import { OpenAPIV3 } from "openapi-types";

export function addDocsServer(paths: OpenAPIV3.PathsObject): boolean {
  let updated = false;
  const docServerBase = "https://numia-docs-api.numia.xyz";

  for (const route in paths) {
    for (const method in paths[route]) {
      const operation = paths[route][method as OpenAPIV3.HttpMethods];
      if (!operation) continue;

      if (!operation.servers) {
        operation.servers = [];
      }

      const updatedServers = operation.servers.flatMap((server) => {
        if (server.url.includes("https://numia-docs-api.numia.xyz")) {
          return [server];
        }
        const network = new URL(server.url).hostname.split(".")[0];
        const docServerUrl = `${docServerBase}/${network}`;

        const serverExists = operation.servers!.some(
          (server) => server.url === docServerUrl
        );
        if (!serverExists) {
          updated = true;
          return [
            server,
            {
              ...server,
              url: docServerUrl,
              description:
                "This is our docs endpoint, its highly rate limited. Dont use in your app",
            },
          ];
        }
        return [server];
      });

      const sortedUpdated = updatedServers.sort((a, b) => {
        return a.url.includes("https://numia-docs-api.numia.xyz") ? -1 : 1;
      });

      console.log(operation.servers, sortedUpdated);
      //   operation.servers = updatedServers;
    }
  }

  return updated;
}
