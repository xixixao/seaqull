import { SQLGroupNodeConfig } from "../../sql/nodes/SQLGroupNodes";
import { useColumnSchema } from "./sqliteCompletions";

export const GroupNodeConfig = {
  ...SQLGroupNodeConfig,
  useGroupByInputExtensions: useColumnSchema,
  useSelectInputExtensions: useColumnSchema,
};
