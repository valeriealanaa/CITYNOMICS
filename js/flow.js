const FLOW_STORAGE_KEY = "citynomicsFlowState";
const FLOW_STATE_VERSION = 2;

const STAGE_ORDER = ["orientation", "team", "exploration", "portfolio", "event", "decision", "reflection", "cityupdate", "monthly"];
const STAGE_LABELS = {
  orientation: "City Orientation",
  team: "Investment Team",
  exploration: "Company Exploration",
  portfolio: "Build Portfolio",
  event: "Economic Event",
  decision: "Decision Making",
  reflection: "AI Reflection",
  cityupdate: "Smart City Update",
  monthly: "Monthly Reflection"
};

const flowState = {
  stage: "orientation",
  history: [],
  portfolioDraft: {},
  activeDecisionId: null,
  decision: null,
  decisionApplied: false
};

function saveFlowState() {
  localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify({
    version: FLOW_STATE_VERSION,
    stage: flowState.stage,
    history: flowState.history,
    portfolioDraft: flowState.portfolioDraft,
    activeDecisionId: flowState.activeDecisionId,
    decision: flowState.decision,
    decisionApplied: flowState.decisionApplied,
    pendingAction: flowState.pendingAction
  }));
}

function loadFlowState() {
  const raw = localStorage.getItem(FLOW_STORAGE_KEY);

  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.version !== FLOW_STATE_VERSION) {
      localStorage.removeItem(FLOW_STORAGE_KEY);
      return false;
    }

    flowState.stage = parsed.stage || "orientation";
    flowState.history = parsed.history || [];
    flowState.portfolioDraft = parsed.portfolioDraft || {};
    flowState.activeDecisionId = parsed.activeDecisionId || null;
    flowState.decision = parsed.decision || null;
    flowState.decisionApplied = Boolean(parsed.decisionApplied);
    flowState.pendingAction = parsed.pendingAction || null;

    const needsDecision = ["reflection", "cityupdate", "monthly"].includes(flowState.stage);
    const needsSnapshot = ["cityupdate", "monthly"].includes(flowState.stage);

    if (needsDecision && !flowState.decision) {
      flowState.stage = "decision";
      flowState.history = [];
    }

    if (needsSnapshot && !cityState.monthSnapshot) {
      flowState.stage = "event";
      flowState.history = [];
    }

    return true;
  } catch (error) {
    return false;
  }
}

function goToStage(stage) {
  flowState.history.push(flowState.stage);
  flowState.stage = stage;
  saveFlowState();
  renderStage();
}

function goBack() {
  if (!flowState.history.length) {
    return;
  }

  flowState.stage = flowState.history.pop();
  saveFlowState();
  renderStage();
}

function renderStepper() {
  const target = document.getElementById("stageStepper");

  if (!target) {
    return;
  }

  const currentIndex = STAGE_ORDER.indexOf(flowState.stage);

  target.innerHTML = STAGE_ORDER.map((stage, index) => {
    const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "";
    return `
      <div class="step ${state}">
        <span class="step-dot">${index < currentIndex ? "✓" : index + 1}</span>
        <span class="step-label">${STAGE_LABELS[stage]}</span>
      </div>
    `;
  }).join("");
}

function backButtonHtml() {
  return flowState.history.length ? `<button class="btn-secondary" id="stageBackBtn">← Kembali</button>` : `<span></span>`;
}

