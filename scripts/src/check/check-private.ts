import { OpenAPIV3 } from "openapi-types";
import { getAttributes } from "../openapi-util";
import assert from "assert";

export function verifyNoPrivateEndpoints(
  paths: OpenAPIV3.PathsObject
): boolean {
  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method as OpenAPIV3.HttpMethods];

      assert(operation, `operation not found: ${route} ${method}`);

      const attributes = getAttributes(operation);

      if (attributes?.["x-private"]) {
        throw new Error(`Private endpoint found: ${route} ${method}`);
      }
    }
  }

  console.log("No private endpoints found.");
  return true;
}
