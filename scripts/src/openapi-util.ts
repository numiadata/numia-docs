import type { OpenAPIV3 } from "openapi-types";

export function getAttributes(
  operation:
    | OpenAPIV3.OperationObject
    | OpenAPIV3.OperationObject<{
        attributes: Record<string, string | boolean>;
      }>
) {
  if ("attributes" in operation) {
    return operation.attributes;
  }
  return undefined;
}
