import UI from './UI.js';
import { obtenerEmpleados } from './api.js';

let uiInstance = null;
let currentView = 'empleados';

window.cargarVista = cargarVista;

function guardarPreferencia(key, value) {
    localStorage.setItem(key, value);
}

function cargarPreferencia(key, defaultValue = false) {
    const valor = localStorage.getItem(key);
    return valor !== null ? valor === 'true' : defaultValue;
}

function aplicarModos() {
    const isNight = cargarPreferencia('nightMode');
    const isVisual = cargarPreferencia('visualProtection');
    document.body.classList.toggle('night-mode', isNight);
    document.body.classList.toggle('visual-protection', isVisual);
    const nightBtn = document.getElementById('nightModeBtn');
    if (nightBtn) nightBtn.textContent = isNight ? '☀️' : '🌙';
}

async function cargarVista(nombre) {
    const container = document.getElementById('view-container');
    try {
        const resp = await fetch(`/views/${nombre}.html`);
        if (!resp.ok) throw new Error('Vista no encontrada');
        const html = await resp.text();
        container.innerHTML = html;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === nombre);
        });

        currentView = nombre;

        if (nombre === 'empleados') {
            initEmpleados(container);
        } else if (nombre === 'estadisticas') {
            initEstadisticas(container);
        } else if (nombre === 'empleado-form') {
            initEmpleadoForm(container);
        }
    } catch (error) {
        container.innerHTML = `<p class="error-message">Error al cargar la vista: ${error.message}</p>`;
    }
}

function initEmpleados(container) {
    if (uiInstance) {
        uiInstance.container = container;
        uiInstance.initElementosDOM();
        uiInstance.registrarEventos();
        uiInstance.cargarEmpleados();
        uiInstance.resetearFormulario();
    } else {
        uiInstance = new UI(container);
    }
}

function initEstadisticas(container) {
    if (uiInstance && uiInstance.empleados) {
        const empleados = uiInstance.empleados;
        const total = empleados.length;
        const suma = empleados.reduce((acc, e) => acc + Number(e.sueldo), 0);
        const totalSpan = container.querySelector('#totalEmpleados');
        const gastoSpan = container.querySelector('#gastoTotal');
        if (totalSpan) totalSpan.textContent = total;
        if (gastoSpan) gastoSpan.textContent = suma.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs';
    } else {
        obtenerEmpleados().then(empleados => {
            const total = empleados.length;
            const suma = empleados.reduce((acc, e) => acc + Number(e.sueldo), 0);
            const totalSpan = container.querySelector('#totalEmpleados');
            const gastoSpan = container.querySelector('#gastoTotal');
            if (totalSpan) totalSpan.textContent = total;
            if (gastoSpan) gastoSpan.textContent = suma.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs';
            if (uiInstance) uiInstance.empleados = empleados;
        }).catch(() => {
            const totalSpan = container.querySelector('#totalEmpleados');
            const gastoSpan = container.querySelector('#gastoTotal');
            if (totalSpan) totalSpan.textContent = 'Error';
            if (gastoSpan) gastoSpan.textContent = 'Error';
        });
    }
}

