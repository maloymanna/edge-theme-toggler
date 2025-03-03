document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('themeToggle');
  const statusText = document.getElementById('status');
  
  // Get current theme state
  chrome.runtime.sendMessage({ action: 'getThemeState' }, (response) => {
    if (response && response.hasOwnProperty('isDarkTheme')) {
      toggleSwitch.checked = response.isDarkTheme;
      updateStatusText(response.isDarkTheme);
    }
  });
  
  // Handle toggle changes
  toggleSwitch.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'toggleTheme' }, (response) => {
      if (response && response.hasOwnProperty('isDarkTheme')) {
        updateStatusText(response.isDarkTheme);
      }
    });
  });
  
  function updateStatusText(isDark) {
    statusText.textContent = `Current theme: ${isDark ? 'Dark' : 'Light'}`;
  }
});