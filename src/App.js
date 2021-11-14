import { useCallback, useEffect, useRef, useState } from "react";

function App() {
  const [namespace, setNamespace] = useState("foo_team");
  const [notebookName, setNotebookName] = useState("Untitled");
  const [table, setTable] = useState(null);
  const [cellName, setCellName] = useState("Unnamed");
  return (
    <div style={{ padding: 5 }}>
      <div>
        <Input label="namespace" value={namespace} onChange={setNamespace} />
        <HorizontalSpace />
        <Input
          label="notebook name"
          value={notebookName}
          onChange={setNotebookName}
        />
      </div>
      <Input label="table" focused value={table} onChange={setTable} />
      {/* <HorizontalSpace />
      <Input label="cell name" value={cellName} onChange={setCellName} /> */}
      <HorizontalSpace />
      <div style={{ fontSize: 12, display: "flex", alignItems: "center" }}>
        AND
        <HorizontalSpace />
        <div>
          <div>name LIKE "J%"</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            OR
            <HorizontalSpace />
            <div>
              <div>id > 5</div>
              <div>dau = 1</div>
            </div>
          </div>
        </div>
      </div>
      <Button>+∇ </Button>
      <HorizontalSpace />
      <Button>+⛉</Button>
      {table != null ? <Table /> : null}
    </div>
  );
}

function ColumnSelector() {
  const [shown, setShown] = useState(false);

  return (
    <span style={{ cursor: "pointer" }} onClick={() => setShown(true)}>
      <Button>∇</Button>
    </span>
  );
}

function Table() {
  const [table, setTable] = useState();
  const [selectedColumns, setSelectedColumns] = useState([]);
  const selectedColumnsSet = new Set(selectedColumns);
  useEffect(() => {
    setTimeout(() => {
      setTable(DATA.my_table);
    }, 100);
  }, []);
  if (table == null) {
    return <div style={{ padding: 12 }}>Loading...</div>;
  }
  const columns = selectedColumns.concat(
    Object.keys(table).filter((column) => !selectedColumnsSet.has(column))
  );
  return (
    <>
      <table>
        <tr>
          <th>
            <ColumnSelector />
          </th>
          {columns.map((column) => (
            <th style={{ textAlign: "start" }}>
              <input
                checked={selectedColumnsSet.has(column)}
                style={{ cursor: "pointer" }}
                type="checkbox"
                onChange={(event) => {
                  if (!selectedColumnsSet.has(column)) {
                    setSelectedColumns(selectedColumns.concat([column]));
                  } else {
                    setSelectedColumns(
                      selectedColumns.filter((key) => key !== column)
                    );
                  }
                }}
              />
              {column}
            </th>
          ))}
        </tr>
        {[...Array(5).keys()].map((i) => (
          <tr>
            <td></td>
            {columns.map((column) => (
              <td>{table[column][i]}</td>
            ))}
          </tr>
        ))}
      </table>
      Group
      {columns.map((column) => column)}
      <Button>+∇ </Button>
    </>
  );
}

function Input(props) {
  const [edited, setEdited] = useState(props.focused || false);
  const [defaultValue] = useState(props.value);
  const { value, onChange: setValue } = props;
  const inputRef = useRef();
  useEffect(() => {
    if (edited && !inputRef.current.focused) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [edited]);
  const handleReset = useCallback(() => {
    if (value === "" || value == null) {
      if (defaultValue != null) {
        setValue(defaultValue);
      } else {
        return;
      }
    }
    setEdited(false);
  }, [defaultValue, value, setValue]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (edited && !inputRef.current.contains(event.target)) {
        handleReset();
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [edited, handleReset]);
  return (
    <div style={{ display: "inline-block" }}>
      <Label>{props.label}</Label>
      {edited ? (
        <input
          ref={inputRef}
          style={{ display: "block" }}
          type="text"
          value={value || ""}
          onMouseLeave={handleReset}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div style={{ cursor: "pointer" }} onClick={() => setEdited(true)}>
          {value}
        </div>
      )}
    </div>
  );
}

function Label(props) {
  return <span style={{ fontSize: 12 }}>{props.children}</span>;
}

function HorizontalSpace() {
  return <span style={{ display: "inline-block", width: 4 }}></span>;
}

function Button(props) {
  return (
    <div
      style={{
        display: "inline-block",
        border: "1px solid black",
        borderRadius: 4,
        padding: "0 2px",
      }}
    >
      {props.children}
    </div>
  );
}

const DATA = {
  my_table: {
    ds: [
      "2042-02-03",
      "2042-02-03",
      "2042-02-03",
      "2042-02-03",
      "2042-02-03",
      "2042-02-03",
      "2042-02-03",
    ],
    id: [1, 23, 8, 9, 12, 12, 202, 2],
    name: ["John", "Bob", "Mary", "Handle", "Poo", "Russ"],
    dau: [1, 0, 0, 1, 0, 1, 0, 1],
  },
};

// const TABLES = [
//   { value: "chocolate", label: "Chocolate" },
//   { value: "strawberry", label: "Strawberry" },
//   { value: "vanilla", label: "Vanilla" },
// ];

export default App;
