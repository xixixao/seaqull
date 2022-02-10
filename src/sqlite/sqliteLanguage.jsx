import { QuestionMarkIcon } from "@modulz/radix-icons";
import { addNodeAtPosition } from "editor/AddNodeButton";
import { Editor } from "editor/Editor";
import { Button } from "editor/ui/Button";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { only } from "js/Arrays";
import * as Objects from "js/Objects";
import React, { useContext } from "react";
import { getEmptyNode, NODE_CONFIGS, TIGHT_CHILD_NODES } from "./sqliteNodes";
import { SQLiteStateContext, SQLiteStateProvider } from "./sqliteState";
import { DialogTrigger } from "./ui/Dialog";
import { SQLiteLocalStorage } from "./ui/SQLiteLocalStorage";
import { AddFromNodeButton, addOrReplaceQueryStep } from "./ui/SqliteNodeUI";
import { SQLiteResults } from "./ui/SQLiteResults";
import { WelcomeDialog } from "./ui/SQLiteWelcomeDialog";

export default function SQLiteLanguage() {
  return (
    <SQLiteStateProvider>
      <Editor
        topRightUI={<Help />}
        topUI={<AddFromNodeButton />}
        nodeTypes={Objects.map(NODE_CONFIGS, (type) => type.Component)}
        onDoubleClick={addFromNodeOnDoubleClick}
        onKeyDown={addNodeFromKey}
      >
        <SQLiteLocalStorage />
        <SQLiteResults />
      </Editor>
    </SQLiteStateProvider>
  );
}

function Help() {
  const source = useContext(SQLiteStateContext.source);
  return (
    <WelcomeDialog>
      <DialogTrigger asChild>
        <Row align="center">
          {source != null ? <Button>{source.name}</Button> : null}
          <IconButton>
            <QuestionMarkIcon />
          </IconButton>
        </Row>
      </DialogTrigger>
    </WelcomeDialog>
  );
}

function stateFromSnapshot([nodes, positions, edges]) {
  return {
    nodes: idMap(nodes),
    positions: new Map(nodes.map((element, i) => [element.id, positions[i]])),
    edges: idMap(edges),
  };
}

function addFromNodeOnDoubleClick(appState, position) {
  return addNodeAtPosition(appState, getEmptyNode("from"), position);
}

const KEY_LOOKUP = new Map(
  Arrays.map(TIGHT_CHILD_NODES, ({ key }, type) => [key, type])
);

function addNodeFromKey(appState, event) {
  const selectedNode = only(Nodes.selected(appState));
  if (selectedNode == null) {
    return;
  }
  const type = KEY_LOOKUP.get(
    event.altKey ? event.code.substr(3, 1).toLowerCase() : event.key
  );
  if (type == null) {
    return;
  }
  return addOrReplaceQueryStep(appState, type);
}

function idMap(array) {
  return new Map(array.map((element) => [element.id, element]));
}
