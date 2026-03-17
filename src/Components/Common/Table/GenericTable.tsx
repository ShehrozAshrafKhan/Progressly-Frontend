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
    <div className="card shadow-sm border-0 rounded-lg">
      <div className="card-header bg-white border-bottom py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* Search */}
        <div className="position-relative w-100" style={{ maxWidth: '300px' }}>
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            type="text"
            className="form-control ps-5 bg-light-soft border-0"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Column Visibility Toggle */}
        <div className="dropdown">
          <button
            className="btn btn-light border d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-layout-three-columns"></i> Columns
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" style={{ minWidth: '200px', borderRadius: '0.5rem' }}>
            {columns.map((col, idx) => (
              <li key={idx}>
                <label className="dropdown-item d-flex align-items-center gap-2 rounded px-2 py-1 user-select-none" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={visibleColumns.has(col.key as string)}
                    onChange={() => toggleColumn(col.key as string)}
                  />
                  <span>{col.header}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive mb-0">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-muted">
            <tr>
              <th className="text-center" style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={(e) =>
                    setSelectedRows(
                      e.target.checked
                        ? new Set(data.map((row) => row.id))
                        : new Set()
                    )
                  }
                  checked={data.length > 0 && selectedRows.size === data.length}
                />
              </th>
              {columns.map((col, idx) =>
                visibleColumns.has(col.key as string) ? (
                  <th
                    key={idx}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    style={{ cursor: col.sortable ? 'pointer' : 'default', fontWeight: 600 }}
                    className="text-uppercase text-nowrap"
                  >
                    <div className="d-flex align-items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="text-muted" style={{ fontSize: '0.8em' }}>
                          {sortKey === col.key ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      )}
                    </div>
                  </th>
                ) : null
              )}
              {(onEdit || onDelete) && <th className="text-end px-4 text-uppercase fw-semibold text-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody className="border-top-0">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-5 text-muted">
                  <div className="d-flex flex-column align-items-center">
                    <i className="bi bi-inbox fs-1 mb-2 text-light"></i>
                    <p className="mb-0">No data found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="transition-base">
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  {columns.map((col, idx) =>
                    visibleColumns.has(col.key as string) ? (
                      <td key={idx} className="text-dark">
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] as React.ReactNode)}
                      </td>
                    ) : null
                  )}
                  {(onEdit || onDelete) && (
                    <td className="text-end px-3 text-nowrap">
                      <div className="d-flex justify-content-end gap-2">
                        {onEdit && (
                          <button
                            className="btn btn-sm btn-light text-primary border rounded-circle"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn btn-sm btn-light text-danger border rounded-circle"
                            onClick={() => onDelete(row)}
                            title="Delete"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="card-footer bg-white border-top py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
        <span className="text-muted small">
          Showing <span className="fw-medium text-dark">{sortedData.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}</span> to{" "}
          <span className="fw-medium text-dark">{Math.min(page * rowsPerPage, sortedData.length)}</span> of{" "}
          <span className="fw-medium text-dark">{sortedData.length}</span> results
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light border px-3"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-sm btn-light border px-3"
            disabled={page * rowsPerPage >= sortedData.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenericTable;
