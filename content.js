console.log("T3 Chat Search State Manager script loaded.");

const STORAGE_KEY = "t3SearchManualState"; // Key for storing the state
let desiredState = "off"; // Default state is 'off'
let userManuallyToggled = false;
let toggleTimeoutId = null;

// --- Button Selectors ---
const enableSelector = 'button[aria-label="Enable search"]';
const disableSelector = 'button[aria-label="Disable search"]';

// --- Core Functions ---

// Function to get the current state from the DOM
function getCurrentButtonState() {
  if (document.querySelector(disableSelector)) {
    return "on"; // Found "Disable search" button, means search is ON
  }
  if (document.querySelector(enableSelector)) {
    return "off"; // Found "Enable search" button, means search is OFF
  }
  return null; // Button not found
}

// Function to click the button to achieve the target state
function setButtonState(targetState) {
  const currentState = getCurrentButtonState();
  if (currentState === null) {
    console.log("Button not found, cannot set state.");
    return;
  }

  if (currentState !== targetState) {
    console.log(
      `Current state (${currentState}) differs from target (${targetState}). Clicking.`
    );
    const buttonToClick =
      targetState === "on"
        ? document.querySelector(enableSelector) // Click "Enable" to turn ON
        : document.querySelector(disableSelector); // Click "Disable" to turn OFF

    if (buttonToClick) {
      buttonToClick.click();
    } else {
      console.warn("Could not find the correct button to click.");
    }
  } else {
    console.log(`Button already in desired state (${targetState}).`);
  }
}

// Function to handle automatic re-enabling IF desired state is "on"
function handleAutomaticReEnable() {
  // If user just clicked, or desired state is 'off', do nothing automatically.
  if (userManuallyToggled || desiredState === "off") {
    if (userManuallyToggled) {
      console.log("Ignoring automatic check due to recent manual toggle.");
    }
    return;
  }

  // If desired state is 'on', check if the button is currently 'off'
  const currentState = getCurrentButtonState();
  if (currentState === "off") {
    console.log(
      "System likely turned button off, but desired state is 'on'. Re-enabling..."
    );
    // Don't call setButtonState here to avoid loops, just click the enable button
    const enableButton = document.querySelector(enableSelector);
    if (enableButton) {
      enableButton.click();
    }
  }
}

// --- Event Listener for Manual Clicks ---
document.body.addEventListener(
  "click",
  (event) => {
    const targetButton = event.target.closest(
      `${enableSelector}, ${disableSelector}`
    );

    if (targetButton) {
      console.log("User manually clicked the search toggle.");
      userManuallyToggled = true;

      // Determine the NEW state AFTER the click
      const stateAfterClick = targetButton.getAttribute("aria-label") === "Enable search" ? "on" : "off";
      desiredState = stateAfterClick; // Update runtime desired state

      // Save the new desired state to storage
      chrome.storage.local.set({ [STORAGE_KEY]: desiredState }, () => {
        console.log(`Saved desired state to storage: ${desiredState}`);
      });

      // Reset the manual toggle flag after a delay
      if (toggleTimeoutId) clearTimeout(toggleTimeoutId);
      toggleTimeoutId = setTimeout(() => {
        userManuallyToggled = false;
        toggleTimeoutId = null;
        console.log("Manual toggle flag reset.");
      }, 150);
    }
  },
  true
);

// --- MutationObserver Setup ---
const observer = new MutationObserver((mutationsList) => {
  // Check if any mutation might have affected the button's state
  let potentiallyAffected = false;
  for (const mutation of mutationsList) {
    if (
      mutation.type === "attributes" &&
      mutation.attributeName === "aria-label" &&
      mutation.target.nodeName === "BUTTON"
    ) {
      potentiallyAffected = true;
      break;
    } else if (mutation.type === "childList") {
      // Check if relevant buttons were added/removed
      if (
        Array.from(mutation.addedNodes).some((node) =>
          node.matches?.(enableSelector + ", " + disableSelector)
        ) ||
        Array.from(mutation.removedNodes).some((node) =>
          node.matches?.(enableSelector + ", " + disableSelector)
        )
      ) {
        potentiallyAffected = true;
        break;
      }
    }
  }

  if (potentiallyAffected) {
    // Use a tiny delay before checking to let click handler run first
    setTimeout(handleAutomaticReEnable, 50);
  }
});

// --- Initialization ---
function initializeState() {
  // 1. Load the desired state from storage
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY]) {
      desiredState = result[STORAGE_KEY];
      console.log(`Loaded desired state from storage: ${desiredState}`);
    } else {
      desiredState = "off"; // Default to 'off' if nothing is stored
      console.log(`No state found in storage. Defaulting to: ${desiredState}`);
      // Optionally save the default state back? Not strictly necessary.
      // chrome.storage.local.set({ [STORAGE_KEY]: desiredState });
    }

    // 2. Apply the desired state to the current button
    // Use a small delay to ensure the button exists after page load
    setTimeout(() => {
      console.log(`Applying initial desired state: ${desiredState}`);
      setButtonState(desiredState);

      // 3. Start observing for changes *after* initial state is set
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-label"],
      });
      console.log("MutationObserver started.");
    }, 500); // Delay (e.g., 500ms) to allow page elements to settle
  });
}

// Start the initialization process
initializeState();

