import { OpenAPIV3 } from "openapi-types";
import { getAttributes } from "../openapi-util";
import assert from "assert";

export function removePrivateEndpoints(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;

  for (const route in paths) {
    for (const method in paths[route]) {
      const httpMethod = method as OpenAPIV3.HttpMethods;
      const operation = paths[route][httpMethod];

      assert(operation, `operation not found: ${route} ${httpMethod}`);

      const attributes = getAttributes(operation);

      if (attributes?.["x-private"]) {
        delete paths[route][httpMethod];
        updated = true;
      }
    }

    // Remove the route if all methods are deleted
    if (Object.keys(paths[route]!).length === 0) {
      delete paths[route];
    }
  }

  return updated;
}
