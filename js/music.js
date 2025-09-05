// music.js — Dynamic Music Page

// Mobile menu
const menuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('active'));
}

// Load tracks from JSON
fetch('tracks.json')
  .then(response => response.json())
  .then(tracks => renderTracks(tracks));

function renderTracks(tracks) {
  const grid = document.querySelector('.track-grid');
  grid.innerHTML = '';

  tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.setAttribute('data-type', track.type);

    card.innerHTML = `
      <img src="${track.cover}" alt="${track.title} Cover" />
      <div class="track-info">
        <h3>${track.title}</h3>
        <p>${track.artist}</p>
        <div class="track-actions">
          <button class="global-play" data-src="${track.audio}" data-title="${track.title}" data-artist="${track.artist}">
            <i class="fas fa-play"></i>
          </button>
          <button><i class="fas fa-download"></i></button>
          <button><i class="fas fa-share-alt"></i></button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  setupPlayerButtons();
}

// Filters
document.querySelectorAll('.filter').forEach(filter => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const type = filter.textContent.toLowerCase();
    document.querySelectorAll('.track-card').forEach(card => {
      const match = type === 'all' || card.dataset.type === type;
      card.style.display = match ? 'block' : 'none';
    });
  });
});



// Global player setup
function setupPlayerButtons() {
  const globalPlayer = document.getElementById('global-player');
  const globalTitle = document.getElementById('global-track-title');
  const globalArtist = document.getElementById('global-track-artist');
  const container = document.querySelector('.global-audio-player');

  document.querySelectorAll('.global-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src;
      const title = btn.dataset.title;
      const artist = btn.dataset.artist;
      if (globalPlayer) {
        globalPlayer.src = src;
        globalPlayer.play();
        if (globalTitle) globalTitle.textContent = title;
        if (globalArtist) globalArtist.textContent = artist;
        if (container) container.classList.add('visible');
      }
    });
  });
}
