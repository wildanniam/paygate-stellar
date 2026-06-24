import { cx } from './utils.js';

export default function DataTable({ columns, rows, renderCell, getRowKey, className, empty }) {
  if (!rows?.length) {
    return empty || null;
  }

  return (
    <div className={cx('pg-data-table-wrap', className)}>
      <table className="pg-data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label} data-align={column.align || 'left'}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey ? getRowKey(row) : row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column.key} data-align={column.align || 'left'} data-label={column.label}>
                  {column.render ? column.render(row) : renderCell ? renderCell(row, column) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
