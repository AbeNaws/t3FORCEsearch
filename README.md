# T3 Chat Search Auto-Enabler

A simple browser extension for Brave/Chrome that automatically re-enables the search button on `t3.chat` if it becomes disabled (e.g., after sending a message).

## Problem

On `t3.chat`, the search functionality button can sometimes switch to a disabled state (indicated by `aria-label="Enable search"`) after performing actions like sending a message. This requires manually clicking it again to re-enable search.

## Solution

This extension monitors the `t3.chat` page using a content script. It uses a `MutationObserver` to efficiently detect when the search button's `aria-label` changes to `"Enable search"`. When detected, the extension programmatically clicks the button to instantly re-enable it (changing the `aria-label` back to `"Disable search"`).

## Features

*   Runs specifically on `https://t3.chat/*` pages.
*   Automatically detects the disabled state of the search button via its `aria-label`.
*   Simulates a click on the button to re-enable it.
*   Uses `MutationObserver` for efficient detection with minimal performance impact.

## Installation (Brave/Chrome)

1.  Download the files (`manifest.json` and `content.js`) into a single folder on your computer (e.g., `t3-search-enabler`).
2.  Open your browser (Brave or Chrome).
3.  Navigate to the Extensions page:
    *   Brave: `brave://extensions/`
    *   Chrome: `chrome://extensions/`
4.  Enable "Developer mode" (usually a toggle switch in the top-right corner).
5.  Click the "Load unpacked" button.
6.  Select the folder you created in step 1 (e.g., `t3-search-enabler`).
7.  The extension should now be installed and active. It will automatically work when you visit `t3.chat`.

## How It Works

*   **`manifest.json`**: Defines the extension's permissions and tells the browser to inject the content script.
*   **`content.js`**: Contains the JavaScript logic that:
    *   Sets up a `MutationObserver` to watch for DOM changes (specifically attribute changes on buttons).
    *   Includes a function (`enableSearchButtonIfNeeded`) that looks for `button[aria-label="Enable search"]`.
    *   If the button is found, it calls the `.click()` method on it.
