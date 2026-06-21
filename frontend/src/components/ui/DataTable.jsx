import { cx } from './utils.js';

export default function DataTable({ columns, rows, renderCell, getRowKey, className, empty }) {
  if (!rows?.length) {
    return empty || null;
  }

  return (
    <table className={cx('pg-data-table', className)}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key || column.label}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={getRowKey ? getRowKey(row) : row.id || rowIndex}>
            {columns.map((column) => (
              <td key={column.key}>{renderCell ? renderCell(row, column) : row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