function initEmpleadoForm(container) {
    const empleado = window.empleadoEditando || null;
    const form = container.querySelector('#empleadoForm');
    const errorDiv = container.querySelector('#mensajeError');
    const cancelBtn = container.querySelector('#btnCancelar');

    if (empleado) {
        const nombreInput = container.querySelector('#nombre');
        const cedulaInput = container.querySelector('#cedula');
        const cargoInput = container.querySelector('#cargo');
        const sueldoInput = container.querySelector('#sueldo');
        const idHidden = container.querySelector('#empleadoId');
        const formTitle = container.querySelector('#formTitle');
        const guardarBtn = container.querySelector('#btnGuardar');

        if (nombreInput) nombreInput.value = empleado.nombre;
        if (cedulaInput) {
            cedulaInput.value = empleado.cedula;
            cedulaInput.readOnly = true;
            cedulaInput.style.backgroundColor = '#f1f5f9';
            cedulaInput.style.color = '#64748b';
            cedulaInput.style.cursor = 'not-allowed';
        }
        if (cargoInput) cargoInput.value = empleado.cargo;
        if (sueldoInput) sueldoInput.value = empleado.sueldo;
        if (idHidden) idHidden.value = empleado.id;
        if (formTitle) formTitle.textContent = 'Editar Empleado';
        if (guardarBtn) guardarBtn.textContent = 'Actualizar';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        if (uiInstance) {
            uiInstance.container = container;
            uiInstance.form = form;
            uiInstance.nombreInput = nombreInput;
            uiInstance.cedulaInput = cedulaInput;
            uiInstance.cargoInput = cargoInput;
            uiInstance.sueldoInput = sueldoInput;
            uiInstance.empleadoIdHidden = idHidden;
            uiInstance.errorDiv = errorDiv;
            uiInstance.formTitle = formTitle;
            uiInstance.btnGuardar = guardarBtn;
            uiInstance.btnCancelar = cancelBtn;
            uiInstance.modoEdicion = true;
            uiInstance.idEditando = empleado.id;
            uiInstance.limpiarError();
            if (form) {
                form.removeEventListener('submit', uiInstance.handleSubmit);
                form.addEventListener('submit', uiInstance.handleSubmit.bind(uiInstance));
            }
            if (cancelBtn) {
                cancelBtn.removeEventListener('click', uiInstance.cancelarEdicion);
                cancelBtn.addEventListener('click', uiInstance.cancelarEdicion.bind(uiInstance));
            }
        }
    } else {
        if (uiInstance) {
            uiInstance.container = container;
            uiInstance.initElementosDOM();
            uiInstance.registrarEventos();
            uiInstance.resetearFormulario();
            if (form) {
                form.removeEventListener('submit', uiInstance.handleSubmit);
                form.addEventListener('submit', uiInstance.handleSubmit.bind(uiInstance));
            }
            if (cancelBtn) {
                cancelBtn.removeEventListener('click', uiInstance.cancelarEdicion);
                cancelBtn.addEventListener('click', uiInstance.cancelarEdicion.bind(uiInstance));
            }
        }
    }
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view && view !== currentView) {
                cargarVista(view);
            }
        });
    });
}

function setupModos() {
    const nightBtn = document.getElementById('nightModeBtn');
    const visualBtn = document.getElementById('visualProtectionBtn');

    if (nightBtn) {
        nightBtn.addEventListener('click', () => {
            const isNight = document.body.classList.toggle('night-mode');
            nightBtn.textContent = isNight ? '☀️' : '🌙';
            guardarPreferencia('nightMode', isNight);
            mostrarNotificacion(isNight ? '🌙 Modo nocturno' : '☀️ Modo diurno');
        });
    }

    if (visualBtn) {
        visualBtn.addEventListener('click', () => {
            const isProtected = document.body.classList.toggle('visual-protection');
            guardarPreferencia('visualProtection', isProtected);
            visualBtn.style.background = isProtected ? '#f59e0b' : '';
            visualBtn.style.color = isProtected ? '#78350f' : '';
            mostrarNotificacion(isProtected ? '👁️ Protección visual' : '👁️ Protección desactivada');
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        });
    }
}

function mostrarNotificacion(mensaje) {
    const existente = document.querySelector('.floating-notification');
    if (existente) existente.remove();

    const notif = document.createElement('div');
    notif.className = 'floating-notification';
    notif.textContent = mensaje;
    Object.assign(notif.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1e293b',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '0.85rem',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif'
    });
    document.body.appendChild(notif);
    setTimeout(() => notif.style.opacity = '1', 10);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/check-session');
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.href = '/';
            return;
        }
    } catch {
        window.location.href = '/';
        return;
    }

    aplicarModos();
    setupNavigation();
    setupModos();
    setupLogout();
    cargarVista('empleados');
});
