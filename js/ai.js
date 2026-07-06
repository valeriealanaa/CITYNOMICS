function addChat(role, message) {
  const list = document.getElementById("chatList");

  if (!list) {
    return;
  }

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = message;
  list.appendChild(bubble);
  list.scrollTop = list.scrollHeight;
}

function mentorQuestion(action, company) {
  if (action === "BUY") {
    return `Kelompokmu membeli ${company.name}. Selain potensi profit, dampak apa yang paling penting bagi kota?`;
  }

  if (action === "SELL") {
    return `Kelompokmu menjual ${company.name}. Apa alasan utama keputusan tersebut?`;
  }

  return `Kelompokmu menahan ${company.name}. Data apa yang membuat kalian yakin menunggu bulan berikutnya?`;
}

function mentorFeedback(text, company, action) {
  if (!text || text.trim().length < 12) {
    return "Alasanmu masih terlalu singkat. Coba hubungkan keputusan dengan profit, risiko, lapangan kerja, atau lingkungan.";
  }

  if (action === "SELL" && company.profit >= 70) {
    return `Alasanmu cukup logis. Namun perlu diingat, ${company.name} memiliki pertumbuhan laba yang masih tinggi sehingga kemungkinan dapat pulih lebih cepat dari tekanan saat ini.`;
  }

  if (action === "BUY" && company.risk >= 55) {
    return `Alasanmu masuk akal karena potensi profitnya menarik. Namun ${company.name} memiliki risiko yang cukup tinggi, pastikan kelompokmu siap menanggung konsekuensinya.`;
  }

  if (action === "HOLD") {
    return "Keputusan menahan bisa tepat jika kalian masih menunggu data lebih jelas. Pastikan kalian tetap memantau event ekonomi bulan berikutnya.";
  }

  return `Alasanmu sudah mempertimbangkan data yang tersedia. Coba pikirkan juga dampak jangka panjang keputusan ini terhadap warga ${cityState.name}.`;
}

function socraticFollowUp() {
  return "Apakah keputusan kelompokmu masih sama setelah mendengar pertimbangan ini?";
}

function monthlyAiNote(company, action, delta) {
  const consideredSocial = company.social >= 70;
  const consideredEnv = company.environment >= 70;

  if (delta.happiness < 0) {
    return "Kelompokmu sudah mempertimbangkan sisi profit, namun keputusan ini menurunkan kebahagiaan warga. Coba pertimbangkan dampak sosialnya lebih dalam pada bulan berikutnya.";
  }

  if (consideredSocial && consideredEnv) {
    return "Kelompokmu sudah mempertimbangkan aspek lingkungan dan sosial dengan baik. Pertahankan pola pikir ini pada bulan-bulan berikutnya.";
  }

  if (action === "BUY" && company.risk >= 55) {
    return "Kelompokmu sudah mempertimbangkan potensi profit, namun belum sepenuhnya memperhitungkan risiko perusahaan ini terhadap stabilitas kota.";
  }

  return "Kelompokmu sudah mempertimbangkan aspek lingkungan, namun belum mempertimbangkan risiko perubahan kondisi ekonomi bulan depan.";
}

function portfolioAiNote(allocations) {
  const totalSocial = allocations.reduce((sum, item) => sum + item.company.social, 0) / allocations.length;
  const totalEnv = allocations.reduce((sum, item) => sum + item.company.environment, 0) / allocations.length;

  if (totalSocial >= 75 && totalEnv >= 75) {
    return "Portofolio awal kelompokmu sudah berorientasi kuat pada dampak sosial dan lingkungan. Ini akan membantu kesejahteraan warga sejak bulan pertama.";
  }

  return "Portofolio awal kelompokmu cukup berimbang. Perhatikan dampak sosial dan lingkungan setiap perusahaan agar pembangunan kota lebih berkelanjutan.";
}
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  // Inisialisasi: AI menyapa pertama kali saat dashboard dimuat
  addChat("ai", "Halo Tim! Saya CityMentor. Saya akan mendampingi diskusi kelompokmu. Silakan pilih perusahaan di panel utama atau sampaikan pertimbangan investasimu.");

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const userText = chatInput.value.trim();
      if (!userText) return;

      // 1. Render pesan siswa ke layar
      addChat("user", userText);
      chatInput.value = ""; // Bersihkan kolom input

      // 2. Beri efek loading AI (opsional biar terlihat realistis)
      setTimeout(() => {
          // Karena ini dashboard global (bukan per company card), 
          // feedback-nya bersifat umum menggunakan socratic logic
          if (userText.length < 15) {
              addChat("ai", "Alasanmu masih terlalu singkat. Coba elaborasi lagi, apa dampak keputusan ini terhadap stabilitas ekonomi dan lingkungan kota?");
          } else {
              addChat("ai", "Analisis yang menarik. Apakah kamu sudah mempertimbangkan risiko fluktuasi harga jika bulan depan terjadi krisis nasional?");
          }
      }, 900); 
    });
  }
});
