const fs = require("fs");
const path = require("path");

const OPENAPI_DIR = path.join(__dirname, "../../openAPI");

const GENERIC_RESPONSE = {
  200: {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  },
};

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function generateOperationId(method, path) {
  const sanitizedPath = path
    .replace(/[/{}/]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
  return `${method.toLowerCase()}${sanitizedPath}`;
}

function needsGenericResponse(responses) {
  return (
    !responses ||
    (typeof responses === "object" && Object.keys(responses).length === 0)
  );
}

function generateSummaryFromOperationId(operationId) {
  return operationId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function addMissingResponsesOperationIdsAndSummaries(filePath) {
  const oas = readJsonFile(filePath);

  if (!oas.paths) {
    return;
  }

  let updated = false;

  for (const [pathKey, pathObj] of Object.entries(oas.paths)) {
    for (const [method, methodObj] of Object.entries(pathObj)) {
      if (typeof methodObj === "object") {
        if (needsGenericResponse(methodObj.responses)) {
          methodObj.responses = { ...GENERIC_RESPONSE };
          updated = true;
        }

        if (!methodObj.operationId) {
          const generatedOperationId = generateOperationId(method, pathKey);
          methodObj.operationId = generatedOperationId;
          updated = true;
        }

        if (!methodObj.summary && methodObj.operationId) {
          const normalizedSummary = generateSummaryFromOperationId(
            methodObj.operationId
          );
          methodObj.summary = normalizedSummary;
          updated = true;
        }
      }
    }
  }

  if (updated) {
    writeJsonFile(filePath, oas);
    console.log(`Updated file: ${filePath}`);
  } else {
    console.log(`No updates required for ${filePath}`);
  }
}

function processOpenApiFiles() {
  const files = fs
    .readdirSync(OPENAPI_DIR)
    .filter((file) => file.endsWith(".json"));

  files.forEach((file) => {
    const filePath = path.join(OPENAPI_DIR, file);
    addMissingResponsesOperationIdsAndSummaries(filePath);
  });

  console.log("Processing complete.");
}

processOpenApiFiles();
