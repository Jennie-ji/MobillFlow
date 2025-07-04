"use client"

import { useMemo } from "react"

interface TableRendererProps {
  markdown: string
}

export function TableRenderer({ markdown }: TableRendererProps) {
  const { headers, rows } = useMemo(() => {
    // ปรับปรุง parser ให้รองรับข้อมูลแบบ Tab-separated โดยเฉพาะ
    const parseTabSeparatedData = (data: string) => {
      const lines = data.trim().split("\n")

      // ตารางต้องมีอย่างน้อย 1 บรรทัด (สำหรับ header)
      if (lines.length < 1) {
        return { headers: [], rows: [] }
      }

      // 1. เปลี่ยนตัวคั่นจาก '|' เป็น Tab (\t)
      const delimiter = /\t/

      // บรรทัดแรกคือ header
      const headers = lines[0].split(delimiter).map((h) => h.trim())

      // 2. ข้อมูลเริ่มจากบรรทัดถัดไป (slice(1)) เพราะไม่มีบรรทัดคั่น "---"
      const dataLines = lines.slice(1)

      const rows = dataLines
        .map((line) => {
          // 3. แยก cell ในแต่ละแถว และไม่กรอง cell ที่ว่างเปล่าทิ้งเพื่อรักษารูปแบบตาราง
          return line.split(delimiter).map((cell) => cell.trim())
        })
        // กรองแถวที่ว่างเปล่าจริงๆ (ไม่มีข้อมูลเลย) ทิ้งไป
        .filter((row) => row.length > 1 || (row.length === 1 && row[0] !== ''));

      return { headers, rows }
    }

    return parseTabSeparatedData(markdown)
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