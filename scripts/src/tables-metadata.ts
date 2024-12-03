import {BigQuery, Dataset, Table} from '@google-cloud/bigquery'
import { writeFileSync } from 'fs'
import pMap from "p-map";

const client = new BigQuery({ projectId: 'numia-data' })

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

    await pMap(bqDatasets, generateDatasetMetadata, { concurrency: 10 })
}

async function generateDatasetMetadata(dataset: Dataset) {
    const [tables] = await client.dataset(dataset.id).getTables()
    const tablesMetadata: TableMetadata[] = await pMap(tables, generateTablesMetadata, { concurrency: 10 })
    const datasetsMetadata: DatasetMetadata = {
        dataset: dataset.id,
        tables: tablesMetadata,
    }
    writeFileSync(`../data/${dataset.id}-table.json`, JSON.stringify(datasetsMetadata, null, 2))
}

async function generateTablesMetadata(table: Table): Promise<TableMetadata> {
    const [tableMetadata] = await table.getMetadata()
    return {
        name: tableMetadata.tableReference.tableId,
        description: tableMetadata.description || '',
        columns: tableMetadata.schema.fields.map((field) => ({
            name: field.name,
            description: field.description,
            type: field.type,
            mode: field.mode,
        })),
    }
}