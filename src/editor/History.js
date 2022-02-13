import {
  applyPatches,
  enableMapSet,
  enablePatches,
  produce,
  produceWithPatches,
  current,
} from "immer";
import * as Arrays from "js/Arrays";

enableMapSet();
enablePatches();

export function historyStack() {
  return {
    inProgressRecording: null,
    reverseCursor: 0,
    patches: [],
  };
}

export function startRecording(value) {
  value.history.content.inProgressRecording = [[], []];
}

export function endRecording(value) {
  value.history.content.addRecording = true;
}

export function produceWithoutRecording(value, updater) {
  return produce(value, updater);
}

export function produceAndRecord(value, updater) {
  const [appState, forwardSet, reverseSet] = produceWithPatches(value, updater);
  const [forward, reverse] = [
    forwardSet.filter(({ path }) => path[0] !== "history"),
    reverseSet.filter(({ path }) => path[0] !== "history"),
  ];

  return produce(appState, (appState) => {
    const { content } = appState.history;
    if (content.inProgressRecording != null) {
      content.inProgressRecording[0].push(...forward);
      content.inProgressRecording[1].push(...Arrays.reverse(reverse));
    }
    if (content.addRecording) {
      if (content.reverseCursor > 0) {
        content.patches.splice(-content.reverseCursor);
        content.reverseCursor = 0;
      }
      content.patches.push([
        content.inProgressRecording[0],
        Arrays.reverse(content.inProgressRecording[1]),
      ]);
      content.inProgressRecording = null;
      content.addRecording = false;
    }
  });
}

export function canUndo(appState) {
  return undoIndex(appState) >= 0;
}

export function undo(appState) {
  const { content } = appState.history;
  const [, reversePatch] = content.patches[undoIndex(appState)];
  const result = applyPatches(appState, reversePatch);
  content.reverseCursor += 1;
  return result;
}

export function canRedo(appState) {
  return redoIndex(appState) < appState.history.content.patches.length;
}

export function redo(appState) {
  const { content } = appState.history;
  const [forwardPatch] = content.patches[redoIndex(appState)];
  const result = applyPatches(appState, forwardPatch);
  content.reverseCursor -= 1;
  return result;
}

function redoIndex(appState) {
  return undoIndex(appState) + 1;
}

function undoIndex(appState) {
  const { content } = appState.history;
  return content.patches.length - content.reverseCursor - 1;
}
