import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React, { createContext, Fragment, useContext } from "react";
import { Box } from "ui/layout/Box";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { useGetNodeConfig } from "../sqlNodes";
import { Children } from "react";
import { invariant } from "js/invariant";

const Context = createContext();
export function useSQLResultsNodeContext() {
  return useContext(Context);
}

export function useIsThisOnlySelectedNode() {
  const { appState } = useSQLResultsNodeContext();
  return only(Nodes.selected(appState)) != null;
}

export function SQLResults({ appState }) {
  const selected = Nodes.selected(appState);
  const onlyLastSelected = only(Nodes.lastSelected(appState));
  if (selected.length > 2) {
    return null;
  }
  const shown =
    selected.length === 0 && onlyLastSelected != null
      ? [onlyLastSelected]
      : selected;
  const [first, second] = shown;
  return (
    <Row
      css={{
        overflow: "scroll",
        padding: "0 $8",
        maxHeight: "100%",
      }}
    >
      {first == null ? null : second == null ? (
        <Result appState={appState} node={first} />
      ) : (
        <HorizontalSplitView>
          <Result appState={appState} node={first} />
          <Result appState={appState} node={second} />
        </HorizontalSplitView>
      )}
    </Row>
  );
}

function Result({ appState, node }) {
  const getConfig = useGetNodeConfig();
  const Results =
    getConfig(node).Results ??
    (() => {
      return null;
    });
  return (
    <Context.Provider value={{ appState, node }}>
      <Results />
    </Context.Provider>
  );
}

function HorizontalSplitView({ children }) {
  const childrenArray = Children.toArray(children);
  invariant(childrenArray.length === 2, "Split view can have only 2 children");
  const [first, second] = childrenArray;
  return (
    <>
      <Box
        css={{
          height: "fit-content",
          flex: "1 0 0",
          overflowX: "scroll",
          maxWidth: "fit-content",
          borderRight: "1px solid $slate7",
        }}
      >
        {first}
      </Box>
      <HorizontalSpace />
      <HorizontalSpace />
      <Box
        css={{
          height: "fit-content",
          flex: "1 0 0",
          overflowX: "scroll",
          maxWidth: "fit-content",
        }}
      >
        {second}
      </Box>
    </>
  );
}
