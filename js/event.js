let eventsData = [];

async function loadEvents() {
  const response = await fetch("../data/events.json");
  eventsData = await response.json();
}

function currentEvent() {
  return eventsData.find((item) => item.month === cityState.month) || eventsData[0];
}

function impactPill(name, isUp) {
  return `<span class="impact-pill ${isUp ? "up" : "down"}">${isUp ? "📈" : "📉"} ${name}</span>`;
}

function renderEventCard(target) {
  const event = currentEvent();

  if (!event || !target) {
    return;
  }

  const upPills = event.impactUp.map((name) => impactPill(name, true)).join("");
  const downPills = event.impactDown.map((name) => impactPill(name, false)).join("");

  target.innerHTML = `
    <span class="tag">${event.category}</span>
    <h3 class="mt-3 text-2xl font-black tracking-[-0.04em]">${event.name}</h3>
    <p class="mt-3 text-sm font-semibold leading-6 text-slate-600">${event.summary}</p>
    <div class="mt-4 flex flex-wrap gap-2">${upPills}${downPills}</div>
    <div class="mt-5 rounded-[10px] bg-emerald-50 p-4">
      <p class="text-xs font-black uppercase text-emerald-700">Pertanyaan Refleksi</p>
      <p class="mt-2 text-sm font-bold text-slate-700">${event.question}</p>
    </div>
    <div class="mt-4 rounded-[10px] border border-slate-200 bg-white p-4">
    <p class="text-xs font-black uppercase text-slate-500">
        Prediksi Dampak Pasar
    </p>

    <div class="mt-3">

        ${
            event.impactUp.length
            ? `
            <p class="font-bold text-emerald-600">
                📈 Sektor yang Diprediksi Naik
            </p>

            <div class="mt-2 flex flex-wrap gap-2">
                ${event.impactUp
                    .map(name => impactPill(name, true))
                    .join("")}
            </div>
            `
            : ""
        }

        ${
            event.impactDown.length
            ? `
            <p class="mt-4 font-bold text-red-600">
                📉 Sektor yang Diprediksi Turun
            </p>

            <div class="mt-2 flex flex-wrap gap-2">
                ${event.impactDown
                    .map(name => impactPill(name, false))
                    .join("")}
            </div>
            `
            : ""
        }

    </div>

    <p class="mt-4 text-xs text-slate-500">
        Gunakan informasi ini sebagai bahan pertimbangan sebelum membeli,
        menjual, atau mempertahankan saham.
    </p>

</div>
  `;
}

function applyCityImpact(company, action) {

    if (!company) return;

    let multiplier = 1;

    if (action === "SELL") multiplier = -0.5;
    if (action === "HOLD") multiplier = 0.3;

    cityState.economy += Math.round((company.profit / 25) * multiplier);

    cityState.jobs += Math.round((company.jobs / 35) * multiplier);

    cityState.happiness += Math.round((company.social / 40) * multiplier);

    cityState.environment += Math.round((company.environment / 30) * multiplier);

    cityState.economy = Math.max(0, Math.min(100, cityState.economy));
    cityState.jobs = Math.max(0, Math.min(100, cityState.jobs));
    cityState.happiness = Math.max(0, Math.min(100, cityState.happiness));
    cityState.environment = Math.max(0, Math.min(100, cityState.environment));

}
