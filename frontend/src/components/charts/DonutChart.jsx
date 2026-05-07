import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DonutChart({ data, total }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()
    if (!data || data.length === 0) return

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.categoria),
        datasets: [
          {
            data: data.map((d) => d.valor),
            backgroundColor: data.map((d) => d.cor),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${formatBRL(ctx.parsed)}`,
            },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <p className="text-sm font-medium text-gray-400 mb-3">Por categoria</p>
      {data && data.length > 0 ? (
        <>
          <div className="relative h-36 mb-4">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500">total</span>
              <span className="text-sm font-bold text-white">{formatBRL(total)}</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {data.map((item) => (
              <li key={item.categoria} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.cor }}
                  />
                  <span className="text-gray-300 truncate">{item.categoria}</span>
                </div>
                <span className="text-gray-500 ml-2">{item.pct}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="h-36 flex items-center justify-center text-gray-600 text-sm">
          Sem gastos neste mês
        </div>
      )}
    </div>
  )
}
