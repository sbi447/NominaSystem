import { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from './api.js';
import Empleado from './Empleado.js';

export default class UI {
    constructor(container) {
        this.container = container;
        this.empleados = [];
        this.modoEdicion = false;
        this.idEditando = null;
        this.procesandoFormulario = false; // Bandera para evitar el doble disparo síncrono

        this.initElementosDOM();
        this.registrarEventos();
        this.cargarEmpleados();
    }

    initElementosDOM() {
        this.tablaBody = this.container.querySelector('#tablaBody');
        this.buscador = this.container.querySelector('#buscador');
        this.btnAgregarEmpleado = this.container.querySelector('#btnAgregarEmpleado');
        
        // Elementos del formulario
        this.form = this.container.querySelector('#empleadoForm');
        this.nombreInput = this.container.querySelector('#nombre');
        this.cedulaInput = this.container.querySelector('#cedula');
        this.cargoInput = this.container.querySelector('#cargo');
        this.sueldoInput = this.container.querySelector('#sueldo');
        this.errorDiv = this.container.querySelector('#mensajeError');
        this.formTitle = this.container.querySelector('#formTitle');
        this.btnGuardar = this.container.querySelector('#btnGuardar');
        this.btnCancelar = this.container.querySelector('#btnCancelar');

        // Elementos de Modales y Toasts globales del documento
        this.toastContainer = document.getElementById('toast-container');
        this.confirmModal = document.getElementById('confirm-modal');
        this.confirmModalMsg = document.getElementById('confirm-modal-msg');
        this.btnModalCancelar = document.getElementById('btn-modal-cancelar');
        this.btnModalConfirmar = document.getElementById('btn-modal-confirmar');
    }

    registrarEventos() {
        if (this.btnAgregarEmpleado) {
            this.btnAgregarEmpleado.addEventListener('click', () => {
                window.empleadoEditando = null;
                window.cargarVista('empleado-form');
            });
        }

        if (this.buscador) {
            this.buscador.addEventListener('input', () => this.filtrarEmpleados());
        }

        if (this.form) {
            // Remover cualquier listener previo por si la vista se recargó de forma incorrecta
            this.form.removeEventListener('submit', this.handleSubmit.bind(this));
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        if (this.btnCancelar) {
            this.btnCancelar.addEventListener('click', this.cancelarEdicion.bind(this));
        }

        if (this.tablaBody) {
            this.tablaBody.addEventListener('click', async (e) => {
                const btnEdit = e.target.closest('.btn-editar');
                const btnDelete = e.target.closest('.btn-eliminar');

                if (btnEdit) {
                    const id = btnEdit.getAttribute('data-id');
                    this.prepararEdicion(id);
                }

                if (btnDelete) {
                    const id = btnDelete.getAttribute('data-id');
                    await this.manejarEliminacion(id);
                }
            });
        }
    }

    lanzarToast(mensaje, tipo = 'info') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast-alerta ${tipo}`;
        
        let icono = 'ℹ️';
        if (tipo === 'exito') icono = '✅';
        if (tipo === 'error') icono = '❌';

        toast.innerHTML = `<span>${icono}</span> <span>${mensaje}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('mostrar'), 10);

        setTimeout(() => {
            toast.classList.remove('mostrar');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    mostrarConfirmacionModal(mensaje) {
        return new Promise((resolve) => {
            if (!this.confirmModal) return resolve(false);

            this.confirmModalMsg.textContent = mensaje;
            this.confirmModal.classList.add('activo');

            const limpiarEventos = () => {
                this.btnModalConfirmar.removeEventListener('click', alConfirmar);
                this.btnModalCancelar.removeEventListener('click', alCancelar);
                this.confirmModal.classList.remove('activo');
            };

            const alConfirmar = () => { limpiarEventos(); resolve(true); };
            const alCancelar = () => { limpiarEventos(); resolve(false); };

            this.btnModalConfirmar.addEventListener('click', alConfirmar);
            this.btnModalCancelar.addEventListener('click', alCancelar);
        });
    }

    async cargarEmpleados() {
        if (!this.tablaBody) return;
        try {
            this.empleados = await obtenerEmpleados();
            this.renderizarTabla(this.empleados);
        } catch (error) {
            this.mostrarMensajeTabla(`❌ Error al cargar: ${error.message}`);
            this.lanzarToast(error.message, 'error');
        }
    }

    renderizarTabla(lista) {
        if (!this.tablaBody) return;
        this.tablaBody.innerHTML = '';

        if (lista.length === 0) {
            this.mostrarMensajeTabla('No se encontraron empleados.');
            return;
        }

        lista.forEach(emp => {
            const tr = document.createElement('tr');
            const sueldoNum = Number(emp.sueldo) || 0; 
            
            tr.innerHTML = `
                <td><strong>${emp.nombre}</strong></td>
                <td>${emp.cedula}</td>
                <td>${emp.cargo}</td>
                <td>${sueldoNum.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</td>
                <td>
                    <button class="btn-edit btn-editar" data-id="${emp.id}">✏️ Editar</button>
                    <button class="btn-delete btn-eliminar" data-id="${emp.id}">🗑️ Eliminar</button>
                </td>
            `;
            this.tablaBody.appendChild(tr);
        });
    }

    mostrarMensajeTabla(mensaje) {
        if (this.tablaBody) {
            this.tablaBody.innerHTML = `<tr class="fila-vacia"><td colspan="5">${mensaje}</td></tr>`;
        }
    }

    filtrarEmpleados() {
        const query = this.buscador.value.toLowerCase().trim();
        const filtrados = this.empleados.filter(emp => 
            emp.nombre.toLowerCase().includes(query) || 
            emp.cedula.toLowerCase().includes(query)
        );
        this.renderizarTabla(filtrados);
    }

    async manejarEliminacion(id) {
        if (!id || id === 'undefined') {
            this.lanzarToast('ID inválido detectado para la eliminación.', 'error');
            return;
        }

        const emp = this.empleados.find(e => e.id === id);
        const nombreEmp = emp ? emp.nombre : 'este empleado';

        const confirmado = await this.mostrarConfirmacionModal(`¿Estás seguro de que deseas eliminar a ${nombreEmp}?`);
        
        if (confirmado) {
            try {
                await eliminarEmpleado(id);
                this.empleados = this.empleados.filter(e => e.id !== id);
                this.renderizarTabla(this.empleados);
                this.lanzarToast(`${nombreEmp} eliminado correctamente`, 'exito');
            } catch (error) {
                this.lanzarToast('Error al eliminar: ' + error.message, 'error');
            }
        }
    }

    prepararEdicion(id) {
        const emp = this.empleados.find(e => e.id === id);
        if (emp) {
            window.empleadoEditando = emp;
            window.cargarVista('empleado-form');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // CONTROL CRÍTICO: Si ya se está procesando una petición, frenamos el doble envío
        if (this.procesandoFormulario) return;

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
            this.lanzarToast('Revisa los errores en el formulario', 'error');
            return;
        }

        try {
            // On bandera de procesamiento y bloq botón
            this.procesandoFormulario = true;
            if (this.btnGuardar) this.btnGuardar.disabled = true;

            if (this.modoEdicion && this.idEditando) {
                const empleadoEditado = await actualizarEmpleado(this.idEditando, datos);
                const index = this.empleados.findIndex(emp => emp.id === this.idEditando);
                if (index !== -1) {
                    this.empleados[index] = empleadoEditado;
                }
                this.lanzarToast('Empleado actualizado correctamente', 'exito');
            } else {
                const nuevoEmpleado = await crearEmpleado(datos);
                this.empleados.push(nuevoEmpleado);
                this.lanzarToast('Empleado registrado correctamente', 'exito');
            }
            
            window.empleadoEditando = null;
            this.cancelarEdicion();
        } catch (error) {
            this.mostrarError(error.message);
            this.lanzarToast(error.message, 'error');
        } finally {
            // Unblock formulario una vez termine de responder el backend
            this.procesandoFormulario = false;
            if (this.btnGuardar) this.btnGuardar.disabled = false;
        }
    }

    cancelarEdicion() {
        this.resetearFormulario();
        window.cargarVista('empleados');
    }

    resetearFormulario() {
        this.modoEdicion = false;
        this.idEditando = null;
        window.empleadoEditando = null;
        if (this.form) this.form.reset();
        if (this.cedulaInput) {
            this.cedulaInput.readOnly = false;
            this.cedulaInput.style.backgroundColor = '';
            this.cedulaInput.style.color = '';
            this.cedulaInput.style.cursor = '';
        }
        if (this.formTitle) this.formTitle.textContent = 'Registrar Empleado';
        if (this.btnGuardar) this.btnGuardar.textContent = 'Guardar';
        if (this.btnCancelar) this.btnCancelar.style.display = 'none';
        this.limpiarError();
    }

    mostrarError(mensaje) {
        if (this.errorDiv) {
            this.errorDiv.textContent = mensaje;
            this.errorDiv.style.display = 'block';
        }
    }

    limpiarError() {
        if (this.errorDiv) {
            this.errorDiv.textContent = '';
            this.errorDiv.style.display = 'none';
        }
    }
}

