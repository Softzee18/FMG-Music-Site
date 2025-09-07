// --- Album Data Example ---
const albums = {
  album1: {
    title: "Fine Wine",
    artist: "Paramanchi",
    cover: "../assets/images/track-1.jpg",
    releaseYear: "Jul-28-2023",
    trackCount: 7,
    duration: "45:30",
    description: "Fine Wine explores the sounds and rhythms of city life...",
    tracks: [
      { title: "International", artist: "Paramanchi", duration: "2:09", url: "../assets/music/International.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Fine Wine", artist: "Paramanchi", duration: "3:09", url: "../assets/music/Fine Wine.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Sokoto", artist: "Paramanchi", duration: "2:37", url: "../assets/music/Sokoto.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Any Problem", artist: "Paramanchi", duration: "3:09", url: "../assets/music/Any Problem.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Hosana", artist: "Paramanchi", duration: "3:07", url: "../assets/music/Hosana.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Good Times", artist: "Paramanchi", duration: "2:51", url: "../assets/music/Good time.mp3", thumbnail: "../assets/images/track-1.jpg" },
      { title: "Vibe", artist: "Paramanchi", duration: "2:09", url: "../assets/music/Vibe.mp3", thumbnail: "../assets/images/track-1.jpg" }
    ]
  }
  // Add more albums as needed
};

// --- Global Audio Player State ---
let globalAudio = document.getElementById('audio-element') || new Audio();
let globalTrackList = [];
let globalCurrentIndex = 0;

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initFilter();
  initSort();
  initPagination();
  initSinglesPlayButtons();
  initPlayerControls();
  initAlbumModal();
  initScrollButtonsAndDots();
});

// --- Search ---
function initSearch() {
  const searchInput = document.getElementById('track-search');
  const searchBtn = document.getElementById('search-btn');
  const trackCards = document.querySelectorAll('.track-card');
  function searchTracks() {
    const term = searchInput.value.toLowerCase();
    trackCards.forEach(card => {
      const title = card.dataset.title?.toLowerCase() || '';
      const artist = card.dataset.artist?.toLowerCase() || '';
      const genre = card.dataset.genre?.toLowerCase() || '';
      card.style.display = title.includes(term) || artist.includes(term) || genre.includes(term) ? 'block' : 'none';
    });
  }
  searchBtn?.addEventListener('click', searchTracks);
  searchInput?.addEventListener('keyup', e => e.key === 'Enter' && searchTracks());
}

// --- Genre Filter ---
function initFilter() {
  const genreFilter = document.getElementById('genre-filter');
  const trackCards = document.querySelectorAll('.track-card');
  genreFilter?.addEventListener('change', function () {
    const selected = this.value.toLowerCase();
    trackCards.forEach(card => {
      const genre = card.dataset.genre?.toLowerCase() || '';
      card.style.display = !selected || genre === selected ? 'block' : 'none';
    });
  });
}

// --- Sort ---
function initSort() {
  const sortBy = document.getElementById('sort-by');
  const musicGrid = document.querySelector('.music-grid');
  sortBy?.addEventListener('change', function () {
    const trackCards = Array.from(document.querySelectorAll('.track-card'));
    const sortValue = this.value;
    if (sortValue === 'a-z') {
      trackCards.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
    } else if (sortValue === 'z-a') {
      trackCards.sort((a, b) => b.dataset.title.localeCompare(a.dataset.title));
    } else if (sortValue === 'popular') {
      trackCards.sort(() => Math.random() - 0.5);
    } else if (sortValue === 'artist') {
      trackCards.sort((a, b) => a.dataset.artist.localeCompare(b.dataset.artist));
    } else if (sortValue === 'oldest') {
      trackCards.reverse();
    }
    musicGrid.innerHTML = '';
    trackCards.forEach(card => musicGrid.appendChild(card));
  });
}

