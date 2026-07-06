function setActiveTab(tabName) {
  const tabs = document.querySelectorAll("#authTabs [data-tab]");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const hint = document.getElementById("authSwitchHint");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  if (tabName === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    hint.innerHTML = `Belum punya akun? <a class="text-emerald-600" href="#" id="switchToRegister">Daftar di sini</a>`;
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    hint.innerHTML = `Sudah punya akun? <a class="text-emerald-600" href="#" id="switchToLogin">Masuk di sini</a>`;
  }

  bindSwitchHint();
}

function bindSwitchHint() {
  const toRegister = document.getElementById("switchToRegister");
  const toLogin = document.getElementById("switchToLogin");

  if (toRegister) {
    toRegister.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveTab("register");
    });
  }

  if (toLogin) {
    toLogin.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveTab("login");
    });
  }
}

// 1. Simpan session berdasarkan Nama Kelompok dan ID Kelompok (bukan email lagi)
function saveSession(team, groupId) {
  localStorage.setItem("citynomicsSession", JSON.stringify({ team, groupId }));
}

// 2. Fungsi inisialisasi Modal Awal & Parameter Kota saat Register
function initializeGameState(groupId) {
    const initialState = {
        availableFund: 1000000000, // Modal Awal Rp1.000.000.000
        investedFund: 0,
        totalAsset: 1000000000,
        earningRate: 0,
        month: 1,
        // Parameter kota default awal (kumuh/butuh perbaikan)
        economy: 30, 
        environment: 42, 
        jobs: 28, 
        happiness: 32, 
        infrastructure: 34,
        portfolio: [],
        journey: []
    };
    
    // Simpan ke local storage khusus untuk grup ini
    if (!localStorage.getItem(`cityState_${groupId}`)) {
         localStorage.setItem(`cityState_${groupId}`, JSON.stringify(initialState));
    }
    
    // Set identifier bahwa grup ini yang sedang main
    localStorage.setItem('activeGroupId', groupId);
}

function goToDashboard() {
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("#authTabs [data-tab]");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  bindSwitchHint();

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // 3. Ubah ID penarik data HTML dari loginEmail menjadi loginId
      const groupId = document.getElementById("loginId").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!groupId || !password) {
        showToast("Isi ID Kelompok dan kata sandi dulu ya.");
        return;
      }

      // Tarik nama tim dari ID jika memungkinkan (dummy login)
      saveSession("Tim " + groupId, groupId);
      localStorage.setItem('activeGroupId', groupId);

      showToast("Berhasil masuk. Mengalihkan ke dashboard...");
      setTimeout(goToDashboard, 900);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const team = document.getElementById("registerTeam").value.trim();
      // 4. Ubah ID penarik data HTML dari registerEmail menjadi registerId
      const groupId = document.getElementById("registerId").value.trim(); 
      const password = document.getElementById("registerPassword").value.trim();
      const confirm = document.getElementById("registerConfirm").value.trim();

      if (!team || !groupId || !password || !confirm) {
        showToast("Lengkapi semua kolom pendaftaran dulu.");
        return;
      }

      if (password !== confirm) {
        showToast("Konfirmasi kata sandi belum cocok.");
        return;
      }

      saveSession(team, groupId);
      initializeGameState(groupId); // Jalankan trigger Modal 1 Miliar

      showToast("Pendaftaran berhasil. Mengalihkan ke dashboard...");
      setTimeout(goToDashboard, 900);
    });
  }
});