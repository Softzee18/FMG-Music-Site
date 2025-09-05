// Admin dashboard functionality
let currentUser = null;
let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    checkAuthentication();
    setupNavigation();
    setupModals();
    setupForms();
    loadDashboardData();
}

function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
        window.location.href = '/admin/login';
        return;
    }
    
    currentUser = JSON.parse(user);
    
    // Update user info in header
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        userEmail.textContent = currentUser.email;
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const logoutBtn = document.getElementById('logout-btn');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding tab
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function showTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    }
    
    currentTab = tabId;
    
    // Load data for the selected tab
    switch (tabId) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'music':
            loadMusicList();
            break;
        case 'videos':
            loadVideosList();
            break;
        case 'events':
            loadEventsList();
            break;
        case 'comments':
            loadCommentsList();
            break;
    }
}

function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const addButtons = {
        'add-music-btn': 'music-modal',
        'add-video-btn': 'video-modal',
        'add-event-btn': 'event-modal'
    };
    
    // Setup add buttons
    Object.keys(addButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        const modalId = addButtons[buttonId];
        
        if (button) {
            button.addEventListener('click', () => openModal(modalId));
        }
    });
    
    // Setup close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function setupForms() {
    const musicForm = document.getElementById('music-form');
    const videoForm = document.getElementById('video-form');
    const eventForm = document.getElementById('event-form');
    
    if (musicForm) {
        musicForm.addEventListener('submit', handleMusicUpload);
    }
    
    if (videoForm) {
        videoForm.addEventListener('submit', handleVideoSubmit);
    }
    
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
}

