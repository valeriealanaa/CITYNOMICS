document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load Data Dasar (Paling Pertama)
  companiesData = await loadCompanies();
  await loadEvents();
  loadCityState(); // Memuat data kota
  loadFlowState(); // Memuat posisi stage terakhir

  // 2. Setup UI & User Session
  const teamNameText = document.getElementById("teamNameText");
  const session = JSON.parse(localStorage.getItem("citynomicsSession") || "null");

  if (teamNameText) {
    teamNameText.textContent = session && session.team ? session.team : "Tamu";
  }

  // 3. Bind Logout & Reset
  const logout = () => {
    localStorage.removeItem("citynomicsSession");
    window.location.href = "login.html";
  };

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("mobileLogoutBtn")?.addEventListener("click", (e) => { e.preventDefault(); logout(); });

  document.getElementById("resetSimulationBtn")?.addEventListener("click", () => {
    resetCityState();
    localStorage.removeItem(FLOW_STORAGE_KEY);
    flowState.stage = "orientation";
    flowState.history = [];
    flowState.portfolioDraft = {};
    flowState.activeDecisionId = null;
    flowState.decision = null;
    flowState.decisionApplied = false;
    renderStage();
    showToast("Simulasi diulang dari Tahap 1.");
  });

  // 4. Render Initial
  renderStage();

  // 5. Setup Chat AI
  addChat("ai", "Hai, aku CityMentor. Aku akan menemani kelompokmu di setiap tahap simulasi Harapan City.");

  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  
  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      addChat("user", message);
      addChat("ai", "Catat pemikiran itu ke dalam alasan keputusan di tahap yang sedang berjalan ya, supaya tersimpan di Investment Journey.");
      input.value = "";
    });
  }

  // 6. Mobile Menu
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("show"));
  }
});