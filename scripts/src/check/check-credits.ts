import fs from "fs";
import path from "path";

import { OpenAPIV3 } from "openapi-types";
import assert from "assert";
import { getAttributes } from "../openapi-util";

export function verifyCreditsInDescription(
  openAPI: OpenAPIV3.Document,
  route: string,
  method: OpenAPIV3.HttpMethods
): boolean {
  const operation = openAPI.paths?.[route]?.[method];
  assert(operation, `operation not found: ${route} ${method}`);
  const attributes = getAttributes(operation);
  const xCredit = attributes?.["x-credits"] || 1;
  const expectedPriceTag = `<PriceTag price={${xCredit}}/>`;

  if (
    operation.description &&
    operation.description.includes(expectedPriceTag)
  ) {
    console.log(
      `Verification successful for ${route} ${method}: PriceTag found.`
    );
    return true;
  } else {
    throw new Error(
      `Verification failed for ${route} ${method}: PriceTag not found.`
    );
  }
}

export function verifyAllCreditsInDirectory(directoryPath: string): void {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const openAPI = JSON.parse(fileContent) as OpenAPI;

    Object.keys(openAPI.paths).forEach((route) => {
      Object.keys(openAPI.paths[route]).forEach((method) => {
        verifyCreditsInDescription(openAPI, route, method);
      });
    });
  });
}
