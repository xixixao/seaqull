import { keymap } from "@codemirror/view";

export function buildKeyMap(commands) {
  const keyMapFacetProvider = keymap.of(
    commands.map((command) => ({
      ...command,
      run: ({ appState, event }) => command.run(appState, event),
    }))
  );
  const runHandlers =
    keyMapFacetProvider.facet.extensions.fields[0].get().handlers.keydown;
  const state = { facet: () => keyMapFacetProvider.value };
  return (appState, event) => runHandlers(event, { state, appState, event });
}
