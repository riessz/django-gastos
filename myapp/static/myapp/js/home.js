(function () {
    // ── Donut ──────────────────────────────────────────────────
    const raw   = JSON.parse(document.getElementById('chart-data').textContent);
    const total = raw.reduce((s, d) => s + d.valor, 0);

    if (raw.length && document.getElementById('donutChart')) {
        const radialLabels = {
            id: 'radialLabels',
            afterDraw(chart) {
                const { ctx: c, data, chartArea } = chart;
                const meta = chart.getDatasetMeta(0);
                const cx = (chartArea.left + chartArea.right) / 2;
                const cy = (chartArea.top + chartArea.bottom) / 2;

                c.save();
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.font = '600 9px Inter, system-ui, sans-serif';
                c.fillStyle = '#94a3b8';
                c.fillText('TOTAL', cx, cy - 13);
                c.font = 'bold 17px Inter, system-ui, sans-serif';
                c.fillStyle = '#1e293b';
                c.fillText('R$ ' + total.toFixed(2).replace('.', ','), cx, cy + 8);
                c.restore();

                meta.data.forEach((arc, i) => {
                    if ((arc.endAngle - arc.startAngle) < 0.15) return;
                    const mid   = (arc.startAngle + arc.endAngle) / 2;
                    const r     = arc.outerRadius;
                    const color = data.datasets[0].backgroundColor[i];
                    const name  = data.labels[i];
                    const val   = data.datasets[0].data[i];
                    const right = Math.cos(mid) >= 0;

                    const x1 = cx + Math.cos(mid) * r;
                    const y1 = cy + Math.sin(mid) * r;
                    const x2 = cx + Math.cos(mid) * (r + 14);
                    const y2 = cy + Math.sin(mid) * (r + 14);
                    const x3 = x2 + (right ? 12 : -12);

                    c.save();
                    c.beginPath();
                    c.moveTo(x1, y1);
                    c.lineTo(x2, y2);
                    c.lineTo(x3, y2);
                    c.strokeStyle = color;
                    c.lineWidth = 1.2;
                    c.lineCap = 'round';
                    c.lineJoin = 'round';
                    c.globalAlpha = 0.75;
                    c.stroke();
                    c.beginPath();
                    c.arc(x3, y2, 2, 0, Math.PI * 2);
                    c.fillStyle = color;
                    c.globalAlpha = 1;
                    c.fill();

                    const tx    = x3 + (right ? 5 : -5);
                    const trunc = name.length > 11 ? name.slice(0, 11) + '…' : name;
                    c.textAlign = right ? 'left' : 'right';
                    c.textBaseline = 'bottom';
                    c.font = '600 10px Inter, system-ui, sans-serif';
                    c.fillStyle = '#1e293b';
                    c.fillText(trunc, tx, y2);
                    c.textBaseline = 'top';
                    c.font = '500 9px Inter, system-ui, sans-serif';
                    c.fillStyle = '#64748b';
                    c.fillText('R$ ' + val.toFixed(2).replace('.', ','), tx, y2 + 2);
                    c.restore();
                });
            }
        };

        new Chart(document.getElementById('donutChart'), {
            type: 'doughnut',
            data: {
                labels: raw.map(d => d.categoria),
                datasets: [{
                    data: raw.map(d => d.valor),
                    backgroundColor: raw.map(d => d.cor),
                    borderWidth: 3,
                    borderColor: '#f8fafc',
                    hoverBorderColor: '#f8fafc',
                    hoverOffset: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                layout: { padding: { top: 46, bottom: 46, left: 70, right: 70 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b', titleColor: '#94a3b8',
                        bodyColor: '#f1f5f9', padding: 10, cornerRadius: 10,
                        callbacks: { label: c => ' R$ ' + c.parsed.toFixed(2).replace('.', ',') }
                    }
                },
                animation: { duration: 900, easing: 'easeInOutQuart' },
            },
            plugins: [radialLabels]
        });
    }

    // ── Bar: tendência ────────────────────────────────────────
    const trendRaw = JSON.parse(document.getElementById('trend-data').textContent);
    const selM = window.SELECTED_MONTH;
    const selY = window.SELECTED_YEAR;

    new Chart(document.getElementById('trendChart'), {
        type: 'bar',
        data: {
            labels: trendRaw.map(d => d.mes),
            datasets: [{
                data: trendRaw.map(d => d.total),
                backgroundColor: trendRaw.map(d =>
                    d.month === selM && d.year === selY ? '#16a34a' : '#86efac'
                ),
                hoverBackgroundColor: trendRaw.map(d =>
                    d.month === selM && d.year === selY ? '#15803d' : '#4ade80'
                ),
                borderRadius: { topLeft: 5, topRight: 5 },
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b', titleColor: '#94a3b8',
                    bodyColor: '#f1f5f9', padding: 10, cornerRadius: 10,
                    callbacks: { label: c => ' R$ ' + c.parsed.y.toFixed(2).replace('.', ',') }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 10, family: 'Inter, system-ui' }, color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(241,245,249,0.9)', lineWidth: 1 },
                    border: { display: false },
                    ticks: {
                        font: { size: 10, family: 'Inter, system-ui' }, color: '#94a3b8',
                        callback: v => v === 0 ? '' : 'R$' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 0})
                    }
                }
            },
            animation: { duration: 750, easing: 'easeInOutQuart' }
        }
    });
})();
