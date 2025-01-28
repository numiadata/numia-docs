import { OpenAPIV3 } from "openapi-types";

export function addCreditsToDescription(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;

  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method];

      const xCredit = operation["x-credit"] || 1;
      const priceTag = `import PriceTag from "@site/src/components/PriceTag";\n\n<PriceTag price={${xCredit}}/>`;

      if (operation.description) {
        if (!operation.description.includes("<PriceTag")) {
          updated = true;
          operation.description += `\n\n${priceTag}`;
        }
      } else {
        updated = true;
        operation.description = priceTag;
      }
    }
  }

  return updated;
}
