const express = require('express');
const router = express.Router();
const GestorArchivo = require('../models/GestorArchivo');
const gestor = new GestorArchivo();

// Salario mínimo (ejemplo 1000 unidades monetarias)
const SALARIO_MINIMO = 1000;

// Función de validación de empleado
function validarEmpleado(datos, esCreacion = true, idExcluir = null) {
    const errores = [];

    // Nombre: no vacío y debe tener al menos dos palabras (nombre y apellido)
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
        errores.push(`El sueldo debe ser igual o superior al salario mínimo de ${SALARIO_MINIMO}`);
    }

    // Cargo: no vacío (opcional pero recomendado)
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
        res.status(500).json({ error: 'Error al crear empleado' });
    }
});

// PUT /api/empleados/:id - Actualizar empleado
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, cargo, sueldo } = req.body;

        const empleadoExistente = await gestor.obtenerPorId(id);
        if (!empleadoExistente) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        // Validaciones (permitir que algunos campos no cambien, pero se envían todos)
        const errores = validarEmpleado({ nombre, cedula, cargo, sueldo }, false, id);
        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Verificar unicidad de cédula excluyendo el propio empleado
        const esUnica = await gestor.validarCedulaUnica(cedula, id);
        if (!esUnica) {
            return res.status(400).json({ errores: ['La cédula ya está registrada por otro empleado'] });
        }

        const empleadoActualizado = await gestor.actualizarEmpleado(id, {
            nombre: nombre.trim(),
            cargo: cargo.trim(),
            sueldo: Number(sueldo)
        });
        res.json(empleadoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
});

// DELETE /api/empleados/:id - Eliminar empleado
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const eliminado = await gestor.eliminarEmpleado(id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar empleado' });
    }
});

module.exports = router;