// --- Pagination ---
function initPagination() {
  const trackCards = document.querySelectorAll('.track-card');
  const pageButtons = document.querySelectorAll('.page-numbers span');
  const prevBtn = document.querySelector('.prev-page');
  const nextBtn = document.querySelector('.next-page');
  const tracksPerPage = 8;
  let currentPage = 1;
  const totalPages = Math.ceil(trackCards.length / tracksPerPage);
  function showPage(page) {
    const start = (page - 1) * tracksPerPage;
    const end = page * tracksPerPage;
    trackCards.forEach((card, index) => {
      card.style.display = index >= start && index < end ? 'block' : 'none';
    });
    pageButtons.forEach((btn, i) => btn.classList.toggle('active', i === page - 1));
    currentPage = page;
  }
  pageButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => showPage(index + 1));
  });
  nextBtn?.addEventListener('click', () => {
    if (currentPage < totalPages) showPage(currentPage + 1);
  });
  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) showPage(currentPage - 1);
  });
  showPage(1);
}

// --- Latest Singles Play/Pause, Download, Share ---

// --- Latest Singles Pagination Fix ---
let currentPage = 0;
const tracksPerPage = 8;

function renderTracks() {
  const allTracks = Array.from(document.querySelectorAll('.track-card'));
  const grid = document.querySelector('.music-grid');
  if (!grid) return;

  // hide all
  allTracks.forEach(card => (card.style.display = 'none'));

  // show only 8
  const start = currentPage * tracksPerPage;
  const end = start + tracksPerPage;
  allTracks.slice(start, end).forEach(card => (card.style.display = 'block'));
}

// Next button
// document.querySelector('.next-page')?.addEventListener('click', () => {
//   const allTracks = document.querySelectorAll('.track-card').length;
//   const totalPages = Math.ceil(allTracks / tracksPerPage);
//   if (currentPage < totalPages - 1) {
//     currentPage++;
//     renderTracks();
//   }
// });

// // Prev button
// document.querySelector('.prev-page')?.addEventListener('click', () => {
//   if (currentPage > 0) {
//     currentPage--;
//     renderTracks();
//   }
// });

// Initial render
document.addEventListener('DOMContentLoaded', renderTracks);

// --- Horizontal Scroll Pagination ---
const musicGrid = document.querySelector('.music-grid');
const trackCards = document.querySelectorAll('.track-card');
const pageNumbers = document.querySelector('.page-numbers');
const nextBtn = document.querySelector('.next-page');
const prevBtn = document.querySelector('.prev-page');
const itemsPerPage = 8;
const totalPages = Math.ceil(trackCards.length / itemsPerPage);
// let currentPage = 0;
if (musicGrid && trackCards.length > 0 && pageNumbers && nextBtn && prevBtn) {
  renderPageNumbers();
  scrollToPage(0);
}


// --- Create page indicators ---
function renderPageNumbers() {
  pageNumbers.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const span = document.createElement("span");
    span.textContent = i + 1;
    if (i === currentPage) span.classList.add("active");
    span.addEventListener("click", () => scrollToPage(i));
    pageNumbers.appendChild(span);
  }
}

// --- Scroll to page ---
function scrollToPage(page) {
  const index = page * itemsPerPage;
  const card = trackCards[index];
  if (card) {
    card.scrollIntoView({ behavior: "smooth", inline: "start" });
    currentPage = page;
    updateActivePage();
  }
}

// --- Update active page ---
function updateActivePage() {
  [...pageNumbers.children].forEach((el, i) => {
    el.classList.toggle("active", i === currentPage);
  });
}

// --- Buttons ---
nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages - 1) {
    scrollToPage(currentPage + 1);
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    scrollToPage(currentPage - 1);
  }
});

// --- Detect scroll (manual scroll sync) ---
// musicGrid.addEventListener("scroll", () => {
//   const scrollLeft = musicGrid.scrollLeft;
//   const cardWidth = trackCards[0].offsetWidth + 15; // card + gap
//   const page = Math.round(scrollLeft / (cardWidth * itemsPerPage));
//   if (page !== currentPage) {
//     currentPage = page;
//     updateActivePage();
//   }
// });

// Initialize
renderPageNumbers();


