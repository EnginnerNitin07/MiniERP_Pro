import React from 'react';

export function SearchBox({
  value = '',
  onChange,
  placeholder = 'Search...'
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="search-box"
    />
  );
}

export function Table({
  columns = [],
  data,
  rows,
  search = '',
  emptyMessage = 'No records found.',
  onRowClick,
  onDelete
}) {
  /*
    Support BOTH:
    
    <Table data={products} />
    
    and
    
    <Table rows={products} />
    
    This prevents old pages from breaking.
  */
  const sourceData = Array.isArray(data)
    ? data
    : Array.isArray(rows)
      ? rows
      : [];

  /*
    Search across all visible fields.
  */
  const filteredData = sourceData.filter((row) => {
    if (!search) return true;

    const query = String(search).toLowerCase();

    return columns.some((column) => {
      const key = column.key || column.field;
      const value = row?.[key];

      return String(value ?? '')
        .toLowerCase()
        .includes(query);
    });
  });

  return (
    <div className="table-wrapper">
      <table className="data-table">

        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={
                  column.key ||
                  column.field ||
                  index
                }
              >
                {column.label ||
                  column.title ||
                  column.key ||
                  column.field}
              </th>
            ))}

            {onDelete && (
              <th>Actions</th>
            )}
          </tr>
        </thead>

        <tbody>

          {filteredData.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (onDelete ? 1 : 0)
                }
                className="empty-cell"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (

            filteredData.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                onClick={() =>
                  onRowClick?.(row)
                }
                className={
                  onRowClick
                    ? 'clickable-row'
                    : ''
                }
              >

                {columns.map(
                  (column, columnIndex) => {

                    const key =
                      column.key ||
                      column.field;

                    const value =
                      row?.[key];

                    return (
                      <td
                        key={
                          key ||
                          columnIndex
                        }
                      >

                        {column.render
                          ? column.render(
                              row,
                              value
                            )
                          : value ?? '-'}

                      </td>
                    );
                  }
                )}

                {onDelete && (
                  <td>
                    <button
                      type="button"
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}

              </tr>
            ))

          )}

        </tbody>

      </table>
    </div>
  );
}

export default Table;