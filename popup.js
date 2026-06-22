const toggleBtn = document.getElementById('toggle-btn');
const testBtn = document.getElementById('test-btn');

// Fetch current status on open
chrome.storage.local.get({ extensieActief: true }, (data) => {
  updateButtonUI(data.extensieActief);
});

// Click action for On/Off button
toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get({ extensieActief: true }, (data) => {
    const nieuweStatus = !data.extensieActief;
    
    chrome.storage.local.set({ extensieActief: nieuweStatus }, () => {
      updateButtonUI(nieuweStatus);
      
      // Send a live message to the active tab to switch IMMEDIATELY
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            actie: "status_gewijzigd", 
            actief: nieuweStatus 
          }).catch(err => {
            // Catch error if page hasn't been refreshed yet
          });
        }
      });
    });
  });
});

// Click action for Test Page button
testBtn.addEventListener('click', () => {
  const testPageUrl = chrome.runtime.getURL('testpage.html');
  chrome.tabs.create({ url: testPageUrl });
});

function updateButtonUI(actief) {
  if (actief) {
    toggleBtn.textContent = 'Extension: ON';
    toggleBtn.classList.remove('disabled');
  } else {
    toggleBtn.textContent = 'Extension: OFF';
    toggleBtn.classList.add('disabled');
  }
}