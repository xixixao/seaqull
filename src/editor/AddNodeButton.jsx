import { PlusIcon } from "@modulz/radix-icons";
import { useContext } from "react";
import { createContext } from "react";
import { useSetAppStateContext } from "./state";
import { ButtonWithIcon } from "./ui/ButtonWithIcon";
import * as Nodes from "graph/Nodes";
import * as Node from "graph/Node";
import * as Edges from "graph/Edges";
import * as Layout from "editor/Layout";
import { onlyThrows } from "js/Arrays";

const LayoutRequestContext = createContext();

export const LayoutRequestProvider = LayoutRequestContext.Provider;

export function AddNodeButton({ children, onAdd }) {
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

export function addTightNode(nodeData) {
  return (appState) => {
    const newNode = Nodes.newNode(appState, nodeData);
    const selectedNode = onlyThrows(Nodes.selected(appState));
    const selectedNodeChildren = Nodes.tightChildren(appState, selectedNode);
    const selectedNodeChildEdges = Edges.tightChildren(appState, selectedNode);
    Edges.removeAll(appState, selectedNodeChildEdges);
    Edges.addTightChildren(appState, newNode, selectedNodeChildren);
    Edges.addTightChild(appState, selectedNode, newNode);
    Nodes.add(appState, newNode);
    Nodes.select(appState, [newNode]);
    return [Node.id(newNode), layoutTightChild];
  };
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

function layoutChild(appState, node) {
  Layout.layoutDetached(appState, Nodes.parents(appState, node), node);
}
