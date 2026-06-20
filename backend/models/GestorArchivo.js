const fs = require('fs').promises;
const path = require('path');

class GestorArchivo {
    constructor() {
        this.rutaArchivo = path.join(__dirname, '../data/empleados.json');
        this.inicializarArchivo();
    }

    async inicializarArchivo() {
        try {
            const dir = path.dirname(this.rutaArchivo);
            await fs.mkdir(dir, { recursive: true });
            await fs.access(this.rutaArchivo);
        } catch (error) {
            // Si no existe, crear con array vacío
            await fs.writeFile(this.rutaArchivo, JSON.stringify([], null, 2));
            console.log('✅ Archivo empleados.json creado correctamente');
        }
    }

    async leerEmpleados() {
        try {
            const data = await fs.readFile(this.rutaArchivo, 'utf8');
            if (!data || data.trim() === '') return [];
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Error al leer empleados:', error.message);
            return [];
        }
    }

    async escribirEmpleados(empleados) {
        // Asegurar que la carpeta data existe
        const dir = path.dirname(this.rutaArchivo);
        await fs.mkdir(dir, { recursive: true });
        // Escribir directamente (sobrescribe)
        const contenido = JSON.stringify(empleados, null, 2);
        await fs.writeFile(this.rutaArchivo, contenido, 'utf8');
    }

    async obtenerTodos() {
        return await this.leerEmpleados();
    }

    async obtenerPorId(id) {
        const empleados = await this.leerEmpleados();
        return empleados.find(emp => emp.id === id);
    }

    async crearEmpleado(empleadoData) {
        const empleados = await this.leerEmpleados();
        const nuevoId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5);
        const nuevoEmpleado = { id: nuevoId, ...empleadoData };
        empleados.push(nuevoEmpleado);
        await this.escribirEmpleados(empleados);
        return nuevoEmpleado;
    }

    async actualizarEmpleado(id, datosActualizados) {
        const empleados = await this.leerEmpleados();
        const index = empleados.findIndex(emp => emp.id === id);
        if (index === -1) return null;
        const empleadoActualizado = { ...empleados[index], ...datosActualizados, id: empleados[index].id };
        empleados[index] = empleadoActualizado;
        await this.escribirEmpleados(empleados);
        return empleadoActualizado;
    }

    async eliminarEmpleado(id) {
        const empleados = await this.leerEmpleados();
        const index = empleados.findIndex(emp => emp.id === id);
        if (index === -1) return false;
        empleados.splice(index, 1);
        await this.escribirEmpleados(empleados);
        return true;
    }

    async validarCedulaUnica(cedula, idExcluir = null) {
        const empleados = await this.leerEmpleados();
        if (idExcluir) {
            return !empleados.some(emp => emp.cedula === cedula && emp.id !== idExcluir);
        }
        return !empleados.some(emp => emp.cedula === cedula);
    }
}

module.exports = GestorArchivo;
