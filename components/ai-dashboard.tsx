"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, X } from "lucide-react"
import { ChartRenderer } from "@/components/chart-renderer"
import { TableRenderer } from "@/components/table-renderer"

interface Widget {
  id: string
  type: "chart" | "table"
  title: string
  data: any
}

export function AIDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  const availableWidgets: Widget[] = [
    {
      id: "1",
      type: "chart",
      title: "Forecast vs Actual",
      data: {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Forecast",
              data: [120, 135, 140, 125, 160, 155],
              borderColor: "#ED1B2D",
              backgroundColor: "rgba(237, 27, 45, 0.1)",
              tension: 0.4,
            },
            {
              label: "Actual",
              data: [110, 130, 145, 120, 155, 150],
              borderColor: "#374151",
              backgroundColor: "rgba(55, 65, 81, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Forecast vs Actual (KT)" },
          },
        },
      },
    },
    {
      id: "2",
      type: "chart",
      title: "Inventory by Plant",
      data: {
        type: "bar",
        data: {
          labels: ["CHINA-WAREHOUSE", "SINGAPORE-WAREHOUSE"],
          datasets: [
            {
              label: "Inventory (MT)",
              data: [3350, 1640],
              backgroundColor: ["#ED1B2D", "#374151"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Current Inventory by Plant" },
          },
        },
      },
    },
    {
      id: "3",
      type: "table",
      title: "Top Materials",
      data: `| Material | Plant | Stock (MT) | Value (USD) |
|----------|-------|------------|-------------|
| P-001 | CHINA-WAREHOUSE | 1,250 | $125,000 |
| P-002 | SINGAPORE-WAREHOUSE | 890 | $89,000 |
| P-003 | CHINA-WAREHOUSE | 2,100 | $210,000 |`,
    },
    {
      id: "4",
      type: "chart",
      title: "Monthly Trends",
      data: {
        type: "line",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Revenue",
              data: [450, 520, 480, 600],
              borderColor: "#ED1B2D",
              backgroundColor: "rgba(237, 27, 45, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Quarterly Revenue Trends" },
          },
        },
      },
    },
    {
      id: "5",
      type: "chart",
      title: "Cost Analysis",
      data: {
        type: "doughnut",
        data: {
          labels: ["Storage", "Transport", "Labor", "Other"],
          datasets: [
            {
              data: [35, 25, 30, 10],
              backgroundColor: ["#ED1B2D", "#374151", "#6B7280", "#9CA3AF"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Cost Breakdown" },
          },
        },
      },
    },
    {
      id: "6",
      type: "table",
      title: "Recent Transactions",
      data: `| Date | Type | Amount | Status |
|------|------|--------|--------|
| 2024-01-15 | Inbound | 500 MT | Complete |
| 2024-01-14 | Outbound | 300 MT | Complete |
| 2024-01-13 | Inbound | 750 MT | Pending |`,
    },
    {
      id: "7",
      type: "chart",
      title: "Weekly Performance",
      data: {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Performance (%)",
              data: [85, 92, 78, 96],
              backgroundColor: "#ED1B2D",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Weekly Performance" },
          },
        },
      },
    },
    {
      id: "8",
      type: "table",
      title: "Warehouse Capacity",
      data: `| Warehouse | Capacity (MT) | Current (MT) | Utilization (%) |
|-----------|---------------|--------------|-----------------|
| CHINA-WAREHOUSE | 5000 | 3350 | 67% |
| SINGAPORE-WAREHOUSE | 3000 | 1640 | 55% |`,
    },
  ]

  const addWidget = (widget: Widget) => {
    setWidgets((prev) => [...prev, { ...widget, id: `${widget.id}-${Date.now()}` }])
  }

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="min-h-full flex flex-col">
        {/* Canvas Area - เพิ่มขนาดและ scroll bar ทั้งหน้า */}
        <div className="flex-1 p-6">
          <Card className="min-h-[800px] p-6 bg-white">
            {widgets.length === 0 ? (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Widget</h3>
                  <p className="text-gray-500">Click on widgets below to add them to your dashboard</p>
                  <p className="text-sm text-gray-400 mt-2">Canvas will expand as you add more widgets</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[600px]">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="p-4 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{widget.title}</h3>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWidget(widget.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {widget.type === "chart" ? (
                      <ChartRenderer config={widget.data} />
                    ) : (
                      <TableRenderer markdown={widget.data} />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Available Widgets - เพิ่ม widgets มากขึ้น */}
        <div className="bg-white border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableWidgets.map((widget) => (
              <Card key={widget.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{widget.title}</h4>
                  <Button size="sm" onClick={() => addWidget(widget)} className="bg-[#ED1B2D] hover:bg-red-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-24 overflow-hidden">
                  {widget.type === "chart" ? (
                    <ChartRenderer config={widget.data} />
                  ) : (
                    <div className="text-xs">
                      <TableRenderer markdown={widget.data} />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
