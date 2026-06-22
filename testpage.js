const GITHUB_BASE_URL = "https://github.com/WesMeer/AD-Replacer-Chrome-Extension/raw/refs/heads/main/";

const memeBestanden = [
  "nyan.mp4", "rick.mp4", "oiia.mp4", "pbjt.mp4", 
  "gandalf.mp4", "keyboardcat.mp4", "maxwell.mp4", 
  "happy.mp4", "huh.mp4", "chipi.mp4", "yeahboii.mp4"
];

const gallery = document.getElementById('gallery');

function buildTestPage() {
  memeBestanden.forEach((filename, index) => {
    const videoUrl = GITHUB_BASE_URL + filename;
    
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
      <video autoplay loop muted playsinline>
        <source src="${videoUrl}" type="video/mp4">
        Failed to load video.
      </video>
      <div class="video-info">
        <span class="video-number">#${index + 1}:</span> ${filename}
      </div>
    `;
    
    gallery.appendChild(card);
  });
}

// Build the gallery view immediately
buildTestPage();