"use client"

import { useWidgetStore, Widget as StoreWidget } from "@/store/widgetStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, X } from "lucide-react"
import { ChartRenderer } from "@/components/chart-renderer"
import { TableRenderer } from "@/components/table-renderer"
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

export default function AiDashboard() {
  const { widgets, addWidget, removeWidget } = useWidgetStore()

  const availableWidgets: StoreWidget[] = []

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
                {widgets.map((widget: StoreWidget) => (
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
