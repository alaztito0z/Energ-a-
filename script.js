/* ==========================
   Navegación entre secciones
   ========================== */
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showSection(btn.dataset.target);
  });
});

function showSection(id){
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const sec = document.getElementById(id);
  if(sec) sec.classList.add('active');
  // small: scroll top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================
   Elementos del simulador
   ========================== */
const solarInput = document.getElementById('solarInput');
const windInput  = document.getElementById('windInput');
const tiltInput  = document.getElementById('tiltInput');

const solarVal = document.getElementById('solarVal');
const windVal  = document.getElementById('windVal');
const tiltVal  = document.getElementById('tiltVal');

[solarInput, windInput, tiltInput].forEach(el => {
  if(!el) return;
  el.addEventListener('input', () => {
    solarVal.textContent = solarInput.value;
    windVal.textContent  = parseFloat(windInput.value).toFixed(1);
    tiltVal.textContent  = tiltInput.value;
  });
});

/* Parámetros físicos (puedes ajustar) */
const params = {
  panelArea: 1.5,       // m² total panel ejemplo
  panelEff: 0.18,       // eficiencia nominal
  rotorArea: 0.25,      // m² (área barrida turbina pequeña)
  rho: 1.225,           // kg/m³ (densidad del aire)
  Cp: 0.35              // coef. de potencia (ejemplo)
};

/* Cálculos: Ps (W), Pw (W) */
function calcSolarPower(G, A, eta, tiltDeg){
  // Simplificación: proyección coseno del tilt
  const tiltRad = tiltDeg * Math.PI / 180;
  return G * A * eta * Math.cos(tiltRad); // W
}
function calcWindPower(V, rho, Cp, Arot){
  // Pw = 0.5 * rho * A * Cp * V^3
  return 0.5 * rho * Arot * Cp * Math.pow(V, 3);
}

/* Gráfica (Chart.js) */
const ctx = document.getElementById('mixChart').getContext('2d');
const mixChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Solar (W)', 'Eólica (W)', 'Total (W)'],
    datasets: [{
      label: 'Potencia instantánea',
      data: [0,0,0],
      backgroundColor: ['#ffd166','#60a5fa','#2dd4bf'],
      borderRadius: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${Number(ctx.raw).toFixed(1)} W`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#9aa6b2' } },
      x: { ticks: { color: '#9aa6b2' } }
    }
  }
});

/* Simulación dinámica: guarda registros para export */
let log = [];
function runSimulationOnce(){
  const G = Number(solarInput.value);        // W/m²
  const V = Number(windInput.value);         // m/s
  const tilt = Number(tiltInput.value);      // degrees

  const Ps = calcSolarPower(G, params.panelArea, params.panelEff, tilt); // W
  const Pw = calcWindPower(V, params.rho, params.Cp, params.rotorArea); // W
  const total = Ps + Pw;

  // actualizar UI
  mixChart.data.datasets[0].data = [Ps, Pw, total];
  mixChart.update();

  document.getElementById('statSolar').textContent = `${Ps.toFixed(1)} W`;
  document.getElementById('statWind').textContent  = `${Pw.toFixed(1)} W`;
  document.getElementById('statTotal').textContent = `${total.toFixed(1)} W`;
  document.getElementById('statCO2').textContent   = `${(total*0.000453).toFixed(3)} kg`; // ejemplo: factor reducidisimo

  // Hero metric
  const heroProduction = document.getElementById('heroProduction');
  if(heroProduction) heroProduction.textContent = `${(total/1000).toFixed(3)} kW`;

  // log entry
  const timestamp = new Date().toISOString();
  log.push({ t: timestamp, G, V, tilt, Ps: Ps.toFixed(2), Pw: Pw.toFixed(2), total: total.toFixed(2) });

  // return values
  return { Ps, Pw, total };
}

/* Botones y eventos */
document.getElementById('simulateBtn').addEventListener('click', () => {
  runSimulationOnce();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  solarInput.value = 600; windInput.value = 6.5; tiltInput.value = 25;
  solarVal.textContent = solarInput.value;
  windVal.textContent = Number(windInput.value).toFixed(1);
  tiltVal.textContent = tiltInput.value;
  runSimulationOnce();
});

/* Inicializar con un cálculo */
document.addEventListener('DOMContentLoaded', () => {
  solarVal.textContent = solarInput.value;
  windVal.textContent  = Number(windInput.value).toFixed(1);
  tiltVal.textContent  = tiltInput.value;
  runSimulationOnce();
});

/* Export CSV */
function exportCSV(){
  if(log.length === 0){ alert('No hay datos para exportar. Ejecuta la simulación primero.'); return; }
  const headers = Object.keys(log[0]).join(',');
  const rows = log.map(r => Object.values(r).join(',')).join('\n');
  const csv = headers + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hybridlab_log_${new Date().toISOString().slice(0,19)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
document.getElementById('exportCSV').addEventListener('click', exportCSV);

/* Snapshot (captura simple de estado) */
document.getElementById('shareSnapshot').addEventListener('click', () => {
  const snap = {
    time: new Date().toISOString(),
    last: log.length ? log[log.length - 1] : null
  };
  const txt = JSON.stringify(snap, null, 2);
  navigator.clipboard?.writeText(txt).then(()=> {
    alert('Snapshot copiado al portapapeles (JSON).');
  }).catch(()=> alert('No se pudo copiar snapshot.'));
});

/* Pequeño helper: navegar botones con data-target */
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', (e) => {
    const targ = e.currentTarget.dataset.target;
    if(targ) showSection(targ);
  });
});
