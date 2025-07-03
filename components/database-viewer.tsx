"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, ChevronDown, ChevronRight, FileSpreadsheet } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TableData {
  name: string
  columns: string[]
  data: any[]
  filters: {
    search?: string[]
    dropdowns?: { label: string; options: string[] }[]
  }
}

const mockTables: TableData[] = [
  {
    name: "Inventory",
    columns: [
      "BALANCE_AS_OF_DATE",
      "PLANT_NAME",
      "MATERIAL_NAME",
      "BATCH_NUMBER",
      "UNRESRICTED_STOCK",
      "STOCK_UNIT",
      "STOCK_SELL_VALUE",
      "CURRENCY",
    ],
    data: [
      ["2024-01-15", "CHINA-WAREHOUSE", "P-001", "B001", "1250", "MT", "125000", "CNY"],
      ["2024-01-15", "SINGAPORE-WAREHOUSE", "P-002", "B002", "890", "MT", "89000", "SGD"],
      ["2024-01-15", "CHINA-WAREHOUSE", "P-003", "B003", "2100", "MT", "210000", "CNY"],
      ["2024-01-15", "SINGAPORE-WAREHOUSE", "P-001", "B004", "750", "MT", "75000", "SGD"],
    ],
    filters: {
      search: ["MATERIAL_NAME", "BATCH_NUMBER"],
      dropdowns: [
        { label: "Plant", options: ["CHINA-WAREHOUSE", "SINGAPORE-WAREHOUSE"] },
        { label: "Currency", options: ["CNY", "SGD"] },
      ],
    },
  },
  {
    name: "Inbound",
    columns: ["INBOUND_DATE", "PLANT_NAME", "MATERIAL_NAME", "NET_QUANTITY_MT"],
    data: [
      ["2024-01-10", "CHINA-WAREHOUSE", "P-001", "500"],
      ["2024-01-12", "SINGAPORE-WAREHOUSE", "P-002", "300"],
      ["2024-01-14", "CHINA-WAREHOUSE", "P-003", "800"],
    ],
    filters: {
      search: ["MATERIAL_NAME"],
      dropdowns: [{ label: "Plant", options: ["CHINA-WAREHOUSE", "SINGAPORE-WAREHOUSE"] }],
    },
  },
  {
    name: "Outbound",
    columns: [
      "OUTBOUND_DATE",
      "PLANT_NAME",
      "MODE_OF_TRANSPORT",
      "MATERIAL_NAME",
      "CUSTOMER_NUMBER",
      "NET_QUANTITY_MT",
    ],
    data: [
      ["2024-01-08", "CHINA-WAREHOUSE", "Truck", "P-001", "C001", "200"],
      ["2024-01-09", "SINGAPORE-WAREHOUSE", "Marine", "P-002", "C002", "150"],
      ["2024-01-11", "CHINA-WAREHOUSE", "Truck", "P-003", "C003", "300"],
    ],
    filters: {
      search: ["MATERIAL_NAME", "CUSTOMER_NUMBER"],
      dropdowns: [
        { label: "Plant", options: ["CHINA-WAREHOUSE", "SINGAPORE-WAREHOUSE"] },
        { label: "Transport", options: ["Truck", "Marine"] },
      ],
    },
  },
  {
    name: "Material",
    columns: ["MATERIAL_NAME", "POLYMER_TYPE", "SHELF_LIFE_IN_MONTH", "DOWNGRADE_VALUE_LOST_PERCENT"],
    data: [
      ["P-001", "P-001", "12", "5"],
      ["P-002", "P-002", "18", "3"],
      ["P-003", "P-001", "24", "7"],
    ],
    filters: {
      search: ["MATERIAL_NAME"],
      dropdowns: [{ label: "Polymer Type", options: ["P-001", "P-002"] }],
    },
  },
  {
    name: "OperationCost",
    columns: ["Operation", "Plant/Mode of Transport", "Cost", "Currency"],
    data: [
      ["Storage", "CHINA-WAREHOUSE", "50", "CNY"],
      ["Transport", "Truck", "100", "CNY"],
      ["Storage", "SINGAPORE-WAREHOUSE", "60", "SGD"],
      ["Transport", "Marine", "200", "SGD"],
    ],
    filters: {
      dropdowns: [{ label: "Operation", options: ["Storage", "Transport"] }],
    },
  },
  {
    name: "Forecast",
    columns: ["month", "year", "warehouse", "TotalCap(KT)", "Predicted Outbound (KT)", "Predicted Inventory (KT)"],
    data: [
      ["January", "2024", "CHINA-WAREHOUSE", "5000", "1200", "3800"],
      ["January", "2024", "SINGAPORE-WAREHOUSE", "3000", "800", "2200"],
      ["February", "2024", "CHINA-WAREHOUSE", "5000", "1350", "3650"],
      ["February", "2024", "SINGAPORE-WAREHOUSE", "3000", "900", "2100"],
    ],
    filters: {
      search: ["warehouse"],
    },
  },
]

