import { AuthService } from './auth.js';
import { AuthMiddleware } from './middleware.js';

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
    await AuthMiddleware.redirectIfAuthenticated();
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('errorMessage');
        
        try {
            const { user, session } = await AuthService.signIn({ email, password });
            console.log('Login successful');
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });
}

// Handle password reset request
const resetForm = document.getElementById('resetPasswordForm');
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        const messageElement = document.getElementById('resetMessage');
        
        try {
            await AuthService.resetPassword(email);
            messageElement.textContent = 'Password reset instructions sent to your email';
            messageElement.style.display = 'block';
            messageElement.classList.remove('error');
            messageElement.classList.add('success');
        } catch (error) {
            messageElement.textContent = error.message;
            messageElement.style.display = 'block';
            messageElement.classList.remove('success');
            messageElement.classList.add('error');
        }
    });
}
