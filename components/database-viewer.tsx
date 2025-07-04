"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TableData {
  name: string;
  columns: string[];
  data: any[];
}

export function DatabaseViewer() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [openTables, setOpenTables] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [filterValues, setFilterValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [tableOrder, setTableOrder] = useState<string[]>([]);

  const PAGE_SIZE = 100;

  useEffect(() => {
    const loadInitial = async () => {
      const names = [
        "inventory",
        "inbound",
        "outbound",
        "materialmaster",
        "operationcost",
        "forecast",
      ];
      setTableOrder(names);
      for (const name of names) {
        await loadTable(name, "", {}, 0, true);
      }
    };
    loadInitial();
  }, []);

  const loadTable = async (
    name: string,
    search?: string,
    filters?: Record<string, string>,
    offset = 0,
    replace = false
  ) => {
    try {
      const params = new URLSearchParams();
      params.set("table", name);
      params.set("limit", PAGE_SIZE.toString());
      params.set("offset", offset.toString());
      if (search) params.set("search", search);
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== "all" && v !== "none") params.set(k.toLowerCase(), v);
        });
      }

      const res = await fetch(`/api/tables?${params.toString()}`);
      if (!res.ok) {
        console.error(`API error: ${res.status}`, await res.text());
        return;
      }

      const json = await res.json();
      if (!json?.table) return;

      setTables((prev) => {
        const existing = prev.find((t) => t.name === json.table.name);
        const combinedData = replace
          ? json.table.data
          : [...(existing?.data || []), ...json.table.data];
        const updatedTable: TableData = { ...json.table, data: combinedData };

        const order = [
          ...new Set([...prev.map((t) => t.name), json.table.name]),
        ];
        const tableMap = new Map(prev.map((t) => [t.name, t]));
        tableMap.set(json.table.name, updatedTable);

        return order
          .map((name) => tableMap.get(name))
          .filter(Boolean) as TableData[];
      });

      setOffsets((prev) => ({ ...prev, [name]: offset + PAGE_SIZE }));
    } catch (error) {
      console.error("loadTable error:", error);
    }
  };

  const handleSearch = (tableName: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [tableName]: value }));
    setOffsets((prev) => ({ ...prev, [tableName]: 0 }));
    loadTable(tableName, value, filterValues[tableName], 0, true);
  };

  const handleFilterChange = (
    tableName: string,
    filterName: string,
    value: string
  ) => {
    const newFilters = { ...filterValues[tableName], [filterName]: value };
    setFilterValues((prev) => ({ ...prev, [tableName]: newFilters }));
    setOffsets((prev) => ({ ...prev, [tableName]: 0 }));
    loadTable(tableName, searchTerms[tableName], newFilters, 0, true);
  };

  const exportToCSV = (table: TableData) => {
    const csvContent = [
      table.columns.join(","),
      ...table.data.map((row) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[T:.Z]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table.name}_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleTable = (tableName: string) => {
    setOpenTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  const renderFilters = (name: string) => {
    const common = (key: string, label: string, items: string[]) => (
      <Select onValueChange={(v: string) => handleFilterChange(name, key, v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {items.map((val) => (
            <SelectItem key={val} value={val}>
              {val}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    const order = (options: [string, string][]) => (
      <Select
        onValueChange={(v: string) => handleFilterChange(name, "order", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Order by" />
        </SelectTrigger>
        <SelectContent>
          {options.map(([val, label]) => (
            <SelectItem key={val} value={val}>
              {val}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    switch (name) {
      case "inventory":
        return (
          <>
            {common("plant", "Plant", [
              "SINGAPORE-WAREHOUSE",
              "CHINA-WAREHOUSE",
            ])}
            {common("currency", "Currency", ["SGD", "CNY"])}
            {order([
              ["date_asc", "Date Asc"],
              ["date_desc", "Date Desc"],
              ["value_asc", "Value Asc"],
              ["value_desc", "Value Desc"],
            ])}
          </>
        );
      case "inbound":
        return (
          <>
            {common("plant", "Plant", [
              "CHINA-WAREHOUSE",
              "SINGAPORE-WAREHOUSE",
            ])}
            {order([
              ["date_asc", "Date Asc"],
              ["date_desc", "Date Desc"],
              ["quantity_asc", "Qty Asc"],
              ["quantity_desc", "Qty Desc"],
            ])}
          </>
        );
      case "outbound":
        return (
          <>
            {common("plant", "Plant", [
              "CHINA-WAREHOUSE",
              "SINGAPORE-WAREHOUSE",
            ])}
            {common("transport", "Transport", ["truck", "marine"])}
            {order([
              ["date_asc", "Date Asc"],
              ["date_desc", "Date Desc"],
              ["quantity_asc", "Qty Asc"],
              ["quantity_desc", "Qty Desc"],
            ])}
          </>
        );
      case "materialmaster":
        return (
          <>
            {common("polymer_type", "Polymer Type", [
              "P-001",
              "P-002",
              "P-003",
              "P-004",
            ])}
            {order([
              ["shelf_life_asc", "Shelf Life ↑"],
              ["shelf_life_desc", "Shelf Life ↓"],
              ["value_lost_asc", "Value Lost ↑"],
              ["value_lost_desc", "Value Lost ↓"],
            ])}
          </>
        );
      case "forecast":
        return common("warehouse", "Warehouse", ["china", "singapore"]);
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="space-y-4">
        {tableOrder.map((name) => {
          const table = tables.find((t) => t.name === name);
          if (!table) return null;

          return (
            <Card key={table.name} className="overflow-hidden">
              <Collapsible
                open={openTables.includes(table.name)}
                onOpenChange={() => toggleTable(table.name)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center space-x-2">
                      {openTables.includes(table.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <h3 className="text-lg font-semibold">{table.name}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#ED1B2D] text-[#ED1B2D] hover:bg-[#ED1B2D] hover:text-white bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToCSV(table);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      {!["operationcost", "forecast"].includes(name) && (
                        <Input
                          placeholder={
                            name === "outbound"
                              ? "search MATERIAL_NAME or CUSTOMER_NUMBER"
                              : name === "inventory"
                              ? "search MATERIAL_NAME or BATCH_NUMBER"
                              : "search MATERIAL_NAME"
                          }
                          value={searchTerms[name] || ""}
                          onChange={(e) => handleSearch(name, e.target.value)}
                          className="w-64"
                        />
                      )}
                      {renderFilters(name)}
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="relative max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                          <thead className="sticky top-0 z-10 bg-gray-200">
                            <tr className="bg-gray-200 border-b border-gray-300">
                              <th className="font-semibold px-4 py-2">#</th>
                              {table.columns.map((column) => (
                                <th
                                  key={column}
                                  className="font-semibold px-4 py-2"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.data.map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-2">{rowIndex + 1}</td>
                                {row.map((cell: any, cellIndex: number) => (
                                  <td key={cellIndex} className="px-4 py-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {table.data.length >=
                      (offsets[table.name] || PAGE_SIZE) && (
                      <div className="text-center mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            loadTable(
                              table.name,
                              searchTerms[table.name],
                              filterValues[table.name],
                              offsets[table.name] || 0,
                              false
                            )
                          }
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}