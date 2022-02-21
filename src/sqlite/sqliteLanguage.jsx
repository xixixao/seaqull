import { QuestionMarkIcon } from "@modulz/radix-icons";
import { addNodeAtPosition } from "editor/AddNodeButton";
import { Editor } from "editor/Editor";
import { Button } from "editor/ui/Button";
import { IconButton } from "editor/ui/IconButton";
import { Row } from "editor/ui/Row";
import * as Objects from "js/Objects";
import React, { useContext } from "react";
import { SQLNodeConfigsProvider } from "../sql/SQLNodeConfigsProvider";
import { getEmptyNode } from "../sql/sqlNodes";
import { AddFromNodeButton, addNodeFromKey } from "../sql/ui/SQLNodeUI";
import { NODE_CONFIGS } from "./sqliteNodes";
import { SQLiteStateContext, SQLiteStateProvider } from "./sqliteState";
import { DialogTrigger } from "./ui/Dialog";
import { SQLiteLocalStorage } from "./ui/SQLiteLocalStorage";
import { SQLiteResults } from "./ui/SQLiteResults";
import { WelcomeDialog } from "./ui/SQLiteWelcomeDialog";

const NODE_TYPES = Objects.map(NODE_CONFIGS, (type) => type.Component);

export default function SQLiteLanguage() {
  return (
    <SQLNodeConfigsProvider value={NODE_CONFIGS}>
      <SQLiteStateProvider>
        <Editor
          topRightUI={<Help />}
          topUI={<AddFromNodeButton />}
          nodeTypes={NODE_TYPES}
          onDoubleClick={addFromNodeOnDoubleClick}
          onKeyDown={addNodeFromKey(NODE_CONFIGS)}
        >
          <SQLiteLocalStorage />
          <SQLiteResults />
        </Editor>
      </SQLiteStateProvider>
    </SQLNodeConfigsProvider>
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

// TODO: For future examples listing
// function stateFromSnapshot([nodes, positions, edges]) {
//   return {
//     nodes: idMap(nodes),
//     positions: new Map(nodes.map((element, i) => [element.id, positions[i]])),
//     edges: idMap(edges),
//   };
// }
// function idMap(array) {
//   return new Map(array.map((element) => [element.id, element]));
// }

function addFromNodeOnDoubleClick(appState, position) {
  return addNodeAtPosition(
    appState,
    getEmptyNode({ nodeConfigs: NODE_CONFIGS }, "from"),
    position
  );
}
