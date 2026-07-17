const LEGACY_CITY_STORAGE_KEY = "citynomicsCityState";
const CITY_STATE_VERSION = 2;

const PORTFOLIO_RESERVE = 237500;

function getCityStorageKey() {
  const activeGroupId = (localStorage.getItem("activeGroupId") || "").trim();
  return activeGroupId ? `cityState_${activeGroupId}` : LEGACY_CITY_STORAGE_KEY;
}

const cityState = {
  name: "Harapan City",
  population: 250000,
  economy: 30,
  environment: 42,
  jobs: 28,
  happiness: 32,
  infrastructure: 34,
  initialFund: 1000000000,
  availableFund: 1000000000,
  investedFund: 0,
  totalAsset: 1000000000,
  month: 1,
  earningRate:0,
  cityLevel:1,
  status:"playing",
  portfolio: [],
  journey: [],
  monthlyLog: [],
  monthSnapshot: null,
  orientationAnswer: "",
  rank: "Healthy Rank 3",
  eventApplied: {}
};

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cityScore() {
    return Math.round(
        (cityState.economy +
        cityState.environment +
        cityState.jobs +
        cityState.happiness +
        cityState.infrastructure) / 5
    );
}

function saveCityState() {
  const key = getCityStorageKey();
  localStorage.setItem(key, JSON.stringify(Object.assign({ version: CITY_STATE_VERSION }, cityState)));
}

function loadCityState() {
  const key = getCityStorageKey();
  const legacyRaw = localStorage.getItem(LEGACY_CITY_STORAGE_KEY);
  const raw = localStorage.getItem(key) || legacyRaw;
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.version !== CITY_STATE_VERSION) {
      localStorage.removeItem(key);
      return false;
    }

    Object.assign(cityState, parsed);

    if (!localStorage.getItem(key) && legacyRaw) {
      localStorage.setItem(key, JSON.stringify(Object.assign({ version: CITY_STATE_VERSION }, cityState)));
    }

    return true;
  } catch (error) {
    return false;
  }
}

function resetCityState() {
  const key = getCityStorageKey();
  localStorage.removeItem(key);
  localStorage.removeItem(LEGACY_CITY_STORAGE_KEY);
  cityState.economy = 30;
  cityState.environment = 42;
  cityState.jobs = 28;
  cityState.happiness = 32;
  cityState.infrastructure = 34;
  cityState.availableFund=1000000000;
  cityState.investedFund=0;
  cityState.totalAsset=1000000000;
  cityState.earningRate=0;
  cityState.cityLevel=1;
  cityState.month = 1;
  cityState.rank = "Healthy Rank 3";
  cityState.portfolio = [];
  cityState.journey = [];
  cityState.monthlyLog = [];
  cityState.monthSnapshot = null;
  cityState.orientationAnswer = "";
  cityState.eventApplied = {};
}

function snapshotCity() {
  return {
    economy: cityState.economy,
    environment: cityState.environment,
    jobs: cityState.jobs,
    happiness: cityState.happiness,
    infrastructure: cityState.infrastructure,

    availableFund: cityState.availableFund,
    investedFund: cityState.investedFund,
    totalAsset: cityState.totalAsset,

    earningRate: cityState.earningRate,
    rank: cityState.rank,
    cityLevel: cityState.cityLevel,
   

    score: cityScore()
  };
}

function renderCityStats() {
  const target = document.getElementById("cityStats");
  const scoreText = document.getElementById("scoreText");
  const fundText = document.getElementById("fundText");
  const monthText = document.getElementById("monthText");

  const score = Math.round(
  (
    cityState.economy +
    cityState.environment +
    cityState.jobs +
    cityState.happiness +
    cityState.infrastructure
  ) / 5
);

cityState.cityScore = score;

if (scoreText) {
  scoreText.textContent = score;
}

  if (fundText) {
    fundText.textContent = formatRupiah(cityState.availableFund);
  }

  if (monthText) {
    monthText.textContent = cityState.month;
  }

  if (!target) {
    return;
  }

  const stats = [
    ["Ekonomi", cityState.economy],
    ["Lingkungan", cityState.environment],
    ["Kerja", cityState.jobs],
    ["Bahagia", cityState.happiness],
    ["Infrastruktur", cityState.infrastructure]
  ];

  target.innerHTML = stats.map(([name, value]) => `
    <div class="stat-line">
      <span>${name}</span>
      <div class="progress"><span style="width: ${clampScore(value)}%"></span></div>
      <strong>${clampScore(value)}/100</strong>
    </div>
  `).join("");
}

function applyEventCityEffect(event) {
  if (!event || cityState.eventApplied[event.month]) {
    return;
  }

  cityState.economy = clampScore(cityState.economy + event.cityEffects.economy);
  cityState.environment = clampScore(cityState.environment + event.cityEffects.environment);
  cityState.jobs = clampScore(cityState.jobs + event.cityEffects.jobs);
  cityState.happiness = clampScore(cityState.happiness + event.cityEffects.happiness);
  cityState.eventApplied[event.month] = true;
}
