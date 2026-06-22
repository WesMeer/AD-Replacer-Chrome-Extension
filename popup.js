const toggleBtn = document.getElementById('toggle-btn');
const testBtn = document.getElementById('test-btn');

// Haal de huidige status op (standaard is TRUE oftewel AAN)
chrome.storage.local.get({ extensieActief: true }, (data) => {
  updateButtonUI(data.extensieActief);
});

// Klikactie voor de Aan/Uit-knop
toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get({ extensieActief: true }, (data) => {
    const nieuweStatus = !data.extensieActief;
    chrome.storage.local.set({ extensieActief: nieuweStatus }, () => {
      updateButtonUI(nieuweStatus);
      // Ververs de huidige actieve tab om de wijziging direct te tonen
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
      });
    });
  });
});

// Klikactie voor de Testpagina-knop
testBtn.addEventListener('click', () => {
  const testPageUrl = chrome.runtime.getURL('testpage.html');
  chrome.tabs.create({ url: testPageUrl });
});

function updateButtonUI(actief) {
  if (actief) {
    toggleBtn.textContent = 'Extensie: AAN';
    toggleBtn.classList.remove('disabled');
  } else {
    toggleBtn.textContent = 'Extensie: UIT';
    toggleBtn.classList.add('disabled');
  }
}