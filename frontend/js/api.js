// Funciones de comunicación con el backend
const API_URL = '/api/empleados';

export async function obtenerEmpleados() {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error('Error al obtener empleados');
    return await resp.json();
}

export async function crearEmpleado(empleado) {
    const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleado)
    });
    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.errores ? data.errores.join(', ') : data.error || 'Error al crear');
    }
    return data;
}

export async function actualizarEmpleado(id, empleado) {
    const resp = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleado)
    });
    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.errores ? data.errores.join(', ') : data.error || 'Error al actualizar');
    }
    return data;
}

export async function eliminarEmpleado(id) {
    const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!resp.ok && resp.status !== 204) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Error al eliminar');
    }
    return true;
}
