export type ApiSection = {
  title: string;
  categoryName: "Advanced APIs" | "Tools";
  name: string;
  oasFiles: string[];
};

export const apiConfig: ApiSection[] = [
  {
    name: "osmosis",
    categoryName: "Advanced APIs",
    oasFiles: ["https://api-docs.numia.xyz/osmosis/openapi.json"],
    title: "Osmosis",
  },
  //   {
  //     name: "engage-ads",
  //     title: "Engage Ads",
  //     oasFiles: ["https://api-docs.numia.xyz/engage/ads/openapi.json"],
  //   },
  //   {
  //     name: "txbyaddress",
  //     oasFiles: ["https://api-docs.numia.xyz/api/byaddress/openapi.json"],
  //     title: "Transaction by Address",
  //   },
  //   {
  //     name: "cosmos",
  //     oasFiles: ["https://api-docs.numia.xyz/lenses/cosmos/openapi.json"],
  //     title: "Analytics",
  //   },
  //   {
  //     name: "osmosis-lenses",
  //     oasFiles: ["https://api-docs.numia.xyz/lenses/osmosis/openapi.json"],
  //     title: "Analytics",
  //   },
  //   {
  //     name: "dydx-lenses",
  //     oasFiles: ["https://api-docs.numia.xyz/lenses/dydx/openapi.json"],
  //     title: "Lenses Analytics",
  //   },
  //   {
  //     name: "numiaai",
  //     oasFiles: ["https://api-docs.numia.xyz/numiaAI/openapi.json"],
  //     title: "AI Agent Analytics",
  //   },
  //   {
  //     name: "quasar",
  //     oasFiles: ["https://api-docs.numia.xyz/quasar/openapi.json"],
  //     title: "Quasar",
  //   },
  //   {
  //     name: "stride",
  //     oasFiles: ["https://api-docs.numia.xyz/stride/openapi.json"],
  //     title: "Stride",
  //   },
  //   {
  //     name: "xion",
  //     oasFiles: ["https://api-docs.numia.xyz/xion/openapi.json"],
  //     title: "Xion",
  //   },
  //   {
  //     name: "snapshots",
  //     oasFiles: ["https://api-docs.numia.xyz/aadao-snapshots/openapi.json"],
  //     title: "Snapshots",
  //   },
];
