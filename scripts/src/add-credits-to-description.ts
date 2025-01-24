import fs from "fs";
import path from "path";

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
          const openAPISpec = JSON.parse(data);
          const paths = openAPISpec.paths;

          for (const route in paths) {
            for (const method in paths[route]) {
              const operation = paths[route][method];
              const xCredit = operation["x-credit"] || 1;
              const priceTag = `import PriceTag from "@site/src/components/PriceTag";\n<PriceTag price={${xCredit}}>`;

              if (operation.description) {
                operation.description += `\n\n${priceTag}`;
              } else {
                operation.description = priceTag;
              }
            }
          }

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
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      });
    }
  });
});
