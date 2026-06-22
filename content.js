// AUTOMATISCHE SCAN VIA HET MANIFEST
let mijnVideoLijst = [];

function laadVideoLijstUitManifest() {
  try {
    const manifest = chrome.runtime.getManifest();
    const resources = manifest.web_accessible_resources[0].resources;
    
    mijnVideoLijst = resources
      .filter(bestand => bestand.endsWith('.mp4'))
      .map(bestand => chrome.runtime.getURL(bestand));
  } catch (e) {
    console.error("Kon video's niet automatisch scannen uit manifest:", e);
  }
}

// Kickstart de automatische scan direct
laadVideoLijstUitManifest();

function pakRandomMeme() {
  if (mijnVideoLijst.length === 0) return "";
  const randomIndex = Math.floor(Math.random() * mijnVideoLijst.length);
  return mijnVideoLijst[randomIndex];
}

// ==========================================
// DEEL A: SPECIFIEK VOOR YOUTUBE
// ==========================================
let adIsActief = false;

function kaapVideoVolume(videoElement) {
  if (videoElement.gekaapt) return;
  videoElement.gekaapt = true;

  const oVol = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume').set;
  const oMut = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set;

  Object.defineProperty(videoElement, 'volume', {
    set: function(w) { if (adIsActief) { oVol.call(this, 0); } else { oVol.call(this, w); } },
    get: function() { return Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume').get.call(this); }
  });

  Object.defineProperty(videoElement, 'muted', {
    set: function(w) { if (adIsActief) { oMut.call(this, true); } else { oMut.call(this, w); } },
    get: function() { return Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').get.call(this); }
  });
}

function handleYouTubeAds() {
  const moviePlayer = document.querySelector('.html5-video-player');
  const ytVideoElement = document.querySelector('.html5-main-video');
  if (!moviePlayer || !ytVideoElement) return;

  kaapVideoVolume(ytVideoElement);
  const isAdShowing = moviePlayer.classList.contains('ad-showing');
  let customOverlay = document.getElementById('my-custom-ad-overlay');

  if (isAdShowing) {
    adIsActief = true;
    ytVideoElement.muted = true;
    ytVideoElement.volume = 0;

    if (!customOverlay) {
      customOverlay = document.createElement('div');
      customOverlay.id = 'my-custom-ad-overlay';
      customOverlay.innerHTML = `
        <video autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover;">
          <source src="${pakRandomMeme()}" type="video/mp4">
        </video>
      `;
      moviePlayer.appendChild(customOverlay);
      
      const myVideoElement = customOverlay.querySelector('video');
      if (myVideoElement) {
        myVideoElement.muted = false;
        myVideoElement.volume = 0.4;
        myVideoElement.play().catch(e => {});
      }
    }
  } else {
    adIsActief = false;
    if (customOverlay) {
      customOverlay.remove();
      ytVideoElement.muted = false;
      ytVideoElement.volume = 1.0;
    }
  }
}

// ==========================================
// DEEL B: FLOATING OVERLAY METHODE (VOLLEDIG HERSTELD & CLEAN)
// ==========================================
function handleAlgemeneAds() {
  const dynamicSelectors = [
    '[id*="placement"]', '[class*="placement"]',
    '[id*="skyscraper"]', '[class*="skyscraper"]',
    '.adsbygoogle', 'amp-ad',
    'iframe[id*="pexi"]', '.pexi', '[class*="pexi_"]', '[id*="pexi_"]',
    'iframe[src*="pexi.nl"]',
    'iframe[id*="utif_"]', 'iframe[title*="advertisement"]'
  ];

  const gevondenAds = document.querySelectorAll(dynamicSelectors.join(', '));

  gevondenAds.forEach((ad, index) => {
    if (ad.id === 'my-custom-ad-overlay' || ad.classList.contains('my-custom-ad-container')) return;

    const isZelfIframe = ad.tagName === 'IFRAME';
    const bevatEchteAd = ad.querySelector('iframe') || ad.querySelector('ins') || ad.querySelector('object');
    
    const memeId = `floating-meme-${index}`;
    let memeOverlay = document.getElementById(memeId);

    if (!isZelfIframe && !bevatEchteAd) {
      if (memeOverlay) memeOverlay.style.setProperty('display', 'none', 'important');
      return;
    }

    const rect = ad.getBoundingClientRect();
    
    // Filter lege/onzichtbare placeholders eruit (behalve als het onze actieve ad-iframes zijn)
    if (!isZelfIframe && (rect.width <= 10 || rect.height <= 10)) {
      if (memeOverlay) memeOverlay.style.setProperty('display', 'none', 'important');
      return;
    }

    // Verberg de meme direct als hij buiten het zichtbare scherm scrolt
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      if (memeOverlay) memeOverlay.style.setProperty('display', 'none', 'important');
      return;
    }

    if (!memeOverlay) {
      memeOverlay = document.createElement('div');
      memeOverlay.id = memeId;
      memeOverlay.className = 'my-custom-ad-container';
      
      memeOverlay.innerHTML = `
        <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
          <source src="${pakRandomMeme()}" type="video/mp4">
        </video>
      `;

      document.body.appendChild(memeOverlay);
    }

    // Bepaal de maten met nette fallbacks
    const breedte = rect.width > 10 ? rect.width : parseInt(ad.getAttribute('width')) || parseInt(ad.style.width) || 300;
    const hoogte = rect.height > 10 ? rect.height : parseInt(ad.getAttribute('height')) || parseInt(ad.style.height) || 250;

    // Plak de video met de veilige z-index (9) ten opzichte van het scherm
    memeOverlay.style.setProperty('position', 'fixed', 'important');
    memeOverlay.style.setProperty('top', `${rect.top}px`, 'important');
    memeOverlay.style.setProperty('left', `${rect.left}px`, 'important');
    memeOverlay.style.setProperty('width', `${breedte}px`, 'important');
    memeOverlay.style.setProperty('height', `${hoogte}px`, 'important');
    memeOverlay.style.setProperty('z-index', '9', 'important'); // NETJES TERUG OP 9
    memeOverlay.style.setProperty('display', 'flex', 'important');
  });
}

// ==========================================
// ENGINE (SCHOON & TERUGGEDRAAID)
// ==========================================
let actieveObserver = null;

function startMemeReplacer() {
  stopMemeReplacer();

  actieveObserver = new MutationObserver(() => {
    if (window.location.hostname.includes('youtube.com')) {
      handleYouTubeAds();
    } else {
      handleAlgemeneAds();
    }
  });

  actieveObserver.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: true, 
    attributeFilter: ['style', 'class'] 
  });

  if (window.location.hostname.includes('youtube.com')) { 
    handleYouTubeAds(); 
  } else { 
    handleAlgemeneAds(); 
  }
}

function stopMemeReplacer() {
  if (actieveObserver) {
    actieveObserver.disconnect();
    actieveObserver = null;
  }
  const actieveMemes = document.querySelectorAll('.my-custom-ad-container');
  actieveMemes.forEach(meme => {
    if (meme.id.startsWith('floating-meme-')) {
      meme.remove();
    }
  });
}

window.addEventListener('scroll', () => {
  chrome.storage.local.get({ extensieActief: true }, (data) => {
    if (data.extensieActief && !window.location.hostname.includes('youtube.com')) handleAlgemeneAds();
  });
}, { passive: true });

window.addEventListener('resize', () => {
  chrome.storage.local.get({ extensieActief: true }, (data) => {
    if (data.extensieActief && !window.location.hostname.includes('youtube.com')) handleAlgemeneAds();
  });
});

chrome.storage.local.get({ extensieActief: true }, (data) => {
  if (data.extensieActief) startMemeReplacer();
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.actie === "status_gewijzigd") {
    if (request.actief) {
      startMemeReplacer();
    } else {
      stopMemeReplacer();
    }
  }
});