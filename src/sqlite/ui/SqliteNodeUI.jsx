import {
  addDetachedNode,
  AddNodeButton,
  addStandaloneNode,
  addTightNode,
} from "editor/AddNodeButton";
import NodeUI from "editor/NodeUI";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useAppStateDataContext } from "editor/state";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { Fragment } from "react";
import { getEmptyNode, getHasProblem, TIGHT_CHILD_NODES } from "../sqliteNodes";
import { useEditorConfig } from "../sqliteState";

export default function SqliteNodeUI({ hideControls, children }) {
  return (
    <NodeUI
      hideControls={hideControls}
      useControls={useControls}
      useHasProblem={useHasProblem}
    >
      {children}
    </NodeUI>
  );
}

function useControls() {
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

function useHasProblem() {
  const appState = useAppStateDataContext();
  const editorConfig = useEditorConfig();
  const node = useNode();
  return getHasProblem(appState, node, { editorConfig });
}

function AddTightChildStepButtons() {
  return (
    <>
      {Arrays.map(TIGHT_CHILD_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton onAdd={addQueryStep(type)}>{label}</AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

export function addQueryStep(type) {
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
