# 📊 NominaSystem

**Sistema de Gestión de Nómina** — Proyecto de Programación II-V

---

## 📋 Descripción

Sistema web completo para la gestión de empleados de una empresa con **arquitectura SPA (Single Page Application)**. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) de manera asíncrona con una interfaz moderna y responsiva.

El sistema cuenta con un **dashboard con menú lateral**, vistas independientes para empleados y estadísticas, autenticación segura con JWT, modos de visualización (nocturno y protección visual) y persistencia de preferencias.

---

## 👥 Desarrolladores

**Equipo 2**
- 👨‍💻 Sebastian Briceño  C.I: 32117825
- 👩‍💻 Claudia Montilla   C.I: 33711807
- 👨‍💻 Roberth Idrobo     C.I: 32746248

---

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| **Backend** | Node.js + Express |
| **Frontend** | HTML5, CSS3, JavaScript (ES6 Modules) |
| **Autenticación** | JWT con cookies HttpOnly |
| **Persistencia** | Archivo JSON (`empleados.json`) |
| **Arquitectura** | 3 Capas (Presentación, Lógica de Negocio, Datos) + POO |
| **Estilos** | CSS modular con modo oscuro/ claro y protección visual |

---

## ✨ Características principales

### 🔐 Autenticación y Seguridad
- **Login independiente** con redirección automática según sesión.
- **JWT con cookies HttpOnly** para sesiones persistentes (24 horas).
- Cierre de sesión seguro.
- Verificación de sesión en cada carga.

### 📊 Dashboard y Navegación
- **Menú lateral fijo** con navegación entre vistas.
- Vistas dinámicas: **Empleados**, **Formulario de Empleado** y **Estadísticas**.
- Carga de vistas mediante `fetch` sin recargar la página.
- **Diseño responsivo** que se adapta a móviles y tablets.

### 👥 Gestión de Empleados (CRUD)
- ✅ Registrar nuevos empleados.
- ✅ Listar empleados con búsqueda en tiempo real.
- ✅ Editar empleados (nombre, cargo, sueldo).
- ✅ **La cédula no puede modificarse después del registro**.
- ✅ Eliminar empleados con confirmación.

### 📈 Estadísticas en Tiempo Real
- 📊 Total de empleados registrados.
- 💰 Gasto mensual total en nómina (sumatoria de sueldos).
- Vista dedicada con tarjetas informativas.

### 🔍 Búsqueda Reactiva
- Búsqueda por cédula o nombre.
- Filtrado en tiempo real mientras el usuario escribe.

### 💵 Moneda
- **Bolívares (Bs)** con formato venezolano (ej. `1.250,00 Bs`).

---

## 📁 Estructura del proyecto

```
NominaSystem/
├── backend/
│   ├── data/
│   │   └── empleados.json       # Base de datos (se crea automáticamente)
│   ├── models/
│   │   └── GestorArchivo.js     # Clase para manejo del archivo JSON
│   ├── routes/
│   │   └── empleados.js         # Rutas de la API
│   └── server.js                # Configuración del servidor Express
├── frontend/
│   ├── css/
│   │   ├── common.css           # Estilos base y utilidades
│   │   ├── login.css            # Estilos específicos del login
│   │   └── dashboard.css        # Layout y modos visuales
│   ├── js/
│   │   ├── app.js               # Redirección según sesión
│   │   ├── login.js             # Lógica del login (autenticación)
│   │   ├── dashboard.js         # Navegación, modos, inicialización de vistas
│   │   ├── UI.js                # Clase CRUD (adaptada a vistas dinámicas)
│   │   ├── Empleado.js          # Modelo y validaciones
│   │   └── api.js               # Comunicación con el backend
│   ├── views/                   # Vistas HTML parciales
│   │   ├── empleados.html       # Lista de empleados con buscador
│   │   ├── empleado-form.html   # Formulario de registro/edición
│   │   └── estadisticas.html    # Panel de estadísticas
│   ├── index.html               # Punto de entrada (redirección)
│   ├── login.html               # Página de login
│   └── dashboard.html           # Dashboard con menú lateral
├── package.json                 # Dependencias y scripts
└── README.md                    # Documentación
```

---

## 🚀 Instalación y ejecución

### Pasos para instalar

```bash
# 1. Clonar el repositorio
git clone https://github.com/sbi447/NominaSystem.git
cd NominaSystem

# 3. Instalar dependencias
npm install

# 4. Ejecutar el servidor
npm run dev      # Modo desarrollo (con nodemon)
# o
npm start        # Modo producción
```

### Acceso a la aplicación
```
http://localhost:3000
```

---

## 🔑 Credenciales de acceso

| Campo | Valor |
|-------|-------|
| **Correo electrónico** | `sysnom@gmail.com` |
| **Contraseña** | `linux123` |

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesión |
| GET | `/api/check-session` | Verificar sesión activa |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/empleados` | Obtener todos los empleados |
| POST | `/api/empleados` | Crear nuevo empleado |
| PUT | `/api/empleados/:id` | Actualizar empleado (sin cédula) |
| DELETE | `/api/empleados/:id` | Eliminar empleado |

---

## 🤝 Contribuciones

Proyecto académico desarrollado por el **Equipo 2** — Programación II-V.

---

## 📄 Licencia

Proyecto educativo — Sin fines comerciales.
