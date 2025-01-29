import fs from "fs";
import path from "path";
import { kebabCase, capitalize } from "es-toolkit";
import { OpenAPIV3 } from "openapi-types";
import { apiConfig, type ApiSection } from "../api-config";
import { getAttributes } from "../openapi-util";

const CONFIG_FILE_PATH = path.join(__dirname, "../../config.json");

const sidebarRef = "apiReference";

const BASE_SIDEBAR: Sidebar = {
  sidebarRef: "apiReference",
  categories: [
    {
      categoryName: "Overview",
      pages: ["api/overview/whats-numia-api", "api/overview/getting-started"],
    },
    {
      categoryName: "Advanced APIs",
      pages: [],
    },
    {
      categoryName: "Tools",
      pages: [],
    },
  ],
};

interface Sidebar {
  sidebarRef: string;
  categories: Category[];
}

interface Category {
  categoryName: "Advanced APIs" | "Tools" | "Overview";
  pages: (string | Group)[];
}
function isGroup(subPage: string | Group): subPage is Group {
  return typeof subPage !== "string";
}

interface Group {
  groupName: string;
  subpages: (string | Group)[];
}

interface Config {
  sidebars: Sidebar[];
  navbar: NavbarEntry[];
}

interface NavbarEntry {
  label: string;
  sidebarRef: string;
}

main();
async function main() {
  const oasSections = await downloadOasFiles();
  for (const section of oasSections) {
    await processSection(section);
  }
  // const sidebars = generateSidebars();
  // updateConfig(sidebars);
  console.log("Config updated with API reference sidebar.");
}

async function downloadOasFiles() {
  return await Promise.all(
    apiConfig.map(async (apiSection) => {
      const oasContent = await Promise.all(
        apiSection.oasFiles.map(async (oasFile) => {
          const response = await fetch(oasFile);
          return response.json() as Promise<OpenAPIV3.Document>;
        })
      );
      return {
        ...apiSection,
        oasContent,
      };
    })
  );
}

function getSectionGroups(
  section: ApiSection & { oasContent: OpenAPIV3.Document[] }
): Group[] {
  const mergedOasContent = section.oasContent.reduce<
    undefined | OpenAPIV3.Document
  >((acc, oas) => {
    if (!acc) {
      return oas;
    }
    return {
      ...acc,
      ...oas,
      paths: {
        ...acc.paths,
        ...oas.paths,
      },
    };
  }, undefined);

  const group: Group = {
    groupName: section.title,
    subpages: [],
  };

  for (const oas of section.oasContent) {
    for (const [pathKey, methods] of Object.entries(oas.paths)) {
      for (const method in methods) {
        const operation = methods[method as OpenAPIV3.HttpMethods];
        if (operation) {
          const attributes = getAttributes(operation);
          const sidebar = attributes?.["x-sidebar"];
          if (sidebar) {
            const subGroup = group.subpages.filter(isGroup).find
              (sub) => sub.groupName === sidebar
            );
            if (subGroup) {
              subGroup;
            }
          }
        }
      }
    }
  }

  return [];
}

