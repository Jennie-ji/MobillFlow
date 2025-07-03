"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Chart } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface ChartRendererProps {
  config: any
}

export function ChartRenderer({ config }: ChartRendererProps) {
  const chartRef = useRef<ChartJS>(null)

  if (!config || !config.data) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
        <p className="text-gray-500">No chart data available</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Chart
        ref={chartRef}
        type={config.type}
        data={config.data}
        options={{
          ...config.options,
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  )
}