async function loadDashboardData() {
    await loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Load all data to get counts
        const [musicRes, videosRes, eventsRes, commentsRes] = await Promise.all([
            fetch('/api/music'),
            fetch('/api/videos'),
            fetch('/api/events'),
            fetch('/api/comments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        const music = await musicRes.json();
        const videos = await videosRes.json();
        const events = await eventsRes.json();
        const comments = commentsRes.ok ? await commentsRes.json() : [];
        
        // Update stats
        document.getElementById('total-music').textContent = music.length;
        document.getElementById('total-videos').textContent = videos.length;
        document.getElementById('total-events').textContent = events.length;
        document.getElementById('total-comments').textContent = comments.length;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadMusicList() {
    const musicList = document.getElementById('music-list');
    if (!musicList) return;
    
    try {
        const response = await fetch('/api/music');
        const music = await response.json();
        
        let html = '';
        
        music.forEach(track => {
            html += `
                <div class="content-item">
                    <div class="item-info">
                        <img src="${track.cover_url}" alt="${track.title}">
                        <div class="item-details">
                            <h4>${track.title}</h4>
                            <p>${track.artist} • ${track.genre}</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="play-btn" onclick="playTrack('${track.audio_url}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="edit-btn" onclick="editMusic(${track.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteMusic(${track.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        musicList.innerHTML = html || '<p>No music tracks found</p>';
        
    } catch (error) {
        console.error('Error loading music list:', error);
        musicList.innerHTML = '<p>Error loading music</p>';
    }
}

async function loadVideosList() {
    const videosList = document.getElementById('videos-list');
    if (!videosList) return;
    
    try {
        const response = await fetch('/api/videos');
        const videos = await response.json();
        
        let html = '';
        
        videos.forEach(video => {
            html += `
                <div class="content-item">
                    <div class="item-info">
                        <img src="${video.thumbnail_url}" alt="${video.title}">
                        <div class="item-details">
                            <h4>${video.title}</h4>
                            <p>${video.category}</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="play-btn" onclick="viewVideo('${video.video_url}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn" onclick="editVideo(${video.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteVideo(${video.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        videosList.innerHTML = html || '<p>No videos found</p>';
        
    } catch (error) {
        console.error('Error loading videos list:', error);
        videosList.innerHTML = '<p>Error loading videos</p>';
    }
}

async function loadEventsList() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;
    
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        
        let html = '';
        
        events.forEach(event => {
            const eventDate = new Date(event.event_date);
            const formattedDate = eventDate.toLocaleDateString();
            
            html += `
                <div class="content-item">
                    <div class="item-info">
                        <img src="${event.image_url}" alt="${event.title}">
                        <div class="item-details">
                            <h4>${event.title}</h4>
                            <p>${event.location} • ${formattedDate}</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editEvent(${event.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteEvent(${event.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        eventsList.innerHTML = html || '<p>No events found</p>';
        
    } catch (error) {
        console.error('Error loading events list:', error);
        eventsList.innerHTML = '<p>Error loading events</p>';
    }
}

async function loadCommentsList() {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/comments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load comments');
        }
        
        const comments = await response.json();
        
        let html = '';
        
        comments.forEach(comment => {
            const statusClass = comment.status === 'approved' ? 'success' : 
                              comment.status === 'rejected' ? 'error' : 'warning';
            
            html += `
                <div class="content-item">
                    <div class="item-info">
                        <div class="item-details">
                            <h4>${comment.name}</h4>
                            <p>${comment.email} • ${comment.page}</p>
                            <p class="comment-message">${comment.message}</p>
                            <span class="status-badge ${statusClass}">${comment.status}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="updateCommentStatus(${comment.id}, 'approved')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="delete-btn" onclick="updateCommentStatus(${comment.id}, 'rejected')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        commentsList.innerHTML = html || '<p>No comments found</p>';
        
    } catch (error) {
        console.error('Error loading comments list:', error);
        commentsList.innerHTML = '<p>Error loading comments</p>';
    }
}

// Form handlers
async function handleMusicUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch('/api/music', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            showNotification('Music uploaded successfully!', 'success');
            closeModal('music-modal');
            loadMusicList();
            loadDashboardStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Upload failed', 'error');
        }
        
    } catch (error) {
        console.error('Music upload error:', error);
        showNotification('Upload failed', 'error');
    }
}

async function handleVideoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const token = localStorage.getItem('adminToken');
    
    const videoData = {
        title: formData.get('title'),
        video_url: formData.get('video_url'),
        thumbnail_url: formData.get('thumbnail_url'),
        category: formData.get('category'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch('/api/videos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });
        
        if (response.ok) {
            showNotification('Video added successfully!', 'success');
            closeModal('video-modal');
            loadVideosList();
            loadDashboardStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add video', 'error');
        }
        
    } catch (error) {
        console.error('Video submit error:', error);
        showNotification('Failed to add video', 'error');
    }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            showNotification('Event created successfully!', 'success');
            closeModal('event-modal');
            loadEventsList();
            loadDashboardStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to create event', 'error');
        }
        
    } catch (error) {
        console.error('Event submit error:', error);
        showNotification('Failed to create event', 'error');
    }
}

// Action handlers
async function deleteMusic(id) {
    if (!confirm('Are you sure you want to delete this track?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`/api/music/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showNotification('Track deleted successfully!', 'success');
            loadMusicList();
            loadDashboardStats();
        } else {
            showNotification('Failed to delete track', 'error');
        }
        
    } catch (error) {
        console.error('Delete music error:', error);
        showNotification('Failed to delete track', 'error');
    }
}

async function deleteVideo(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`/api/videos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showNotification('Video deleted successfully!', 'success');
            loadVideosList();
            loadDashboardStats();
        } else {
            showNotification('Failed to delete video', 'error');
        }
        
    } catch (error) {
        console.error('Delete video error:', error);
        showNotification('Failed to delete video', 'error');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showNotification('Event deleted successfully!', 'success');
            loadEventsList();
            loadDashboardStats();
        } else {
            showNotification('Failed to delete event', 'error');
        }
        
    } catch (error) {
        console.error('Delete event error:', error);
        showNotification('Failed to delete event', 'error');
    }
}

async function updateCommentStatus(id, status) {
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`/api/comments/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Comment ${status}!`, 'success');
            loadCommentsList();
        } else {
            showNotification('Failed to update comment', 'error');
        }
        
    } catch (error) {
        console.error('Update comment error:', error);
        showNotification('Failed to update comment', 'error');
    }
}

function playTrack(audioUrl) {
    window.open(audioUrl, '_blank');
}

function viewVideo(videoUrl) {
    window.open(videoUrl, '_blank');
}

function editMusic(id) {
    // Implementation for editing music
    showNotification('Edit functionality coming soon!', 'info');
}

function editVideo(id) {
    // Implementation for editing video
    showNotification('Edit functionality coming soon!', 'info');
}

function editEvent(id) {
    // Implementation for editing event
    showNotification('Edit functionality coming soon!', 'info');
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#03dac6';
            break;
        case 'error':
            notification.style.backgroundColor = '#cf6679';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#6200ea';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Make functions available globally
window.deleteMusic = deleteMusic;
window.deleteVideo = deleteVideo;
window.deleteEvent = deleteEvent;
window.updateCommentStatus = updateCommentStatus;
window.playTrack = playTrack;
window.viewVideo = viewVideo;
window.editMusic = editMusic;
window.editVideo = editVideo;
window.editEvent = editEvent;