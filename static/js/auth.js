/**
 * auth.js - Authentication JavaScript for HDI Prediction System
 * Enhanced with SweetAlert2 for professional UI notifications
 */

// ── Password Toggle Functionality ─────────────────────────────────────────────
function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    
    if (toggle && input) {
        toggle.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
            }
        });
    }
}

// ── Password Strength Checker ─────────────────────────────────────────────────
function checkPasswordStrength(password) {
    let strength = 0;
    const feedback = [];
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    let level = '';
    if (strength < 50) level = 'weak';
    else if (strength < 75) level = 'medium';
    else if (strength < 100) level = 'strong';
    else level = 'very-strong';
    
    return { strength, level };
}

// ── Update Password Strength UI ───────────────────────────────────────────────
function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (strengthFill && strengthText) {
        const { strength, level } = checkPasswordStrength(password);
        
        strengthFill.className = 'strength-fill ' + level;
        
        const labels = {
            'weak': 'Weak - Add more characters',
            'medium': 'Medium - Good, but could be stronger',
            'strong': 'Strong - Almost there!',
            'very-strong': 'Very Strong - Excellent!'
        };
        
        strengthText.textContent = labels[level] || 'Password strength';
    }
}

// ── Show Error Message ───────────────────────────────────────────────────────
function showError(message) {
    const errorBox = document.getElementById('formError');
    const errorMsg = document.getElementById('formErrorMsg');
    
    if (errorBox && errorMsg) {
        errorMsg.textContent = message;
        errorBox.classList.remove('d-none');
    }
}

// ── Hide Error Message ───────────────────────────────────────────────────────
function hideError() {
    const errorBox = document.getElementById('formError');
    if (errorBox) {
        errorBox.classList.add('d-none');
    }
}

// ── Show SweetAlert2 Success Popup (Auto-redirect) ───────────────────────────
function showSuccessAlert(title, text, redirectUrl) {
    console.log("[DEBUG] showSuccessAlert called - Title:", title, "Redirect:", redirectUrl);
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
        customClass: {
            popup: 'swal2-dark-popup',
            title: 'swal2-dark-title',
            htmlContainer: 'swal2-dark-text'
        }
    }).then(() => {
        console.log("[DEBUG] Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
    });
}

// ── Show SweetAlert2 Error Popup ───────────────────────────────────────────────
function showErrorAlert(title, text) {
    console.log("[DEBUG] showErrorAlert called - Title:", title, "Text:", text);
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#6366f1',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
        customClass: {
            popup: 'swal2-dark-popup',
            title: 'swal2-dark-title',
            htmlContainer: 'swal2-dark-text'
        }
    });
}

// ── Show SweetAlert2 Info Popup ───────────────────────────────────────────────
function showInfoAlert(title, text) {
    console.log("[DEBUG] showInfoAlert called - Title:", title);
    Swal.fire({
        icon: 'info',
        title: title,
        text: text,
        confirmButtonText: 'OK',
        confirmButtonColor: '#6366f1',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
        customClass: {
            popup: 'swal2-dark-popup',
            title: 'swal2-dark-title',
            htmlContainer: 'swal2-dark-text'
        }
    });
}

// ── Show Session Expired Alert ────────────────────────────────────────────────
function showSessionExpiredAlert() {
    console.log("[DEBUG] showSessionExpiredAlert called");
    Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again to continue.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#6366f1',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
        customClass: {
            popup: 'swal2-dark-popup',
            title: 'swal2-dark-title',
            htmlContainer: 'swal2-dark-text'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/login';
        }
    });
}

