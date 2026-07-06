document.addEventListener("DOMContentLoaded", () => {
  const hasState = loadCityState();

  if (!hasState) {
    document.getElementById("reportEmpty").classList.remove("hidden");
    document.getElementById("reportContent").classList.add("hidden");
    return;
  }

  const baseline = { economy: 30, environment: 42, jobs: 28, happiness: 32, infrastructure: 34 };
  const current = { economy: cityState.economy, environment: cityState.environment, jobs: cityState.jobs, happiness: cityState.happiness, infrastructure: cityState.infrastructure };

  const investmentPerformance = clampScore( 50 + cityState.earningRate * 2 + (cityState.economy - 50) / 2
);
  const socialEnvironmental = clampScore((current.environment + current.happiness + current.jobs) / 3);

  const reasons = cityState.journey.map((item) => item.reason || "");
  const avgLength = reasons.length ? reasons.reduce((sum, text) => sum + text.length, 0) / reasons.length : 0;
  const keywordHits = reasons.filter((text) => /lingkungan|sosial|risiko|masyarakat|kerja|dampak/i.test(text)).length;
  const decisionQuality = clampScore(Math.min(70, avgLength / 1.4) + (reasons.length ? (keywordHits / reasons.length) * 30 : 0));
  const cityDevelopment = clampScore((current.infrastructure + current.economy) / 2);
  const finalScore = Math.round((investmentPerformance + cityDevelopment + socialEnvironmental + decisionQuality) / 4);
  const bestInvestment = cityState.journey
    .filter(item => item.action === "SELL")
    .sort((a, b) => b.profit - a.profit)[0];
  const totalBuy = cityState.journey.filter(
    item => item.action === "BUY"
).length;

const totalSell = cityState.journey.filter(
    item => item.action === "SELL"
).length;

const totalHold = cityState.journey.filter(
    item => item.action === "HOLD"
).length;

const totalCompany = cityState.portfolio.length;

  document.getElementById("beforeStats").textContent = "🏚️ 🌫️ 👷⬇️ 🙁";
  document.getElementById("afterStats").textContent = describeCityEmoji(current);
  document.getElementById("finalScore").textContent = `${finalScore} / 100`;
  document.getElementById("availableFund").textContent =
formatRupiah(cityState.availableFund);

document.getElementById("investedFund").textContent =
formatRupiah(cityState.investedFund);

document.getElementById("totalAsset").textContent =
formatRupiah(cityState.totalAsset);

document.getElementById("earningRate").textContent =
cityState.earningRate.toFixed(2) + "%";

document.getElementById("cityRank").textContent =
cityState.rank;
  document.getElementById("componentScores").innerHTML = [
    ["Investment Performance", investmentPerformance],
    ["City Development", cityDevelopment],
    ["Social & Environmental Impact", socialEnvironmental],
    ["Decision Quality", decisionQuality]
  ].map(([label, value]) => `
    <div>
      <div class="mb-2 flex justify-between text-sm font-black"><span>${label}</span><span>${value}/100</span></div>
      <div class="progress"><span style="width: ${value}%"></span></div>
    </div>
  `).join("");

  document.getElementById("aiSummary").textContent = buildAiSummary(finalScore, current, cityState.journey.length);

  const journeyList = document.getElementById("finalJourney");
  journeyList.innerHTML = cityState.journey.length
    ? cityState.journey.map((item) => `
        <div class="mb-3 rounded-[10px] bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <strong>
${item.action}
${item.company}
${item.percentage ? "(" + item.percentage + "%)" : ""}
</strong>

<p>
Investasi :
${formatRupiah(item.amount)}
</p>

${
item.action==="SELL"
?
`<p>
Profit :
${formatRupiah(item.profit)}
</p>`
:
""
}
            <span class="text-xs font-black text-emerald-600">Bulan ${item.month}</span>
          </div>
          <p class="mt-2 text-sm font-semibold leading-6 text-slate-500">${item.reason}</p>
          ${item.note ? `<p class="mt-2 text-xs font-bold text-emerald-700">Catatan AI: ${item.note}</p>` : ""}
        </div>
      `).join("")
    : `<p class="text-sm font-semibold text-slate-500">Belum ada riwayat keputusan.</p>`;
});

function describeCityEmoji(stats) {
  const buildings = stats.infrastructure >= 70 ? "🏙️🏙️" : stats.infrastructure >= 45 ? "🏢🏢" : "🏚️";
  const green = stats.environment >= 70 ? "🌳🌳🌳" : stats.environment >= 45 ? "🌳🌳" : "🌫️";
  const mood = stats.happiness >= 70 ? "😊😊😊" : stats.happiness >= 45 ? "😊" : "🙁";
  return `${buildings} ${green} ${mood}`;
}

function buildAiSummary(score, stats, decisionCount) {

    const roi = cityState.earningRate.toFixed(2);

    if (cityState.earningRate >= 20) {

        return `
Selama simulasi, kelompokmu berhasil memperoleh ROI sebesar ${roi}% dengan predikat ${cityState.rank}.
Strategi investasi yang diterapkan mampu meningkatkan nilai aset kota sekaligus menjaga pembangunan kota tetap stabil.
Jumlah keputusan investasi yang diambil sebanyak ${decisionCount} keputusan.
`;

    }

    if (cityState.earningRate >= 10) {

        return `
Kelompokmu memperoleh ROI sebesar ${roi}% dengan predikat ${cityState.rank}.
Strategi investasi sudah cukup baik, namun masih terdapat peluang untuk meningkatkan keuntungan melalui pemilihan sektor yang lebih tepat pada setiap event ekonomi.
`;

    }

    return `
ROI investasi kelompok masih sebesar ${roi}% dengan predikat ${cityState.rank}.
Cobalah mengevaluasi kembali keputusan BUY, SELL, dan HOLD agar investasi dapat memberikan keuntungan yang lebih optimal pada simulasi berikutnya.
`;

}
