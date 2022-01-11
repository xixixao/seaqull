import { DropdownMenuIcon, PlusIcon } from "@modulz/radix-icons";
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as Arrays from "./Arrays";
import { first, only, onlyThrows, second } from "./Arrays";
import { Button } from "./components/Button";
import { ButtonWithIcon } from "./components/ButtonWithIcon";
import { Column } from "./components/Column";
import { IconButton } from "./components/IconButton";
import { PaneControls } from "./components/PaneControls";
import { Row } from "./components/Row";
import { database, tableColumns } from "./database";
import * as Edge from "./Edge";
import * as Edges from "./Edges";
import * as FromNodes from "./FromNodes";
import * as GroupNodes from "./GroupNodes";
import { produce } from "./immer";
import { invariant } from "./invariant";
// import * as NameNodes from "./NameNodes";
import * as JoinNodes from "./JoinNodes";
import * as Node from "./Node";
import * as Nodes from "./Nodes";
import * as OrderNodes from "./OrderNodes";
import ReactFlow, { Background, Handle, ReactFlowProvider } from "./react-flow";
import * as SelectNodes from "./SelectNodes";
import {
  AppStateContextProvider,
  useAppStateContext,
  useAppStateDataContext,
  useSetAppStateCallback,
  useSetAppStateContext,
} from "./state";
import { SQLITE_ACTORS_PER_FILM } from "./statesRepository";
import { keyframes, styled } from "./style";
import * as WhereNodes from "./WhereNodes";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "./components/DropdownMenu";

// The logical ordering would be
// FROM (foo JOIN boo ON bla)
// WHERE
// SELECT
// DISTINCT | GROUP BY
// HAVING
// ORDER
// LIMIT

function App() {
  return (
    <ReactFlowProvider>
      <AppStateContextProvider
        initialState={stateFromSnapshot(SQLITE_ACTORS_PER_FILM)}
      >
        <Content />
      </AppStateContextProvider>
    </ReactFlowProvider>
  );
}

function useSetSelectedNodeState() {
  return useSetAppStateCallback((producer) => (appState) => {
    producer(onlyThrows(Nodes.selected(appState)));
  });
}

const LayoutRequestContext = createContext();

function Content() {
  // const [namespace, setNamespace] = useState("foo_team");
  // const [notebookName, setNotebookName] = useState("Untitled");

  return (
    <>
      {/* <div style={{ padding: "0 4px 4px" }}>
        <Input label="namespace" value={namespace} onChange={setNamespace} />
        <HorizontalSpace />
        <Input
          label="notebook name"
          value={notebookName}
          onChange={setNotebookName}
        />
        <HorizontalSpace />
      </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <NodesPane />
        <div
          style={{
            overflowX: "scroll",
            flexGrow: 1,
            maxHeight: "50%",
            padding: "0 8px",
          }}
        >
          <ResultsTable />
        </div>
      </div>
    </>
  );
}

function stateFromSnapshot([nodes, positions, edges]) {
  return {
    nodes: idMap(nodes),
    positions: new Map(nodes.map((element, i) => [element.id, positions[i]])),
    edges: idMap(edges),
  };
}

const Div = styled("div");

function idMap(array) {
  return new Map(array.map((element) => [element.id, element]));
}

function NodesPane() {
  //   const onElementsRemove = (elementsToRemove) =>
  //     setElements((els) => removeElements(elementsToRemove, els));
  // const onConnect = (params) => setElements((els) => addEdge(params, els));
  // const updateNodePosDiff = useStoreActions(
  //   (actions) => actions.updateNodePosDiff
  // );
  const appState = useAppStateContext();
  const setAppState = useSetAppStateContext();

  const layoutRequestRef = useRef(null);
  useLayoutEffect(() => {
    if (layoutRequestRef.current != null) {
      const request = layoutRequestRef.current;
      setAppState((appState) => {
        const [nodeID, layoutCallback] = request;
        if (Nodes.positionWithID(appState, nodeID).height != null) {
          const node = Nodes.nodeWithID(appState, nodeID);
          layoutCallback(appState, node);
        }
      });
      layoutRequestRef.current = null;
    }
  }, [appState, setAppState]);

  const onRequestLayout = useCallback((request) => {
    layoutRequestRef.current = request;
  }, []);

  const onSelectionChange = useCallback(
    (elements) => {
      const nodes = (elements ?? []).filter(
        (element) => element.source == null
      );
      setAppState((appState) => {
        if (
          !Arrays.isEqual(
            nodes.map(Node.id),
            Array.from(appState.selectedNodeIDs)
          )
        ) {
          Nodes.select(appState, nodes);
        }
      });
    },
    [setAppState]
  );

  return (
    <LayoutRequestContext.Provider value={onRequestLayout}>
      <Div
        css={{
          height: "65%",
          borderBottom: "1px solid $slate7",
          // borderTop: "1px solid $slate7",
          outline: "none",
        }}
        tabIndex="-1"
        onKeyDown={(e) => {
          if (e.key === "Backspace") {
            setAppState((appState) => {
              if (Nodes.countSelected(appState) > 0) {
                const selectedNodes = Nodes.selected(appState);
                selectedNodes.forEach((node) => {
                  const tightParent = Nodes.tightParent(appState, node);
                  const children = Nodes.children(appState, node);
                  Nodes.remove(appState, node);
                  if (tightParent != null) {
                    Edges.addTightChildren(appState, tightParent, children);
                    Nodes.layout(appState, tightParent);
                  }
                });
                Nodes.select(appState, []);
              }
            });
          }
        }}
      >
        <ReactFlow
          nodeTypes={NODE_COMPONENTS}
          edgeTypes={EDGE_COMPONENTS}
          onSelectionChange={onSelectionChange}
          // onElementsRemove={onElementsRemove}
          // onConnect={onConnect}
          // onLoad={onLoad}
        >
          {/* <MiniMap
        nodeStrokeColor={(n) => {
          if (n.style?.background) return n.style.background;
          if (n.type === "input") return "#0041d0";
          if (n.type === "output") return "#ff0072";
          if (n.type === "default") return "#1a192b";

          return "#eee";
        }}
        nodeColor={(n) => {
          if (n.style?.background) return n.style.background;

          return "#fff";
        }}
        nodeBorderRadius={2}
      /> */}

          <div
            style={{
              position: "absolute",
              padding: 4,
              zIndex: 5,
              transform: "translate(-50%, 0)",
              top: 0,
              left: "50%",
            }}
          >
            <AddFromNodeButton />
          </div>
          <PaneControls showInteractive={false} />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </Div>
    </LayoutRequestContext.Provider>
  );
}

