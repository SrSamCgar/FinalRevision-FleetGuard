import { AuthService } from './auth.js';
import { AuthMiddleware } from './middleware.js';

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
    await AuthMiddleware.redirectIfAuthenticated();
});

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('name').value;
        const errorElement = document.getElementById('errorMessage');
        
        // Basic validation
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'block';
            return;
        }
        
        try {
            const { user, worker } = await AuthService.signUp({
                email,
                password,
                name,
                role: 'user' // Default role
            });
            
            console.log('Registration successful');
            // Redirect to login page or show success message
            window.location.href = '/login.html?registered=true';
        } catch (error) {
            console.error('Registration error:', error);
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });
}