export function DatabaseViewer() {
  const [openTables, setOpenTables] = useState<string[]>(["Inventory"])
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [filterValues, setFilterValues] = useState<Record<string, Record<string, string>>>({})

  const toggleTable = (tableName: string) => {
    setOpenTables((prev) => (prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]))
  }

  const handleSearch = (tableName: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [tableName]: value }))
  }

  const handleFilterChange = (tableName: string, filterName: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        [filterName]: value,
      },
    }))
  }

  const getFilteredData = (table: TableData) => {
    let filteredData = table.data

    // Apply search filter
    const searchTerm = searchTerms[table.name]?.toLowerCase()
    if (searchTerm && table.filters.search) {
      filteredData = filteredData.filter((row) =>
        table.filters.search!.some((searchCol) => {
          const colIndex = table.columns.indexOf(searchCol)
          return row[colIndex]?.toString().toLowerCase().includes(searchTerm)
        }),
      )
    }

    // Apply dropdown filters
    const tableFilters = filterValues[table.name] || {}
    Object.entries(tableFilters).forEach(([filterName, filterValue]) => {
      if (filterValue && filterValue !== "all") {
        const dropdown = table.filters.dropdowns?.find((d) => d.label === filterName)
        if (dropdown) {
          // Find the column that matches this filter
          let colIndex = -1
          if (filterName === "Plant") colIndex = table.columns.findIndex((col) => col.includes("PLANT"))
          else if (filterName === "Currency") colIndex = table.columns.indexOf("CURRENCY")
          else if (filterName === "Transport") colIndex = table.columns.indexOf("MODE_OF_TRANSPORT")
          else if (filterName === "Polymer Type") colIndex = table.columns.indexOf("POLYMER_TYPE")
          else if (filterName === "Operation") colIndex = table.columns.indexOf("Operation")

          if (colIndex >= 0) {
            filteredData = filteredData.filter((row) => row[colIndex] === filterValue)
          }
        }
      }
    })

    return filteredData
  }

  // Export functions
  const exportToCSV = (table: TableData) => {
    const filteredData = getFilteredData(table)
    const csvContent = [
      table.columns.join(","), // Header
      ...filteredData.map((row) => row.map((cell) => `"${cell}"`).join(",")), // Data rows
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    // Create timestamp in Thai format
    const now = new Date()
    const timestamp = now
      .toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/[/:]/g, "-")
      .replace(/,/g, "_")
      .replace(/ /g, "_")

    link.setAttribute("href", url)
    link.setAttribute("download", `${table.name}_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Clean up memory
  }

  const exportToExcel = (table: TableData) => {
    const filteredData = getFilteredData(table)

    // Create Excel-compatible HTML table
    const htmlTable = `
      <table>
        <thead>
          <tr>
            ${table.columns.map((col) => `<th>${col}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${filteredData.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlTable], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    // Create timestamp in Thai format
    const now = new Date()
    const timestamp = now
      .toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/[/:]/g, "-")
      .replace(/,/g, "_")
      .replace(/ /g, "_")

    link.setAttribute("href", url)
    link.setAttribute("download", `${table.name}_${timestamp}.xls`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Clean up memory
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="space-y-4">
        {mockTables.map((table) => (
          <Card key={table.name} className="overflow-hidden">
            <Collapsible open={openTables.includes(table.name)} onOpenChange={() => toggleTable(table.name)}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    {openTables.includes(table.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <h3 className="text-lg font-semibold">{table.name}</h3>
                    <span className="text-sm text-gray-500">({getFilteredData(table).length} records)</span>
                  </div>

                  {/* Export Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#ED1B2D] text-[#ED1B2D] hover:bg-[#ED1B2D] hover:text-white bg-transparent"
                        onClick={(e) => e.stopPropagation()} // Prevent collapsible toggle
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportToCSV(table)}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export {table.name} as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportToExcel(table)}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export {table.name} as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {table.filters.search && (
                      <div className="flex-1 min-w-64">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder={`Search ${table.filters.search.join(", ")}...`}
                            value={searchTerms[table.name] || ""}
                            onChange={(e) => handleSearch(table.name, e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}

                    {table.filters.dropdowns?.map((dropdown) => (
                      <Select
                        key={dropdown.label}
                        value={filterValues[table.name]?.[dropdown.label] || "all"}
                        onValueChange={(value) => handleFilterChange(table.name, dropdown.label, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={`Select ${dropdown.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {dropdown.label}s</SelectItem>
                          {dropdown.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          {table.columns.map((column) => (
                            <TableHead key={column} className="font-semibold">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredData(table).map((row, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {getFilteredData(table).length === 0 && (
                    <div className="text-center py-8 text-gray-500">No records found matching your filters.</div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  )
}
