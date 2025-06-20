import React from 'react';

export function Table({ rows, columns, loading }) {
  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.field} className="px-6 py-4 whitespace-nowrap">
                  {column.renderCell ? (
                    column.renderCell({ row })
                  ) : column.valueGetter ? (
                    column.valueGetter({ row })
                  ) : column.valueFormatter ? (
                    column.valueFormatter({ value: row[column.field] })
                  ) : (
                    row[column.field]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
