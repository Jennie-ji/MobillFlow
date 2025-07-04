import { create } from "zustand"
import { persist } from "zustand/middleware"

// กำหนด interface สำหรับ Widget
export interface Widget {
  id: string
  type: "chart" | "table"
  title: string
  data: any
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

// กำหนด interface สำหรับ State และ Actions ของ Store
interface WidgetStore {
  widgets: Widget[]
  availableWidgets: Widget[]
  addWidget: (widget: Widget) => void
  removeWidget: (id: string) => void
  addAvailableWidget: (widget: Widget) => void
  removeAvailableWidget: (id: string) => void
  updateWidget: (id: string, update: Partial<Widget>) => void
  setWidgets: (widgets: Widget[]) => void
}

// ข้อมูลเริ่มต้นของ Widgets (ยกมาจาก ai-dashboard.tsx)
const initialWidgets: Widget[] = [
    {
      id: "1",
      type: "chart",
      title: "Forecast vs Actual",
      data: {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            { label: "Forecast", data: [120, 135, 140, 125, 160, 155], borderColor: "#ED1B2D", tension: 0.4 },
            { label: "Actual", data: [110, 130, 145, 120, 155, 150], borderColor: "#374151", tension: 0.4 },
          ],
        },
        options: { plugins: { title: { display: true, text: "Forecast vs Actual (KT)" }}},
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
          datasets: [{ label: "Inventory (MT)", data: [3350, 1640], backgroundColor: ["#ED1B2D", "#374151"] }],
        },
        options: { plugins: { title: { display: true, text: "Current Inventory by Plant" }}},
      },
    },
    {
      id: "3",
      type: "table",
      title: "Top Materials",
      data: `| Material | Plant | Stock (MT) |\n|---|---|---|\n| P-001 | CHINA-WAREHOUSE | 1,250 |\n| P-002 | SINGAPORE-WAREHOUSE | 890 |\n| P-003 | CHINA-WAREHOUSE | 2,100 |`,
    },
    // ... (สามารถเพิ่ม Widgets เริ่มต้นอื่นๆ ที่นี่ได้)
];


// สร้าง Store
export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgets: initialWidgets,
      availableWidgets: [],
      addWidget: (widget) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      addAvailableWidget: (widget) =>
        set((state) => ({
          availableWidgets: [...state.availableWidgets, widget],
        })),
      removeAvailableWidget: (id) =>
        set((state) => ({
          availableWidgets: state.availableWidgets.filter((w) => w.id !== id),
        })),
      updateWidget: (id, update) =>
        set((state) => ({
          widgets: state.widgets.map((w) => w.id === id ? { ...w, ...update } : w),
        })),
      setWidgets: (widgets) => set({ widgets }),
    }),
    { name: "dashboard-widgets" }
  )
)