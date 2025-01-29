import path from "path";
import fs from "fs";

import {
  verifyCreditsInDescription,
  verifyAllCreditsInDirectory,
} from "../check/check-credits";
import { verifyNoPrivateEndpoints } from "../check/check-private";
import { OpenAPIV3 } from "openapi-types";

/**
 * Check Credits in Description
 */
const filePath = path.join(__dirname, "../../openAPI/osmosis.json");
const fileContent = fs.readFileSync(filePath, "utf-8");
const dexFile = JSON.parse(fileContent) as OpenAPIV3.Document;
verifyCreditsInDescription(
  dexFile,
  "/pairs/v1/historical/{pool_id}/chart",
  OpenAPIV3.HttpMethods.GET
);

// Check credits in all files in the openAPI directory
const openAPIDirectoryPath = path.join(__dirname, "../../openAPI");
verifyAllCreditsInDirectory(openAPIDirectoryPath);

verifyNoPrivateEndpoints(dexFile.paths);