function bindBackButton() {
  const backBtn = document.getElementById("stageBackBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }
}

function stageHeader(step, title, subtitle) {
  return `
    <div class="stage-card mb-5">
      <span class="stage-index">${step}</span>
      <h2 class="mt-3 text-2xl font-black tracking-[-0.04em] md:text-3xl">${title}</h2>
      <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">${subtitle}</p>
    </div>
  `;
}

async function renderStage() {
  const container = document.getElementById("stageContainer");
  if (!container) return;

  // KUNCI UTAMA: Tahan sistem, jangan render apapun kalau data perusahaan belum siap!
  if (typeof companiesData === 'undefined' || companiesData.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-emerald-600 font-bold">Mempersiapkan data simulasi...</div>`;
    setTimeout(renderStage, 200); // Cek otomatis setiap 0.2 detik
    return;
  }

  renderStepper();
  renderCityStats();
  if (typeof renderJourney === 'function') renderJourney();

  const renderers = {
    orientation: renderOrientationStage,
    team: renderTeamStage,
    exploration: renderExplorationStage,
    portfolio: renderPortfolioStage,
    event: renderEventStage,
    decision: renderDecisionStage,
    reflection: renderReflectionStage,
    cityupdate: renderCityUpdateStage,
    monthly: renderMonthlyStage
  };

  const renderer = renderers[flowState.stage] || renderOrientationStage;

  try {
    container.innerHTML = renderer();
    setTimeout(() => { bindStageEvents(); }, 0);
  } catch (error) {
    console.error("Crash dicegah:", error);
    // Kalau masih nge-bug, reset paksa ke tahap 1 biar gak nyangkut di tengah jalan
    flowState.stage = "orientation";
    flowState.history = [];
    saveFlowState();
    container.innerHTML = renderOrientationStage();
    setTimeout(() => { bindStageEvents(); }, 0);
  }
}

function renderOrientationStage() {
  return `
    ${stageHeader(1, "City Orientation", "Sebelum simulasi dimulai, kenali kondisi awal Harapan City yang akan kalian kembangkan selama 12 bulan virtual.")}
    <div class="grid gap-4 md:grid-cols-2">
      <div class="panel-soft p-5">
        <p class="text-xs font-black uppercase text-slate-400">Kondisi Awal Harapan City</p>
        <div class="mt-4 grid gap-2 text-sm font-bold text-slate-600">
          <span>🏘️ Penduduk: 250.000 jiwa</span>
          <span>📈 Pertumbuhan ekonomi: Rendah</span>
          <span>👷 Pengangguran: Tinggi</span>
          <span>🌳 Lingkungan: Sedang</span>
          <span>😊 Kebahagiaan warga: Rendah</span>
          <span>🏭 Industri: Belum berkembang</span>
        </div>
      </div>
      <div class="panel-soft p-5">
        <p class="text-xs font-black uppercase text-slate-400">Pertanyaan Pemantik Guru</p>
        <p class="mt-3 font-black text-slate-700">"Jika kalian menjadi investor kota ini, apa yang akan kalian lakukan agar kota berkembang?"</p>
        <textarea class="mt-4 w-full rounded-[10px] border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-emerald-500" id="orientationInput" rows="4" placeholder="Tulis jawaban awal kelompokmu...">${cityState.orientationAnswer}</textarea>
      </div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="orientationNextBtn">Lanjut ke Tahap 2</button>
    </div>
  `;
}

function renderTeamStage() {
  const session = JSON.parse(localStorage.getItem("citynomicsSession") || "null");
  const teamName = session && session.team ? session.team : "Tim Investor";

  return `
    ${stageHeader(2, "Build Your Investment Team", "Kelas dibagi menjadi beberapa kelompok. Setiap kelompok berperan sebagai City Investment Council dengan modal virtual yang sama.")}
    <div class="grid gap-4 md:grid-cols-2">
      <div class="panel-soft p-5">
        <p class="text-xs font-black uppercase text-slate-400">Nama Kelompok</p>
        <h3 class="mt-2 text-2xl font-black">${teamName}</h3>
        <p class="mt-3 text-sm font-semibold leading-6 text-slate-500">Peran: City Investment Council</p>
      </div>
      <div class="panel-soft p-5">
        <p class="text-xs font-black uppercase text-slate-400">Modal Virtual Awal</p>
        <h3 class="mt-2 text-2xl font-black text-emerald-600">${formatRupiah(cityState.availableFund)}</h3>
        <p class="mt-3 text-sm font-semibold leading-6 text-slate-500">Seluruh kelompok memperoleh modal yang sama agar permainan tetap adil.</p>
      </div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="teamNextBtn">Bentuk Tim & Lanjut</button>
    </div>
  `;
}

function renderExplorationStage() {
  const cards = companiesData.map(createCompanyCard).join("");

  return `
    ${stageHeader(3, "Company Exploration", "Kenali profil setiap perusahaan sebelum menentukan strategi portofolio. Klik kartu untuk melihat detail lengkap.")}
    <div class="company-row">${cards}</div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="explorationNextBtn">Lanjut ke Build Your Portfolio</button>
    </div>
  `;
}

function buildJourneySummary(limit = 4) {
  const history = [...(cityState.journey || [])].reverse().slice(0, limit);

  if (!history.length) {
    return `<p class="text-sm font-semibold text-slate-500">Belum ada keputusan. Keputusanmu akan muncul di sini setelah ada aksi BUY, SELL, atau HOLD.</p>`;
  }

  return history.map((item) => `
    <div class="rounded-[10px] border border-slate-200 bg-white p-3">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-black text-slate-800">${item.action} ${item.company}${item.percentage ? ` (${item.percentage}%)` : ""}</p>
        <span class="text-[11px] font-black uppercase text-emerald-600">Bulan ${item.month}</span>
      </div>
      <p class="mt-1 text-xs font-semibold leading-5 text-slate-500">${item.reason || "Tidak ada alasan tercatat."}</p>
    </div>
  `).join("");
}

function renderPortfolioStage() {
  const rows = companiesData.map((company) => createPortfolioRow(company, flowState.portfolioDraft[company.id])).join("");

  return `
    ${stageHeader(4, "Build Your Portfolio", "Alokasikan modal ke beberapa perusahaan pilihan kelompokmu. Total alokasi maksimal 100% dan setiap perusahaan wajib disertai alasan.")}
    <div class="grid gap-4">${rows}</div>
    <div class="mt-5 panel-soft p-4 flex items-center justify-between">
      <span class="text-sm font-black">Total Alokasi</span>
      <span class="text-xl font-black" id="portfolioTotal">0%</span>
    </div>
    <div class="mt-5 panel-soft p-4">
      <p class="text-xs font-black uppercase text-emerald-600">Riwayat Keputusan</p>
      <div class="mt-3 grid gap-2">${buildJourneySummary(3)}</div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="portfolioConfirmBtn">Konfirmasi Portofolio</button>
    </div>
  `;
}

function renderEventStage() {
  if (!cityState.monthSnapshot || cityState.monthSnapshot.month !== cityState.month) {
    cityState.monthSnapshot = Object.assign({ month: cityState.month }, snapshotCity());
  }

  const event = currentEvent();

  return `
    ${stageHeader(5, `Economic Event — Bulan ${cityState.month}`, "Setiap bulan, kota menghadapi peristiwa ekonomi nyata yang memengaruhi berbagai sektor perusahaan.")}
    <div class="panel-soft p-5" id="eventCardTarget"></div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="eventNextBtn">Lanjut ke Decision Making</button>
    </div>
  `;
}

function renderDecisionStage() {
  const activeCompany = companiesData.find((item) => item.id === flowState.activeDecisionId);
  const cards = companiesData.map((company) => createDecisionCard(company, company.id === flowState.activeDecisionId)).join("");
  const priorDecision = flowState.decision && flowState.decision.companyId === flowState.activeDecisionId ? flowState.decision : null;
  const currentAction = priorDecision ? priorDecision.action : "BUY";
  const currentReason = priorDecision ? priorDecision.reason : "";

  return `
    ${stageHeader(6, "Decision Making", "Pilih satu perusahaan untuk diputuskan bulan ini: BUY, SELL, atau HOLD. Setiap keputusan wajib disertai alasan.")}
    <div class="company-row">${cards}</div>
    ${activeCompany ? `
      <div class="panel-soft mt-5 p-5">
    <p class="text-sm font-black">
        Keputusan untuk ${activeCompany.name}
    </p>

    <div class="action-tabs mt-3" id="decisionActionTabs">
        <button class="action-tab ${currentAction === "BUY" ? "active" : ""}" data-decision-action="BUY">
            BUY
        </button>

        <button class="action-tab ${currentAction === "SELL" ? "active" : ""}" data-decision-action="SELL">
            SELL
        </button>

        <button class="action-tab ${currentAction === "HOLD" ? "active" : ""}" data-decision-action="HOLD">
            HOLD
        </button>
    </div>

    <!-- Persentase -->
    <div
        id="decisionPercentBox"
        class="mt-5 ${currentAction === "HOLD" ? "hidden" : ""}"
    >

        <div class="flex justify-between text-sm font-bold">
            <span>Persentase</span>
            <span id="decisionPercentLabel">
                ${priorDecision?.percent || 10}%
            </span>
        </div>

        <input
            id="decisionPercentInput"
            type="range"
            min="1"
            max="100"
            value="${priorDecision?.percent || 10}"
            class="mt-2 w-full"
        >

        <p class="mt-2 text-xs text-slate-500">
            Tentukan persentase saham yang ingin
            dibeli atau dijual.
        </p>

    </div>
        <textarea
        class="mt-4 w-full rounded-[10px] border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-emerald-500"
        id="decisionReasonInput"
        rows="3"
        placeholder="Alasan keputusan kelompokmu..."
    >${currentReason}</textarea>
</div>
    ` : `<p class="mt-5 text-sm font-bold text-slate-400">Pilih salah satu perusahaan di atas untuk mulai menentukan keputusan.</p>`}
    <div class="mt-5 panel-soft p-4">
      <p class="text-xs font-black uppercase text-emerald-600">Riwayat Keputusan</p>
      <div class="mt-3 grid gap-2">${buildJourneySummary(4)}</div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="decisionConfirmBtn" ${activeCompany ? "" : "disabled"}>Konfirmasi Keputusan</button>
    </div>
  `;
}

function renderReflectionStage() {
  const company = companiesData.find((item) => item.id === flowState.decision.companyId);

  return `
    ${stageHeader(7, "AI Reflection", "AI Mentor tidak memberi jawaban benar atau salah. AI mengajak kelompokmu berpikir ulang sebelum keputusan dikunci.")}
    <div class="panel-soft p-5">
      <p class="text-xs font-black uppercase text-emerald-600">CityMentor bertanya</p>
      <p class="mt-3 font-bold text-slate-700">${mentorQuestion(flowState.decision.action, company)}</p>
      <div class="mt-4 rounded-[10px] bg-slate-50 p-4">
        <p class="text-xs font-black uppercase text-slate-400">Jawaban Kelompokmu</p>
        <p class="mt-2 text-sm font-semibold text-slate-600">${flowState.decision.reason}</p>
      </div>
      <div class="mt-4 rounded-[10px] bg-emerald-50 p-4">
        <p class="text-xs font-black uppercase text-emerald-700">Tanggapan AI</p>
        <p class="mt-2 text-sm font-semibold text-slate-700">${mentorFeedback(flowState.decision.reason, company, flowState.decision.action)}</p>
      </div>
      <p class="mt-4 font-black text-slate-700">${socraticFollowUp()}</p>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <div class="flex gap-3">
        <button class="btn-secondary" id="reflectionChangeBtn">Ubah Keputusan</button>
        <button class="btn-primary" id="reflectionKeepBtn">Tetap dengan Keputusan Ini</button>
      </div>
    </div>
  `;
}

function renderCityUpdateStage() {
  const before = cityState.monthSnapshot;
  const after = snapshotCity();

  const rows = [
    ["Ekonomi", before.economy, after.economy],
    ["Lingkungan", before.environment, after.environment],
    ["Lapangan Kerja", before.jobs, after.jobs],
    ["Kebahagiaan", before.happiness, after.happiness],
    ["Infrastruktur", before.infrastructure, after.infrastructure]
  ];

  const rowsHtml = rows.map(([label, from, to]) => {
    const delta = to - from;
    const stateClass = delta > 0 ? "is-positive" : delta < 0 ? "is-negative" : "is-neutral";
    const symbol = delta > 0 ? "↗" : delta < 0 ? "↘" : "—";

    return `
      <div class="smart-city-stat-row ${stateClass}">
        <div class="smart-city-stat-label">${label}</div>
        <div class="smart-city-stat-track">
          <span style="width: ${Math.max(0, Math.min(100, to))}%"></span>
        </div>
        <div class="smart-city-stat-delta">
          <span>${symbol}</span>
          <strong>${delta > 0 ? "+" : ""}${delta}</strong>
        </div>
      </div>
    `;
  }).join("");

  return `
    ${stageHeader(8, "Smart City Update", "Bukan angka semata. Inilah cara kota kalian benar-benar berubah setelah keputusan diambil.")}
    <div class="smart-city-output" id="cityUpdateIllustration">
      <div class="smart-city-output-head">
        <div>
          <p class="smart-city-eyebrow">Live City Visualization</p>
          <h3>${cityState.name}</h3>
        </div>
        <div class="smart-city-score-pill">
          <span>Skor Kota</span>
          <strong>${cityScore()}/100</strong>
        </div>
      </div>

      <div class="smart-city-visual-shell">
        <iframe
          id="smartCityVisualFrame"
          class="smart-city-visual-frame"
          src="smart-city-visual.html"
          title="Visualisasi perubahan Harapan City"
          loading="eager"
        ></iframe>

        <div class="smart-city-change-card">
          <p class="smart-city-change-title">Perubahan Bulan ${cityState.month}</p>
          <div class="smart-city-stat-list">${rowsHtml}</div>
        </div>
      </div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="cityUpdateNextBtn">Lanjut ke Refleksi Bulanan</button>
    </div>
  `;
}

function renderMonthlyStage() {
  const company = companiesData.find((item) => item.id === flowState.decision.companyId);
  const before = cityState.monthSnapshot;
  const after = snapshotCity();
  const delta = {
    economy: after.economy - before.economy,
    environment: after.environment - before.environment,
    jobs: after.jobs - before.jobs,
    happiness: after.happiness - before.happiness
  };
  const note = monthlyAiNote(company, flowState.decision.action, delta);
  const isFinalMonth = cityState.month >= 12;

  return `
    ${stageHeader(9, `Monthly Reflection — Bulan ${cityState.month}`, "AI menyusun ringkasan perjalanan investasi bulan ini sebagai bagian dari Investment Journey.")}
    <div class="panel-soft p-5">
      <p class="text-xs font-black uppercase text-slate-400">Keputusan</p>
      <p class="mt-1 font-black">${flowState.decision.action} ${company.name}</p>
      <p class="mt-4 text-xs font-black uppercase text-slate-400">Dampak</p>
      <p class="mt-1 text-sm font-semibold text-slate-600">Ekonomi ${delta.economy >= 0 ? "+" : ""}${delta.economy}, Lingkungan ${delta.environment >= 0 ? "+" : ""}${delta.environment}, Lapangan Kerja ${delta.jobs >= 0 ? "+" : ""}${delta.jobs}, Kebahagiaan ${delta.happiness >= 0 ? "+" : ""}${delta.happiness}</p>
      <p class="mt-4 text-xs font-black uppercase text-slate-400">Skor Kota Saat Ini</p>
      <p class="mt-1 text-2xl font-black text-emerald-600">${cityScore()} / 100</p>
      <div class="mt-4 rounded-[10px] bg-emerald-50 p-4">
        <p class="text-xs font-black uppercase text-emerald-700">Catatan AI</p>
        <p class="mt-2 text-sm font-semibold text-slate-700">${note}</p>
      </div>
    </div>
    <div class="mt-6 flex items-center justify-between">
      ${backButtonHtml()}
      <button class="btn-primary" id="monthlyNextBtn">${isFinalMonth ? "Lihat Laporan Akhir Tahun" : "Lanjut ke Bulan Berikutnya"}</button>
    </div>
  `;
}

function bindStageEvents() {
  bindBackButton();

  if (flowState.stage === "orientation") {
    document.getElementById("orientationInput").addEventListener("input", (event) => {
      cityState.orientationAnswer = event.target.value;
    });

    document.getElementById("orientationNextBtn").addEventListener("click", () => {
      const value = document.getElementById("orientationInput").value.trim();

      if (!value) {
        showToast("Tulis dulu jawaban kelompokmu sebelum lanjut.");
        return;
      }

      cityState.orientationAnswer = value;
      saveCityState();
      goToStage("team");
    });
  }

  if (flowState.stage === "team") {
    document.getElementById("teamNextBtn").addEventListener("click", () => {
      goToStage("exploration");
    });
  }

  if (flowState.stage === "exploration") {
    document.querySelectorAll("[data-company-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const company = companiesData.find((item) => item.id === button.dataset.companyId);
        showCompanyModal(company, { readOnly: true });
      });
    });

    document.getElementById("explorationNextBtn").addEventListener("click", () => {
      goToStage("portfolio");
    });
  }

  if (flowState.stage === "portfolio") {
    bindPortfolioEvents();

    document.getElementById("portfolioConfirmBtn").addEventListener("click", confirmPortfolio);
  }

  if (flowState.stage === "event") {
    renderEventCard(document.getElementById("eventCardTarget"));

    document.getElementById("eventNextBtn").addEventListener("click", () => {
      const event = currentEvent();

addChat(
    "ai",
`📢 Analisis Event

${event.name}

Sektor yang diprediksi naik:
${event.impactUp.join(", ") || "-"}

Sektor yang diprediksi turun:
${event.impactDown.join(", ") || "-"}

Silakan sesuaikan strategi investasimu.`
);
      applyEventCityEffect(currentEvent());
      renderCityStats();
      saveCityState();
      goToStage("decision");
    });
  }

 if (flowState.stage === "decision") {

  // ===========================
  // PILIH PERUSAHAAN
  // ===========================
  document.querySelectorAll("[data-decision-id]").forEach((element) => {

    element.addEventListener("click", () => {

      flowState.activeDecisionId = element.dataset.decisionId;

      saveFlowState();

      renderStage();

    });

  });


  // Kalau belum memilih perusahaan, berhenti di sini
  if (!flowState.activeDecisionId) {
    return;
  }


  // ===========================
  // BUY / SELL / HOLD
  // ===========================
  document.querySelectorAll("[data-decision-action]").forEach((button) => {

    button.addEventListener("click", () => {

      document.querySelectorAll("[data-decision-action]")
        .forEach(item => item.classList.remove("active"));

      button.classList.add("active");

      flowState.pendingAction = button.dataset.decisionAction;

      const percentBox = document.getElementById("decisionPercentBox");

      if (percentBox) {

        if (flowState.pendingAction === "HOLD") {
          percentBox.classList.add("hidden");
        } else {
          percentBox.classList.remove("hidden");
        }

      }

      saveFlowState();

    });

  });


  // ===========================
  // SLIDER %
  // ===========================
  const percentInput = document.getElementById("decisionPercentInput");

  if (percentInput) {

    percentInput.addEventListener("input", () => {

      document.getElementById("decisionPercentLabel").textContent =
        percentInput.value + "%";

    });

  }


  // ===========================
  // KONFIRMASI
  // ===========================
  document.getElementById("decisionConfirmBtn").addEventListener("click", () => {

    const reason =
      document.getElementById("decisionReasonInput").value.trim();

    if (!reason) {

      showToast("Tulis alasan keputusan dulu sebelum konfirmasi.");

      return;

    }

    const activeTab =
      document.querySelector("[data-decision-action].active");

    const action =
      activeTab ? activeTab.dataset.decisionAction : "BUY";

    flowState.decision = {

      companyId: flowState.activeDecisionId,

      action,

      percent:
        action === "HOLD"
          ? 0
          : Number(document.getElementById("decisionPercentInput").value),

      reason

    };

    flowState.decisionApplied = false;

    goToStage("reflection");

  });

}

  if (flowState.stage === "reflection") {
    document.getElementById("reflectionChangeBtn").addEventListener("click", () => {
      goBack();
    });

    document.getElementById("reflectionKeepBtn").addEventListener("click", () => {
      applyConfirmedDecision();
      goToStage("cityupdate");
    });
  }

  if (flowState.stage === "cityupdate") {
    const illustration = document.getElementById("cityUpdateIllustration");
    const frame = document.getElementById("smartCityVisualFrame");

    if (illustration) {
      pulseElement(illustration);
    }

    const sendSmartCityState = () => {
      if (!frame || !frame.contentWindow) {
        return;
      }

      frame.contentWindow.postMessage({
        type: "CITYNOMICS_SMART_CITY_UPDATE",
        stats: {
          economy: cityState.economy,
          environment: cityState.environment,
          jobs: cityState.jobs,
          happiness: cityState.happiness,
          infrastructure: cityState.infrastructure
        },
        portfolio: cityState.portfolio.map((item) => item.companyId)
      }, window.location.origin);
    };

    if (frame) {
      frame.addEventListener("load", sendSmartCityState);
      window.setTimeout(sendSmartCityState, 250);
    }

    document.getElementById("cityUpdateNextBtn").addEventListener("click", () => {
      goToStage("monthly");
    });
  }

  if (flowState.stage === "monthly") {
    document.getElementById("monthlyNextBtn").addEventListener("click", () => {
      finalizeMonthlyNote();

      if (cityState.month >= 12) {
        saveCityState();
        window.location.href = "report.html";
        return;
      }

      cityState.month += 1;
      cityState.monthSnapshot = null;
      flowState.decision = null;
      flowState.activeDecisionId = null;
      flowState.decisionApplied = false;
      saveCityState();
      goToStage("event");
    });
  }
}

