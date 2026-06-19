const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('loginPassword');
const toggleBtn = document.getElementById('togglePassword');

// Toggle de visibilidad
if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? '🙈' : '👁️';
        toggleBtn.title = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
    });
}

// Envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = passwordInput.value.trim();

    loginError.style.display = 'none';
    loginError.textContent = '';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/dashboard.html';
        } else {
            loginError.textContent = data.message || 'Credenciales incorrectas';
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
    } catch (error) {
        loginError.textContent = 'Error de conexión con el servidor';
        loginError.style.display = 'block';
    }
});
