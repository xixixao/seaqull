import {
  addDetachedNode,
  AddNodeButton,
  addStandaloneNode,
  addTightNode,
} from "editor/AddNodeButton";
import NodeUI from "editor/NodeUI";
import { useAppStateDataContext } from "editor/state";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import * as Nodes from "graph/Nodes";
import { getEmptyNode, getHasProblem } from "../sqliteNodes";

export default function SqliteNodeUI({ node, showTools, children }) {
  return (
    <NodeUI
      node={node}
      showTools={showTools}
      useAddButtons={useAddButtons}
      hasProblem={hasProblem}
    >
      {children}
    </NodeUI>
  );
}

function useAddButtons({ node, showTools }) {
  const appState = useAppStateDataContext();
  if (Nodes.countSelected(appState) > 2) {
    return null;
  }

  const twoSelected = Nodes.countSelected(appState) === 2;
  const joinable =
    twoSelected &&
    !Nodes.haveSameTightRoot(appState, ...Nodes.selected(appState));
  if (twoSelected && !joinable) {
    return null;
  }
  return joinable ? (
    <AddJoinNodeBtton />
  ) : (
    <>
      {/*
        TODO: Support
        <AddJoinNodeBtton />
      <HorizontalSpace /> */}
      <AddTightChildStepButtons />
    </>
  );
}

function hasProblem(appState, node) {
  return getHasProblem(appState, node);
}

function AddTightChildStepButtons() {
  return (
    <>
      <AddNodeButton onAdd={addQueryStep("where")}>WHERE</AddNodeButton>
      <HorizontalSpace />
      <AddNodeButton onAdd={addQueryStep("group")}>GROUP BY</AddNodeButton>
      <HorizontalSpace />
      <AddNodeButton onAdd={addQueryStep("select")}>SELECT</AddNodeButton>
      <HorizontalSpace />
      <AddNodeButton onAdd={addQueryStep("order")}>ORDER BY</AddNodeButton>
    </>
  );
}

function addQueryStep(type) {
  return addTightNode(getEmptyNode(type));
}

function AddJoinNodeBtton() {
  return (
    <AddNodeButton onAdd={addDetachedNode(getEmptyNode("join"))}>
      JOIN
    </AddNodeButton>
  );
}

export function AddFromNodeButton() {
  return (
    <AddNodeButton onAdd={addStandaloneNode(getEmptyNode("from"))}>
      FROM
    </AddNodeButton>
  );
}
