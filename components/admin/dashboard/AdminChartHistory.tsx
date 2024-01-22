"use client"

import "dayjs/locale/vi";
import { Chart } from "chart.js/auto"
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import zoomPlugin from 'chartjs-plugin-zoom';
import { memo, useEffect, useRef, useState } from "react";
import { useAction, usePromise } from "@/lib/utils/promise";
import Skeleton from "@/components/ui/Skeleton";
import { getAccessHistory } from "@/actions/admin/dashboard";

// million-ignore
const AdminChartHistory = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{date: string, count: number}[]>([])

  const fetchData = () => usePromise({
    loading,
    setLoading,
    showSuccessTitle: false,
    callback: async () => {
      const { data } = await useAction(getAccessHistory)
      setData(data)
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="w-full rounded-lg bg-white p-6 h-80 flex flex-col space-y-6">
      <div className="flex-none flex items-center space-x-3">
        <div className="rounded w-4 h-8 bg-slate-900"></div>
        <p className="font-semibold">Lịch sử truy cập</p>
      </div>
      <div className="flex-grow min-h-0">
        { loading
          ? <Skeleton className="w-full h-full rounded-lg" />
          : data.length == 0 ? <div className="w-full h-full rounded-lg grid place-items-center bg-gray-100">
            Chưa có dữ liệu
          </div>
          : <ChartOne data={data} />
        }
      </div>
    </div>
  )
}

const ChartOne = memo(({
  data
}: {
  data: {date: string, count: number}[]
}) => {
  const chartEl = useRef<HTMLCanvasElement | null>(null)
  const chart = useRef<Chart<"line">>()

  useEffect(() => {
    if (chartEl.current) {
      // moment.locale('vi')
      Chart.register(zoomPlugin)

      chart.current = new Chart(chartEl.current, {
        type: 'line',
        data: {
          datasets: [
            {
              data: data.map(v => ({
                x: v.date,
                y: v.count
              })) as any,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: (context) => {
                const bgColors = [
                  'rgb(255, 99, 132)',
                  'rgba(255, 99, 133, 0.144)'
                ]

                if (!context.chart.chartArea) return

                const { ctx, data, chartArea: {top, bottom} } = context.chart
                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom)
                gradientBg.addColorStop(0, bgColors[0])
                gradientBg.addColorStop(1, bgColors[1])

                return gradientBg
              },
              fill: 'start'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            filler: {
              propagate: false,
            },
            title: {
              display: false
            },
            legend: {
              display: false
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                  modifierKey: 'ctrl'
                },
                pinch: {
                  enabled: true,
                },
                mode: 'x',
              },
              pan: {
                enabled: true,
                mode: 'x',
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              type: 'time',
              ticks: {
                autoSkip: true,
                autoSkipPadding: 50,
                maxRotation: 0
              },
              time: {
                unit: 'day',
                parser: 'YYYY-MM-DD',
                tooltipFormat: 'll',
                displayFormats: {
                  day: 'DD MMM',
                  month: 'MMM YYYY',
                  year: 'YYYY'
                }
              },
              adapters: {
                date: {
                  locale: 'vi'
                }
              }
            },
            y: {
              ticks: {
                autoSkip: true,
                autoSkipPadding: 10,
                maxRotation: 0
              },
              grid: {
                display: false
              }
            },
          },
          elements: {
            line: {
              tension: 0.4
            }
          },
          interaction: {
            intersect: false,
          },
        },
      })
    }

    return () => {
      chart.current?.destroy()
    }
    
  }, [])

  return <canvas ref={chartEl} className="!w-full !h-full"></canvas>
})

export default AdminChartHistory