import UI from './UI.js';

let uiInstance = null;

async function verificarSesion() {
    try {
        const response = await fetch('/api/check-session');
        const data = await response.json();
        if (data.loggedIn) {
            // Si hay sesión, mostrar la app de nómina
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            if (!uiInstance) {
                uiInstance = new UI();
            }
        } else {
            // No hay sesión: mostrar login
            document.getElementById('loginContainer').style.display = 'flex';
            document.getElementById('appContainer').style.display = 'none';
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                await verificarSesion(); // recargar estado
            } else {
                loginError.textContent = data.message || 'Credenciales incorrectas';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.textContent = 'Error de conexión con el servidor';
            loginError.style.display = 'block';
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            // Limpiar instancia UI si existe
            if (uiInstance) {
                // opcional: limpiar eventos, etc.
                uiInstance = null;
            }
            await verificarSesion();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    setupLogout();
    verificarSesion();
});