function initSinglesPlayButtons() {
  const playBtns = Array.from(document.querySelectorAll('.track-card .play-btn'));
  const downloadBtns = document.querySelectorAll('.track-card .download-btn');
  const shareBtns = document.querySelectorAll('.track-card .share-btn');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playerThumbnail = document.getElementById('player-thumbnail');

  playBtns.forEach((btn, idx) => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.track-card');
      const url = card.dataset.url;
      const title = card.dataset.title;
      const artist = card.dataset.artist;
      const thumbnail = card.dataset.thumbnail;
      // Set global playlist and index
      globalTrackList = Array.from(document.querySelectorAll('.track-card')).map(card => ({
        url: card.dataset.url,
        title: card.dataset.title,
        artist: card.dataset.artist,
        thumbnail: card.dataset.thumbnail
      }));
      globalCurrentIndex = idx;
      // If already playing this track, pause
      if (!globalAudio.paused && globalCurrentIndex === idx) {
        globalAudio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
        return;
      }
      // Reset all play icons
      playBtns.forEach(b => b.innerHTML = '<i class="fas fa-play"></i>');
      // Play this track
      globalAudio.src = url;
      globalAudio.play();
      playerTitle.textContent = title;
      playerArtist.textContent = artist;
      playerThumbnail.src = thumbnail;
      btn.innerHTML = '<i class="fas fa-pause"></i>';
    });
  });

  // Download
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.track-card');
      const url = card.dataset.url;
      const title = card.dataset.title;
      const a = document.createElement('a');
      a.href = url;
      a.download = title + '.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });

  // Share
  shareBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const card = btn.closest('.track-card');
      const url = window.location.origin + '/' + card.dataset.url.replace(/^\.\.\//, '');
      const title = card.dataset.title;
      if (navigator.share) {
        navigator.share({ title, url });
      } else {
        navigator.clipboard.writeText(url);
        alert('Track link copied to clipboard!');
      }
    });
  });

  // Sync play/pause icons with global audio
  globalAudio.addEventListener('play', () => {
    playBtns.forEach((btn, idx) => {
      btn.innerHTML = idx === globalCurrentIndex ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    });
  });
  globalAudio.addEventListener('pause', () => {
    playBtns.forEach(btn => btn.innerHTML = '<i class="fas fa-play"></i>');
  });
}

// Helper to sync the global play/pause button icon
function updateGlobalPlayPauseUI() {
  const playPauseBtn = document.getElementById('play-pause');
  if (!playPauseBtn) return;
  playPauseBtn.querySelector('i').className = globalAudio.paused ? 'fas fa-play' : 'fas fa-pause';
}

globalAudio.addEventListener('play', updateGlobalPlayPauseUI);
globalAudio.addEventListener('pause', updateGlobalPlayPauseUI);

// --- Global Player Controls (Play, Pause, Next, Prev) ---
function initPlayerControls() {
  const audio = globalAudio;
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');
  const currentTime = document.getElementById('current-time');
  const totalTime = document.getElementById('total-time');
  const muteBtn = document.getElementById('mute-btn');
  const volumeSlider = document.querySelector('.volume-slider');
  const volumeFill = document.querySelector('.volume-fill');
  const playPauseBtn = document.getElementById('play-pause');
  const prevBtn = document.getElementById('prev-track');
  const nextBtn = document.getElementById('next-track');

  // Set default volume
  audio.volume = 1;
  if (volumeFill) volumeFill.style.width = '100%';

  // Play/Pause
  playPauseBtn?.addEventListener('click', function () {
    if (audio.paused) {
      audio.play();
      this.querySelector('i').className = 'fas fa-pause';
    } else {
      audio.pause();
      this.querySelector('i').className = 'fas fa-play';
    }
  });

  // Next/Prev
  nextBtn?.addEventListener('click', function () {
    if (globalTrackList.length === 0) return;
    globalCurrentIndex = (globalCurrentIndex + 1) % globalTrackList.length;
    playGlobalTrack(globalCurrentIndex);
  });
  prevBtn?.addEventListener('click', function () {
    if (globalTrackList.length === 0) return;
    globalCurrentIndex = (globalCurrentIndex - 1 + globalTrackList.length) % globalTrackList.length;
    playGlobalTrack(globalCurrentIndex);
  });

  // Progress Bar
  audio.addEventListener('timeupdate', () => {
    if (progressFill && audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + '%';
    }
    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
    if (totalTime) totalTime.textContent = formatTime(audio.duration);
  });

  progressBar?.addEventListener('click', function (e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration) {
      audio.currentTime = (clickX / width) * audio.duration;
    }
  });

  // Volume
  volumeSlider?.addEventListener('click', function (e) {
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const volume = Math.min(Math.max(clickX / width, 0), 1);
    audio.volume = volume;
    audio.muted = (volume === 0);
  });

  // Mute
  muteBtn?.addEventListener('click', () => {
    audio.muted = !audio.muted;
  });

  // Always update icon and bar on volume/mute change
  audio.addEventListener('volumechange', () => {
    if (volumeFill) {
      volumeFill.style.width = audio.muted ? '0%' : (audio.volume * 100) + '%';
    }
    muteBtn.querySelector('i').className =
      audio.muted || audio.volume === 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up';
  });

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const min = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${min}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}