// ── Initialize Login Page ───────────────────────────────────────────────────
function initLoginPage() {
    console.log("[DEBUG] initLoginPage called");
    setupPasswordToggle('passwordToggle', 'password');
    
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            hideError();
            
            const loginInput = form.querySelector('[name="login_input"]');
            const password = form.querySelector('[name="password"]');
            
            if (!loginInput.value.trim() || !password.value) {
                e.preventDefault();
                showError('Please fill in all fields.');
            }
        });
    }
    
    // Check for flash messages and show SweetAlert
    const flashSuccess = document.querySelector('.alert-success');
    const flashDanger = document.querySelector('.alert-danger');
    const flashWarning = document.querySelector('.alert-warning');
    
    if (flashSuccess && flashSuccess.textContent.includes('Welcome back')) {
        const userName = flashSuccess.textContent.match(/Welcome back, (.+?)!/)?.[1] || 'User';
        console.log("[DEBUG] Login success detected, showing welcome alert");
        showSuccessAlert('Welcome Back!', `Hello ${userName}, you have successfully logged in.`, '/dashboard');
    }
    
    if (flashDanger) {
        const errorText = flashDanger.textContent;
        console.log("[DEBUG] Login error detected:", errorText);
        if (errorText.includes('Invalid') || errorText.includes('Incorrect')) {
            showErrorAlert('Login Failed', 'Invalid username or password. Please try again.');
        }
    }
    
    // Only show session expired if we're on login page and redirected from a protected route
    // Check for a specific query parameter or session expired flag
    if (flashWarning && flashWarning.textContent.includes('Please login') && window.location.search.includes('session=expired')) {
        showSessionExpiredAlert();
    }
}

// ── Initialize Register Page ────────────────────────────────────────────────
function initRegisterPage() {
    console.log("[DEBUG] initRegisterPage called");
    setupPasswordToggle('passwordToggle', 'password');
    setupPasswordToggle('confirmPasswordToggle', 'confirm_password');
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            hideError();
            
            const password = form.querySelector('[name="password"]');
            const confirmPassword = form.querySelector('[name="confirm_password"]');
            
            if (password.value !== confirmPassword.value) {
                e.preventDefault();
                showError('Passwords do not match.');
            }
        });
    }
    
    // Check for flash messages and show SweetAlert
    const flashSuccess = document.querySelector('.alert-success');
    const flashDanger = document.querySelector('.alert-danger');
    
    if (flashSuccess && flashSuccess.textContent.includes('Registration successful')) {
        console.log("[DEBUG] Registration success detected, showing success alert");
        showSuccessAlert('Account Created Successfully!', 'Your account has been created successfully. Please login to continue.', '/login');
    }
    
    if (flashDanger) {
        const errorText = flashDanger.textContent;
        console.log("[DEBUG] Registration error detected:", errorText);
        if (errorText.includes('Username already exists')) {
            showErrorAlert('Username Already Exists', 'The username you entered is already taken. Please choose another one.');
        } else if (errorText.includes('Email already registered')) {
            showErrorAlert('Email Already Registered', 'This email is already registered. Please login instead.');
        } else if (errorText.includes('All fields are required') || errorText.includes('valid email') || errorText.includes('Password')) {
            showErrorAlert('Registration Failed', errorText);
        }
    }
}

// ── Initialize Forgot Password Page ─────────────────────────────────────────
function initForgotPasswordPage() {
    console.log("[DEBUG] initForgotPasswordPage called");
    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            hideError();
            
            const email = form.querySelector('[name="email"]');
            if (!email.value.trim()) {
                e.preventDefault();
                showError('Please enter your email address.');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                e.preventDefault();
                showError('Please enter a valid email address.');
            }
        });
    }
    
    // Check for flash messages
    const flashSuccess = document.querySelector('.alert-success');
    const flashDanger = document.querySelector('.alert-danger');
    
    if (flashSuccess) {
        showInfoAlert('Email Sent', flashSuccess.textContent);
    }
    
    if (flashDanger) {
        showErrorAlert('Error', flashDanger.textContent);
    }
}

