"use client"

import { useState, useRef } from "react"
import html2canvas from "html2canvas"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, X, Maximize2, Minimize2, Sparkles } from "lucide-react"
import { ChartRenderer } from "@/components/chart-renderer"
import { TableRenderer } from "@/components/table-renderer"
import { useWidgetStore } from "@/store/widgetStore"

interface Widget {
  id: string
  type: "chart" | "table"
  title: string
  data: any
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface DragState {
  isDragging: boolean
  draggedWidget: string | null
  offset: { x: number; y: number }
}

export function AIDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedWidget: null,
    offset: { x: 0, y: 0 },
  })
  const canvasRef = useRef<HTMLDivElement>(null)

  const availableWidgets = useWidgetStore((state) => state.availableWidgets)
  const removeAvailableWidget = useWidgetStore((state) => state.removeAvailableWidget)

  const addWidget = (widget: any) => {
    const newWidget: Widget = {
      ...widget,
      id: `${widget.id}-${Date.now()}`,
      position: { x: Math.random() * 200, y: Math.random() * 150 },
      size: { width: 380, height: 280 },
    }
    setWidgets((prev) => [...prev, newWidget])
  }

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
  }

  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId)
    if (!widget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setDragState({
      isDragging: true,
      draggedWidget: widgetId,
      offset,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedWidget || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - canvasRect.left - dragState.offset.x
    const newY = e.clientY - canvasRect.top - dragState.offset.y

    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === dragState.draggedWidget
          ? {
              ...widget,
              position: {
                x: Math.max(0, Math.min(newX, canvasRect.width - widget.size.width)),
                y: Math.max(0, Math.min(newY, canvasRect.height - widget.size.height)),
              },
            }
          : widget,
      ),
    )
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      draggedWidget: null,
      offset: { x: 0, y: 0 },
    })
  }

  const resizeWidget = (widgetId: string, newSize: { width: number; height: number }) => {
    setWidgets((prev) => prev.map((widget) => (widget.id === widgetId ? { ...widget, size: newSize } : widget)))
  }

  const toggleWidgetSize = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        if (widget.id === widgetId) {
          const isLarge = widget.size.width > 380
          return {
            ...widget,
            size: isLarge ? { width: 380, height: 280 } : { width: 500, height: 350 },
          }
        }
        return widget
      }),
    )
  }

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, {backgroundColor: null});
    const link = document.createElement("a");
    link.download = "dashboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-full flex flex-col">
        {/* Export Button */}
        <div className="flex justify-end mb-2">
          <Button onClick={handleExportPNG} variant="outline" className="gap-2">
            <span>Export PNG</span>
          </Button>
        </div>
        {/* Canvas Area - ปรับขนาดให้พอดีกับหน้าจอ */}
        <div className="flex-1 p-4">
          <Card className="h-[calc(100vh-200px)] p-4 bg-white/80 backdrop-blur-sm relative overflow-visible shadow-xl border-0 ring-1 ring-gray-200/50">
            <div
              ref={canvasRef}
              className="h-full relative w-full"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {widgets.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300/50 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50">
                  <div className="text-center max-w-md">
                    <div className="relative mb-6">
                      
                      <div className="relative bg-gradient-to-r from-[#ED1B2D] to-red-600 p-4 rounded-full mx-auto w-fit">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Dashboard</h3>
                    <p className="text-gray-600 mb-2 leading-relaxed">
                      Start building your custom dashboard by adding widgets below
                    </p>
                    <p className="text-sm text-gray-500 bg-white/50 rounded-lg px-3 py-2 inline-block">
                      Drag & Drop • Resize • Customize
                    </p>
                  </div>
                </div>
              ) : (
                widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="absolute bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg group hover:shadow-xl transition-all duration-200 ring-1 ring-gray-100/50"
                    style={{
                      left: widget.position.x,
                      top: widget.position.y,
                      width: widget.size.width,
                      height: widget.size.height,
                    }}
                  >
                    {/* Widget Header - ปรับปรุงให้สวยขึ้น */}
                    <div
                      className="flex items-center justify-between p-3 border-b border-gray-200/50 cursor-move bg-gradient-to-r from-gray-50/80 to-white/80 rounded-t-xl"
                      onMouseDown={(e) => handleMouseDown(e, widget.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900 text-sm">{widget.title}</h3>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetSize(widget.id)}
                          className="h-6 w-6 p-0 hover:bg-gray-100/80"
                        >
                          {widget.size.width > 380 ? (
                            <Minimize2 className="h-3 w-3" />
                          ) : (
                            <Maximize2 className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWidget(widget.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50/80"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Widget Content */}
                    <div className="p-3" style={{ height: widget.size.height - 60 }}>
                      {widget.type === "chart" ? (
                        <div className="h-full">
                          <ChartRenderer config={widget.data} />
                        </div>
                      ) : (
                        <div className="h-full overflow-auto">
                          <TableRenderer markdown={widget.data} />
                        </div>
                      )}
                    </div>

                    {/* Resize Handle - ปรับปรุงให้สวยขึ้น */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        const startX = e.clientX
                        const startY = e.clientY
                        const startWidth = widget.size.width
                        const startHeight = widget.size.height

                        const handleResize = (e: MouseEvent) => {
                          const newWidth = Math.max(280, startWidth + (e.clientX - startX))
                          const newHeight = Math.max(200, startHeight + (e.clientY - startY))
                          resizeWidget(widget.id, { width: newWidth, height: newHeight })
                        }

                        const handleResizeEnd = () => {
                          document.removeEventListener("mousemove", handleResize)
                          document.removeEventListener("mouseup", handleResizeEnd)
                        }

                        document.addEventListener("mousemove", handleResize)
                        document.addEventListener("mouseup", handleResizeEnd)
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 rounded-tl-lg opacity-60"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Available Widgets - ปรับขนาดให้เล็กลง */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-[#ED1B2D] to-red-600 p-2 rounded-lg">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Available Widgets</h3>
              <p className="text-sm text-gray-600">Click to add widgets to your dashboard</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {availableWidgets.map((widget) => (
              <Card
                key={widget.id}
                className="p-3 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm border-0 ring-1 ring-gray-200/50 hover:ring-[#ED1B2D]/30 hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-xs group-hover:text-[#ED1B2D] transition-colors">
                    {widget.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={() => addWidget(widget)}
                      className="bg-gradient-to-r from-[#ED1B2D] to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAvailableWidget(widget.id)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      title="Remove widget"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="h-16 overflow-hidden rounded-lg bg-gray-50/50">
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
