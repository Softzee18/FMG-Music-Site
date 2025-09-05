// Admin login functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminLogin();
});

function initializeAdminLogin() {
    setupLoginForm();
    checkExistingAuth();
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function checkExistingAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Redirect to admin dashboard if already logged in
        window.location.href = '/admin';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    const spinner = loginBtn.querySelector('.fa-spinner');
    const buttonText = loginBtn.querySelector('span');
    
    // Clear previous errors
    errorMessage.textContent = '';
    
    // Show loading state
    loginBtn.disabled = true;
    spinner.style.display = 'inline-block';
    buttonText.textContent = 'Signing in...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            
            // Show success message
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
            
        } else {
            // Show error message
            errorMessage.textContent = data.error || 'Login failed';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Network error. Please try again.';
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        spinner.style.display = 'none';
        buttonText.textContent = 'Sign In';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles for notification
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
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#03dac6';
            break;
        case 'error':
            notification.style.backgroundColor = '#cf6679';
            break;
        default:
            notification.style.backgroundColor = '#6200ea';
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove notification after 3 seconds
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