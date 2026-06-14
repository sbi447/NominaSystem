// Clase modelo para Empleado (validaciones centralizadas)
export default class Empleado {
    constructor(nombre, cedula, cargo, sueldo, id = null) {
        this.id = id;
        this.nombre = nombre;
        this.cedula = cedula;
        this.cargo = cargo;
        this.sueldo = sueldo;
    }

    // Validaciones estáticas reutilizables
    static validarNombre(nombre) {
        if (!nombre || nombre.trim() === '') return 'El nombre completo es obligatorio';
        if (nombre.trim().split(/\s+/).length < 2) return 'Debe incluir nombre y apellido';
        return null;
    }

    static validarCedula(cedula) {
        const regex = /^[VE]-\d+$/;
        if (!cedula || !regex.test(cedula)) return 'Formato inválido. Use V-12345678 o E-12345678';
        return null;
    }

    static validarSueldo(sueldo, salarioMinimo = 1000) {
        const num = Number(sueldo);
        if (isNaN(num)) return 'El sueldo debe ser un número';
        if (num < salarioMinimo) return `El sueldo mínimo es ${salarioMinimo} Bs`;
        return null;
    }

    static validarCargo(cargo) {
        if (!cargo || cargo.trim() === '') return 'El cargo es obligatorio';
        return null;
    }

    // Validación completa
    static validarEmpleado(datos) {
        const errores = [];
        const errorNombre = this.validarNombre(datos.nombre);
        if (errorNombre) errores.push(errorNombre);
        const errorCedula = this.validarCedula(datos.cedula);
        if (errorCedula) errores.push(errorCedula);
        const errorSueldo = this.validarSueldo(datos.sueldo);
        if (errorSueldo) errores.push(errorSueldo);
        const errorCargo = this.validarCargo(datos.cargo);
        if (errorCargo) errores.push(errorCargo);
        return errores;
    }
}
