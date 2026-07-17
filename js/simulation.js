function renderJourney() {
  const journeyList = document.getElementById("journeyList");
  if (!journeyList) return;

  // Pengaman 1: Kalau belum ada transaksi (seperti di Tahap 4 ini)
  if (!cityState || !cityState.journey || cityState.journey.length === 0) {
    journeyList.innerHTML = `<p class="text-sm font-semibold text-slate-500">Belum ada keputusan. Konfirmasi portofolio/keputusanmu untuk memulai Investment Journey.</p>`;
    return;
  }

  // Pengaman 2: Kalau sudah ada transaksi, baru di-render
  try {
    const historyHtml = [...cityState.journey].reverse().map(item => `
      <div class="mb-3 border-l-2 border-emerald-500 pl-3">
        <p class="text-[11px] font-black uppercase text-slate-400">Bulan ${item.month}</p>
        <p class="text-sm font-bold text-slate-700">${item.action} <span class="text-emerald-600">${item.company}</span></p>
        <p class="text-xs font-semibold text-slate-500 mt-1">${item.reason}</p>
      </div>
    `).join("");

    journeyList.innerHTML = historyHtml;
  } catch (error) {
    console.error("Gagal merender riwayat:", error);
  }
}

function processDecision(company, action, reason, percent) {

    if (!company) return;

    let investAmount = 0;
    let portfolioItem = null;
    let profit = 0;
    let sellValue = 0;

    // =========================
    // BUY
    // =========================
    if (action === "BUY") {

        if (percent <= 0 || percent > 100) {
            showToast("Masukkan persentase investasi yang valid.");
            return;
        }

        investAmount = cityState.availableFund * (percent / 100);

        if (investAmount > cityState.availableFund) {
            showToast("Dana tidak mencukupi.");
            return;
        }

        cityState.availableFund -= investAmount;
cityState.investedFund += investAmount;

const existing = cityState.portfolio.find(
    item => item.companyId === company.id
);

if (existing) {

    // Tambah investasi ke saham yang sudah dimiliki
    existing.investedAmount += investAmount;
    existing.currentValue += investAmount;

    // Update total persentase kepemilikan
    existing.percentage += percent;

} else {

    // Buat data baru jika belum pernah membeli
    cityState.portfolio.push({

        companyId: company.id,
        companyName: company.name,
        sector: company.sector,

        percentage: percent,

        investedAmount: investAmount,

        currentValue: investAmount,

        profitPercent: 0,

        monthlyReturn: 0,

        monthBought: cityState.month,

        status: "BUY"

    });

}
    }

    // =========================
    // SELL
    // =========================
    if (action === "SELL") {

        portfolioItem = cityState.portfolio.find(
            item => item.companyId === company.id
        );

        if (!portfolioItem) {
            showToast("Perusahaan belum ada di portfolio.");
            return;
        }

        portfolioItem =
    cityState.portfolio.find(
        item => item.companyId === company.id
    );

if (!portfolioItem) {

    showToast("Perusahaan belum ada di portfolio.");

    return;

}

sellValue =
    portfolioItem.currentValue *
    (percent / 100);

const investedPart =
    portfolioItem.investedAmount *
    (percent / 100);

profit =
    sellValue -
    investedPart;

cityState.availableFund += sellValue;

cityState.investedFund -= sellValue;

portfolioItem.investedAmount -= investedPart;

portfolioItem.currentValue -= sellValue;
portfolioItem.percentage -= percent;

if (portfolioItem.percentage < 0) {
    portfolioItem.percentage = 0;
}

if (portfolioItem.investedAmount <= 0) {

    cityState.portfolio =
        cityState.portfolio.filter(
            item => item.companyId !== company.id
        );

}
    }

    // =========================
    // HOLD
    // =========================
    if (action === "HOLD") {
         portfolioItem = cityState.portfolio.find(
        item => item.companyId === company.id);
        showToast("Saham dipertahankan sampai bulan berikutnya.");

    }
    if(action==="HOLD" && !portfolioItem){

    showToast("Perusahaan belum ada di portfolio.");

    return;

}

    // =========================
    // HITUNG TOTAL ASSET
    // =========================
    cityState.totalAsset =
        cityState.availableFund +
        cityState.portfolio.reduce(
            (total, item) => total + item.currentValue,
            0
        );

    // =========================
    // HITUNG EARNING RATE
    // =========================
    cityState.earningRate =
        (
            cityState.totalAsset -
            cityState.initialFund
        ) /
        cityState.initialFund * 100;

    // =========================
    // RANK
    // =========================
    if (cityState.earningRate >= 20) {

        cityState.rank = "Healthy Rank 1";

    } else if (cityState.earningRate >= 10) {

        cityState.rank = "Healthy Rank 2";

    } else {

        cityState.rank = "Healthy Rank 3";

    }

    // =========================
    // JOURNEY
    // =========================
    cityState.journey.push({

    month: cityState.month,

    company: company.name,

    action,

    percentage: percent,

    amount:
        action === "BUY"
            ? investAmount
            : action === "SELL"
            ? sellValue
            : 0,

    profit,

    reason

});
showTransactionResult({

    action,

    company:company.name,

    percent,

    invested:
        action==="BUY"
        ? investAmount
        : portfolioItem
        ? portfolioItem.investedAmount
        :0,

    value:
        portfolioItem
        ? portfolioItem.currentValue
        :investAmount,

    profit

});

    // =========================
    // AI CHAT
    // =========================
    addChat(
        "user",
        `${action} ${company.name}. ${reason}`
    );

    addChat(
        "ai",
        mentorQuestion(action, company)
    );

    addChat(
        "ai",
        mentorFeedback(reason, company, action)
    );

    // =========================
    // UPDATE
    // =========================
    // UPDATE
showCityImpact(company, action);
applyCityImpact(company, action);
updatePortfolioValue();

renderCityStats();
renderPortfolioDashboard();
renderJourney();

saveCityState();
    if (action === "BUY") {

   // showToast(
       // `Berhasil membeli ${percent}% ${company.name}
//(${formatRupiah(investAmount)})`
  //  );

}

else if (action === "SELL") {

    showToast(
        `Berhasil menjual ${percent}% ${company.name}

Profit:
${formatRupiah(profit)}`
    );

}

else {

    showToast(
        `${company.name} dipertahankan bulan ini.`
    );

}

}

