function pulseElement(element) {
  if (!element) {
    return;
  }

  element.animate([
    { transform: "scale(1)" },
    { transform: "scale(1.02)" },
    { transform: "scale(1)" }
  ], {
    duration: 420,
    easing: "ease-out"
  });
}
