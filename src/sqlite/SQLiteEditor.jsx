import { QuestionMarkIcon } from "@modulz/radix-icons";
import { addNodeAtPosition } from "seaqull/AddNodeButton";
import { Button } from "seaqull/ui/Button";
import { Box } from "seaqull/ui/Box";
import { IconButton } from "seaqull/ui/IconButton";
import { Row } from "seaqull/ui/Row";
import * as Objects from "js/Objects";
import React, { useContext } from "react";
import { SQLNodeConfigsProvider } from "../sql/SQLNodeConfigsProvider";
import { getEmptyNode } from "../sql/sqlNodes";
import { AddFromNodeButton, addNodeFromKey } from "../sql/ui/SQLNodeUI";
import { ThemeProvider } from "../theme/useTheme";
import { NODE_CONFIGS } from "./sqliteNodes";
import { SQLiteStateContext, SQLiteStateProvider } from "./sqliteState";
import { DialogTrigger } from "./ui/Dialog";
import { SQLiteLocalStorage } from "./ui/SQLiteLocalStorage";
import { SQLiteResults } from "./ui/SQLiteResults";
import { WelcomeDialog } from "./ui/SQLiteWelcomeDialog";
import { Relative } from "ui/Relative";
import { Seaqull } from "seaqull/Seaqull";
import { ThemeToggle } from "theme/ThemeToggle";
import { SplitView } from "../ui/SplitView";
import { Column } from "../seaqull/ui/Column";

const NODE_TYPES = Objects.map(NODE_CONFIGS, (type) => type.Component);

export function SQLiteEditor() {
  return (
    <SQLNodeConfigsProvider value={NODE_CONFIGS}>
      <SQLiteStateProvider>
        <Editor
          topRightUI={<DatabaseFileAndHelpButtons />}
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

function Editor({
  topRightUI,
  topUI,
  nodeTypes,
  onDoubleClick,
  onKeyDown,
  children,
}) {
  return (
    <ThemeProvider>
      <Seaqull>
        <SplitView>
          <Seaqull.NodeEditor
            nodeTypes={nodeTypes}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
          >
            <Relative top center>
              <Box css={{ padding: "$12" }}>{topUI}</Box>
            </Relative>
            <Relative top right>
              <Row css={{ padding: "$12" }}>
                {topRightUI}
                <ThemeToggle />
              </Row>
            </Relative>
            <Relative bottom left>
              <Column css={{ padding: "$12" }}>
                <Seaqull.NodeEditor.PaneControls />
              </Column>
            </Relative>
          </Seaqull.NodeEditor>
          <SQLiteResults />
        </SplitView>
        <SQLiteLocalStorage />
      </Seaqull>
    </ThemeProvider>
  );
}

function DatabaseFileAndHelpButtons() {
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
