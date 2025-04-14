function enableSearchButtonIfNeeded() {
  const disabledSearchButton = document.querySelector(
    'button[aria-label="Enable search"]'
  );
  if (disabledSearchButton) {
    console.log("Found disabled search button. Clicking to enable...");
    disabledSearchButton.click();
  }
}

const observer = new MutationObserver((mutationsList, observer) => {
  enableSearchButtonIfNeeded();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["aria-label"],
});

enableSearchButtonIfNeeded();