function bindPortfolioEvents() {
  const updateTotal = () => {
    const total = Object.values(flowState.portfolioDraft).reduce((sum, item) => sum + item.percent, 0);
    const totalLabel = document.getElementById("portfolioTotal");
    if (totalLabel) {
      totalLabel.textContent = `${total}%`;
      totalLabel.style.color = total <= 100 ? "#087348" : "#b91c1c";
    }
  };

  document.querySelectorAll("[data-portfolio-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const id = event.target.dataset.portfolioToggle;
      const row = document.querySelector(`[data-portfolio-id="${id}"]`);
      const range = row.querySelector("[data-portfolio-range]");
      const reasonBox = row.querySelector("[data-portfolio-reason]");

      if (event.target.checked) {
        flowState.portfolioDraft[id] = { percent: 20, reason: "" };
        range.disabled = false;
        reasonBox.disabled = false;
        range.value = 20;
      } else {
        delete flowState.portfolioDraft[id];
        range.disabled = true;
        reasonBox.disabled = true;
        range.value = 0;
      }

      row.querySelector("[data-portfolio-percent-label]").textContent = `${range.value}%`;
      saveFlowState();
      updateTotal();
    });
  });

  document.querySelectorAll("[data-portfolio-range]").forEach((range) => {
    range.addEventListener("input", (event) => {
      const id = event.target.dataset.portfolioRange;
      const label = document.querySelector(`[data-portfolio-percent-label="${id}"]`);
      label.textContent = `${event.target.value}%`;

      if (flowState.portfolioDraft[id]) {
        flowState.portfolioDraft[id].percent = Number(event.target.value);
      }

      saveFlowState();
      updateTotal();
    });
  });

  document.querySelectorAll("[data-portfolio-reason]").forEach((box) => {
    box.addEventListener("input", (event) => {
      const id = event.target.dataset.portfolioReason;
      if (flowState.portfolioDraft[id]) {
        flowState.portfolioDraft[id].reason = event.target.value;
      }
      saveFlowState();
    });
  });

  updateTotal();
}

