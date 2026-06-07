import Empleado from './Empleado.js';
import { obtenerEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from './api.js';

export default class UI {
    constructor() {
        this.empleados = [];
        this.modoEdicion = false;
        this.idEditando = null;
        this.filtroTexto = '';

        this.initElementosDOM();
        this.registrarEventos();
        this.cargarEmpleados();
    }

    initElementosDOM() {
        this.form = document.getElementById('empleadoForm');
        this.nombreInput = document.getElementById('nombre');
        this.cedulaInput = document.getElementById('cedula');
        this.cargoInput = document.getElementById('cargo');
        this.sueldoInput = document.getElementById('sueldo');
        this.empleadoIdHidden = document.getElementById('empleadoId');
        this.tablaBody = document.getElementById('tablaBody');
        this.totalEmpleadosSpan = document.getElementById('totalEmpleados');
        this.gastoTotalSpan = document.getElementById('gastoTotal');
        this.errorDiv = document.getElementById('mensajeError');
        this.buscadorInput = document.getElementById('buscador');
        this.btnCancelar = document.getElementById('btnCancelar');
        this.formTitle = document.getElementById('formTitle');
        this.btnGuardar = document.getElementById('btnGuardar');
    }

    registrarEventos() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.btnCancelar.addEventListener('click', this.cancelarEdicion.bind(this));
        this.buscadorInput.addEventListener('input', (e) => {
            this.filtroTexto = e.target.value.toLowerCase();
            this.renderizarTabla();
        });
    }

    async cargarEmpleados() {
        try {
            this.empleados = await obtenerEmpleados();
            this.renderizarTabla();
            this.actualizarEstadisticas();
        } catch (error) {
            this.mostrarError('Error al cargar empleados: ' + error.message);
        }
    }

    renderizarTabla() {
        const empleadosFiltrados = this.filtrarEmpleados();
        if (empleadosFiltrados.length === 0) {
            this.tablaBody.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay empleados registrados</td></tr>';
            return;
        }

        this.tablaBody.innerHTML = empleadosFiltrados.map(emp => `
            <tr>
                <td>${this.escapeHtml(emp.nombre)}</td>
                <td>${this.escapeHtml(emp.cedula)}</td>
                <td>${this.escapeHtml(emp.cargo)}</td>
                <td>${Number(emp.sueldo).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                <td>
                    <button class="btn-edit" data-id="${emp.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${emp.id}">🗑️ Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Agregar eventos a botones
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editarEmpleado(btn.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.eliminarEmpleado(btn.dataset.id));
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
        this.totalEmpleadosSpan.textContent = total;
        this.gastoTotalSpan.textContent = sumaSueldos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.limpiarError();

        const datos = {
            nombre: this.nombreInput.value.trim(),
            cedula: this.cedulaInput.value.trim(),
            cargo: this.cargoInput.value.trim(),
            sueldo: parseFloat(this.sueldoInput.value)
        };

        // Validación frontend
        const errores = Empleado.validarEmpleado(datos);
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
            this.cancelarEdicion();
            await this.cargarEmpleados();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    async editarEmpleado(id) {
        const empleado = this.empleados.find(emp => emp.id === id);
        if (!empleado) return;

        this.modoEdicion = true;
        this.idEditando = id;
        this.nombreInput.value = empleado.nombre;
        this.cedulaInput.value = empleado.cedula;
        this.cargoInput.value = empleado.cargo;
        this.sueldoInput.value = empleado.sueldo;
        this.empleadoIdHidden.value = id;
        this.formTitle.textContent = 'Editar Empleado';
        this.btnGuardar.textContent = 'Actualizar';
        this.btnCancelar.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelarEdicion() {
        this.modoEdicion = false;
        this.idEditando = null;
        this.form.reset();
        this.empleadoIdHidden.value = '';
        this.formTitle.textContent = 'Registrar Empleado';
        this.btnGuardar.textContent = 'Guardar';
        this.btnCancelar.style.display = 'none';
        this.limpiarError();
    }

    async eliminarEmpleado(id) {
        const confirmar = confirm('¿Estás seguro de eliminar este empleado?');
        if (!confirmar) return;

        try {
            await eliminarEmpleado(id);
            this.mostrarExito('Empleado eliminado');
            await this.cargarEmpleados();
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    mostrarError(mensaje) {
        this.errorDiv.textContent = mensaje;
        this.errorDiv.style.display = 'block';
        setTimeout(() => {
            this.errorDiv.style.display = 'none';
        }, 5000);
    }

    mostrarExito(mensaje) {
        // Opcional: se puede mostrar un pequeño toast, por ahora usamos alerta ligera
        const toast = document.createElement('div');
        toast.textContent = mensaje;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = '#10b981';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '30px';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = '1000';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    limpiarError() {
        this.errorDiv.style.display = 'none';
        this.errorDiv.textContent = '';
    }

    escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}
