function createCompanyCard(company) {
  return `
    <article class="company-card flex h-full flex-col">
      <div class="flex items-start justify-between gap-3">
        <span class="tag">${company.sector}</span>
        <div class="text-xl font-black text-emerald-600">${company.icon}</div>
      </div>
      <div class="company-icon mt-4">${company.icon}</div>
      <h3 class="mt-4 min-h-[42px] text-sm font-black leading-5">${company.name}</h3>
      <p class="mt-2 min-h-[48px] text-xs font-semibold leading-5 text-slate-500">${company.description}</p>
      <div class="mt-3 text-amber-400">★★★★★</div>
      <button class="btn-primary mt-auto w-full py-2 text-xs" data-company-id="${company.id}" style="margin-top:16px;">Lihat Detail</button>
    </article>
  `;
}

function createDecisionCard(company, isActive) {
  return `
    <article class="company-card decision-card ${isActive ? "selected" : ""}">
      <div class="flex items-start justify-between gap-3">
        <span class="tag">${company.sector}</span>
        <div class="text-xl font-black text-emerald-600">${company.icon}</div>
      </div>
      <div class="company-icon mt-4">${company.icon}</div>
      <h3 class="mt-4 min-h-[42px] text-sm font-black leading-5">${company.name}</h3>
      <p class="mt-2 text-xs font-bold text-slate-500">Prospek: ${company.prospect}</p>
      <button class="btn-secondary mt-4 w-full py-2 text-xs" data-decision-id="${company.id}">${isActive ? "Terpilih" : "Pilih untuk Diputuskan"}</button>
    </article>
  `;
}

function createPortfolioRow(company, allocation) {
  const percent = allocation ? allocation.percent : 0;
  const reason = allocation ? allocation.reason : "";
  const checked = Boolean(allocation);

  return `
    <div class="portfolio-row" data-portfolio-id="${company.id}">
      <div class="flex items-start justify-between gap-3">
        <label class="flex items-center gap-3">
          <input type="checkbox" data-portfolio-toggle="${company.id}" ${checked ? "checked" : ""}>
          <span class="text-2xl">${company.icon}</span>
          <span>
            <strong class="block text-sm font-black">${company.name}</strong>
            <span class="text-xs font-bold text-slate-400">${company.sector} • Prospek ${company.prospect}</span>
          </span>
        </label>
        <span class="alloc-percent" data-portfolio-percent-label="${company.id}">${percent}%</span>
      </div>
      <input class="alloc-input mt-3" type="range" min="0" max="100" step="5" value="${percent}" data-portfolio-range="${company.id}" ${checked ? "" : "disabled"}>
      <textarea class="mt-3 w-full rounded-[10px] border border-slate-200 p-3 text-xs font-semibold outline-none focus:border-emerald-500" rows="2" placeholder="Mengapa kelompokmu membeli perusahaan ini?" data-portfolio-reason="${company.id}" ${checked ? "" : "disabled"}>${reason}</textarea>
    </div>
  `;
}
