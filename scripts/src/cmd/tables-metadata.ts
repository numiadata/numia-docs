import {BigQuery, Dataset, Table} from "@google-cloud/bigquery";
import assert from "assert";
import fs, {writeFileSync} from "fs";
import pMap from "p-map";
import Path from "path";
import {capitalize} from "es-toolkit";


const client = new BigQuery({projectId: "numia-data"});

const rawTables = [
    "blocks",
    "block_events",
    "message_events",
    "event_attributes",
    "message_event_attributes",
    "tx_messages",
    "transactions",
    "validators",
];

type ColumnMetadata = {
    name: string;
    description: string;
    type: string;
    mode: string;
};
type TableMetadata = {
    name: string;
    description: string;
    columns: ColumnMetadata[];
    tags?: string[];
};
type DatasetMetadata = {
    dataset: string;
    tables: TableMetadata[];
};


const TABLES_DIR = '../data'

const REPOSITORY_ROOT = Path.join(__dirname, "../../../");
const SQL_DOCS_DIR = Path.join(REPOSITORY_ROOT, "docs/sql/querying-data/chains");

main();

async function main() {
    cleanOldData()
    const [bqDatasets] = await client.getDatasets()

    const metadata: DatasetMetadata[] = await pMap(bqDatasets, generateDatasetMetadata, {concurrency: 10})

    metadata.forEach((table) => generateDocFile(table))
}

function cleanOldData() {
    fs.rmSync(TABLES_DIR, {recursive: true, force: true})
    fs.mkdirSync(TABLES_DIR, {recursive: true})

    fs.rmSync(SQL_DOCS_DIR, {recursive: true, force: true})
    fs.mkdirSync(SQL_DOCS_DIR, {recursive: true})
}

async function generateDatasetMetadata(dataset: Dataset) {
    const id = dataset.id;
    assert(id, "dataset id is undefined");
    const [tables] = await client.dataset(id).getTables();
    const tablesMetadata: TableMetadata[] = await pMap(
        tables,
        generateTablesMetadata,
        {concurrency: 10}
    );
    const datasetsMetadata: DatasetMetadata = {
        dataset: id,
        tables: tablesMetadata,
    };
    writeFileSync(
        `../data/${dataset.id}-table.json`,
        JSON.stringify(datasetsMetadata, null, 2)
    );
    return datasetsMetadata
}

async function generateTablesMetadata(table: Table): Promise<TableMetadata> {
    const [tableMetadata] = await table.getMetadata();
    const isRawTable = rawTables.some((t) => {
        return tableMetadata.tableReference.tableId.endsWith(t);
    });

    const tableTags = isRawTable ? ["raw_table"] : ["parsed_table"];

    return {
        name: tableMetadata.tableReference.tableId,
        description: tableMetadata.description || "",
        tags: tableTags,
        columns: tableMetadata.schema.fields.map((field: any) => ({
            name: field.name,
            description: field.description,
            type: field.type,
            mode: field.mode,
        })),
    };
}


function generateDocFile(metadata: DatasetMetadata) {
    const datasetTags = metadata.tables.flatMap((table) => {
        return table?.tags || []
    })

    const hasRawTables = datasetTags.includes('raw_table')
    const hasParsedTables = datasetTags.includes('parsed_table')

    createFile(metadata.dataset, hasRawTables, hasParsedTables)
}

function createFile(tableName: string, hasRawTables: boolean, hasParsedTables: boolean) {
    const chainName = capitalize(tableName.replaceAll('_', ' '))
    const rawTableComponent = `
## Raw Tables
<Table data={json} tag="raw_table"/>
    `

    const parsedTableComponent = `
## Parsed Tables
<Table data={json} tag="parsed_table"/>
    `

    const file = `-- This file is generated, don't modify
---
title: ${chainName}
---

import Table from '@site/src/components/JsonToTable/JsonToTable';
import json from '@site/data/${tableName}-table.json'


This page presents the available tables for ${chainName}.

${hasRawTables ? rawTableComponent : ''}

${hasParsedTables ? parsedTableComponent : ''}
    `

    writeFileSync(Path.join(SQL_DOCS_DIR, `${tableName}.mdx`), file)
}
