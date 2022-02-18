import { SQLSelectNodeConfig } from "../../sql/nodes/SQLSelectNodes";
import { useColumnSchema } from "./sqliteCompletions";

export const SelectNodeConfig = {
  ...SQLSelectNodeConfig,
  useSelectInputExtensions: useColumnSchema,
};