function updatePortfolioValue() {

    const event = currentEvent();

    cityState.portfolio.forEach(item => {

        const company =
            companiesData.find(c => c.id === item.companyId);

        // Random dasar
        let change =
            Math.floor(Math.random() * 5) - 2;

        // Bonus profit perusahaan
        change += (company.profit - 70) / 10;

        // Pengaruh risk
        change -= (company.risk - 40) / 20;

        // Dampak event
        change += getEventImpact(company);

        // Supaya tidak terlalu ekstrem
        change = Math.max(-15, Math.min(15, change));

        item.monthlyReturn = Number(change.toFixed(1));

        item.profitPercent += item.monthlyReturn;

        item.currentValue =
            Math.round(
                item.investedAmount *
                (1 + item.profitPercent / 100)
            );

    });

    cityState.totalAsset =
        cityState.availableFund +
        cityState.portfolio.reduce(
            (total, item) => total + item.currentValue,
            0
        );
    renderPortfolioDashboard();

}
function getEventImpact(company) {

    const event = currentEvent();

    if (!event) return 0;

    let impact = 0;

    if (event.impactUp.includes(company.sector))
        impact += 8;

    if (event.impactDown.includes(company.sector))
        impact -= 8;

    return impact;

}
function showTransactionResult(data){

    const panel=document.getElementById("transactionPanel");

    const content=document.getElementById("transactionContent");

    if(!panel || !content) return;

    panel.classList.remove("hidden");

    content.innerHTML=`

<h3 class="text-lg font-black">
${data.action}
${data.company}
</h3>

<div class="mt-4 space-y-2 text-sm">

<p>
Persentase :
<b>${data.percent}%</b>
</p>

<p>
Modal :
<b>${formatRupiah(data.invested)}</b>
</p>

<p>
Nilai sekarang :
<b>${formatRupiah(data.value)}</b>
</p>

<p class="${
data.profit>=0
?"text-emerald-600"
:"text-red-500"
} font-black">

Profit :

${formatRupiah(data.profit)}

</p>

<p>

Saldo tersedia :

<b>

${formatRupiah(cityState.availableFund)}

</b>

</p>

</div>

`;
}
function showCityImpact(company, action) {

    const before = {
        economy: cityState.economy,
        jobs: cityState.jobs,
        happiness: cityState.happiness,
        environment: cityState.environment
    };

    // hitung perubahan
    let multiplier = 1;

    if (action === "SELL") multiplier = -0.5;
    if (action === "HOLD") multiplier = 0.3;

    const eco =
        Math.round((company.profit / 25) * multiplier);

    const jobs =
        Math.round((company.jobs / 35) * multiplier);

    const happy =
        Math.round((company.social / 40) * multiplier);

    const env =
        Math.round((company.environment / 30) * multiplier);

    const after = {
        economy: before.economy + eco,
        jobs: before.jobs + jobs,
        happiness: before.happiness + happy,
        environment: before.environment + env
    };

    addChat(
        "ai",
`🏙️ Dampak terhadap Harapan City

📈 Ekonomi
${before.economy} → ${after.economy}

👷 Lapangan Kerja
${before.jobs} → ${after.jobs}

😊 Kebahagiaan
${before.happiness} → ${after.happiness}

🌱 Lingkungan
${before.environment} → ${after.environment}

Keputusan investasi ini memengaruhi perkembangan kota.`
    );

}
function showEventImpact() {

    const panel = document.getElementById("eventImpactPanel");
    const content = document.getElementById("eventImpactContent");

    if (!panel || !content) return;

    const event = currentEvent();

    if (!event) return;

    panel.classList.remove("hidden");

    let html = `

<h3 class="text-lg font-black mb-3">

${event.name}

</h3>

`;

    if (event.impactUp.length) {

        html += `

<p class="font-bold text-emerald-600">

📈 Sektor Naik

</p>

<ul class="mb-4">`;

        event.impactUp.forEach(sector => {

            html += `<li>+ ${sector}</li>`;

        });

        html += "</ul>";

    }

    if (event.impactDown.length) {

        html += `

<p class="font-bold text-red-500">

📉 Sektor Turun

</p>

<ul>`;

        event.impactDown.forEach(sector => {

            html += `<li>- ${sector}</li>`;

        });

        html += "</ul>";

    }
    content.innerHTML = html;
}
function renderPortfolioDashboard(){

    const target =
        document.getElementById("portfolioDashboard");

    if(!target) return;

    if(cityState.portfolio.length===0){

        target.innerHTML=
        `
        <p class="text-sm text-slate-500">
        Belum ada investasi.
        </p>
        `;

        return;

    }

    target.innerHTML=
        cityState.portfolio.map(item=>{

            const profit=
                item.currentValue-
                item.investedAmount;

            return`

            <div class="rounded-xl border p-4">

                <div class="flex justify-between">

                    <strong>${item.companyName}</strong>

                    <span>${item.percentage}%</span>

                </div>

                <div class="text-sm mt-2">

                    Modal :
                    ${formatRupiah(item.investedAmount)}

                </div>

                <div class="text-sm">

                    Nilai :
                    ${formatRupiah(item.currentValue)}

                </div>

                <div class="font-bold mt-2
                ${profit>=0
                    ?"text-emerald-600"
                    :"text-red-600"}">

                    ${profit>=0?"+":""}
                    ${formatRupiah(profit)}

                    (${item.profitPercent.toFixed(1)}%)

                </div>

            </div>

            `;

        }).join("");

}
