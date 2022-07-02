import { QuestionMarkIcon } from "@modulz/radix-icons";
import * as Objects from "js/Objects";
import React, { useContext } from "react";
import { addNodeAtPosition } from "seaqull/AddNodeButton";
import { Seaqull } from "seaqull/Seaqull";
import { ThemeToggle } from "theme/ThemeToggle";
import { Button } from "ui/interactive/Button";
import { IconButton } from "ui/interactive/IconButton";
import { RelativeColumn } from "ui/layout/RelativeColumn";
import { RelativeRow } from "ui/layout/RelativeRow";
import { SQLNodeConfigsProvider } from "../sql/SQLNodeConfigsProvider";
import { getEmptyNode } from "../sql/sqlNodes";
import { AddFromNodeButton } from "../sql/ui/SQLNodeUI";
import { ThemeProvider } from "../theme/useTheme";
import { VerticalSplitView } from "../ui/layout/VerticalSplitView";
import { NODE_CONFIGS } from "./sqliteNodes";
import { SQLiteStateContext, SQLiteStateProvider } from "./sqliteState";
import { DialogTrigger } from "./ui/Dialog";
import { SQLiteLocalStorage } from "./ui/SQLiteLocalStorage";
import { SQLiteResults } from "./ui/SQLiteResults";
import { WelcomeDialog } from "./ui/SQLiteWelcomeDialog";

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
          inContext={<SQLiteLocalStorage />}
        >
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
  inContext,
}) {
  return (
    <ThemeProvider>
      <Seaqull>
        <VerticalSplitView>
          <Seaqull.NodeEditor
            nodeTypes={nodeTypes}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
          >
            <RelativeRow top center css={{ padding: "$12" }}>
              {topUI}
            </RelativeRow>
            <RelativeRow align="center" top right css={{ padding: "$12" }}>
              {topRightUI}
              <ThemeToggle />
            </RelativeRow>
            <RelativeColumn bottom left css={{ padding: "$12" }}>
              <Seaqull.NodeEditor.PaneControls />
            </RelativeColumn>
          </Seaqull.NodeEditor>
          {children}
        </VerticalSplitView>
        {inContext}
      </Seaqull>
    </ThemeProvider>
  );
}

function DatabaseFileAndHelpButtons() {
  const source = useContext(SQLiteStateContext.source);
  return (
    <WelcomeDialog>
      {source != null ? (
        <DialogTrigger asChild>
          <Button>{source.name}</Button>
        </DialogTrigger>
      ) : null}
      <DialogTrigger asChild>
        <IconButton>
          <QuestionMarkIcon />
        </IconButton>
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
