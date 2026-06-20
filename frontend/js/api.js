// Funciones de comunicación con el backend
const API_URL = '/api/empleados';

// Función para manejar respuestas no autorizadas o expiradas
async function handleResponse(response) {
    if (response.status === 401) {
        // Limpiar datos locales
        localStorage.removeItem('sessionActive');
        // Mostrar mensaje amigable
        alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Recargar la página para mostrar el login
        window.location.href = '/';
        throw new Error('Sesión expirada');
    }
    return response;
}

export async function obtenerEmpleados() {
    const resp = await fetch(API_URL);
    await handleResponse(resp);
    if (!resp.ok) throw new Error('Error al obtener empleados');
    return await resp.json();
}

export async function crearEmpleado(empleado) {
    const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleado)
    });
    await handleResponse(resp);
    if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.errores ? data.errores.join(', ') : data.error || 'Error al crear');
    }
    return await resp.json();
}

export async function actualizarEmpleado(id, empleado) {
    const resp = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleado)
    });
    await handleResponse(resp);
    if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.errores?.join(', ') || 'Error al actualizar');
    }
    return await resp.json();
}

export async function eliminarEmpleado(id) {

    const resp = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
    await handleResponse(resp);
    if (!resp.ok && resp.status !== 204) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar');
    }
    return true;
}

