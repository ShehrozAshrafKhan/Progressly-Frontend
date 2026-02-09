import React, { useState, useMemo } from "react";

type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

function GenericTable<T extends { id: number | string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: GenericTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key as string))
  );

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortAsc]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toggleRow = (id: string | number) => {
    const newSet = new Set(selectedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleColumn = (key: string) => {
    const newSet = new Set(visibleColumns);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setVisibleColumns(newSet);
  };

  return (
    <>
      {/* Search */}
      <div className="d-flex justify-content-between mb-2">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Column Visibility Toggle */}
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            Columns
          </button>
          <ul className="dropdown-menu">
            {columns.map((col, idx) => (
              <li key={idx}>
                <label className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key as string)}
                    onChange={() => toggleColumn(col.key as string)}
                  />
                  {col.header}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedRows(
                    e.target.checked
                      ? new Set(data.map((row) => row.id))
                      : new Set()
                  )
                }
                checked={selectedRows.size === data.length}
              />
            </th>
            {columns.map((col, idx) =>
              visibleColumns.has(col.key as string) ? (
                <th
                  key={idx}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  {col.header}{" "}
                  {col.sortable &&
                    (sortKey === col.key ? (sortAsc ? "🔼" : "🔽") : "⬍")}
                </th>
              ) : null
            )}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center">
                No data found
              </td>
            </tr>
          ) : (
            paginatedData.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
                {columns.map((col, idx) =>
                  visibleColumns.has(col.key as string) ? (
                    <td key={idx}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ) : null
                )}
                {(onEdit || onDelete) && (
                  <td>
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        <span>
          Showing {(page - 1) * rowsPerPage + 1} to{" "}
          {Math.min(page * rowsPerPage, sortedData.length)} of{" "}
          {sortedData.length}
        </span>
        <div>
          <button
            className="btn btn-sm btn-secondary me-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-secondary"
            disabled={page * rowsPerPage >= sortedData.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default GenericTable;
