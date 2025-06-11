import {BigQuery, Table, type TableField} from '@google-cloud/bigquery';
import OpenAI from 'openai';
import pMap from "p-map";

type ColumnDescriptions = {
    [key: string]: string
}

main()

async function main() {
    const projectId = 'numia-data'
    await generateDescriptionsForProject(projectId)
}

/**
 * Generate AI descriptions for columns
 */
async function generateColumnDescriptions(
    clientAI: OpenAI,
    datasetName: string,
    tableName: string,
    columnsWithoutDescriptions: string[]
): Promise<ColumnDescriptions> {
    if (columnsWithoutDescriptions.length === 0) {
        return {}
    }

    const columnNames = columnsWithoutDescriptions.join(', ')

    try {
        const response = await clientAI.chat.completions.create({
            model: "Meta-Llama-3-1-8B-Instruct-FP8",
            messages: [
                {
                    role: "user",
                    content: `You are a blockchain data analyst specializing in the Cosmos ecosystem. 

Dataset: ${datasetName}
Table: ${tableName}
Columns needing descriptions: ${columnNames}

Context: This data comes from blockchain networks in the Cosmos ecosystem (Cosmos Hub, Osmosis, Juno, etc.). Common data types include:
- Transaction data (hashes, addresses, amounts, fees)
- Block data (height, timestamp, proposer, validators)
- Governance data (proposals, votes, parameters)
- IBC data (cross-chain transfers, channels, connections)
- Staking data (delegations, rewards, validators)
- Smart contract interactions and events

Instructions:
1. Provide concise, technical descriptions (10-15 words max per column), don't include examples
2. Focus on what the data represents in blockchain context
3. Use standard blockchain terminology
4. Consider the dataset and table names for additional context
5. Return ONLY valid JSON, no extra text

Required JSON format:
{
    "column1": "Brief technical description of what this column contains",
    "column2": "Brief technical description of what this column contains"
}`
                }
            ],
        })

        const content = response.choices[0]?.message?.content?.trim()
        if (!content) {
            console.log(`No content returned for ${tableName}, skipping...`)
            return {}
        }

        // Try to find JSON block first
        const start = content.indexOf('{')
        const end = content.lastIndexOf('}') + 1

        let jsonStr: string
        if (start !== -1 && end > start) {
            jsonStr = content.substring(start, end)
        } else {
            jsonStr = content
        }

        return JSON.parse(jsonStr) as ColumnDescriptions

    } catch (error) {
        console.error(`Error parsing AI response for ${tableName}:`, error)
        return {}
    }
}

/**
 * Process a single table and update column descriptions
 */
async function processTable(
    clientAI: OpenAI,
    datasetId: string,
    table: Table,
    overwriteAll: boolean = false
): Promise<void> {
    console.log(`  Processing table: ${table.id}`)

    try {
        // Get table metadata
        const [metadata] = await table.getMetadata()
        const schema = metadata.schema?.fields

        if (!schema) {
            console.log(`    No schema found for table ${table.id}, skipping...`)
            return
        }

        // Find columns that need descriptions
        let columnsToProcess: string[]

        if (overwriteAll) {
            // Get ALL columns if overwriting all descriptions
            columnsToProcess = schema.map((field: TableField) => field.name)
            console.log(`    Overwriting descriptions for ALL ${columnsToProcess.length} columns...`)
        } else {
            // Only get columns without descriptions
            columnsToProcess = schema
                .filter((field: TableField) => !field.description)
                .map((field: TableField) => field.name)

            if (columnsToProcess.length === 0) {
                console.log(`    All columns already have descriptions, skipping...`)
                return
            }

            console.log(`    Generating descriptions for ${columnsToProcess.length} columns without descriptions...`)
        }

        // Generate descriptions for columns that need them
        const newDescriptions = await generateColumnDescriptions(
            clientAI,
            datasetId,
            table.id || '',
            columnsToProcess
        );

        if (Object.keys(newDescriptions).length === 0) {
            console.log(`    Failed to generate descriptions for ${table.id}`)
            return;
        }

        // Update schema with new descriptions
        const newSchema = schema.map((field: TableField) => {
            if (field.name && newDescriptions[field.name]) {
                const action = (overwriteAll && field.description) ? "Overwrote" : "Updated"
                console.log(`      ${action} ${field.name}: ${newDescriptions[field.name]}`)

                return {
                    ...field,
                    description: newDescriptions[field.name]
                }
            }
            return field
        });

        // Update the table schema
        await table.setMetadata({
            schema: {fields: newSchema}
        })

        console.log(`    Successfully ${overwriteAll ? "overwrote" : "updated"} ${Object.keys(newDescriptions).length} columns in ${table.id}`)

    } catch (error) {
        console.error(`    Failed to update ${table.id}:`, error)
    }
}


async function generateDescriptionsForProject(projectId: string, overwriteDescriptions = false): Promise<void> {
    // Initialize clients
    const client = new BigQuery({projectId});
    const clientAI = new OpenAI({
        apiKey: process.env.LLM_API_KEY,
        baseURL: process.env.LLM_BASE_URL
    })

    const [datasets] = await client.getDatasets()

    const processDataset = async (dataset: any) => {
        const [tables] = await dataset.getTables()

        const processTableInDataset = async (table: Table) => {
            return processTable(clientAI, dataset.id || '', table, overwriteDescriptions)
        }

        // Process each table in a dataset
        await pMap(tables, processTableInDataset, {concurrency: 3})
    }

    await pMap(datasets, processDataset, {concurrency: 3})

    console.log('Process completed successfully!')
}