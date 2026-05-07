import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function TrendChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.mes),
        datasets: [
          {
            data: data.map((d) => d.total),
            backgroundColor: data.map((_, i) =>
              i === data.length - 1 ? '#10b981' : '#374151'
            ),
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: {
            label: (ctx) =>
              ` R$ ${Number(ctx.parsed.y).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          },
        }},
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 10 } },
            border: { display: false },
          },
          y: {
            grid: { color: '#1f2937' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: (v) => `R$${Number(v).toLocaleString('pt-BR')}`,
            },
            border: { display: false },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <p className="text-sm font-medium text-gray-400 mb-3">Tendência 6 meses</p>
      {data && data.length > 0 ? (
        <div className="relative h-36 mb-4">
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <div className="h-36 flex items-center justify-center text-gray-600 text-sm">
          Sem dados
        </div>
      )}
    </div>
  )
}
