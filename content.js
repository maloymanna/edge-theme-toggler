// This file can be used for additional per-page functionality
// For now, it's just a placeholder since the core functionality
// is handled by the injected script from background.js

// Listen for theme changes from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyTheme') {
    // This provides a hook for potential future enhancements
    sendResponse({success: true});
  }
  return true;
});