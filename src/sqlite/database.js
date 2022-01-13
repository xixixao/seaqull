import initSqlJs from "sql.js";
import sqlWasmURL from "./sql-wasm.wasm?url";

export function database(tables) {
  return (async () => {
    const [SQL, sql] = await Promise.all([
      initSqlJs({ locateFile: (file) => sqlWasmURL }),
      setupSql(tables),
    ]);
    const db = new SQL.Database();
    // console.log(sql);
    db.run(sql);
    return {
      db,
      tableColumns(tableName) {
        const table = tables.find(([name]) => tableName === name);
        if (table == null) {
          return [];
        }
        const [, columns] = table;
        return columnDefinitionToNames(columns);
      },
    };
  })();
}

function columnDefinitionToNames(definition) {
  return definition.split(",\n").map((column) => column.split(" ")[0]);
}

async function setupSql(tables) {
  return (
    await Promise.all(
      tables.map(async (table) => {
        const [tableName, columns, dataURL] = table;
        const createSQL = `CREATE TABLE ${tableName} (${columns});`;
        const columnNames = columnDefinitionToNames(columns);
        const rows = (await (await fetch(dataURL)).text())
          .split("\n")
          .map((row) => row.split("\t"));

        const insertSql = `INSERT INTO ${tableName} (${columnNames.join(
          ","
        )}) VALUES ${rows
          .map((row) =>
            row.map((value) => (isNaN(value) ? `"${value}"` : value)).join(",")
          )
          .map((rowSql) => `(${rowSql})`)
          .join(",")};`;
        return createSQL + insertSql;
      })
    )
  ).join("\n");
}

// todo move inside setup
// const COLUMNS = [
//   ["ds", "TEXT"],
//   ["id", "INTEGER"],
//   ["name", "TEXT"],
//   ["dau", "INTEGER"],
//   ["wau", "INTEGER"],
//   ["country", "TEXT"],
//   ["metadata", "TEXT"],
// ];
// const DATABASE_SETUP_SQL = (() => {
//   const tableName = "users";
//   const columns = COLUMNS;
//   // prettier-ignore
//   const rows = [
// ["2042-02-03", 9, 'John', 1, 0, 'UK', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-03", 4, 'Bob', 0, 0, 'CZ', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-03", 12, 'Ross', 0, 0, 'FR', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-01", 1, 'Marline', 1, 1, 'US', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-01", 14, 'Jackie', 0, 1, 'BU', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-04", 11, 'Major', 0, 0, 'IS', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-04", 2, 'Smith', 0, 0, 'LI', "{foo: 'bar', bee: 'ba', do: 'da'}"],
// ["2042-02-03", 16, 'Capic', 1, 0, 'LA', "{foo: 'bar', bee: 'ba', do: 'da'}"],
//   ];
//   const createSql = `CREATE TABLE ${tableName} (${columns
//     .map((pair) => pair.join(" "))
//     .join(",")});`;
//   const insertSql = `INSERT INTO ${tableName} (${columns
//     .map(([column]) => column)
//     .join(",")}) VALUES ${rows
//     .map((row) =>
//       row.map((value) => (isNaN(value) ? `"${value}"` : value)).join(",")
//     )
//     .map((rowSql) => `(${rowSql})`)
//     .join(",")};`;
//   return createSql + insertSql;
// })();

// const TABLES = [
//   { value: "chocolate", label: "Chocolate" },
//   { value: "strawberry", label: "Strawberry" },
//   { value: "vanilla", label: "Vanilla" },
// ];
