import { readFileSync, writeFileSync, readdirSync } from "fs";
import Path from "path";
import { capitalize } from "es-toolkit";

type ColumnMetadata = {
    name: string;
    description: string;
    type: string;
    mode?: string;
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

const REPOSITORY_ROOT = Path.join(__dirname, "../../../");
const DATA_DIR = Path.join(REPOSITORY_ROOT, "data");
const SQL_DOCS_DIR = Path.join(REPOSITORY_ROOT, "docs/sql/querying-data/chains");

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

function getPageTitle(datasetName: string): string {
    if (repoToChainMap[datasetName]) {
        return repoToChainMap[datasetName];
    }
    return capitalize(datasetName.replaceAll('_', ' '));
}

function createFile(datasetName: string, hasRawTables: boolean, hasParsedTables: boolean) {
    const pageTitle = getPageTitle(datasetName)
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

import Table from '@site/components/JsonToTable/JsonToTable';
import json from '@site/data/${datasetName}-table.json'


This page presents the available tables for ${pageTitle}.

${hasRawTables ? rawTableComponent : ''}

${hasParsedTables ? parsedTableComponent : ''}
    `

    const outputPath = Path.join(SQL_DOCS_DIR, `${datasetName}.mdx`)
    writeFileSync(outputPath, file)
    console.log(`Generated: ${outputPath}`)
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

function main() {
    console.log("Regenerating MDX files from existing JSON data...\n")

    // Read all JSON files from data directory
    const jsonFiles = readdirSync(DATA_DIR).filter(file => file.endsWith('-table.json'))

    console.log(`Found ${jsonFiles.length} JSON files to process\n`)

    jsonFiles.forEach(jsonFile => {
        const filePath = Path.join(DATA_DIR, jsonFile)
        const metadata: DatasetMetadata = JSON.parse(readFileSync(filePath, 'utf8'))

        console.log(`Processing ${metadata.dataset}...`)
        generateDocFile(metadata)
    })

    console.log("\nDone! MDX files have been regenerated from your JSON data.")
}

main()
