import {BigQuery, Dataset, Table} from '@google-cloud/bigquery'
import {writeFileSync} from 'fs'
import pMap from "p-map";

const client = new BigQuery({projectId: 'numia-data'})

const rawTables = ['blocks', 'block_events', 'message_events', 'event_attributes', 'message_event_attributes',
    'tx_messages', 'transactions', 'validators']

type ColumnMetadata = {
    name: string
    description: string
    type: string
    mode: string
}
type TableMetadata = {
    name: string
    description: string
    columns: ColumnMetadata[]
    tags?: string[]
}
type DatasetMetadata = {
    dataset: string
    tables: TableMetadata[]
}

main()

async function main() {
    const [bqDatasets] = await client.getDatasets()

    await pMap(bqDatasets, generateDatasetMetadata, {concurrency: 10})
}

async function generateDatasetMetadata(dataset: Dataset) {
    const [tables] = await client.dataset(dataset.id).getTables()
    const tablesMetadata: TableMetadata[] = await pMap(tables, generateTablesMetadata, {concurrency: 10})
    const datasetsMetadata: DatasetMetadata = {
        dataset: dataset.id,
        tables: tablesMetadata,
    }
    writeFileSync(`../data/${dataset.id}-table.json`, JSON.stringify(datasetsMetadata, null, 2))
}

async function generateTablesMetadata(table: Table): Promise<TableMetadata> {
    const [tableMetadata] = await table.getMetadata()
    const tableTags = [table.dataset.id]
    if (rawTables.some((t) => {
        return tableMetadata.tableReference.tableId.endsWith(t)
    })) {
        tableTags.push('raw_table')
    }
    return {
        name: tableMetadata.tableReference.tableId,
        description: tableMetadata.description || '',
        tags: tableTags,
        columns: tableMetadata.schema.fields.map((field) => ({
            name: field.name,
            description: field.description,
            type: field.type,
            mode: field.mode,
        })),
    }
}