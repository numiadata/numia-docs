import path from "path";
import fs from "fs";

import { verifyCreditsInDescription } from "./check/check-credits";
import { verifyNoPrivateEndpoints } from "./check/check-private";

/**
 * Check Credits in Description
 */
const filePath = path.join(__dirname, "../../openAPI/dex.json");
verifyCreditsInDescription(
  filePath,
  "/pairs/v1/historical/{pool_id}/chart",
  "get"
);

// Load the OpenAPI specification
const openAPIContent = fs.readFileSync(filePath, "utf-8");
const openAPI = JSON.parse(openAPIContent);
verifyNoPrivateEndpoints(openAPI.paths);
