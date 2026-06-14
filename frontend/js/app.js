import UI from './UI.js';

let uiInstance = null;

// Función para guardar preferencias en localStorage
function guardarPreferencia(key, value) {
    localStorage.setItem(key, value);
}

function cargarPreferencia(key, defaultValue = false) {
    const valor = localStorage.getItem(key);
    return valor !== null ? valor === 'true' : defaultValue;
}

// Aplicar modos según preferencias guardadas
function aplicarModosGuardados() {
    const appContainer = document.getElementById('appContainer');
    if (!appContainer) return;
    
    // Modo nocturno
    if (cargarPreferencia('nightMode')) {
        appContainer.classList.add('night-mode');
        const nightBtn = document.getElementById('nightModeBtn');
        if (nightBtn) nightBtn.textContent = '☀️';
    }
    
    // Protección visual
    if (cargarPreferencia('visualProtection')) {
        appContainer.classList.add('visual-protection');
        const visualBtn = document.getElementById('visualProtectionBtn');
        if (visualBtn) visualBtn.classList.add('active');
    }
}

function setupModos() {
    const appContainer = document.getElementById('appContainer');
    const nightBtn = document.getElementById('nightModeBtn');
    const visualBtn = document.getElementById('visualProtectionBtn');
    
    if (!nightBtn || !visualBtn) return;
    
    // Modo nocturno
    nightBtn.addEventListener('click', () => {
        const isNightMode = appContainer.classList.toggle('night-mode');
        // Cambiar el ícono y texto del botón
        nightBtn.innerHTML = isNightMode ? '☀️ <span class="btn-text">Diurno</span>' : '🌙 <span class="btn-text">Nocturno</span>';
        guardarPreferencia('nightMode', isNightMode);
        mostrarNotificacion(isNightMode ? '🌙 Modo nocturno activado' : '☀️ Modo diurno activado');
    });
    
    // Protección visual
    visualBtn.addEventListener('click', () => {
        const isProtected = appContainer.classList.toggle('visual-protection');
        visualBtn.classList.toggle('active', isProtected);
        guardarPreferencia('visualProtection', isProtected);
        
        if (isProtected) {
            visualBtn.style.background = '#f59e0b';
            visualBtn.style.color = '#78350f';
            mostrarNotificacion('👁️ Protección visual activada');
        } else {
            visualBtn.style.background = '';
            visualBtn.style.color = '';
            mostrarNotificacion('👁️ Protección visual desactivada');
        }
    });
    
    // Inicializar texto de botones según preferencias guardadas
    if (cargarPreferencia('nightMode')) {
        nightBtn.innerHTML = '☀️ <span class="btn-text">Diurno</span>';
    } else {
        nightBtn.innerHTML = '🌙 <span class="btn-text">Nocturno</span>';
    }
}

// Función para mostrar notificaciones temporales
function mostrarNotificacion(mensaje) {
    // Eliminar notificación existente
    const notificacionExistente = document.querySelector('.floating-notification');
    if (notificacionExistente) {
        notificacionExistente.remove();
    }
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'floating-notification';
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: white;
        padding: 8px 16px;
        border-radius: 30px;
        font-size: 0.85rem;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        white-space: nowrap;
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(notificacion);
    
    // Mostrar notificación
    setTimeout(() => { notificacion.style.opacity = '1'; }, 10);
    
    // Ocultar y eliminar después de 2 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 300);
    }, 2000);
}

async function verificarSesion() {
    try {
        const response = await fetch('/api/check-session');
        const data = await response.json();
        
        if (data.loggedIn) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            
            // Aplicar modos guardados después de mostrar el contenedor
            aplicarModosGuardados();
            setupModos();
            
            if (!uiInstance) {
                uiInstance = new UI();
            }
        } else {
            document.getElementById('loginContainer').style.display = 'flex';
            document.getElementById('appContainer').style.display = 'none';
            if (uiInstance) {
                uiInstance = null;
            }
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const passwordInput = document.getElementById('loginPassword');
    const toggleBtn = document.getElementById('togglePassword');

    // Funcionalidad para mostrar/ocultar contraseña
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.textContent = isPassword ? '🙈' : '👁️';
            toggleBtn.title = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
        });
    }

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
                await verificarSesion();
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
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            if (uiInstance) {
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
