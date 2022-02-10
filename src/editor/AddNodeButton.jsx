import * as Layout from "editor/Layout";
import * as Edges from "graph/Edges";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { onlyWarns } from "js/Arrays";
import { useContext } from "react";
import { LayoutRequestContext } from "./layoutRequest";
import { useSetAppStateContext } from "./state";
import { ButtonWithIcon } from "./ui/ButtonWithIcon";

export function AddNodeButton({ icon, children, onAdd }) {
  const setAppState = useSetAppStateContext();
  const onRequestLayout = useContext(LayoutRequestContext);
  return (
    <ButtonWithIcon
      icon={icon}
      onClick={() => {
        setAppState((appState) => {
          onRequestLayout(onAdd(appState, appState.modes.alt));
        });
      }}
    >
      {children}
    </ButtonWithIcon>
  );
}

// Adds to the first selected node, but language should ensure that only
// one node can be selected to avoid confusion
export function addTightNode(nodeData) {
  return (appState) => {
    const selectedNode = onlyWarns(Nodes.selected(appState));
    if (selectedNode == null) {
      return;
    }
    const newNode = Nodes.newNode(appState, nodeData);
    Nodes.moveTightChild(appState, selectedNode, newNode);
    Edges.addTightChild(appState, selectedNode, newNode);
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutTightChild];
  };
}

export function replaceTightNode(nodeData) {
  return (appState) => replaceNode(appState, nodeData, layoutTightChild);
}

function layoutTightChild(appState, node) {
  const parent = Nodes.tightParent(appState, node);
  Layout.layoutTightStack(appState, parent);
}

export function addStandaloneNode(nodeData) {
  return (appState) => {
    const newNode = Nodes.newNode(appState, nodeData);
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), Layout.layoutStandalone];
  };
}

export function addNodeAtPosition(appState, nodeData, position) {
  const newNode = Nodes.newNode(appState, nodeData);
  Nodes.add(appState, newNode);
  Nodes.select(appState, [newNode]);
  return [Node.id(newNode), Layout.centerAtPosition(position)];
}

export function addDetachedNode(nodeData) {
  return (appState) => {
    const selected = Nodes.selected(appState);
    const newNode = Nodes.newNode(appState, nodeData);
    selected.forEach((node) => {
      Edges.addChild(appState, node, newNode);
    });
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutChild];
  };
}

export function replaceDetachedNode(nodeData) {
  return (appState) => replaceNode(appState, nodeData, layoutChild);
}

function layoutChild(appState, node) {
  Layout.layoutDetached(appState, Nodes.parents(appState, node), node);
}

function replaceNode(appState, nodeData, layout) {
  const selectedNode = onlyWarns(Nodes.selected(appState));
  if (selectedNode == null) {
    return;
  }
  Nodes.replaceNode(appState, selectedNode, nodeData);
  return [Node.id(selectedNode), layout];
}
