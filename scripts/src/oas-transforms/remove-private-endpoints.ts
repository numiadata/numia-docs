import { OpenAPIV3 } from "openapi-types";

export function removePrivateEndpoints(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;

  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method];

      if (operation["x-private"]) {
        delete paths[route][method];
        updated = true;
      }
    }

    // Remove the route if all methods are deleted
    if (Object.keys(paths[route]).length === 0) {
      delete paths[route];
    }
  }

  return updated;
}
