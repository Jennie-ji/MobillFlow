"use client"

interface TableRendererProps {
  markdown: string
}

export function TableRenderer({ markdown }: TableRendererProps) {
  const parseMarkdownTable = (markdown: string) => {
    const lines = markdown.trim().split("\n")
    if (lines.length < 3) return { headers: [], rows: [] }

    const headers = lines[0]
      .split("|")
      .map((h) => h.trim())
      .filter((h) => h)
    const rows = lines.slice(2).map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell),
    )

    return { headers, rows }
  }

  const { headers, rows } = parseMarkdownTable(markdown)

  if (headers.length === 0) {
    return <div className="p-4 bg-gray-100 rounded text-gray-500 text-center">No table data available</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
