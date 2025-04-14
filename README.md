# T3 Chat Search State Manager

A browser extension for Brave/Chrome that remembers and maintains your preferred state (on or off) for the search button on `t3.chat`.

## Problem

On `t3.chat`, the search functionality button can sometimes switch to a disabled state (`aria-label="Enable search"`) after performing actions like sending a message. Furthermore, the desired state (whether you want search enabled or disabled by default) wasn't remembered across page loads.

## Solution

This extension manages the state of the search button on `t3.chat`:

1.  **Remembers Your Choice:** It uses browser storage (`chrome.storage.local`) to save whether you last manually set the search button to "on" (`aria-label="Disable search"`) or "off" (`aria-label="Enable search"`).
2.  **Persistence:** Your saved preference persists even if you close the tab or browser and return to `t3.chat` later.
3.  **Applies State on Load:** When you load a `t3.chat` page, the extension checks your saved preference and sets the button to match it.
4.  **Defaults to Off:** If you've never manually clicked the button, it defaults to the "off" state on the first run.
5.  **Respects Manual Clicks:** When you click the button, that state becomes your new saved preference.
6.  **Conditional Auto Re-enabling:** If the website automatically turns the search button *off* (e.g., after sending a message), the extension will only turn it back *on* automatically if your saved preference is "on". If your preference is "off", it will remain off.

## Features

*   Runs specifically on `https://t3.chat/*` pages.
*   Saves the user's preferred search button state (on/off) using `chrome.storage.local`.
*   Applies the saved state automatically when the page loads.
*   Defaults to "off" if no preference has been saved previously.
*   Updates the saved preference whenever the user manually clicks the button.
*   Only automatically re-enables the search (clicks "Enable search") if the saved preference is "on" and the site disables it.
*   Uses `MutationObserver` for efficient detection of state changes triggered by the website.
*   Requires the `storage` permission.

## Installation (Brave/Chrome)

1.  Download the files (`manifest.json` and `content.js`) into a single folder on your computer (e.g., `t3-search-manager`).
2.  Open your browser (Brave or Chrome).
3.  Navigate to the Extensions page:
    *   Brave: `brave://extensions/`
    *   Chrome: `chrome://extensions/`
4.  Enable "Developer mode" (usually a toggle switch in the top-right corner).
5.  Click the "Load unpacked" button.
6.  Select the folder you created in step 1 (e.g., `t3-search-manager`).
7.  The extension should now be installed and active. It will manage the search button state automatically when you visit `t3.chat`.

## How It Works

*   **`manifest.json`**: Defines the extension's permissions (including `storage`) and tells the browser to inject the content script.
*   **`content.js`**: Contains the JavaScript logic that:
    *   Loads the desired state from `chrome.storage.local` on initialization (defaulting to "off").
    *   Applies the loaded/default state to the button on the page.
    *   Listens for user clicks on the search button to update the desired state and save it back to storage.
    *   Sets up a `MutationObserver` to watch for changes to the button's `aria-label` attribute.
    *   If a change is detected *and* it wasn't a direct result of a user click *and* the desired state is "on", it clicks the button to re-enable search.
