import { type OpenAPIV3 } from "openapi-types";

// Extend the OpenAPIV3 namespace
declare module "openapi-types" {
  namespace OpenAPIV3 {
    interface OperationObject {
      // Add your optional attribute here
      attributes?: Record<string, string | boolean>;
    }
  }
}
