// Track current theme state
let isDarkTheme = false;

// Initialize theme state from storage
chrome.storage.local.get('isDarkTheme', (result) => {
  if (result.hasOwnProperty('isDarkTheme')) {
    isDarkTheme = result.isDarkTheme;
  }
});

// Listen for theme toggle commands
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTheme') {
    // Toggle theme state
    isDarkTheme = !isDarkTheme;
    
    // Store the new state
    chrome.storage.local.set({ isDarkTheme });
    
    // Apply to all existing tabs
    applyThemeToAllTabs();
    
    // Respond with the new state
    sendResponse({ isDarkTheme });
  } else if (message.action === 'getThemeState') {
    sendResponse({ isDarkTheme });
  }
  return true; // Keep the message channel open for async response
});

// Apply theme to all open tabs
function applyThemeToAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Skip extension pages and special Edge pages
      if (!tab.url.startsWith('chrome://') && 
          !tab.url.startsWith('edge://') && 
          !tab.url.startsWith('about:')) {
        
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: applyTheme,
          args: [isDarkTheme]
        }).catch(err => console.log(`Error applying theme to tab ${tab.id}: ${err.message}`));
      }
    });
  });
}

// Function that will be injected into tabs
function applyTheme(isDark) {
  // Apply data-color-scheme attribute
  document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light');
  
  // Set force-colors CSS for websites that don't respect data-color-scheme
  if (!document.getElementById('edge-theme-toggle-style')) {
    const style = document.createElement('style');
    style.id = 'edge-theme-toggle-style';
    document.head.appendChild(style);
  }
  
  const styleEl = document.getElementById('edge-theme-toggle-style');
  if (isDark) {
    styleEl.textContent = `
      @media (prefers-color-scheme: dark) {
        :root {
          color-scheme: dark !important;
        }
      }
      html { 
        filter: invert(90%) hue-rotate(180deg) !important;
      }
      img, video, canvas, [style*="background-image"] { 
        filter: invert(100%) hue-rotate(180deg) !important;
      }
    `;
  } else {
    styleEl.textContent = '';
  }
  
  // Store theme preference for this site
  localStorage.setItem('edge-theme-preference', isDark ? 'dark' : 'light');
}

// Listen for tab updates to apply theme to new tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      !tab.url.startsWith('chrome://') && 
      !tab.url.startsWith('edge://') && 
      !tab.url.startsWith('about:')) {
    
    chrome.scripting.executeScript({
      target: { tabId },
      function: applyTheme,
      args: [isDarkTheme]
    }).catch(err => console.log(`Error applying theme to updated tab: ${err.message}`));
  }
});