function playGlobalTrack(index) {
  const track = globalTrackList[index];
  if (!track) return;
  globalAudio.src = track.url;
  globalAudio.play();
  document.getElementById('player-title').textContent = track.title;
  document.getElementById('player-artist').textContent = track.artist;
  document.getElementById('player-thumbnail').src = track.thumbnail;
}

// Update UI after setting global audio source
function updateGlobalTrackUI(trackData) {
  if (!trackData) return;
  document.getElementById('player-title').textContent = trackData.title;
  document.getElementById('player-artist').textContent = trackData.artist;
  document.getElementById('player-thumbnail').src = trackData.thumbnail;
}

updateGlobalPlayPauseUI();
if (globalTrackList.length > 0) {
  updateGlobalTrackUI(globalTrackList[globalCurrentIndex]);
}

// --- Album Modal Functionality ---
function initAlbumModal() {
  const modal = document.getElementById('album-modal');
  const closeModal = modal.querySelector('.close-modal');
  const viewButtons = document.querySelectorAll('.view-album-btn');
  const modalCover = document.getElementById('modal-album-cover');
  const modalTitle = document.getElementById('modal-album-title');
  const modalMeta = document.getElementById('modal-album-meta');
  const modalDesc = document.getElementById('modal-album-description');
  const modalTracks = document.getElementById('modal-album-tracks');
  let currentTrackIndex = 0;
  let isShuffling = false;
  let albumTracks = [];

  function updateModalTrackUI(index) {
    modalTracks.querySelectorAll('.play-track-btn').forEach((btn, i) => {
      btn.innerHTML = i === index && !globalAudio.paused
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
    });
  }

  function playNextTrack() {
    if (isShuffling) {
      let next;
      do {
        next = Math.floor(Math.random() * albumTracks.length);
      } while (next === currentTrackIndex && albumTracks.length > 1);
      currentTrackIndex = next;
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % albumTracks.length;
    }
    playTrackAtIndex(currentTrackIndex);
  }

  function playPrevTrack() {
    if (isShuffling) {
      let prev;
      do {
        prev = Math.floor(Math.random() * albumTracks.length);
      } while (prev === currentTrackIndex && albumTracks.length > 1);
      currentTrackIndex = prev;
    } else {
      currentTrackIndex = (currentTrackIndex - 1 + albumTracks.length) % albumTracks.length;
    }
    playTrackAtIndex(currentTrackIndex);
  }

  function playTrackAtIndex(index) {
    const track = albumTracks[index];
    if (!track) return;
    globalTrackList = albumTracks;
    globalCurrentIndex = index;
    globalAudio.src = track.url;
    globalAudio.play();
    document.getElementById('player-title').textContent = track.title;
    document.getElementById('player-artist').textContent = track.artist;
    document.getElementById('player-thumbnail').src = track.thumbnail;
    updateModalTrackUI(index);
    document.getElementById('modal-playpause-btn').innerHTML = '<i class="fas fa-pause"></i>';
  }

  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.album-card');
      const albumId = card.dataset.albumId;
      const album = albums[albumId];
      if (!album) return;

      modalCover.src = album.cover;
      modalTitle.textContent = album.title;
      modalMeta.textContent = `Released: ${album.releaseYear} • ${album.trackCount} tracks • ${album.duration}`;
      modalDesc.textContent = album.description;

      // Populate tracks
      modalTracks.innerHTML = '';
      album.tracks.forEach((track, idx) => {
        const div = document.createElement('div');
        div.className = 'modal-track';
        div.innerHTML = `
          <span>${track.title} - ${track.duration}</span>
          <button class="play-track-btn" data-index="${idx}"><i class="fas fa-play"></i></button>
          <button class="download-track-btn" data-url="${track.url}" data-title="${track.title}"><i class="fas fa-download"></i></button>
          <button class="share-track-btn" data-url="${track.url}" data-title="${track.title}"><i class="fas fa-share"></i></button>
        `;
        modalTracks.appendChild(div);
      });

      // Controls (insert only once)
      if (!document.getElementById('modal-prev-btn')) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'modal-player-controls';
        controlsDiv.innerHTML = `
          <button id="modal-prev-btn"><i class="fas fa-backward"></i></button>
          <button id="modal-playpause-btn"><i class="fas fa-play"></i></button>
          <button id="modal-next-btn"><i class="fas fa-forward"></i></button>
          <button id="modal-shuffle-btn"><i class="fas fa-random"></i></button>
          <span id="modal-duration"></span>
        `;
        modalTracks.parentElement.insertBefore(controlsDiv, modalTracks);
      }

      albumTracks = album.tracks;
      currentTrackIndex = 0;
      updateModalTrackUI(-1); // Reset play icons

      // Play/Pause, Next, Prev, Shuffle
      document.getElementById('modal-playpause-btn').onclick = function () {
        if (globalAudio.paused) {
          globalAudio.play();
          this.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
          globalAudio.pause();
          this.innerHTML = '<i class="fas fa-play"></i>';
        }
        updateModalTrackUI(currentTrackIndex);
      };
      document.getElementById('modal-next-btn').onclick = playNextTrack;
      document.getElementById('modal-prev-btn').onclick = playPrevTrack;
      document.getElementById('modal-shuffle-btn').onclick = function () {
        isShuffling = !isShuffling;
        this.classList.toggle('active', isShuffling);
      };

      // Track play buttons
      modalTracks.querySelectorAll('.play-track-btn').forEach((btn, idx) => {
        btn.onclick = function () {
          if (currentTrackIndex === idx && !globalAudio.paused && !globalAudio.ended) {
            globalAudio.pause();
            btn.innerHTML = '<i class="fas fa-play"></i>';
          } else {
            modalTracks.querySelectorAll('.play-track-btn').forEach(b => {
              b.innerHTML = '<i class="fas fa-play"></i>';
            });
            playTrackAtIndex(idx);
          }
        };
      });

      // Download
      modalTracks.querySelectorAll('.download-track-btn').forEach(btn => {
        btn.onclick = function () {
          const url = this.getAttribute('data-url');
          const a = document.createElement('a');
          a.href = url;
          a.download = this.getAttribute('data-title') + '.mp3';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      });

      // Share
      modalTracks.querySelectorAll('.share-track-btn').forEach(btn => {
        btn.onclick = function () {
          const url = window.location.origin + '/' + this.getAttribute('data-url').replace(/^\.\.\//, '');
          if (navigator.share) {
            navigator.share({
              title: this.getAttribute('data-title'),
              url: url
            });
          } else {
            navigator.clipboard.writeText(url);
            alert('Track link copied to clipboard!');
          }
        };
      });

      // Duration display
      const durationSpan = document.getElementById('modal-duration');
      globalAudio.ontimeupdate = function () {
        if (!isNaN(globalAudio.duration)) {
          const min = Math.floor(globalAudio.currentTime / 60);
          const sec = Math.floor(globalAudio.currentTime % 60).toString().padStart(2, '0');
          const totalMin = Math.floor(globalAudio.duration / 60);
          const totalSec = Math.floor(globalAudio.duration % 60).toString().padStart(2, '0');
          durationSpan.textContent = `${min}:${sec} / ${totalMin}:${totalSec}`;
        }
      };

      // Auto next
      globalAudio.onended = playNextTrack;

      modal.style.display = 'block';
    });
  });

  closeModal?.addEventListener('click', () => {
    modal.style.display = 'none';
    // Do NOT pause globalAudio here!
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      // Do NOT pause globalAudio here!
    }
  });
}

