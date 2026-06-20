const express = require('express');
const router = express.Router();
const GestorArchivo = require('../models/GestorArchivo');
const gestor = new GestorArchivo();

// Salario mínimo en Bolívares
const SALARIO_MINIMO = 1000;

// Función de validación de empleado (para CREACIÓN)
function validarEmpleado(datos) {
    const errores = [];

    // Nombre: no vacío y debe tener al menos dos palabras
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre completo es obligatorio');
    } else if (datos.nombre.trim().split(/\s+/).length < 2) {
        errores.push('El nombre debe incluir al menos nombre y apellido');
    }

    // Cédula: formato V- o E- seguido de números
    const cedulaRegex = /^[VE]-\d+$/;
    if (!datos.cedula || !cedulaRegex.test(datos.cedula)) {
        errores.push('La cédula debe tener formato V-12345678 o E-12345678');
    }

    // Sueldo: número >= salario mínimo
    if (datos.sueldo === undefined || datos.sueldo === null || isNaN(Number(datos.sueldo))) {
        errores.push('El sueldo debe ser un número válido');
    } else if (Number(datos.sueldo) < SALARIO_MINIMO) {
        errores.push(`El sueldo debe ser igual o superior al salario mínimo de ${SALARIO_MINIMO} Bs`);
    }

    // Cargo: no vacío
    if (!datos.cargo || datos.cargo.trim() === '') {
        errores.push('El cargo es obligatorio');
    }

    return errores;
}

// Función de validación para ACTUALIZACIÓN (sin cédula)
function validarActualizacion(datos) {
    const errores = [];

    // Nombre: no vacío y debe tener al menos dos palabras
    if (!datos.nombre || datos.nombre.trim() === '') {
        errores.push('El nombre completo es obligatorio');
    } else if (datos.nombre.trim().split(/\s+/).length < 2) {
        errores.push('El nombre debe incluir al menos nombre y apellido');
    }

    // Sueldo: número >= salario mínimo
    if (datos.sueldo === undefined || datos.sueldo === null || isNaN(Number(datos.sueldo))) {
        errores.push('El sueldo debe ser un número válido');
    } else if (Number(datos.sueldo) < SALARIO_MINIMO) {
        errores.push(`El sueldo debe ser igual o superior al salario mínimo de ${SALARIO_MINIMO} Bs`);
    }

    // Cargo: no vacío
    if (!datos.cargo || datos.cargo.trim() === '') {
        errores.push('El cargo es obligatorio');
    }

    return errores;
}

// GET /api/empleados - Obtener todos
router.get('/', async (req, res) => {
    try {
        const empleados = await gestor.obtenerTodos();
        res.json(empleados);
    } catch (error) {
        console.error('Error GET empleados:', error);
        res.status(500).json({ error: 'Error al obtener empleados' });
    }
});

// POST /api/empleados - Crear empleado
router.post('/', async (req, res) => {
    try {
        const { nombre, cedula, cargo, sueldo } = req.body;

        // Validaciones
        const errores = validarEmpleado({ nombre, cedula, cargo, sueldo });
        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Verificar unicidad de cédula
        const esUnica = await gestor.validarCedulaUnica(cedula);
        if (!esUnica) {
            return res.status(400).json({ errores: ['La cédula ya está registrada'] });
        }

        const nuevoEmpleado = await gestor.crearEmpleado({
            nombre: nombre.trim(),
            cedula: cedula.trim(),
            cargo: cargo.trim(),
            sueldo: Number(sueldo)
        });
        res.status(201).json(nuevoEmpleado);
    } catch (error) {
        console.error('Error POST empleado:', error);
        res.status(500).json({ error: 'Error al crear empleado' });
    }
});

// PUT /api/empleados/:id - Actualizar empleado (Ignora y bloquea cambios de cédula)
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Forzamos a extraer solo los campos permitidos para la edición
        const { nombre, cargo, sueldo } = req.body;

        console.log('Actualizando empleado:', { id, nombre, cargo, sueldo });

        const empleadoExistente = await gestor.obtenerPorId(id);
        if (!empleadoExistente) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        // Validaciones SOLO para campos editables
        const errores = validarActualizacion({ nombre, cargo, sueldo });
        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Al pasar explícitamente solo estos campos, blindamos el archivo JSON
        const empleadoActualizado = await gestor.actualizarEmpleado(id, {
            nombre: nombre.trim(),
            cargo: cargo.trim(),
            sueldo: Number(sueldo)
        });
        
        res.json(empleadoActualizado);
    } catch (error) {
        console.error('Error en PUT /api/empleados/:id:', error);
        res.status(500).json({ error: 'Error al actualizar empleado: ' + error.message });
    }
});

// DELETE /api/empleados/:id - Eliminar empleado
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Eliminando empleado con ID:', id);
        
        const empleadoExistente = await gestor.obtenerPorId(id);
        if (!empleadoExistente) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        
        const eliminado = await gestor.eliminarEmpleado(id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        
        // Responder con éxito (sin afectar la sesión)
        res.status(204).send();
    } catch (error) {
        console.error('Error DELETE empleado:', error);
        res.status(500).json({ error: 'Error al eliminar empleado: ' + error.message });
    }
});

module.exports = router;
