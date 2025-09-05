// Paramanchi - Video Gallery with Toggle Show More/Less and Filters

// Filter logic
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;

    document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.video-card').forEach(card => {
      const match = selected === 'all' || card.dataset.category === selected;
      card.style.display = match ? 'block' : 'none';
      card.classList.remove('hidden');
    });

    // Reset Show More button
    const btn = document.getElementById('show-more-btn');
    if (btn) btn.textContent = 'show more';
  });
});

// Click card to update featured player
const mainPlayer = document.getElementById('main-video');
document.querySelectorAll('.video-card').forEach(card => {
  card.addEventListener('click', () => {
    const rawLink = card.dataset.src;
    const match = rawLink.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/);
    if (match && match[1]) {
      const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      mainPlayer.src = embedUrl;
      window.scrollTo({ top: document.querySelector('.featured-video').offsetTop - 60, behavior: 'smooth' });
    } else {
      alert('Invalid YouTube link format.');
    }
  });
});

// Show More / Show Less logic
let showMoreExpanded = false;
const showMoreBtn = document.getElementById('show-more-btn');

if (showMoreBtn) {
  showMoreBtn.addEventListener('click', () => {
    const hiddenCards = document.querySelectorAll('.video-card.hidden');
    hiddenCards.forEach(card => {
      card.classList.toggle('visible');
      card.style.display = card.classList.contains('visible') ? 'block' : 'none';
    });

    showMoreExpanded = !showMoreExpanded;
    showMoreBtn.textContent = showMoreExpanded ? 'show Less ' : 'view more';
  });
}
