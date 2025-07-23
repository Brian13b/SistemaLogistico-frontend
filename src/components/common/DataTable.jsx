import { useTheme } from '../../context/ThemeContext';

function DataTable({ columns, data, onRowClick }) {
  const { darkMode } = useTheme();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-sm font-medium ${
                  darkMode ? 'text-gray-100' : 'text-gray-700'
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } transition-colors cursor-pointer`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-100' : 'text-gray-700'
                  }`}
                >
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;