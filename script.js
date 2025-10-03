// Menú hamburguesa
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });
}

// Simulador (solo funciona si los elementos existen en la página)
const solarInput = document.getElementById("solarInput");
const windInput = document.getElementById("windInput");
const energyValue = document.getElementById("energyValue");

if (solarInput && windInput && energyValue) {
  let ctx = document.getElementById("energyChart").getContext("2d");
  let energyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Solar", "Eólica", "Total"],
      datasets: [{
        label: "kWh",
        data: [0, 0, 0],
        backgroundColor: ["#c69c6d", "#8b5e34", "#3e2f1c"]
      }]
    }
  });

  function updateSim() {
    let solar = parseInt(solarInput.value);
    let wind = parseInt(windInput.value);
    let total = (solar * 0.05) + (wind * 0.07);

    energyValue.textContent = total.toFixed(2);

    energyChart.data.datasets[0].data = [solar*0.05, wind*0.07, total];
    energyChart.update();

    // Dashboard también (si existe)
    if (document.getElementById("dashEnergy")) {
      document.getElementById("dashEnergy").textContent = total.toFixed(2);
      document.getElementById("dashCO2").textContent = (total*0.8).toFixed(1);
      document.getElementById("dashBattery").textContent = (total/2).toFixed(1);
    }
  }

  solarInput.addEventListener("input", updateSim);
  windInput.addEventListener("input", updateSim);
  updateSim();
}
