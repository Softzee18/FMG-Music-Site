// DOM Elements
const header = document.querySelector('header');
const newsletterForm = document.querySelector('.newsletter-form');

//Mobile Togle 
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

if (mobileMenuBtn && nav) {
  const icon = mobileMenuBtn.querySelector('i');
  const navLinks = nav.querySelectorAll('a');

  // Toggle nav on menu button click
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent document click listener
    nav.classList.toggle('active');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  // Close nav when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    });
  });
  

  // Optionally: Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      nav.classList.remove('active');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
      }
    }
  });

  
}


// Newsletter Form
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (!emailInput) return;
        const email = emailInput.value;
        try {
            await subscribeToNewsletter(email);
            showNotification("Success! You've been subscribed to our newsletter.", 'success');
            newsletterForm.reset();
        } catch (error) {
            showNotification('Oops! Something went wrong. Please try again.', 'error');
        }
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<p>${message}</p><button class="notification-close">&times;</button>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
    notification.querySelector('.notification-close')?.addEventListener('click', () => notification.remove());
}

function subscribeToNewsletter(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.5) {
                resolve(); 
                showNotification('You have been subscribed to our newsletter.', 'success');
            } else {
                reject('Failed to subscribe to newsletter.');
                showNotification('Oops! Something went wrong. Please try again.', 'error');
            }
        }, 1000);
    });
}

// Upload Modal
const uploadModal = document.getElementById('upload-modal');
const uploadBtn = document.getElementById('upload-btn');
const closeModal = document.querySelector('.close-modal');
const uploadForm = document.getElementById('upload-form');
const contentType = document.getElementById('content-type');
const title = document.getElementById('title');
const description = document.getElementById('description');
const fileUpload = document.getElementById('media-upload');
const thumbnail = document.getElementById('cover-upload');

uploadBtn?.addEventListener('click', () => uploadModal.style.display = 'block');
closeModal?.addEventListener('click', () => uploadModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === uploadModal) uploadModal.style.display = 'none'; });

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && uploadModal.style.display === 'block') {
        uploadModal.style.display = 'none';
    }
});
     

// Track Card Events
const trackCards = document.querySelectorAll('.track-card');
trackCards.forEach(card => {
    const playBtn = card.querySelector('.play-btn');
    const downloadBtn = card.querySelector('.action-btn:first-child');
    const shareBtn = card.querySelector('.action-btn:last-child');

    playBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.trackId;
        if (typeof playTrack === 'function') playTrack(id);
    });

    downloadBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.trackId;
        if (typeof downloadTrack === 'function') downloadTrack(id);
    });

    shareBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.trackId;
        shareTrack(id);
    });
});

// Share Track
async function shareTrack(trackId) {
    try {
        const trackData = await getTrackData(trackId);
        const url = `${window.location.origin}/track/${trackId}`;
        if (navigator.share) {
            await navigator.share({ title: trackData.title, text: `Check out this track: ${trackData.title}`, url });
            showNotification('Thanks for sharing!', 'success');
        } else {
            copyToClipboard(url);
            showNotification('Link copied to clipboard!', 'success');
        }
    } catch (err) {
        showNotification('Error sharing track', 'error');
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

async function getTrackData(trackId) {
    return { title: 'Track Title', artist: 'Artist Name', url: 'track-url' };
}

async function subscribeToNewsletter(email) {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Performance
window.addEventListener('load', () => {
    const perf = window.performance.getEntriesByType('navigation')[0];
    if (perf) {
        const loadTime = perf.loadEventEnd - perf.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

