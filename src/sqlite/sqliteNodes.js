import { SQLExceptNodeConfig } from "../sql/nodes/SQLExceptNodes";
import { SQLIntersectNodeConfig } from "../sql/nodes/SQLIntersectNodes";
import { FromNodeConfig } from "./nodes/FromNodes";
import { GroupNodeConfig } from "./nodes/GroupNodes";
import { JoinNodeConfig } from "./nodes/JoinNodes";
import { OrderNodeConfig } from "./nodes/OrderNodes";
import { SelectNodeConfig } from "./nodes/SelectNodes";
import { UnionNodeConfig } from "./nodes/UnionNodes";
import { WhereNodeConfig } from "./nodes/WhereNodes";

export const NODE_CONFIGS = {
  from: FromNodeConfig,
  join: JoinNodeConfig,
  select: SelectNodeConfig,
  where: WhereNodeConfig,
  group: GroupNodeConfig,
  order: OrderNodeConfig,
  union: UnionNodeConfig,
  except: SQLExceptNodeConfig,
  intersect: SQLIntersectNodeConfig,
};