function updateConfig(sidebars: Sidebar): void {
  const config: Config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));

  config.sidebars = config.sidebars.filter(
    (sidebar) => sidebar.sidebarRef !== "apiReference"
  );

  config.sidebars.push(sidebars);

  const navbarExists = config.navbar.some(
    (entry) => entry.sidebarRef === "apiReference"
  );

  if (!navbarExists) {
    config.navbar.push({
      label: "API",
      sidebarRef: "apiReference",
    });
  }

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function insertEngageAds(engageIntegrationGroup: Group[]): void {
  const configPath = path.join(__dirname, "../../config.json");
  const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const engageSection = config.sidebars.find(
    (sidebar) => sidebar.sidebarRef === "engage"
  );

  if (engageSection) {
    const publisherGuide = engageSection.categories.find(
      (category) => category.categoryName === "Publisher Guide"
    );

    if (publisherGuide) {
      const apiIntegration = publisherGuide.pages.find(
        (page) => (page as Group).groupName === "API Integration"
      ) as Group;

      if (apiIntegration) {
        const existingEndpointsIndex = apiIntegration.subpages.findIndex(
          (subpage) => subpage === "API Endpoints"
        );

        if (existingEndpointsIndex !== -1) {
          apiIntegration.subpages[existingEndpointsIndex] =
            engageIntegrationGroup[0].groupName;
        } else {
          apiIntegration.subpages.push(
            ...engageIntegrationGroup.map((group) => group.groupName)
          );
        }
      }
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

function generateSidebars(): Sidebar {
  const REFERENCE_PATH = path.join(__dirname, "../../docs/reference");
  const OPENAPI_PATH = path.join(__dirname, "../../openAPI");
  const directories = getAllDirectories(REFERENCE_PATH);
  const engageIntegrationGroup: Group[] = [];

  const nameMap: Record<string, string> = {
    "engage-ads": "Engage Ads",
    dex: "DEX",
    "dydx-lenses": "Lenses Analytics",
    numiaai: "AI Agent Analytics",
    "osmosis-lenses": "Analytics",
    quasar: "Quasar",
    snapshots: "Snapshots",
    stride: "Stride",
    txbyaddress: "Transaction by Address",
    lenses: "Lenses",
    xion: "Xion",
    cosmos: "Analytics",
  };

  function groupPagesByTags(apiFiles: string[], folderName: string) {
    const openApiFilePath = path.join(OPENAPI_PATH, `${folderName}.json`);
    const groupedPages: Record<string, string[]> = {};
    const untaggedPages: string[] = [];

    if (!fs.existsSync(openApiFilePath)) {
      console.warn(`OpenAPI file not found for folder: ${folderName}`);
      return {
        groupedPages,
        untaggedPages: apiFiles.map(
          (file) => `reference/${folderName}/${file}`
        ),
      };
    }

    const openApi = JSON.parse(fs.readFileSync(openApiFilePath, "utf-8"));

    const operationIdToFile: Record<string, string> = {};
    apiFiles.forEach((file) => {
      const operationId = file.split(".api.mdx")[0];
      operationIdToFile[operationId] = `reference/${folderName}/${file}`;
    });

    Object.entries(openApi.paths || {}).forEach(([_, methods]) => {
      Object.values(methods).forEach((method: any) => {
        const operationId = kebabCase(method.operationId);

        if (operationId && operationIdToFile[operationId]) {
          const pagePath = operationIdToFile[operationId];
          const tag = method.tags?.[0] || "_untagged";

          if (!groupedPages[tag]) groupedPages[tag] = [];
          groupedPages[tag].push(pagePath);
        }
      });
    });

    Object.keys(operationIdToFile).forEach((operationId) => {
      const pagePath = operationIdToFile[operationId];
      if (!Object.values(groupedPages).flat().includes(pagePath)) {
        untaggedPages.push(pagePath);
      }
    });

    return { groupedPages, untaggedPages };
  }

  directories.forEach((dir) => {
    const apiFiles = getApiFiles(path.join(REFERENCE_PATH, dir));

    if (apiFiles.length > 0) {
      if (dir.toLowerCase() === "txbyaddress") {
        sidebar.categories[1].pages.push({
          groupName: "Multichain",
          subpages: [
            {
              groupName: "Transaction By Address",
              subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
            },
          ],
        });
      } else if (dir.toLowerCase() === "snapshots") {
        sidebar.categories[2].pages.push({
          groupName: "Snapshots",
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        });
      } else if (dir.toLowerCase() === "engage-ads") {
        engageIntegrationGroup.push({
          groupName: "API Endpoints",
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        });
      } else if (["dex", "osmosis-lenses"].includes(dir.toLowerCase())) {
        const osmosisGroup = sidebar.categories[1].pages.find(
          (group) => (group as Group).groupName === "Osmosis"
        ) as Group;
        if (!osmosisGroup) {
          sidebar.categories[1].pages.push({
            groupName: "Osmosis",
            subpages: [],
          });
        }

        const group: Group = {
          groupName: nameMap[dir.toLowerCase()] || capitalize(dir),
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        };

        (
          sidebar.categories[1].pages.find(
            (group) => (group as Group).groupName === "Osmosis"
          ) as Group
        ).subpages.push(group.groupName);
      } else if (["dydx-lenses", "numiaai"].includes(dir.toLowerCase())) {
        const dydxGroup = sidebar.categories[1].pages.find(
          (group) => (group as Group).groupName === "dYdX"
        ) as Group;
        if (!dydxGroup) {
          sidebar.categories[1].pages.push({ groupName: "dYdX", subpages: [] });
        }

        const group: Group = {
          groupName: nameMap[dir.toLowerCase()] || capitalize(dir),
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        };

        (
          sidebar.categories[1].pages.find(
            (group) => (group as Group).groupName === "dYdX"
          ) as Group
        ).subpages.push(group.groupName);
      } else {
        const { groupedPages, untaggedPages } = groupPagesByTags(apiFiles, dir);

        const subpages = [
          ...Object.entries(groupedPages).map(([tag, pages]) => {
            if (tag === "_untagged") {
              return pages;
            }
            return {
              groupName: capitalize(tag),
              subpages: pages,
            };
          }),
          ...untaggedPages,
        ];

        const group: Group = {
          groupName: nameMap[dir.toLowerCase()] || capitalize(dir),
          subpages: subpages.flat(),
        };

        sidebar.categories[1].pages.push(group);
      }
    }
  });

  if (engageIntegrationGroup.length > 0) {
    insertEngageAds(engageIntegrationGroup);
  }

  return sidebar;
}

function getAllDirectories(srcPath: string): string[] {
  return fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((file) => file.name);
}

function getApiFiles(dirPath: string): string[] {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith(".endpoint.mdx"))
    .map((file) => file.name.replace(".endpoint.mdx", ""));
}
