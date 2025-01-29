import { writeFileSync, rmSync, mkdirSync, readFileSync } from "fs";
import Path from "path";
import { apiConfig } from "../api-config";

const REPOSITORY_ROOT = Path.join(__dirname, "../../../");
export const OAS_ROOT_DIR = Path.join(REPOSITORY_ROOT, "openAPI");
const CONFIG_FILE_PATH = Path.join(REPOSITORY_ROOT, "config.json");

export async function rebuildOas() {
  cleanOasDir();
  await downloadOasFiles();
  updateApiFilesInConfig();
}

function cleanOasDir() {
  rmSync(OAS_ROOT_DIR, { recursive: true, force: true });
  mkdirSync(OAS_ROOT_DIR, { recursive: true });
}

async function downloadOasFiles() {
  return await Promise.all(
    apiConfig.map(async (apiSection) => {
      const response = await fetch(apiSection.oasFile);
      const body = await response.json();
      writeFileSync(
        Path.join(OAS_ROOT_DIR, `${apiSection.oasFile}.json`),
        JSON.stringify(body, null, 2)
      );
    })
  );
}

function updateApiFilesInConfig() {
  const config = JSON.parse(readFileSync(CONFIG_FILE_PATH, "utf-8"));
  config.apiFiles = apiConfig.flatMap((c) => `${c.name}.json`);
  writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
}
