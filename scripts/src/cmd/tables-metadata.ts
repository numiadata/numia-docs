import { BigQuery, Dataset, Table } from "@google-cloud/bigquery";
import assert from "assert";
import fs, { readFileSync, writeFileSync } from "fs";
import pMap from "p-map";
import Path from "path";
import { capitalize } from "es-toolkit";
import { log } from "console";


const client = new BigQuery({ projectId: "numia-data" });

const DATASETS_TO_IGNORE = [
    "artemis",
    "interchain_foundation",
    "pyth",
    "stride_private",
    "wynd"
]
const rawTables = [
    "blocks",
    "block_events",
    "message_events",
    "event_attributes",
    "message_event_attributes",
    "tx_messages",
    "transactions",
    "validators",
]

type ColumnMetadata = {
    name: string;
    description: string;
    type: string;
    mode: string;
}
type TableMetadata = {
    name: string;
    description: string;
    columns: ColumnMetadata[];
    tags?: string[];
}
type DatasetMetadata = {
    dataset: string;
    tables: TableMetadata[];
}

type IndexConfig = {
    websiteName: string;
    description: string;
    images: {
        logo: string;
        favicon: string;
        darkLogo: string;
    };
    languages: string[];
    styles: {
        mainColor: string;
        navbarColor: string;
        navbarDarkModeColor: string;
        backgroundDarkModeColor: string;
        logoSize: string;
        navbarMode: string;
        pagination: boolean;
    };
    colorMode: {
        default: string;
        switchOff: boolean;
    };
    apiFiles: string[];
    codeLanguages: string[];
    homepage: string;
    changelog: boolean;
    navbar: Array<{
        label: string;
        sidebarRef: string;
    }>;
    externalLinks: Array<{
        name: string;
        link: string;
    }>;
    sidebars: Array<{
        sidebarRef: string;
        categories: Array<{
            categoryName: string;
            pages: Array<string | {
                groupName: string;
                page?: string;
                subpages?: Array<string | {
                    groupName: string;
                    subpages: string[];
                }>;
            }>;
        }>;
    }>;
}


const TABLES_DIR = '../data'

const REPOSITORY_ROOT = Path.join(__dirname, "../../../");
const SQL_DOCS_DIR = Path.join(REPOSITORY_ROOT, "docs/sql/querying-data/chains");

main();

async function main() {
    // cleanOldData()
    const [bqDatasets] = await client.getDatasets()
    //
    // const datasetsToProcess = bqDatasets.filter((dataset) => dataset.id && !DATASETS_TO_IGNORE.includes(dataset.id))
    //
    // const metadata: DatasetMetadata[] = await pMap(datasetsToProcess, generateDatasetMetadata, {concurrency: 10})
    //
    // metadata.forEach((table) => generateDocFile(table))

    updateIndex(bqDatasets.map((dataset) => dataset.id))
}

function cleanOldData() {
    fs.rmSync(TABLES_DIR, { recursive: true, force: true })
    fs.mkdirSync(TABLES_DIR, { recursive: true })

    fs.rmSync(SQL_DOCS_DIR, { recursive: true, force: true })
    fs.mkdirSync(SQL_DOCS_DIR, { recursive: true })
}

async function generateDatasetMetadata(dataset: Dataset) {
    const id = dataset.id;
    assert(id, "dataset id is undefined");
    const [tables] = await client.dataset(id).getTables();
    const tablesMetadata: TableMetadata[] = await pMap(
        tables,
        generateTablesMetadata,
        { concurrency: 10 }
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
    if (metadata.dataset === "numia") {
        // Skip the numia dataset as it is not a chain dataset
        return;
    }
    const datasetTags = metadata.tables.flatMap((table) => {
        return table?.tags || []
    })

    const hasRawTables = datasetTags.includes('raw_table')
    const hasParsedTables = datasetTags.includes('parsed_table')

    createFile(metadata.dataset, hasRawTables, hasParsedTables)
}

const repoToChainMap: Record<string, string> = {
    cosmoshub: "Cosmos Hub",
    dydx_mainnet: "dYdX",
    interchain_foundation: "Interchain Foundation",
    kaiyo: "Kujira",
    lenses: "Numia Lenses",
    nillion_chain_testnet: "Nillion Testnet",
    quasar: "Quasar",
    quasar_testnet: "Quasar Testnet",
    secret: "Secret Network",
    terra: "Terra 2",
}

function createFile(datasetName: string, hasRawTables: boolean, hasParsedTables: boolean) {
    const pageTitle = repoToChainMap[datasetName] || capitalize(datasetName.replaceAll('_', ' '))
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
title: ${pageTitle}
---

import Table from '@site/src/components/JsonToTable/JsonToTable';
import json from '@site/data/${datasetName}-table.json'


This page presents the available tables for ${pageTitle}.

${hasRawTables ? rawTableComponent : ''}

${hasParsedTables ? parsedTableComponent : ''}
    `

    writeFileSync(Path.join(SQL_DOCS_DIR, `${datasetName}.mdx`), file)
}

function updateIndex(datasets: (string | undefined)[]) {
    const currentIndex = JSON.parse(readFileSync('../config.json', 'utf8')) as IndexConfig

    // Access the categoryName Querying Data in the sidebar with sideBArRef sql and the groupName Available chains
    const sqlSubpages = currentIndex.sidebars
        .find((sidebar) => sidebar.sidebarRef === "sql")?.categories
        .find((category) => category.categoryName === "Querying Data")?.pages

    if (!sqlSubpages) {
        throw new Error("no subpages found")
    }

    const availableChainsGroup = sqlSubpages.find((subpage) => typeof subpage  === 'object' && subpage.groupName === "Available Chains") as {
        groupName: string;
        subpages: string[];
    }

    if (!availableChainsGroup) {
        throw new Error("no available chains group found")
    }


    const newSQLChainsSubpages = datasets.filter((dataset) => dataset && !DATASETS_TO_IGNORE.includes(dataset)).map((dataset) => {
        return `sql/querying-data/chains/${dataset}`
    }).sort((a, b) => a.localeCompare(b))

    availableChainsGroup.subpages = newSQLChainsSubpages

    writeFileSync('../config.json', JSON.stringify(currentIndex, null, 2))
}