import Empleado from './Empleado.js';
import { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from './api.js';

export default class UI {
    constructor(container) {
        this.container = container;
        this.empleados = [];
        this.modoEdicion = false;
        this.idEditando = null;
        this.filtroTexto = '';

        this.initElementosDOM();
        this.registrarEventos();
        this.cargarEmpleados();
    }

    initElementosDOM() {
        this.form = this.container.querySelector('#empleadoForm');
        this.nombreInput = this.container.querySelector('#nombre');
        this.cedulaInput = this.container.querySelector('#cedula');
        this.cargoInput = this.container.querySelector('#cargo');
        this.sueldoInput = this.container.querySelector('#sueldo');
        this.empleadoIdHidden = this.container.querySelector('#empleadoId');
        this.tablaBody = this.container.querySelector('#tablaBody');
        this.totalEmpleadosSpan = document.getElementById('totalEmpleados');
        this.gastoTotalSpan = document.getElementById('gastoTotal');
        this.errorDiv = this.container.querySelector('#mensajeError');
        this.buscadorInput = this.container.querySelector('#buscador');
        this.btnCancelar = this.container.querySelector('#btnCancelar');
        this.formTitle = this.container.querySelector('#formTitle');
        this.btnGuardar = this.container.querySelector('#btnGuardar');
        this.btnAgregar = this.container.querySelector('#btnAgregarEmpleado');
    }

    registrarEventos() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        if (this.btnCancelar) {
            this.btnCancelar.addEventListener('click', this.cancelarEdicion.bind(this));
        }
        if (this.buscadorInput) {
            this.buscadorInput.addEventListener('input', (e) => {
                this.filtroTexto = e.target.value.toLowerCase();
                this.renderizarTabla();
            });
        }
        if (this.btnAgregar) {
            this.btnAgregar.addEventListener('click', () => {
                window.empleadoEditando = null;
                if (window.cargarVista) {
                    window.cargarVista('empleado-form');
                }
            });
        }
    }

    async cargarEmpleados() {
        try {
            this.empleados = await obtenerEmpleados();
            this.renderizarTabla();
            this.actualizarEstadisticas();
        } catch (error) {
            if (error.message === 'Sesión expirada') return;
            this.mostrarError('Error al cargar empleados: ' + error.message);
        }
    }

    renderizarTabla() {
        const empleadosFiltrados = this.filtrarEmpleados();
        if (!this.tablaBody) return;

        if (empleadosFiltrados.length === 0) {
            this.tablaBody.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay empleados registrados</td></tr>';
            return;
        }

        this.tablaBody.innerHTML = empleadosFiltrados.map(emp => `
            <tr data-id="${emp.id}">
                <td>${this.escapeHtml(emp.nombre)}</td>
                <td>${this.escapeHtml(emp.cedula)}</td>
                <td>${this.escapeHtml(emp.cargo)}</td>
                <td>${Number(emp.sueldo).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</td>
                <td>
                    <button class="btn-edit" data-id="${emp.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${emp.id}">🗑️ Eliminar</button>
                </td>
            </tr>
        `).join('');

        this.tablaBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editarEmpleado(btn.dataset.id);
            });
        });
        this.tablaBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                this.eliminarEmpleado(btn.dataset.id);
            });
        });
    }

    filtrarEmpleados() {
        if (!this.filtroTexto) return this.empleados;
        return this.empleados.filter(emp =>
            emp.cedula.toLowerCase().includes(this.filtroTexto) ||
            emp.nombre.toLowerCase().includes(this.filtroTexto)
        );
    }

    actualizarEstadisticas() {
        const total = this.empleados.length;
        const sumaSueldos = this.empleados.reduce((acc, emp) => acc + Number(emp.sueldo), 0);
        if (this.totalEmpleadosSpan) this.totalEmpleadosSpan.textContent = total;
        if (this.gastoTotalSpan) {
            this.gastoTotalSpan.textContent = sumaSueldos.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Bs';
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.limpiarError();

        let datos = {};
        if (this.modoEdicion) {
            datos = {
                nombre: this.nombreInput.value.trim(),
                cargo: this.cargoInput.value.trim(),
                sueldo: parseFloat(this.sueldoInput.value)
            };
        } else {
            datos = {
                nombre: this.nombreInput.value.trim(),
                cedula: this.cedulaInput.value.trim(),
                cargo: this.cargoInput.value.trim(),
                sueldo: parseFloat(this.sueldoInput.value)
            };
        }

        let errores = [];
        const errorNombre = Empleado.validarNombre(datos.nombre);
        if (errorNombre) errores.push(errorNombre);
        const errorSueldo = Empleado.validarSueldo(datos.sueldo);
        if (errorSueldo) errores.push(errorSueldo);
        const errorCargo = Empleado.validarCargo(datos.cargo);
        if (errorCargo) errores.push(errorCargo);
        if (!this.modoEdicion) {
            const errorCedula = Empleado.validarCedula(datos.cedula);
            if (errorCedula) errores.push(errorCedula);
        }

        if (errores.length > 0) {
            this.mostrarError(errores.join('. '));
            return;
        }

        try {
            if (this.modoEdicion && this.idEditando) {
                await actualizarEmpleado(this.idEditando, datos);
                this.mostrarExito('Empleado actualizado correctamente');
            } else {
                await crearEmpleado(datos);
                this.mostrarExito('Empleado registrado correctamente');
            }
            // Limpiar y navegar a empleados
            window.empleadoEditando = null;
            this.cancelarEdicion();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    async editarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;
        window.empleadoEditando = empleado;
        if (window.cargarVista) {
            window.cargarVista('empleado-form');
        }
    }

    cancelarEdicion() {
        // Limpiar estado interno
        this.modoEdicion = false;
        this.idEditando = null;
        // No resetear el formulario ni cambiar títulos porque la vista va a desaparecer
        // Limpiar error
        this.limpiarError();
        // Navegar a empleados
        window.empleadoEditando = null;
        if (window.cargarVista) {
            window.cargarVista('empleados');
        }
    }

    async eliminarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;
        if (!confirm(`¿Eliminar a "${empleado.nombre}"?`)) return;

        try {
            await eliminarEmpleado(id);
            this.mostrarExito('Empleado eliminado');
            await this.cargarEmpleados();
        } catch (error) {
            if (error.message === 'Sesión expirada') return;
            this.mostrarError('Error al eliminar: ' + error.message);
        }
    }

    mostrarError(mensaje) {
        if (!this.errorDiv) return;
        this.errorDiv.textContent = mensaje;
        this.errorDiv.style.display = 'block';
        setTimeout(() => {
            this.errorDiv.style.display = 'none';
        }, 5000);
    }

    mostrarExito(mensaje) {
        const notif = document.createElement('div');
        notif.textContent = mensaje;
        Object.assign(notif.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#10b981',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '30px',
            fontWeight: 'bold',
            zIndex: '1000',
            fontFamily: 'Inter, sans-serif'
        });
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    limpiarError() {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
            this.errorDiv.textContent = '';
        }
    }

    escapeHtml(str) {
        return str.replace(/[&<>]/g, m => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}
