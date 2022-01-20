import { SQLite, StandardSQL } from "@codemirror/lang-sql";
import { LanguageSupport, syntaxTree } from "@codemirror/language";
import Input from "editor/Input";
import { useAppStateContext } from "editor/state";
import { useMemo } from "react";
import * as Objects from "js/Objects";

export default function SqliteInput(props) {
  const { editorConfig } = useAppStateContext();
  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema: editorConfig.schema(),
      }),
    ];
  }, [editorConfig]);
  return <Input {...props} extensions={extensions} />;
}

function sql(config = {}) {
  let lang = config.dialect || StandardSQL;
  return new LanguageSupport(lang.language, [schemaCompletion(config)]);
}

function schemaCompletion(config) {
  return config.schema
    ? (config.dialect || StandardSQL).language.data.of({
        autocomplete: completeFromSchema(
          config.schema,
          config.tables,
          config.defaultTable
        ),
      })
    : [];
}

function completeFromSchema(schema, tables, defaultTable) {
  // const byTable = Objects.map(schema, (columns) =>
  //   columns.map((column) => ({ label: column, type: "property" }))
  // );
  const tableNames = Object.keys(schema).map((name) => ({
    label: name,
    type: "type",
  }));

  // let topOptions = (
  //   tables ??
  //   Object.keys(byTable).map((name) => ({ label: name, type: "type" }))
  // ).concat((defaultTable && byTable[defaultTable]) || []);
  return (context) => {
    let { parent, from, quoted, empty } = sourceContext(
      context.state,
      context.pos
    );
    // console.log("emtpyt", empty);
    // if (empty && !context.explicit) return null;
    // let options = topOptions;
    let options = tableNames;
    // console.log("options", options);
    // if (parent) {
    //   let columns = byTable[parent];
    //   if (!columns) return null;
    //   options = columns;
    // }
    let quoteAfter =
      quoted && context.state.sliceDoc(context.pos, context.pos + 1) == quoted;
    return {
      from,
      // to: quoteAfter ? context.pos + 1 : undefined,
      options: maybeQuoteCompletions(quoted, options),
      // span: quoted ? QuotedSpan : Span,
    };
  };
}
const Span = /^\w*$/,
  QuotedSpan = /^[`'"]?\w*[`'"]?$/;

function sourceContext(state, startPos) {
  let pos = syntaxTree(state).resolveInner(startPos, -1);
  let empty = false;
  // console.log(pos, pos.name);
  if (pos.name == "Identifier" || pos.name == "QuotedIdentifier") {
    empty = false;
    let parent = null;
    let dot = tokenBefore(pos);
    if (dot && dot.name == ".") {
      let before = tokenBefore(dot);
      if (
        (before && before.name == "Identifier") ||
        before.name == "QuotedIdentifier"
      )
        parent = stripQuotes(
          state.sliceDoc(before.from, before.to).toLowerCase()
        );
    }
    return {
      parent,
      from: pos.from,
      quoted:
        pos.name == "QuotedIdentifier"
          ? state.sliceDoc(pos.from, pos.from + 1)
          : null,
    };
  } else if (pos.name == ".") {
    let before = tokenBefore(pos);
    if (
      (before && before.name == "Identifier") ||
      before.name == "QuotedIdentifier"
    )
      return {
        parent: stripQuotes(
          state.sliceDoc(before.from, before.to).toLowerCase()
        ),
        from: startPos,
        quoted: null,
      };
  } else {
    empty = true;
  }
  return { parent: null, from: startPos, quoted: null, empty };
}

function tokenBefore(tree) {
  let cursor = tree.cursor.moveTo(tree.from, -1);
  while (/Comment/.test(cursor.name)) cursor.moveTo(cursor.from, -1);
  return cursor.node;
}
function stripQuotes(name) {
  let quoted = /^[`'"](.*)[`'"]$/.exec(name);
  return quoted ? quoted[1] : name;
}

function maybeQuoteCompletions(quote, completions) {
  if (!quote) return completions;
  return completions.map((c) => ({
    ...c,
    label: quote + c.label + quote,
    apply: undefined,
  }));
}
