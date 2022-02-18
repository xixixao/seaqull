import { SQLWhereNodeConfig } from "../../sql/nodes/SQLWhereNodes";
import { useColumnSchema } from "./sqliteCompletions";

export const WhereNodeConfig = {
  ...SQLWhereNodeConfig,
  useWhereInputExtensions: useColumnSchema,
};
