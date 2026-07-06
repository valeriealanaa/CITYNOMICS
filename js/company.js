let companiesData = [];
let selectedAction = "BUY";
let selectedCompany = null;

async function loadCompanies() {
  if (companiesData.length) {
    return companiesData;
  }

  const response = await fetch("../data/companies.json");
  companiesData = await response.json();
  return companiesData;
}

function renderCompanies() {
  const list = document.getElementById("companyList");

  if (!list) {
    return;
  }

  list.innerHTML = companiesData.map(createCompanyCard).join("");

  list.querySelectorAll("[data-company-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const company = companiesData.find((item) => item.id === button.dataset.companyId);
      showCompanyModal(company);
    });
  });
}

function metricRow(label, value) {
  return `
    <div>
      <div class="mb-2 flex justify-between text-sm font-black">
        <span>${label}</span>
        <span>${value}/100</span>
      </div>
      <div class="progress"><span style="width: ${value}%"></span></div>
    </div>
  `;
}

function showCompanyModal(company, options = {}) {
  selectedCompany = company;
  selectedAction = "BUY";
  const readOnly = Boolean(options.readOnly);

  openModal(`
    <div class="p-5 md:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="tag">${company.sector}</span>
          <h2 class="mt-4 text-3xl font-black tracking-[-0.04em]">${company.name}</h2>
          <p class="mt-2 text-sm font-semibold leading-6 text-slate-500">${company.description}</p>
        </div>
        <button class="btn-secondary" data-close="modal">Tutup</button>
      </div>
 
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        ${metricRow("Pertumbuhan Laba", company.profit)}
        ${metricRow("Risiko", company.risk)}
        ${metricRow("Lapangan Kerja", company.jobs)}
        ${metricRow("Kontribusi Sosial", company.social)}
        ${metricRow("Dampak Lingkungan", company.environment)}
        <div class="rounded-[10px] bg-slate-50 p-4">
          <p class="text-xs font-black uppercase text-slate-400">Prospek</p>
          <p class="mt-2 font-black">${company.prospect}</p>
        </div>
      </div>

      ${readOnly ? "" : `
      <div class="mt-6">
        <p class="mb-3 text-sm font-black">Keputusan Kelompok</p>
        <div class="action-tabs" id="actionTabs">
          <button class="action-tab active" data-action="BUY">BUY</button>
          <button class="action-tab" data-action="SELL">SELL</button>
          <button class="action-tab" data-action="HOLD">HOLD</button>
        </div>
      </div>
             <div id="investmentSection" class="mt-6">

  <p class="text-sm font-black">
    Dana Tersedia
  </p>

  <p class="mt-1 text-xl font-black text-emerald-600">
    ${formatRupiah(cityState.availableFund)}
  </p>

  <label class="mt-5 block">
    <span class="text-sm font-black">
      Persentase Investasi
    </span>

    <input
      type="range"
      id="investmentPercent"
      min="5"
      max="100"
      step="5"
      value="10"
      class="mt-3 w-full">

  </label>

  <div class="mt-3 flex items-center justify-between">

    <span
        id="investmentPercentText"
        class="font-bold text-slate-700">
        10%
    </span>

    <span
        id="investmentAmount"
        class="font-black text-emerald-600">
    </span>

</div>

<p
    id="remainingFund"
    class="mt-2 text-xs text-slate-500">
</p>
</div>
      <label class="mt-5 block">
        <span class="text-sm font-black">Alasan keputusan</span>
        <textarea class="mt-2 min-h-[110px] w-full rounded-[10px] border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-emerald-500" id="decisionReason" placeholder="Contoh: perusahaan ini membuka lapangan kerja dan mendukung energi bersih."></textarea>
      </label>

      <button class="btn-primary mt-5 w-full" id="confirmDecision">Konfirmasi Keputusan</button>
      `}
    </div>
  `);

  if (readOnly) {
    return;
  }
  document.getElementById(
"investmentSection"
).style.display = "block";

  document.querySelectorAll("[data-action]").forEach((button) => {

  button.addEventListener("click", () => {

    selectedAction = button.dataset.action;

    document.querySelectorAll("[data-action]").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const investmentSection =
      document.getElementById("investmentSection");

    investmentSection.style.display =
      selectedAction === "BUY"
        ? "block"
        : "none";
    

  });

});

  document.getElementById("confirmDecision").addEventListener("click", submitDecision);
  const slider =
document.getElementById("investmentPercent");
slider.value = 10;
const investmentAmount =
document.getElementById("investmentAmount");
const investmentPercentText =
document.getElementById("investmentPercentText");
function updateInvestment(){

    const percent =
        Number(slider.value);
    investmentPercentText.textContent =
    percent + "%";

    const amount =

        cityState.availableFund *

        percent /

        100;

    investmentAmount.textContent =
        formatRupiah(amount);
    const remaining =
cityState.availableFund - amount;

document.getElementById(
"remainingFund"
).textContent =

"Sisa dana : " +

formatRupiah(remaining);

}

slider.addEventListener(

    "input",

    updateInvestment

);

updateInvestment();
}

function submitDecision() {

    const reason =
        document
        .getElementById("decisionReason")
        .value
        .trim();

    if (!reason) {

        showToast(
            "Tulis alasan dulu sebelum konfirmasi."
        );

        return;

    }

    const percent =

        selectedAction === "BUY"

        ?

        Number(

            document.getElementById(

                "investmentPercent"

            ).value

        )

        :

        0;

    processDecision(

        selectedCompany,

        selectedAction,

        reason,

        percent

    );

    closeModal();

}
