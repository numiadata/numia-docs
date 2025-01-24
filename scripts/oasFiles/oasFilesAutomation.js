const fs = require("fs");
const path = require("path");

const CONFIG_FILE_PATH = path.join(__dirname, "../../config.json");

function getAllDirectories(srcPath) {
  return fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((file) => file.name);
}

function getApiFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith(".endpoint.mdx"))
    .map((file) => file.name.replace(".endpoint.mdx", ""));
}

function updateConfig(sidebars) {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));

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

function insertEngageAds(engageIntegrationGroup) {
  const configPath = path.join(__dirname, "../../config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const engageSection = config.sidebars.find(
    (sidebar) => sidebar.sidebarRef === "engage"
  );

  if (engageSection) {
    const publisherGuide = engageSection.categories.find(
      (category) => category.categoryName === "Publisher Guide"
    );

    if (publisherGuide) {
      const apiIntegration = publisherGuide.pages.find(
        (page) => page.groupName === "API Integration"
      );

      if (apiIntegration) {
        const existingEndpointsIndex = apiIntegration.subpages.findIndex(
          (subpage) => subpage.groupName === "API Endpoints"
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

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function generateSidebars() {
  const REFERENCE_PATH = path.join(__dirname, "../../docs/reference");
  const OPENAPI_PATH = path.join(__dirname, "../../openAPI");
  const directories = getAllDirectories(REFERENCE_PATH);
  const engageIntegrationGroup = [];

  const sidebar = {
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

  const nameMap = {
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

  function capitalize(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function groupPagesByTags(apiFiles, folderName) {
    const openApiFilePath = path.join(OPENAPI_PATH, `${folderName}.json`);
    const groupedPages = {};
    const untaggedPages = [];

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

    const operationIdToFile = {};
    apiFiles.forEach((file) => {
      const operationId = file.split(".api.mdx")[0];
      operationIdToFile[operationId] = `reference/${folderName}/${file}`;
    });

    Object.entries(openApi.paths || {}).forEach(([_, methods]) => {
      Object.values(methods).forEach((method) => {
        const operationId = toKebabCase(method.operationId);

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
          (group) => group.groupName === "Osmosis"
        );
        if (!osmosisGroup) {
          sidebar.categories[1].pages.push({
            groupName: "Osmosis",
            subpages: [],
          });
        }

        const group = {
          groupName: nameMap[dir.toLowerCase()] || capitalize(dir),
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        };

        sidebar.categories[1].pages
          .find((group) => group.groupName === "Osmosis")
          .subpages.push(group);
      } else if (["dydx-lenses", "numiaai"].includes(dir.toLowerCase())) {
        const dydxGroup = sidebar.categories[1].pages.find(
          (group) => group.groupName === "dYdX"
        );
        if (!dydxGroup) {
          sidebar.categories[1].pages.push({ groupName: "dYdX", subpages: [] });
        }

        const group = {
          groupName: nameMap[dir.toLowerCase()] || capitalize(dir),
          subpages: apiFiles.map((file) => `reference/${dir}/${file}`),
        };

        sidebar.categories[1].pages
          .find((group) => group.groupName === "dYdX")
          .subpages.push(group);
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

function main() {
  const sidebars = generateSidebars();
  updateConfig(sidebars);
  console.log("Config updated with API reference sidebar.");
}

main();
