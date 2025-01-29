import assert from "assert";
import { OpenAPIV3 } from "openapi-types";

export function addDefaultValues(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;

  for (const pathKey in paths) {
    for (const method in paths[pathKey]) {
      const methodObj = paths[pathKey][method as OpenAPIV3.HttpMethods];
      assert(methodObj, `methodObj not found: ${pathKey} ${method}`);

      if (typeof methodObj === "object") {
        if (needsGenericResponse(methodObj.responses)) {
          methodObj.responses = GENERIC_RESPONSE;
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

  return updated;
}

function needsGenericResponse(
  responses: OpenAPIV3.ResponsesObject | undefined
): boolean {
  return (
    !responses ||
    (typeof responses === "object" && Object.keys(responses).length === 0)
  );
}

function generateOperationId(method: string, path: string): string {
  const sanitizedPath = path
    .replace(/[/{}/]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
  return `${method.toLowerCase()}${sanitizedPath}`;
}

function generateSummaryFromOperationId(operationId: string): string {
  return operationId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

const GENERIC_RESPONSE: Record<string, OpenAPIV3.ResponseObject> = {
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
