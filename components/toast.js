function showToast(message) {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) {
    return;
  }

  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  wrap.appendChild(item);

  setTimeout(() => {
    item.remove();
  }, 2600);
}
