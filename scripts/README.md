# doc-scripts

To install dependencies:

```bash
bun install
```

## Available Scripts

### Generate SQL Documentation

```bash
bun run generate-sql-docs
```

Fetches table metadata from BigQuery and generates both JSON data files and MDX documentation files. This will overwrite existing JSON files.

### Regenerate MDX from Existing JSON

```bash
bun run regenerate-mdx
```

Regenerates MDX documentation files from existing JSON data files without fetching from BigQuery. Use this when you've manually edited the JSON files and want to regenerate the corresponding MDX files.

### Individual Scripts

- `bun run table-metadata` - Fetch metadata from BigQuery and generate JSON + MDX files
- `bun run column-descriptions` - Generate column descriptions
- `bun run check` - Run validation checks

This project was created using `bun init` in bun v1.2.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