function confirmPortfolio() {

    const entries = Object.entries(flowState.portfolioDraft);

    const total = entries.reduce(
        (sum,[,item]) => sum + item.percent,
        0
    );

    if (!entries.length || total > 100) {
        showToast("Total alokasi portofolio tidak boleh lebih dari 100%.");
        return;
    }

    const missingReason = entries.find(
        ([,item]) => !item.reason.trim()
    );

    if (missingReason) {
        showToast("Lengkapi alasan untuk setiap perusahaan.");
        return;
    }

    entries.forEach(([id,item]) => {

        const company =
            companiesData.find(c => c.id === id);

        processDecision(
            company,
            "BUY",
            item.reason,
            item.percent
        );

    });

    addChat(
        "ai",
        portfolioAiNote(
            entries.map(([id,item])=>({
                company: companiesData.find(c=>c.id===id),
                percent:item.percent,
                reason:item.reason
            }))
        )
    );

    saveCityState();
    renderPortfolioDashboard();

    showToast("Portofolio awal berhasil dibuat.");

    goToStage("event");

}
function applyConfirmedDecision() {

    if (flowState.decisionApplied) return;

    const company = companiesData.find(
        item => item.id === flowState.decision.companyId
    );

    processDecision(

        company,

        flowState.decision.action,

        flowState.decision.reason,

        flowState.decision.percent

    );
    // ===== UPDATE NILAI SAHAM SETELAH KEPUTUSAN =====
    updatePortfolioValue();
    showEventImpact();
    renderCityStats();

    renderJourney();

    saveCityState();

    flowState.decisionApplied = true;

    saveFlowState();

}

function finalizeMonthlyNote() {
  const company = companiesData.find((item) => item.id === flowState.decision.companyId);
  const before = cityState.monthSnapshot;
  const after = snapshotCity();
  const delta = {
    economy: after.economy - before.economy,
    environment: after.environment - before.environment,
    jobs: after.jobs - before.jobs,
    happiness: after.happiness - before.happiness
  };
  const note = monthlyAiNote(company, flowState.decision.action, delta);
  const lastEntry = cityState.journey[cityState.journey.length - 1];

  if (lastEntry) {
    lastEntry.note = note;
  }

  cityState.monthlyLog.push({ month: cityState.month, score: cityScore(), note });
  saveCityState();
  renderJourney();
}
