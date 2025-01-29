import fs from "fs";
import path from "path";
import { OpenAPIV3 } from "openapi-types";
import { addCreditsToDescription } from "./oas-transforms/add-credits-to-description";
import { removePrivateEndpoints } from "./oas-transforms/remove-private-endpoints";
import { addDefaultValues } from "./oas-transforms/default-values";

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

          const updatedCredits = addCreditsToDescription(paths);
          const updatedPrivate = removePrivateEndpoints(paths);
          const withDefaultValues = addDefaultValues(paths);

          if (updatedCredits || updatedPrivate) {
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
