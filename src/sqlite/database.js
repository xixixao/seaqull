import initSqlJs from "sql.js";
import sqlWasmURL from "./sql-wasm.wasm?url";
import * as Objects from "js/Objects";

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
  return createSQL
    .replace(/\n/g, "")
    .replace(/^[^(]+\((.+)\)\s*$/, "$1")
    .replace(/\s[^,]+/g, "")
    .split(",");
}
