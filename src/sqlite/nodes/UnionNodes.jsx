import { SQLUnionNodeConfig } from "../../sql/nodes/SQLUnionNodes";
import { useColumnSchema } from "./sqliteCompletions";

export const UnionNodeConfig = {
  ...SQLUnionNodeConfig,
  useTypeInputExtensions: useColumnSchema,
};
