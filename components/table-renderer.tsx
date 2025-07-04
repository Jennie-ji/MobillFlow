"use client"

import { useMemo } from "react"

interface TableRendererProps {
  markdown: string
}

export function TableRenderer({ markdown }: TableRendererProps) {
  const { headers, rows } = useMemo(() => {
    // รองรับทั้ง Markdown Table (pipe) และ Tab-separated
    const parseTable = (data: string) => {
      const lines = data.trim().split("\n").filter(l => l.trim() !== "")
      if (lines.length < 1) return { headers: [], rows: [] }

      // ตรวจสอบว่าเป็น markdown table หรือ tab-separated
      // ถ้าเจอ '|' และมีบรรทัดคั่น '---' ให้ใช้ markdown table
      const isMarkdownTable = lines[0].includes("|") && lines[1] && /^\s*[-| ]+\s*$/.test(lines[1])

      if (isMarkdownTable) {
        // Markdown Table
        const headerLine = lines[0]
        // รองรับกรณี header เริ่ม/จบด้วย |
        let cleanHeader = headerLine
        if (cleanHeader.startsWith("|")) cleanHeader = cleanHeader.slice(1)
        if (cleanHeader.endsWith("|")) cleanHeader = cleanHeader.slice(0, -1)
        const headers = cleanHeader.split("|").map(h => h.trim())
        // ถ้า header ไม่มีข้อมูล หรือเป็น --- ทั้งหมด ให้ถือว่าไม่ valid
        const isHeaderAllDashes = headers.every(h => /^-+$/.test(h) || h === '')
        if (headers.length === 0 || isHeaderAllDashes) {
          return { headers: [], rows: [] }
        }
        // ข้ามบรรทัดคั่น ---
        const dataLines = lines.slice(2)
        const rows = dataLines.map(line => {
          let clean = line
          if (clean.startsWith("|")) clean = clean.slice(1)
          if (clean.endsWith("|")) clean = clean.slice(0, -1)
          // split แล้วเติมช่องว่างถ้า cell ไม่ครบ header
          const cells = clean.split("|").map(cell => cell.trim())
          while (cells.length < headers.length) cells.push("")
          return cells.slice(0, headers.length)
        })
        return { headers, rows }
      } else {
        // Tab-separated (หรือกรณี fallback)
        const delimiter = /\t/
        const headers = lines[0].split(delimiter).map((h) => h.trim())
        // ถ้า header ไม่มีข้อมูล ให้ถือว่าไม่ valid
        if (headers.length === 0 || headers.every(h => h === '')) {
          return { headers: [], rows: [] }
        }
        const dataLines = lines.slice(1)
        const rows = dataLines
          .map((line) => {
            const cells = line.split(delimiter).map((cell) => cell.trim())
            while (cells.length < headers.length) cells.push("")
            return cells.slice(0, headers.length)
          })
          .filter((row) => row.length > 1 || (row.length === 1 && row[0] !== ''));
        return { headers, rows }
      }
    }
    return parseTable(markdown)
  }, [markdown])

  if (headers.length === 0 || rows.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded text-gray-500 text-center">
        No valid table data to display.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="even:bg-gray-50 hover:bg-gray-100">
              {/* 4. แก้ไขการ render cell ให้ปลอดภัยขึ้น
                  โดยวนลูปตามจำนวน header เพื่อให้แน่ใจว่าทุกแถวมีจำนวนคอลัมน์เท่ากัน
                  ป้องกันปัญหา table-layout เพี้ยนหากข้อมูลบางแถวไม่ครบ */}
              {headers.map((_, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-gray-700 border-t border-gray-200"
                >
                  {/* แสดงข้อมูลใน cell ถ้ามี, ถ้าไม่มีให้แสดงเป็นค่าว่าง */}
                  {row[cellIndex] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}