// ── Initialize Profile Page ─────────────────────────────────────────────────
function initProfilePage() {
    console.log("[DEBUG] initProfilePage called");
    setupPasswordToggle('currentPasswordToggle', 'current_password');
    setupPasswordToggle('newPasswordToggle', 'new_password');
    setupPasswordToggle('confirmPasswordToggle2', 'confirm_password');
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            const errorBox = document.getElementById('passwordFormError');
            const errorMsg = document.getElementById('passwordFormErrorMsg');
            
            if (errorBox && errorMsg) {
                errorBox.classList.add('d-none');
            }
            
            const newPassword = passwordForm.querySelector('[name="new_password"]');
            const confirmPassword = passwordForm.querySelector('[name="confirm_password"]');
            
            if (newPassword.value !== confirmPassword.value) {
                e.preventDefault();
                if (errorBox && errorMsg) {
                    errorMsg.textContent = 'New passwords do not match.';
                    errorBox.classList.remove('d-none');
                }
            }
        });
    }
    
    // Check for flash messages on profile page
    const flashSuccess = document.querySelector('.alert-success');
    const flashDanger = document.querySelector('.alert-danger');
    
    if (flashSuccess) {
        showInfoAlert('Success', flashSuccess.textContent);
    }
    
    if (flashDanger) {
        showErrorAlert('Error', flashDanger.textContent);
    }
}

// ── Initialize Logout Confirmation ───────────────────────────────────────────
function initLogoutConfirmation() {
    console.log("[DEBUG] initLogoutConfirmation called");
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                icon: 'question',
                title: 'Are you sure you want to logout?',
                text: 'You will be redirected to the home page.',
                showCancelButton: true,
                confirmButtonText: 'Yes, Logout',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#ef4444',
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
                customClass: {
                    popup: 'swal2-dark-popup',
                    title: 'swal2-dark-title',
                    htmlContainer: 'swal2-dark-text'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/logout';
                }
            });
        });
    }
}

// ── Initialize Dashboard Page ─────────────────────────────────────────────
function initDashboardPage() {
    console.log("[DEBUG] initDashboardPage called");
    // Check for flash messages and show SweetAlert
    const flashSuccess = document.querySelector('.alert-success');
    
    if (flashSuccess && flashSuccess.textContent.includes('Welcome back')) {
        const userName = flashSuccess.textContent.match(/Welcome back, (.+?)!/)?.[1] || 'User';
        // Show welcome message without redirect (user is already on dashboard)
        Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: `Hello ${userName}, you have successfully logged in.`,
            confirmButtonText: 'Continue',
            confirmButtonColor: '#6366f1',
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e1b4b' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1e293b',
            customClass: {
                popup: 'swal2-dark-popup',
                title: 'swal2-dark-title',
                htmlContainer: 'swal2-dark-text'
            }
        });
    }
}

// ── Initialize All Auth Pages ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    console.log("[DEBUG] DOMContentLoaded - Initializing auth pages");
    
    // Only initialize the relevant page based on which elements exist
    if (document.getElementById('loginForm')) {
        console.log("[DEBUG] Login form found, initializing login page");
        initLoginPage();
    }
    
    if (document.getElementById('registerForm')) {
        console.log("[DEBUG] Register form found, initializing register page");
        initRegisterPage();
    }
    
    if (document.getElementById('forgotPasswordForm')) {
        console.log("[DEBUG] Forgot password form found, initializing forgot password page");
        initForgotPasswordPage();
    }
    
    if (document.getElementById('passwordForm')) {
        console.log("[DEBUG] Password form found, initializing profile page");
        initProfilePage();
    }
    
    // Check if we're on dashboard by looking for dashboard-specific elements
    if (document.querySelector('.stat-card-dashboard') && !document.getElementById('loginForm') && !document.getElementById('registerForm')) {
        console.log("[DEBUG] Dashboard elements found, initializing dashboard page");
        initDashboardPage();
    }
    
    // Logout button is in navbar, so check globally
    initLogoutConfirmation();
});