// --- Featured Albums Scroll Buttons and Dots ---
// This section assumes you have a scrollable container for featured albums
document.addEventListener("DOMContentLoaded", function() {
  // Use the correct class names for your featured albums section
  const scrollContainer = document.querySelector('.albums-scroll-container');
  const leftBtn = document.querySelector('.featured-albums-wrapper .scroll-left');
  const rightBtn = document.querySelector('.featured-albums-wrapper .scroll-right');
  const dots = document.querySelectorAll('.dot-indicators .dot');
  const items = document.querySelectorAll('.albums-scroll-container .album-card');

  if (!scrollContainer || !leftBtn || !rightBtn || !items.length) return;

  // How many items are visible at once?
  const itemsPerView = Math.floor(scrollContainer.offsetWidth / items[0].offsetWidth);

  function getCurrentPage() {
    const scrollLeft = scrollContainer.scrollLeft;
    const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(scrollContainer).gap || 0, 10);
    return Math.round(scrollLeft / itemWidth);
  }

  function setActiveDot(idx) {
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[idx]) dots[idx].classList.add('active');
  }

  // Update dot on scroll
  scrollContainer.addEventListener('scroll', () => {
    setActiveDot(getCurrentPage());
  });

  // Scroll buttons
  leftBtn.addEventListener('click', () => {
    const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(scrollContainer).gap || 0, 10);
    scrollContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    setTimeout(() => setActiveDot(getCurrentPage()), 400);
  });
  rightBtn.addEventListener('click', () => {
    const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(scrollContainer).gap || 0, 10);
    scrollContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
    setTimeout(() => setActiveDot(getCurrentPage()), 400);
  });

  // Dot click: scroll to that "page"
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(scrollContainer).gap || 0, 10);
      scrollContainer.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
      setActiveDot(idx);
    });
  });

  // Initial dot
  setActiveDot(0);
});

