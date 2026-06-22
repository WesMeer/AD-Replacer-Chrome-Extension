const gallery = document.getElementById('gallery');

function bouwTestPagina() {
  try {
    // Haal het manifest op
    const manifest = chrome.runtime.getManifest();
    const resources = manifest.web_accessible_resources[0].resources;
    
    // Filter alle mp4'tjes eruit
    const videoBestanden = resources.filter(bestand => bestand.endsWith('.mp4'));

    // Bouw de HTML op volgorde op
    videoBestanden.forEach((bestandsnaam, index) => {
      const videoUrl = chrome.runtime.getURL(bestandsnaam);
      
      const card = document.createElement('div');
      card.className = 'video-card';
      
      card.innerHTML = `
        <video autoplay loop muted playsinline>
          <source src="${videoUrl}" type="video/mp4">
          Kan video niet laden. Check manifest.json!
        </video>
        <div class="video-info">
          <span class="video-number">#${index + 1}:</span> ${bestandsnaam}
        </div>
      `;
      
      gallery.appendChild(card);
    });
  } catch (e) {
    console.error("Fout bij het laden van de testpagina:", e);
  }
}

// Start het bouwen van de pagina
bouwTestPagina();