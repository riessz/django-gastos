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
        datasets: [{
          data: data.map((d) => d.valor),
          backgroundColor: data.map((d) => d.cor),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,13,34,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#8080a0',
            bodyColor: '#ededf5',
            bodyFont: { family: 'DM Mono', size: 12 },
            callbacks: {
              label: (ctx) => ` ${formatBRL(ctx.parsed)}`,
            },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data])

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
      <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-3">Por categoria</p>
      {data && data.length > 0 ? (
        <>
          <div className="relative h-32 mb-3">
            <canvas ref={canvasRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#50507a] font-syne">total</span>
              <span className="text-sm font-mono-fin font-medium text-[#ededf5]">{formatBRL(total)}</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {data.map((item) => (
              <li key={item.categoria} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.cor }} />
                  <span className="text-[#a0a0c0] truncate">{item.categoria}</span>
                </div>
                <span className="text-[#606080] ml-2 font-mono-fin">{item.pct}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="h-32 flex items-center justify-center text-[#44445a] text-sm">
          Sem gastos neste mês
        </div>
      )}
    </div>
  )
}
