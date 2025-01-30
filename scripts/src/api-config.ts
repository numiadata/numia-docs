import path from "path";
import type { Group } from "./oas-generation/gen-api-menu";

export type ApiSection = {
  title: string;
  categoryName?: "Advanced APIs" | "Tools";
  name: string;
  oasFile: string;
  subpages?: Group["subpages"];
};

export const REPOSITORY_ROOT = path.join(__dirname, "../../");

export const apiConfig: ApiSection[] = [
  {
    name: "osmosis",
    categoryName: "Advanced APIs",
    oasFile: "https://api-docs.numia.xyz/osmosis/openapi.json",
    title: "Osmosis",
    subpages: ["api/osmosis-overview"],
  },
  {
    name: "osmosis-lenses",
    categoryName: "Advanced APIs",
    oasFile: "https://api-docs.numia.xyz/lenses/osmosis/openapi.json",
    title: "Osmosis Analytics",
  },
  {
    name: "engage-ads",
    title: "Engage Ads",
    oasFile: "https://api-docs.numia.xyz/engage/ads/openapi.json",
  },
  //   {
  //     name: "txbyaddress",
  //     categoryName: "Tools",
  //     oasFiles: [
  //       {
  //         name: "txbyaddress",
  //         url: "https://api-docs.numia.xyz/api/byaddress/openapi.json",
  //       },
  //     ],
  //     title: "Transaction by Address",
  //   },
  //   {
  //     name: "cosmos",
  //     categoryName: "Advanced APIs",
  //     oasFiles: [
  //       {
  //         name: "cosmos",
  //         url: "https://api-docs.numia.xyz/lenses/cosmos/openapi.json",
  //       },
  //     ],
  //     title: "Analytics",
  //   },

  //   {
  //     name: "dydx-lenses",
  //     categoryName: "Advanced APIs",
  //     oasFiles: [
  //       {
  //         name: "dydx-lenses",
  //         url: "https://api-docs.numia.xyz/lenses/dydx/openapi.json",
  //       },
  //     ],
  //     title: "Lenses Analytics",
  //   },
  //   {
  //     name: "numiaai",
  //     categoryName: "Tools",
  //     oasFiles: [
  //       {
  //         name: "numiaai",
  //         url: "https://api-docs.numia.xyz/numiaAI/openapi.json",
  //       },
  //     ],
  //     title: "AI Agent Analytics",
  //   },
  //   {
  //     name: "quasar",
  //     categoryName: "Advanced APIs",
  //     oasFiles: [
  //       {
  //         name: "quasar",
  //         url: "https://api-docs.numia.xyz/quasar/openapi.json",
  //       },
  //     ],
  //     title: "Quasar",
  //   },
  //   {
  //     name: "stride",
  //     categoryName: "Advanced APIs",
  //     oasFiles: [
  //       {
  //         name: "stride",
  //         url: "https://api-docs.numia.xyz/stride/openapi.json",
  //       },
  //     ],
  //     title: "Stride",
  //   },
  //   {
  //     name: "xion",
  //     categoryName: "Advanced APIs",
  //     oasFiles: [
  //       {
  //         name: "xion",
  //         url: "https://api-docs.numia.xyz/xion/openapi.json",
  //       },
  //     ],
  //     title: "Xion",
  //   },
  //   {
  //     name: "snapshots",
  //     categoryName: "Tools",
  //     oasFiles: [
  //       {
  //         name: "snapshots",
  //         url: "https://api-docs.numia.xyz/aadao-snapshots/openapi.json",
  //       },
  //     ],
  //     title: "Snapshots",
  //   },
];
