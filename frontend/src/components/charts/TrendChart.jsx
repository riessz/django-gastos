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
        datasets: [{
          data: data.map((d) => d.total),
          backgroundColor: data.map((_, i) =>
            i === data.length - 1 ? 'rgba(139,92,246,0.85)' : 'rgba(139,92,246,0.2)'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              label: (ctx) =>
                ` R$ ${Number(ctx.parsed.y).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#50507a', font: { size: 9, family: 'Syne' } },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#50507a',
              font: { size: 9 },
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
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
      <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-3">Tendência 6 meses</p>
      {data && data.length > 0 ? (
        <div className="relative h-32">
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-[#44445a] text-sm">
          Sem dados
        </div>
      )}
    </div>
  )
}