// ================= Hero Background Rotation =================
// Hero Slider JS
const slider = document.querySelector('.hero-slider');
let slideIndex = 0;
const totalSlides = slider.children.length;

function slideHero() {
    slideIndex = (slideIndex + 1) % totalSlides;
    slider.style.transform = `translateX(-${slideIndex * 100}%)`;
}

setInterval(slideHero, 5000);



// ================= Audio Player =================
const player = document.getElementById('global-player');
const playPauseBtn = document.getElementById('play-pause');
let audio = new Audio();
let currentTrackIndex = 0;
const tracks = Array.from(document.querySelectorAll('.track-card'));

function loadTrack(trackCard) {
    const url = trackCard.dataset.url;
    const title = trackCard.dataset.title;
    const artist = trackCard.dataset.artist;
    const thumbnail = trackCard.dataset.thumbnail;

    audio.src = url;
    document.getElementById('player-title').innerText = title;
    document.getElementById('player-artist').innerText = artist;
    document.getElementById('player-thumbnail').src = thumbnail;
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

tracks.forEach(trackCard => {
    trackCard.querySelector('.play-btn').addEventListener('click', () => {
        loadTrack(trackCard);
    });
});

playPauseBtn.addEventListener('click', () => {if (audio.paused) {audio.play(); playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';} else {audio.pause(); playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';}});

audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(tracks[currentTrackIndex]);
});
// ================= End Audio Player =================
