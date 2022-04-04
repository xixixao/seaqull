import * as Layout from "seaqull/Layout";
import * as History from "seaqull/History";
import * as Edges from "graph/Edges";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { onlyWarns } from "js/Arrays";
import { useLayoutRequest } from "./layoutRequest";
import { useSetAppStateContext } from "./state";
import { ButtonWithIcon } from "../ui/interactive/ButtonWithIcon";
import { useRefEventListener } from "../react/useRefEventListener";
import { useNodeUIProps } from "./react-flow/components/Nodes/wrapNode";

export function AddNodeButton({ icon, children, onAdd }) {
  return (
    <ButtonWithIcon icon={icon} onClick={useAddNode(onAdd)}>
      {children}
    </ButtonWithIcon>
  );
}

export function AddNodeButtonWithKeyBinding({
  keyBinding,
  icon,
  children,
  onAdd,
}) {
  const addNode = useAddNode(onAdd);
  const node = useNodeUIProps();
  useRefEventListener(node.nodeElement, "keydown", (event) => {
    if (event.code.substr(3, 1).toLowerCase() === keyBinding) {
      addNode();
    }
  });
  return (
    <AddNodeButton icon={icon} onAdd={onAdd}>
      {children}
    </AddNodeButton>
  );
}

function useAddNode(onAdd) {
  const setAppState = useSetAppStateContext();
  const onRequestLayout = useLayoutRequest();
  return () => {
    setAppState((appState) => {
      onRequestLayout(onAdd(appState, appState.modes.alt));
    });
  };
}

// Adds to the first selected node, but language should ensure that only
// one node can be selected to avoid confusion
export function addTightNode(nodeData) {
  return (appState) => {
    const selectedNode = onlyWarns(Nodes.selected(appState));
    if (selectedNode == null) {
      return;
    }
    History.startRecording(appState);
    const newNode = Nodes.newNode(appState, nodeData);
    Nodes.moveTightChild(appState, selectedNode, newNode);
    Edges.addTightChild(appState, selectedNode, newNode);
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutTightChild];
  };
}

export function replaceTightNode(nodeData) {
  return (appState) => replaceNode(appState, nodeData, Layout.layoutTightStack);
}

function layoutTightChild(appState, node) {
  const parent = Nodes.tightParent(appState, node);
  Layout.layoutTightStack(appState, parent);
  History.endRecording(appState);
}

export function addStandaloneNode(nodeData) {
  return (appState) => {
    History.startRecording(appState);
    const newNode = Nodes.newNode(appState, nodeData);
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutStandalone];
  };
}

function layoutStandalone(appState, node) {
  Layout.layoutStandalone(appState, node);
  History.endRecording(appState);
}

export function addNodeAtPosition(appState, nodeData, position) {
  History.startRecording(appState);
  const newNode = Nodes.newNode(appState, nodeData);
  Nodes.add(appState, newNode);
  Nodes.select(appState, [newNode]);
  return [
    Node.id(newNode),
    (appState, node) => {
      Layout.centerAtPosition(appState, node, position);
      History.endRecording(appState);
    },
  ];
}

export function addDetachedNode(nodeData) {
  return (appState) => {
    History.startRecording(appState);
    const selected = Nodes.selected(appState);
    const newNode = Nodes.newNode(appState, nodeData);
    selected.forEach((node, i) => {
      Edges.addChild(appState, node, newNode, String(i));
    });
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutChild];
  };
}

export function replaceDetachedNode(nodeData) {
  return (appState) => replaceNode(appState, nodeData, Layout.layoutTightStack);
}

function layoutChild(appState, node) {
  Layout.layoutDetached(appState, Nodes.parents(appState, node), node);
  History.endRecording(appState);
}

function replaceNode(appState, nodeData, layout) {
  const selectedNode = onlyWarns(Nodes.selected(appState));
  if (selectedNode == null) {
    return;
  }
  Nodes.replaceNode(appState, selectedNode, nodeData);
  return [Node.id(selectedNode), layout];
}
