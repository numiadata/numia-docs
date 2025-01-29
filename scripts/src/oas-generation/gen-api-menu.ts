import fs from "fs";
import path from "path";
import { apiConfig } from "../api-config";
import { capitalize, kebabCase } from "es-toolkit";
import type { OpenAPIV3 } from "openapi-types";
import { OAS_ROOT_DIR } from "./download-oas";

const REPOSITORY_ROOT = path.join(__dirname, "../../../");
const CONFIG_FILE_PATH = path.join(REPOSITORY_ROOT, "config.json");
const REFERENCE_PATH = path.join(REPOSITORY_ROOT, "docs/reference");

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
export function generateApiMenu(): void {
  const sidebars = generateSidebars();
  updateConfig(sidebars);
  console.log("Config updated with API reference sidebar.");
}

function updateConfig(sidebars: any): void {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));

  config.sidebars = config.sidebars.filter(
    (sidebar: any) => sidebar.sidebarRef !== "apiReference"
  );

  config.sidebars.push(sidebars);

  const navbarExists = config.navbar.some(
    (entry: any) => entry.sidebarRef === "apiReference"
  );

  if (!navbarExists) {
    config.navbar.push({
      label: "API",
      sidebarRef: "apiReference",
    });
  }

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function insertEngageAds(engageIntegrationGroup: any[]): void {
  const configPath = path.join(__dirname, "../../config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const engageSection = config.sidebars.find(
    (sidebar: any) => sidebar.sidebarRef === "engage"
  );

  if (engageSection) {
    const publisherGuide = engageSection.categories.find(
      (category: any) => category.categoryName === "Publisher Guide"
    );

    if (publisherGuide) {
      const apiIntegration = publisherGuide.pages.find(
        (page: any) => page.groupName === "API Integration"
      );

      if (apiIntegration) {
        const existingEndpointsIndex = apiIntegration.subpages.findIndex(
          (subpage: any) => subpage.groupName === "API Endpoints"
        );

        if (existingEndpointsIndex !== -1) {
          apiIntegration.subpages[existingEndpointsIndex] =
            engageIntegrationGroup[0];
        } else {
          apiIntegration.subpages.push(...engageIntegrationGroup);
        }
      }
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

function generateSidebars(): any {
  const directories = getAllDirectories(REFERENCE_PATH);
  const engageIntegrationGroup: any[] = [];

  const sidebar: Sidebar = {
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

  function groupPagesByTags(apiFiles: string[], folderName: string) {
    const openApiFilePath = path.join(OAS_ROOT_DIR, `${folderName}.json`);
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

    const openApi = JSON.parse(
      fs.readFileSync(openApiFilePath, "utf-8")
    ) as OpenAPIV3.Document;

    const operationIdToFile: Record<string, string> = {};
    apiFiles.forEach((file) => {
      const operationId = file.split(".api.mdx")[0];
      operationIdToFile[operationId] = `reference/${folderName}/${file}`;
    });

    Object.entries(openApi.paths || {}).forEach(([_, methods]) => {
      if (!methods) return;
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
      const configSection = apiConfig.find(
        (section) => section.name.toLowerCase() === dir.toLowerCase()
      );

      if (configSection) {
        const group = {
          groupName: configSection.title,
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        };

        const category = sidebar.categories.find(
          (cat) => cat.categoryName === configSection.categoryName
        );

        if (category) {
          category.pages.push(group);
        }
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

        const group = {
          groupName: capitalize(dir),
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