const FromNode = {
  name: "FromNode",
  Component(node) {
    const name = FromNodes.name(node);
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node} showTools={name?.length > 0}>
        FROM{" "}
        <Input
          focused={name == null}
          value={name}
          onChange={(name) => {
            setSelectedNodeState((node) => {
              FromNodes.setName(node, name);
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData: FromNodes.empty,
  query(appState, node) {
    const name = FromNodes.name(node);
    return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalValues(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    return FromNode.query(appState, node);
  },
  columnNames(appState, node) {
    return new Set(tableColumns(FromNodes.name(node)));
  },
  columnControl() {
    return null;
  },
};

const JoinNode = {
  name: "JoinNode",
  Component(node) {
    const filters = JoinNodes.filters(node);
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node}>
        {/* todo type of join */}
        JOIN ON{" "}
        <Input
          displayValue={!JoinNodes.hasFilter(node) ? "∅" : null}
          value={filters}
          onChange={(filters) => {
            setSelectedNodeState((node) => {
              JoinNodes.setFilters(node, filters);
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData: JoinNodes.empty,
  query(appState, node) {
    const parents = Nodes.parents(appState, node);

    const joinedColumns = JoinNodes.joinedColumns(node);
    const aOtherColumns = subtractArrays(
      Array.from(getColumnNames(appState, first(parents))),
      joinedColumns.map(first)
    );
    const bOtherColumns = subtractArrays(
      Array.from(getColumnNames(appState, second(parents))),
      joinedColumns.map(second)
    );

    return `SELECT ${
      joinedColumns.length > 0
        ? joinedColumns
            .map(first)
            .map((column) => "a." + column)
            .concat(
              aOtherColumns.map((column) => "a." + column),
              bOtherColumns.map((column) => "b." + column)
            )
            .join(",")
        : "a.*, b.*"
    } FROM (${getQuerySelectable(appState, parents[0])}) AS a
    JOIN (${getQuerySelectable(appState, parents[1])}) AS b ${
      JoinNodes.hasFilter(node) ? `ON ${JoinNodes.filters(node)}` : ""
    }`;
    // Nodes.parents(appState, node)
    // return (name ?? "").length > 0 ? `SELECT * from ${name}` : null;
  },
  queryAdditionalValues(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    const parents = Nodes.parents(appState, node);
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return `SELECT ${JoinNodes.selectedColumnExpressionsAliased(
      node,
      parentsColumnNames
    ).join(",")} FROM (${getQuerySelectable(appState, parents[0])}) AS a
    JOIN (${getQuerySelectable(appState, parents[1])}) AS b ${
      JoinNodes.hasFilter(node) ? `ON ${JoinNodes.filters(node)}` : ""
    }`;
  },
  columnNames(appState, node) {
    const parents = Nodes.parents(appState, node);
    const parentsColumnNames = parents.map((parent) =>
      getColumnNames(appState, parent)
    );
    return JoinNodes.selectedColumnNames(node, parentsColumnNames);
  },
  // TODO: Obviously refactor this
  columnControl(
    appState,
    node,
    columnName,
    setSelectedNodeState,
    isPrimary,
    columnIndex
  ) {
    const joinedColumns = JoinNodes.joinedColumns(node);
    const parents = Nodes.parents(appState, node);

    const aOtherColumns = subtractArrays(
      Array.from(getColumnNames(appState, first(parents))),
      joinedColumns.map(first)
    );
    const isJoined = columnIndex < joinedColumns.length;
    const isA = columnIndex < joinedColumns.length + aOtherColumns.length;
    const prefixedColumnName =
      (isJoined ? "" : (isA ? "a" : "b") + ".") + columnName;
    return (
      <Row align="center">
        {isJoined ? (
          <>
            <ColumnCheckbox
              checked={true}
              onChange={() => {
                setSelectedNodeState((node) => {
                  JoinNodes.removeFilter(node, columnName);
                });
              }}
            />
            <HorizontalSpace />
            <HorizontalSpace />
          </>
        ) : null}
        {prefixedColumnName}
        {!isJoined ? (
          <JoinOnSelector
            columns={Arrays.map(
              getColumnNames(
                appState,
                (isA ? second : first)(Nodes.parents(appState, node))
              ),
              (column) => (!isA ? "a" : "b") + "." + column
            )}
            onChange={(otherColumn) => {
              setSelectedNodeState((node) => {
                JoinNodes.addFilter(
                  node,
                  `${prefixedColumnName} = ${otherColumn}`
                );
              });
            }}
          />
        ) : null}
      </Row>
    );
  },
};

function JoinOnSelector({ columns, onChange }) {
  return (
    <ShowOnClick
      css={{
        position: "absolute",
        top: "100%",
        background: "$slate7",
        padding: "$4",
        borderRadius: "$4",
      }}
      trigger={
        <IconButton>
          <DropdownMenuIcon />
        </IconButton>
      }
    >
      <Column>
        {columns.map((column) => (
          <Button
            css={{ marginTop: "$4" }}
            key={column}
            onClick={() => onChange(column)}
          >
            {column}
          </Button>
        ))}
      </Column>
    </ShowOnClick>
  );
}

// const NameNode = {
//   name: "NameNode",
//   Component(node) {
//     const setSelectedNodeState = useSetSelectedNodeState();
//     return (
//       <NodeUI
//         node={node}
//         showTools={true}
//         tools={<AddFromOrChildStepButtons />}
//       >
//         <Input
//           value={NameNodes.name(node)}
//           onChange={(name) => {
//             setSelectedNodeState((node) => {
//               NameNodes.setName(node, name);
//             });
//           }}
//         />
//         {/* <Handle type="target" position="top" /> */}
//         {/* <Handle type="source" position="right" /> */}
//       </NodeUI>
//     );
//   },
//   emptyNodeData() {
//     return NameNodes.empty();
//   },
//   query(appState, node) {
//     return getQuery(appState, Nodes.parentX(appState, node));
//   },
//   queryAdditionalValues(appState, node) {
//     return null;
//   },
//   columnNames(appState, node) {
//     return getColumnNames2(appState, Nodes.parentX(appState, node));
//   },
//   columnControl(appState, node, columnName, setAppState) {
//     return null;
//   },
// };

const SelectNode = {
  name: "SelectNode",
  Component(node) {
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node}>
        SELECT{" "}
        <Input
          value={someOrAllColumnList(SelectNodes.selectedExpressions(node))}
          onChange={(expressions) => {
            setSelectedNodeState((node) => {
              SelectNodes.setSelectedExpressions(
                node,
                "*" === expressions ? [] : expressions.split(/, */)
              );
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData() {
    return SelectNodes.empty();
  },
  query(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    return `SELECT ${someOrAllColumnList(
      SelectNodes.selectedExpressions(node)
    )} FROM (${fromQuery})`;
  },
  queryAdditionalValues(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    const selectedExpressions = SelectNodes.selectedExpressions(node);
    if (selectedExpressions.length === 0) {
      return null;
    }
    const otherColumns = subtractArrays(
      Array.from(getColumnNames(appState, sourceNode)),
      selectedExpressions
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    return `SELECT ${someOrAllColumnList(
      SelectNodes.selectedExpressionsAliased(node)
    )} FROM (${fromQuery})`;
  },
  columnNames(appState, node) {
    const sourceNode = getSource(appState, node);
    const selectedExpressions = SelectNodes.selectedExpressions(node);
    return selectedExpressions.length > 0
      ? SelectNodes.selectedColumns(node)
      : getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState) {
    return (
      <SelectableColumn
        node={node}
        columnName={columnName}
        setSelectedNodeState={setSelectedNodeState}
      />
    );
  },
};

function SelectableColumn({ node, columnName, setSelectedNodeState }) {
  return (
    <Row align="center">
      <ColumnCheckbox
        checked={SelectNodes.hasSelectedColumn(node, columnName)}
        onChange={() => {
          setSelectedNodeState((node) => {
            SelectNodes.toggleSelectedColumn(node, columnName);
          });
        }}
      />

      <HorizontalSpace />
      <HorizontalSpace />
      {columnName}
      <HorizontalSpace />
    </Row>
  );
}

function ColumnCheckbox({ checked, onChange }) {
  return (
    <input
      checked={checked}
      style={{ cursor: "pointer" }}
      type="checkbox"
      onChange={onChange}
    />
  );
}

function visibleIf(bool) {
  return { visibility: bool ? "visible" : "hidden" };
}

const WhereNode = {
  name: "WhereNode",
  Component(node) {
    const filters = WhereNodes.filters(node);
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node}>
        WHERE{" "}
        <Input
          displayValue={!WhereNodes.hasFilter(node) ? "∅" : null}
          value={filters}
          onChange={(filters) => {
            setSelectedNodeState((node) => {
              WhereNodes.setFilters(node, filters);
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData: WhereNodes.empty,
  query(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!WhereNodes.hasFilter(node)) {
      return `SELECT * FROM (${fromQuery})`;
    }
    return `SELECT * FROM (${fromQuery}) WHERE ${WhereNodes.filters(node)}`;
  },
  queryAdditionalValues(appState, node) {
    return null;
  },
  querySelectable(appState, node) {
    return WhereNode.query(appState, node);
  },
  columnNames(appState, node) {
    const sourceNode = getSource(appState, node);
    return getColumnNames(appState, sourceNode);
  },
  columnControl() {
    return null;
  },
};

function GroupNodeComponent(node) {
  return (
    <NodeUI node={node}>
      <div>
        GROUP BY{" "}
        {someOrNoneColumnList(Array.from(GroupNodes.groupedColumns(node)))}
      </div>
      <Div
        css={{ color: !GroupNodes.hasGrouped(node) ? "$slate11" : undefined }}
      >
        SELECT {someOrAllColumnList(GroupNodes.selectedColumnExpressions(node))}
      </Div>
    </NodeUI>
  );
}

function someOrNoneColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "∅";
}

function someOrAllColumnList(columnNames) {
  return columnNames.length > 0 ? columnNames.join(", ") : "*";
}

const GroupNode = {
  Component: GroupNodeComponent,
  emptyNodeData: GroupNodes.empty,
  query(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!GroupNodes.hasGrouped(node)) {
      return `SELECT * from (${fromQuery})`;
    }

    return GroupNodes.sql(
      node,
      GroupNodes.selectedColumnExpressions(node),
      fromQuery
    );
  },
  queryAdditionalValues(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!GroupNodes.hasGrouped(node)) {
      return null;
    }
    const otherColumns = subtractArrays(
      Array.from(getColumnNames(appState, sourceNode)),
      GroupNodes.groupedColumns(node)
    );
    if (otherColumns.length === 0) {
      return null;
    }
    return [`SELECT ${otherColumns} FROM (${fromQuery})`];
  },
  querySelectable(appState, node) {
    if (!GroupNodes.hasGrouped(node)) {
      return GroupNode.query(appState, node);
    }
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    return GroupNodes.sql(
      node,
      GroupNodes.selectedColumnExpressionsAliased(node),
      fromQuery
    );
  },
  columnNames(appState, node) {
    const sourceNode = getSource(appState, node);
    return GroupNodes.hasGrouped(node)
      ? GroupNodes.selectedColumns(node)
      : getColumnNames(appState, sourceNode);
  },
  columnControl(appState, node, columnName, setSelectedNodeState, isPrimary) {
    return (
      <Row align="center">
        <input
          checked={GroupNodes.hasGroupedColumn(node, columnName)}
          style={{ cursor: "pointer" }}
          type="checkbox"
          onChange={(event) => {
            setSelectedNodeState((node) => {
              GroupNodes.toggleGroupedColumn(node, columnName);
            });
          }}
        />
        <HorizontalSpace />
        <HorizontalSpace />
        {columnName}
        {!isPrimary && GroupNodes.hasGrouped(node) ? (
          <AggregationSelector
            onChange={(aggregation) => {
              setSelectedNodeState((node) => {
                GroupNodes.addAggregation(node, columnName, aggregation);
              });
            }}
          />
        ) : null}
      </Row>
    );
  },
};

function AggregationSelector({ onChange }) {
  return (
    <ShowOnClick
      css={{
        position: "absolute",
        top: "100%",
        background: "$slate7",
        padding: "$4",
        borderRadius: "$4",
      }}
      trigger={
        <IconButton>
          <DropdownMenuIcon />
        </IconButton>
      }
    >
      <Column>
        {Object.keys(GroupNodes.AGGREGATIONS).map((aggregation) => (
          <Button
            css={{ marginTop: "$4" }}
            key={aggregation}
            onClick={() => onChange(aggregation)}
          >
            {aggregation}
          </Button>
        ))}
      </Column>
    </ShowOnClick>
    /* <Tooltip content="Select aggregation" side="bottom" align="start">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DropdownMenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>Hello</DropdownMenuContent>
      </DropdownMenu>
    </Tooltip> */
  );
}

const OrderNode = {
  name: "OrderNode",
  Component(node) {
    const setSelectedNodeState = useSetSelectedNodeState();
    return (
      <NodeUI node={node}>
        ORDER BY{" "}
        <Input
          value={
            !OrderNodes.hasOrdered(node) ? "∅" : OrderNodes.orderClause(node)
          }
          onChange={(orderClause) => {
            setSelectedNodeState((node) => {
              let columnToOrder = {};
              orderClause
                .split(/, */)
                .map((columnOrder) => columnOrder.split(/ +/))
                .filter(([column]) => column !== "∅")
                .forEach(([column, order]) => {
                  columnToOrder[column] = order ?? "ASC";
                });
              node.data.columnToOrder = columnToOrder;
            });
          }}
        />
      </NodeUI>
    );
  },
  emptyNodeData: OrderNodes.empty,
  query(appState, node) {
    const sourceNode = getSource(appState, node);
    const fromQuery = getQuerySelectable(appState, sourceNode);
    if (!OrderNodes.hasOrdered(node)) {
      return fromQuery;
    }
    return `SELECT * FROM  (${fromQuery})
    ORDER BY ${OrderNodes.orderClause(node)}`;
  },
  queryAdditionalValues() {
    return null;
  },
  querySelectable(appState, node) {
    return OrderNode.query(appState, node);
  },
  columnNames(appState, node) {
    return getColumnNames(appState, getSource(appState, node));
  },
  columnControl(appState, node, columnName, setSelectedNodeState) {
    // const selectableColumnNames = getColumnNames(appState, node.source);
    // // TODO: Fix O(N^2) algo to be nlogn
    // if (!selectableColumnNames.find((column) => column === columnName)) {
    //   return null;
    // }
    const columnToOrderNotNull = node.data.columnToOrder ?? {};
    const state = columnToOrderNotNull[columnName];
    return (
      <Row>
        <Button
          onClick={() => {
            setSelectedNodeState((node) => {
              node.data.columnToOrder = produce(columnToOrderNotNull, (map) => {
                switch (state) {
                  case "ASC":
                    map[columnName] = "DESC";
                    break;
                  case "DESC":
                    delete map[columnName];
                    break;
                  default:
                    map[columnName] = "ASC";
                }
              });
            });
          }}
        >
          {(() => {
            switch (state) {
              case "ASC":
                return "▲";
              case "DESC":
                return "▼";
              default:
                return "-";
            }
          })()}
        </Button>
        <HorizontalSpace />
        {columnName}
      </Row>
    );
  },
};

// function NodeInput({
//   label,
//   node,
//   appState,
//   value,
//   showTools,
//   setAppState,
//   children,
//   onChange,
// }) {
//   const { selectedNodeID } = appState;
//   const isSelected = node.id === selectedNodeID;
//   return (
//     <NodeUI
//       node={node}
//       appState={appState}
//       showTools={showTools}
//       setAppState={setAppState}
//     >
//       {label}{" "}
//       <Input
//         displayValue={isSelected ? value : value.slice(0, 10) + "..."}
//         value={value}
//         onChange={onChange}
//       />
//     </NodeUI>
//   );
// }

function NodeUI({ node, showTools, children }) {
  const appState = useAppStateContext();
  return (
    <div>
      <Box isHighlighted={node.highlight} isSelected={node.selected}>
        {children}
        <Handle
          style={visibleIf(Nodes.hasDetachedParents(appState, node))}
          type="target"
          position="left"
        />
        <Handle
          style={visibleIf(Nodes.hasDetachedChildren(appState, node))}
          type="source"
          position="right"
        />
      </Box>
      <Div
        css={{
          position: "absolute",
          left: "100%",
          top: "100%",
          transform: "translate(-100%, -30%)",
        }}
      >
        {Node.label(node)}
      </Div>
      <NodeUIAddButtons node={node} showTools={showTools} />
      {/* <HorizontalSpace /> */}
      {/* <DeleteNodeButton node={node} /> */}
      {/* {isSelected && showTools ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 2,
              left: "100%",
              width: 300,
            }}
          >
            <HorizontalSpace />
            <AddConnectedFromNodeButon />
          </div>
          <div style={{ position: "absolute", top: "110%", width: 300 }}>
            <AddChildStepButtons />
          </div>
        </>
      ) : null} */}
    </div>
  );
}

function NodeUIAddButtons({ node, showTools }) {
  const appState = useAppStateContext();
  if (Nodes.countSelected(appState) > 2 || node.isDragging) {
    return null;
  }

  const twoSelected = Nodes.countSelected(appState) === 2;
  const joinable =
    twoSelected &&
    !Nodes.haveSameTightRoot(appState, ...Nodes.selected(appState));
  if (twoSelected && !joinable) {
    return null;
  }

  const isSelected = node.selected;
  const isLast = !Nodes.hasTightChildren(appState, node);

  const addChildrenButtonsPositioned = (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        // transform: "translate(0, -50%)",
        // width: 340,
      }}
    >
      <Row>
        {joinable ? (
          <AddJoinNodeBtton />
        ) : (
          <>
            {/*
              TODO: Support
             <AddJoinNodeBtton />
            <HorizontalSpace /> */}
            <AddTightChildStepButtons />
          </>
        )}
      </Row>
    </div>
  );
  return !(showTools ?? true) || !isSelected ? null : isLast ? (
    addChildrenButtonsPositioned
  ) : (
    <FloatOnHover
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translate(-100%, -50%)",
      }}
      trigger={
        <IconButton>
          <PlusIcon />
        </IconButton>
      }
    >
      {addChildrenButtonsPositioned}
    </FloatOnHover>
  );
}

function FloatOnHover({ style, trigger, children }) {
  const [isFloating, setIsFloating] = useState(false);
  // const floated = React.cloneElement(React.Children.only(children), {
  //   onMouseLeave: () => setIsFloating(false),
  // });
  return (
    <>
      <div style={style} onMouseEnter={() => setIsFloating(true)}>
        {trigger}
      </div>
      {isFloating ? (
        <div onMouseLeave={() => setIsFloating(false)}>{children}</div>
      ) : null}
    </>
  );
}

function ShowOnClick({ css, trigger, children }) {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setIsShowing(true)}>{trigger}</div>
      {isShowing ? (
        <Div css={css} onMouseLeave={() => setIsShowing(false)}>
          {children}
        </Div>
      ) : null}
    </div>
  );
}

// function Selectable({ node, children }) {
//   const [, setAppState] = useAppStateContext();
//   return (
//     <span
//       onClick={() => {
//         setAppState((appState) => {
//           appState.selectedNodeID = node.id;
//         });
//       }}
//     >
//       {children}
//     </span>
//   );
// }

function TightEdge() {
  return <></>;
}

function subtractArrays(a, b) {
  const bSet = new Set(b);
  return a.filter((column) => !bSet.has(column));
}

function getSource(appState, node) {
  return only(Nodes.parents(appState, node));
}

function getType(node) {
  const type = NODE_TYPES[node.type];
  invariant(type != null);
  return type;
}

function getQuery(appState, node) {
  return getType(node).query(appState, node);
}

function getQueryAdditionalValues(appState, node) {
  return getType(node).queryAdditionalValues(appState, node);
}

function getQuerySelectable(appState, node) {
  return getType(node).querySelectable(appState, node);
}

function getColumnNames(appState, node) {
  return getType(node).columnNames(appState, node);
}

function AddTightChildStepButtons() {
  return (
    <>
      <AttachNodeButton onAdd={attachTightNode("where")}>
        WHERE
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("group")}>
        GROUP BY
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("select")}>
        SELECT
      </AttachNodeButton>
      <HorizontalSpace />
      <AttachNodeButton onAdd={attachTightNode("order")}>
        ORDER BY
      </AttachNodeButton>
    </>
  );
}

function AddJoinNodeBtton() {
  return <AttachNodeButton onAdd={addJoinNode}>JOIN</AttachNodeButton>;
}

function AddFromNodeButton() {
  return <AttachNodeButton onAdd={addFromNode}>FROM</AttachNodeButton>;
}

function AttachNodeButton({ children, onAdd }) {
  const setAppState = useSetAppStateContext();
  const onRequestLayout = useContext(LayoutRequestContext);
  return (
    <ButtonWithIcon
      icon={<PlusIcon />}
      onClick={() => {
        setAppState((appState) => {
          onRequestLayout(onAdd(appState));
        });
      }}
    >
      {children}
    </ButtonWithIcon>
  );
}

function attachTightNode(type) {
  return (appState) => {
    const data = getType({ type }).emptyNodeData();
    const newNode = Nodes.newNode(appState, { type, data });
    // const selectedNode = onlyThrows(Nodes.selected(appState));
    attachAndSelectNode(appState, newNode);
    return [Node.id(newNode), layoutTightChild];
    // Nodes.layout(appState, selectedNode, );
  };
}

function layoutTightChild(appState, node) {
  const parent = Nodes.tightParent(appState, node);
  Nodes.layout(appState, parent);
}

function addFromNode(appState) {
  const data = FromNode.emptyNodeData();
  const newNode = Nodes.newNode(appState, { type: "from", data });
  Nodes.add(appState, newNode);
  Nodes.select(appState, [newNode]);
  return [Node.id(newNode), Nodes.layoutStandalone];
}

function addJoinNode(appState) {
  // TODO: Support adding when 2 are not selected
  const selected = Nodes.selected(appState);
  // Nodes.ensureLabel(appState, selectedNode);
  const data = JoinNode.emptyNodeData();
  const newNode = Nodes.newNode(appState, { type: "join", data });
  selected.forEach((node) => {
    Edges.addChild(appState, node, newNode);
  });
  Nodes.add(appState, newNode);
  Nodes.select(appState, [newNode]);
  return [Node.id(newNode), layoutChild];
}

function layoutChild(appState, node) {
  Nodes.layoutDetached(appState, Nodes.parents(appState, node), node);
}

function attachAndSelectNode(appState, newNode) {
  const selectedNode = onlyThrows(Nodes.selected(appState));
  const selectedNodeChildren = Nodes.tightChildren(appState, selectedNode);
  const selectedNodeChildEdges = Edges.tightChildren(appState, selectedNode);
  Edges.removeAll(appState, selectedNodeChildEdges);
  Edges.addTightChildren(appState, newNode, selectedNodeChildren);
  Edges.addTightChild(appState, selectedNode, newNode);
  Nodes.add(appState, newNode);
  Nodes.select(appState, [newNode]);
}

const Box = styled("div", {
  cursor: "move",
  // display: "inline-block",
  background: "$slate1",
  borderRadius: "8px",
  border: `1px solid $slate7`,
  // boxShadow: props.isSelected ? "0 0 0 0.5px #0041d0" : "none",
  // borderRadius: 4,
  // boxShadow: "rgb(201 204 209) 0px 0px 0px 1px",
  // background: props.isSelected ? "#e7f2fd" : "white",
  // boxSizing: "border-box",
  padding: "2px 8px",
  variants: {
    isSelected: {
      true: {
        borderColor: "$blue9",
        boxShadow: "0 0 0 0.5px $colors$blue9",
      },
    },
    isHighlighted: {
      true: {
        borderBottomColor: "$amber9",
      },
    },
  },
  // margin: "0 4px 2px 0",
});

function ResultsTable() {
  const appState = useAppStateDataContext();
  const [tableState, setTableState] = useState(null);
  const [lastShownNode, setLastShownNode] = useState(null);
  const [updated, setUpdated] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const selected = Nodes.selected(appState);
    const isSelecting = selected.length > 0;
    const previous = lastShownNode && Nodes.current(appState, lastShownNode);
    if (previous == null && !isSelecting) {
      setTableState(null);
      return;
    }
    const oneShown = only(selected) ?? previous;
    const isEditing = selected.length === 1;
    const queries = (isSelecting ? selected : [oneShown])
      .map((node) =>
        (isEditing ? getQuery : getQuerySelectable)(appState, node)
      )
      .concat(isEditing ? getQueryAdditionalValues(appState, oneShown) : [])
      .filter((query) => query != null);
    // console.log(appState);
    // console.log(query);
    if (queries.length > 0) {
      setIsLoading(true);
    }
    const ARTIFICIAL_DELAY = 300;
    database.then((database) =>
      setTimeout(() => {
        setIsLoading(false);
        if (queries.length > 0) {
          setTableState({
            tables: queries.map((query) => execQuery(database, query)),
            appState: appState,
          });
          setUpdated(
            lastShownNode != null &&
              oneShown != null &&
              !Node.is(oneShown, lastShownNode)
          );
          setLastShownNode(oneShown);
        }
        const NEW_RESULTS_INDICATOR_DURATION = 1000;
        setTimeout(() => setUpdated(false), NEW_RESULTS_INDICATOR_DURATION);
      }, ARTIFICIAL_DELAY)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  if (isLoading && tableState == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  } else if (tableState == null) {
    return null;
  }
  return (
    <Div
      css={{
        display: "inline-flex",
        border: "1px solid transparent",
        animation: updated ? `${borderBlink} 1s ease-out` : null,
      }}
    >
      <ResultsTableLoaded state={tableState} />
    </Div>
  );
}

const borderBlink = keyframes({
  from: { borderColor: "$lime9" },
  to: { borderColor: "transparent" },
});

const TH = styled("th");
const TD = styled("td");

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { tables, appState },
}) {
  // const { selectedNodeID } = appState;
  // const availableColumnNamesSet = getAvailableColumnNamesSet(
  //   appState,
  //   selectedNodeID
  // );
  // const columnNames = getAllColumnNames(appState, selectedNodeID);
  const setSelectedNodeState = useSetSelectedNodeState();
  const selectedNode = only(Nodes.selected(appState));
  const brokenTable = tables.find((table) => table instanceof ResultError);
  if (brokenTable != null) {
    return (
      <Column css={{ background: "$red3", padding: "$12", borderRadius: "$4" }}>
        <div>{brokenTable.sql}</div>
        <div>{brokenTable.error.toString()}</div>
      </Column>
    );
  }
  const columns = tables[0].columns.concat(
    ...tables.slice(1).map((table) => [""].concat(table.columns))
  );
  const values = [tables[0].values].concat(
    ...tables.slice(1).map((table) => [[[""]], table.values])
  );
  const rowCount = Math.max(...values.map((rows) => rows.length));
  const primaryColumnCount = tables[0].columns.length;
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, i) => {
            const isPrimary = i < primaryColumnCount;
            return (
              <TH
                key={i}
                css={{
                  textAlign: "start",
                  whiteSpace: "nowrap",
                  color: isPrimary ? null : "$slate11",
                  // color: availableColumnNamesSet.has(column) ? "black" : "#ddd",
                }}
              >
                {column !== ""
                  ? (() => {
                      if (selectedNode == null) {
                        return column;
                      }
                      const control = getType(selectedNode).columnControl(
                        appState,
                        selectedNode,
                        column,
                        setSelectedNodeState,
                        isPrimary,
                        i
                      );
                      return control ?? column;
                    })()
                  : null}
              </TH>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {[...Array(rowCount)].map((_, j) => (
          <tr key={j}>
            {values.map((rows, tableIndex) =>
              rows[0].map((_, i) => (
                <TD
                  css={{
                    whiteSpace: "nowrap",
                    color: tableIndex > 0 ? "$slate11" : null,
                  }}
                  key={i}
                >
                  {(rows[j] ?? [])[i] ?? ""}
                </TD>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

function Input({ displayValue, focused, label, value, onChange: setValue }) {
  const [edited, setEdited] = useState(focused ?? false ? "" : null);
  const [defaultValue] = useState(value);
  const inputRef = useRef();
  const isEditing = edited != null;
  useEffect(() => {
    if (isEditing && !inputRef.current.focused) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  const handleReset = useCallback(() => {
    if (edited === "" && value == null) {
      if (defaultValue != null) {
        setValue(defaultValue);
      } else {
        return;
      }
    }
    setEdited(null);
    setValue(edited);
  }, [defaultValue, edited, value, setValue]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edited != null && !inputRef.current.contains(event.target)) {
        handleReset();
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [edited, handleReset]);
  return (
    <div
      style={{ display: "inline-block" }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      {label != null ? <Label>{label}</Label> : null}
      {edited != null ? (
        <input
          ref={inputRef}
          style={{
            display: "block",
            outline: "none",
            borderWidth: "0 0 1px 0",
            borderColor: "#0041d0",
          }}
          type="text"
          value={edited}
          onMouseLeave={handleReset}
          onChange={(e) => setEdited(e.target.value)}
        />
      ) : (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setEdited(value ?? "")}
        >
          {displayValue ?? value}
        </div>
      )}
    </div>
  );
}

function Label(props) {
  return <span style={{ fontSize: 12 }}>{props.children}</span>;
}

function HorizontalSpace() {
  return <Div css={{ minWidth: "2px" }}></Div>;
}

class ResultError {
  constructor(sql, error) {
    this.sql = sql;
    this.error = error;
  }
}

function execQuery(db, sql) {
  // console.log(sql);
  try {
    return db.exec(sql + " LIMIT 100")[0];
  } catch (e) {
    return new ResultError(sql, e);
  }
}

const NODE_TYPES = {
  from: FromNode,
  // name: NameNode,
  join: JoinNode,
  select: SelectNode,
  where: WhereNode,
  group: GroupNode,
  order: OrderNode,
};
const NODE_COMPONENTS = objectMap(NODE_TYPES, (type) => type.Component);
const EDGE_COMPONENTS = {
  tight: TightEdge,
};

function objectMap(object, fn) {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

export default App;
