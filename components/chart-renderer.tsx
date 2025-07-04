"use client"

import { useRef } from "react"
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Chart as ReactChartJS } from "react-chartjs-2"
import type { Chart as ChartJS } from "chart.js"

// Register all controllers and elements you use
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

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
      <ReactChartJS
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
