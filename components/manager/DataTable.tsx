"use client";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function DataTable<T extends { _id?: string | number }>({
  columns,
  data,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-yellow-100 rounded-lg p-8 text-center text-gray-500">
        No data found
      </div>
    );
  }

  return (
    <div className="bg-white border border-yellow-100 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-yellow-50 border-b border-yellow-100">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-yellow-50">
          {data.map((item, idx) => (
            <tr key={item._id || idx} className="hover:bg-yellow-50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-6 py-4 text-sm text-gray-700"
                >
                  {col.render
                    ? col.render(item[col.key], item)
                    : String(item[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
