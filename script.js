// Cambiar secciones
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Tabs en Educación
function showTab(tab) {
  const content = {
    solar: "La energía solar convierte la luz del sol en electricidad usando paneles fotovoltaicos.",
    eolica: "La energía eólica aprovecha el viento para mover turbinas y generar electricidad.",
    sensor: "El sensor 360° detecta movimiento alrededor de la torre para seguridad y eficiencia."
  };
  document.getElementById("tabContent").innerHTML = `<p>${content[tab]}</p>`;
}

// Simulador
const solarInput = document.getElementById("solarInput");
const windInput = document.getElementById("windInput");
const energyValue = document.getElementById("energyValue");

let ctx = document.getElementById('energyChart').getContext('2d');
let energyChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Solar', 'Eólica', 'Total'],
    datasets: [{
      label: 'kWh',
      data: [0, 0, 0],
      backgroundColor: ['#ffcc00', '#00ccff', '#00ff99']
    }]
  }
});

function updateSim() {
  let solar = parseInt(solarInput.value);
  let wind = parseInt(windInput.value);
  let total = (solar * 0.05) + (wind * 0.07); // fórmula simplificada

  energyValue.textContent = total.toFixed(2);

  energyChart.data.datasets[0].data = [solar*0.05, wind*0.07, total];
  energyChart.update();

  // Dashboard también
  document.getElementById("dashEnergy").textContent = total.toFixed(2);
  document.getElementById("dashCO2").textContent = (total*0.8).toFixed(1);
  document.getElementById("dashBattery").textContent = (total/2).toFixed(1);
}

solarInput.addEventListener("input", updateSim);
windInput.addEventListener("input", updateSim);
updateSim(); // inicial
