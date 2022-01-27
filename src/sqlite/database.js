import initSqlJs from "sql.js";
import sqlWasmURL from "./sql-wasm.wasm?url";
import * as Objects from "js/Objects";
import { SQLite } from "@codemirror/lang-sql";

export function database(arrayBuffer) {
  return (async () => {
    const SQL = await initSqlJs({ locateFile: (file) => sqlWasmURL });
    const db = new SQL.Database(new Uint8Array(arrayBuffer));
    const schema = schemaFromDatabase(db);
    return {
      db,
      schema: Objects.fromMap(schema),
      tableExists: (name) => schema.has(name),
      tableColumns: (name) => schema.get(name),
    };
  })();
}

function schemaFromDatabase(db) {
  return new Map(
    db
      .exec('SELECT name, sql FROM sqlite_schema WHERE type="table"')[0]
      .values.map(([name, createSQL]) => [
        name,
        createSqlToColumnNames(createSQL),
      ])
  );
}

function createSqlToColumnNames(createSQL) {
  let cursor = SQLite.language.parser.parse(createSQL).cursor();
  cursor.firstChild();
  cursor.firstChild();
  cursor.nextSibling();
  cursor.nextSibling();
  cursor.nextSibling();
  cursor.firstChild();

  let columnNames = [];
  let columnStart = true;
  while (
    cursor.nextSibling() &&
    !(
      cursor.name === "Keyword" &&
      /^foreign|constraint$/i.test(at(cursor, createSQL))
    )
  ) {
    if (columnStart) {
      const isWrapped = cursor.name === "Brackets";
      if (isWrapped) {
        cursor.firstChild();
        cursor.nextSibling();
      }
      columnNames.push(
        at(
          cursor,
          createSQL,
          cursor.name === "QuotedIdentifier" || cursor.name === "String" ? 1 : 0
        )
      );
      if (isWrapped) {
        cursor.parent();
      }
      columnStart = false;
    }
    if (cursor.name === "Punctuation" && at(cursor, createSQL) === ",") {
      columnStart = true;
    }
  }

  return columnNames;
}

function at(cursor, text, inset = 0) {
  return text.substring(cursor.from + inset, cursor.to - inset);
}
