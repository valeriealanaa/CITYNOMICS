function openModal(html) {
  const modal = document.getElementById("companyModal");
  const content = document.getElementById("modalContent");

  if (!modal || !content) {
    return;
  }

  content.innerHTML = html;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("companyModal");

  if (modal) {
    modal.classList.remove("show");
  }
}

document.addEventListener("click", (event) => {
  if (event.target.id === "companyModal" || event.target.dataset.close === "modal") {
    closeModal();
  }
});
