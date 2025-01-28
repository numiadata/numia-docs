import { OpenAPIV3 } from "openapi-types";

export function verifyNoPrivateEndpoints(
  paths: OpenAPIV3.PathsObject
): boolean {
  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method];

      if (operation["x-private"]) {
        throw new Error(`Private endpoint found: ${route} ${method}`);
      }
    }
  }

  console.log("No private endpoints found.");
  return true;
}
