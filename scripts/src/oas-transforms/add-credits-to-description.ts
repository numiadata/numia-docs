import assert from "assert";
import { OpenAPIV3 } from "openapi-types";

export function addCreditsToDescription(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;

  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method as OpenAPIV3.HttpMethods];
      assert(operation, `operation not found: ${route} ${method}`);

      const attributes = (operation as any).attributes as
        | undefined
        | Record<string, string>;
      const xCredit = attributes?.["x-credits"] || 5;

      const priceTag = `import PriceTag from "@site/src/components/PriceTag";\n\n<PriceTag price={${xCredit}}/>`;
      const priceTagRegex = /<PriceTag price={\d+}\/>/;
      const justTag = `<PriceTag price={${xCredit}}/>`;

      if (operation.description) {
        if (!operation.description.includes("<PriceTag")) {
          updated = true;
          operation.description += `\n\n${priceTag}`;
        } else if (priceTagRegex.test(operation.description)) {
          updated = true;
          operation.description = operation.description.replace(
            priceTagRegex,
            justTag
          );
        }
      } else {
        updated = true;
        operation.description = priceTag;
      }
    }
  }

  return updated;
}
