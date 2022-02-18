import { SQLOrderNodeConfig } from "../../sql/nodes/SQLOrderNodes";
import { useColumnSchema } from "./sqliteCompletions";

export const OrderNodeConfig = {
  ...SQLOrderNodeConfig,
  useOrderInputExtensions: useColumnSchema,
};
