// DOM Elements
const header = document.querySelector('header');
// const newsletterForm = document.querySelector('.newsletter-form');

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

// ================= Newsletter Subscription =================
const newsletterForm = document.getElementById('newsletter-form');
const emailInput = document.getElementById('email-input');  
const messageDiv = document.getElementById('subscription-message');

newsletterForm.addEventListener('submit', function(e) { 
    e.preventDefault();
    const email = emailInput.value;
    if (validateEmail(email)) {
        // Simulate successful subscription
        messageDiv.style.color = 'green';
        messageDiv.innerText = 'Thank you for subscribing!';
        emailInput.value = '';
    } else {
        messageDiv.style.color = 'red';
        messageDiv.innerText = 'Please enter a valid email address.';
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
// ================= End Newsletter Subscription =================

// ================= Notification System =================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
}
// ================= End Notification System =================

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
// Smooth Scrolling for Featured Section
const scrollContainer = document.querySelector('.featured-scroll-container');
const scrollLeftBtn = document.querySelector('.scroll-left');
const scrollRightBtn = document.querySelector('.scroll-right');

scrollLeftBtn.addEventListener('click', () => {
  scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
});

scrollRightBtn.addEventListener('click', () => {
  scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
});

// Lazy Load Images
const lazyImages = document.querySelectorAll('img.lazy');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ================= Music Library Pagination =================