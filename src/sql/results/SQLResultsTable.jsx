import React, { memo } from "react";
import { styled } from "ui/styled/style";
import {
  useIsThisOnlySelectedNode,
  useSQLResultsNodeContext,
} from "./SQLResults";
import { SQLResultsTableOrQueryWrapper } from "./SQLResultsTableOrQueryWrapper";
import { useExecuteSQLQuery } from "./useExecuteSQLQuery";

export function SQLResultsTableOrQuery({ getQuery, columnHeader, color }) {
  return (
    <SQLResultsTableOrQueryWrapper getQuery={getQuery}>
      <SQLResultsTable
        getQuery={getQuery}
        columnHeader={columnHeader}
        color={color}
      />
    </SQLResultsTableOrQueryWrapper>
  );
}

export function SQLResultsTables({ getQuery, children }) {
  const isThisOnlySelectedNode = useIsThisOnlySelectedNode();
  return (
    <SQLResultsTableOrQueryWrapper getQuery={getQuery}>
      {isThisOnlySelectedNode ? (
        children
      ) : (
        <SQLResultsTable getQuery={getQuery} />
      )}
    </SQLResultsTableOrQueryWrapper>
  );
}

export function SQLResultsTableWithRemainingRows({
  getQuery,
  getQueryForRemainingRows,
}) {
  const isThisOnlySelectedNode = useIsThisOnlySelectedNode();
  return (
    <SQLResultsTableOrQueryWrapper getQuery={getQuery}>
      {isThisOnlySelectedNode ? (
        <SQLResultsTable getQuery={getQuery}>
          <RemainingRows
            getQuery={getQueryForRemainingRows}
            css={{ color: "$slate11" }}
          />
        </SQLResultsTable>
      ) : (
        <SQLResultsTable getQuery={getQuery} />
      )}
    </SQLResultsTableOrQueryWrapper>
  );
}

function RemainingRows({ getQuery, css }) {
  const state = useExecuteSQLQuery(getQuery);
  if (state == null) {
    return null;
  }
  if (state.error != null) {
    return null;
  }
  return <TableBodyRows css={css} values={state.table.values} />;
}

export function SQLResultsTable({
  columnHeader,
  color,
  getQuery,
  results,
  children,
}) {
  const { node } = useSQLResultsNodeContext();
  const state = useExecuteSQLQuery(getQuery);
  if (state == null) {
    return null;
  }
  if (state.error != null) {
    return state.error;
  }

  return (
    <ResultsTableLoaded
      node={node}
      state={state}
      columnHeader={columnHeader}
      color={color}
    >
      {children}
    </ResultsTableLoaded>
  );
}

const ResultsTableLoaded = memo(function ResultsTableLoaded({
  state: { appState, table },
  // TODO: This can also break memoization
  node,
  color,
  // TODO: This can also break memoization
  columnHeader,
  // TODO: This will definitely break memoization
  children,
}) {
  const { columns, values } = table;
  const ColumnHeader = columnHeader ?? DefaultColumnHeader;

  return (
    <Table
      css={{
        $$secondary: "$colors$slate11",
        textAlign: "start",
        whiteSpace: "nowrap",
        th: {
          fontWeight: 600,
          height: "36px",
        },
        color,
      }}
    >
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i}>
              <ColumnHeader
                appState={appState}
                node={node}
                columnName={column}
                columnIndex={i}
              />
            </th>
          ))}
        </tr>
      </thead>
      <TableBodyRows values={values} />
      {children}
    </Table>
  );
});

function DefaultColumnHeader({ columnName }) {
  return columnName;
}

function TableBodyRows({ css, values }) {
  return (
    <TBody css={css}>
      {values.map((row, j) => (
        <tr key={j}>
          {row.map((value, i) => (
            <td key={i}>{value}</td>
          ))}
        </tr>
      ))}
    </TBody>
  );
}
const TBody = styled("tbody");

const Table = styled("table", {
  borderCollapse: "collapse",
  height: "fit-content",
  th: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // borderBottom: "1px solid $slate7",
    position: "sticky",
    top: "0",
    background: "$panel",
    whiteSpace: "nowrap",
    textAlign: "start",
    padding: "$8 $4 0 $4",
    boxShadow: "inset 0 -1px 0 $colors$slate7",
  },
  td: {
    // borderWidth: "1px",
    // borderStyle: "solid",
    // borderColor: "inherit",
    // border: "1px solid $slate7",
    padding: "0 4px",
    whiteSpace: "nowrap",
  },
  "tbody tr": {
    borderBottom: "1px solid $slate3",
  },
});
