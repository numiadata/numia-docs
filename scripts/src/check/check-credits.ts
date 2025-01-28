import fs from "fs";

export function verifyCreditsInDescription(
  filePath: string,
  route: string,
  method: string
): boolean {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const openAPI = JSON.parse(fileContent);

  const operation = openAPI.paths[route][method];
  const xCredit = operation["x-credits"] || 1;
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
