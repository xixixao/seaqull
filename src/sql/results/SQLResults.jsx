import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React, { createContext, Fragment, useContext } from "react";
import { Box } from "ui/layout/Box";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { useGetNodeConfig } from "../sqlNodes";
import { Children } from "react";
import { invariant } from "js/invariant";
import { HorizontalSplitView } from "ui/layout/HorizontalSplitView";

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
