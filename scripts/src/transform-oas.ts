import fs from "fs";
import path from "path";
import { OpenAPIV3 } from "openapi-types";

const openAPIDir = path.join(__dirname, "../../openAPI");

fs.readdir(openAPIDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(openAPIDir, file);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        try {
          const openAPISpec: OpenAPIV3.Document = JSON.parse(
            data
          ) as OpenAPIV3.Document;
          const paths = openAPISpec.paths;
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

          if (updated) {
            fs.writeFile(
              filePath,
              JSON.stringify(openAPISpec, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  console.error("Error writing file:", err);
                } else {
                  console.log(`Updated file: ${file}`);
                }
              }
            );
          }
        } catch (parseError) {
          console.error("Error parsing " + file, parseError);
        }
      });
    }
  });
});
