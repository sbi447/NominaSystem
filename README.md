# NominaSystem

Sistema de Nómina - Proyecto de Programación II-V

## 📋 Descripción

Sistema web completo para la gestión de empleados de una empresa. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) de manera asíncrona, con validaciones tanto en frontend como en backend. Incluye un panel de estadísticas en tiempo real (total de empleados y gasto mensual en nómina), barra de búsqueda reactiva por cédula o nombre, sistema de autenticación con JWT, modos de visualización (nocturno y protección visual) y campo de contraseña con toggle de visibilidad.

## 👥 Desarrolladores

**Equipo 2**
- Sebastian Briceño
- Claudia Montilla
- Roberth Idrobo

## 🛠️ Tecnologías utilizadas

- **Backend:** Node.js + Express
- **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules)
- **Autenticación:** JWT (JSON Web Tokens) con cookies HttpOnly
- **Persistencia:** Archivo JSON (`empleados.json`)
- **Arquitectura:** 3 Capas (Presentación, Lógica de Negocio, Datos) + POO

## ✨ Características principales

### Gestión de Empleados (CRUD)
- ✅ Registrar nuevos empleados
- ✅ Visualizar lista completa de empleados
- ✅ Editar empleados (nombre, cargo, sueldo)
- ✅ Eliminar empleados con confirmación
- ✅ **La cédula no puede modificarse después de registrar**

### Validaciones
- ✅ **Cédula:** Formato V-12345678 o E-12345678 (única por empleado)
- ✅ **Sueldo:** Mínimo 1000 Bs (Bolívares)
- ✅ **Nombre:** Obligatorio, debe incluir nombre y apellido
- ✅ **Cargo:** Obligatorio

### Estadísticas en Tiempo Real
- 📊 Total de empleados registrados
- 💰 Gasto mensual total en nómina (sumatoria de sueldos)

### Búsqueda Reactiva
- 🔍 Búsqueda por cédula o nombre
- 📝 Filtrado en tiempo real mientras el usuario escribe

### Autenticación y Seguridad
- 🔐 **Login con JWT** (sesiones persistentes)
- 🍪 Cookies HttpOnly para mayor seguridad
- ⏰ Sesión válida por 24 horas
- 🚪 Cierre de sesión seguro

### Experiencia de Usuario (UX)
- 🌙 **Modo nocturno** - Colores oscuros para trabajar de noche
- 👁️ **Protección visual** - Reduce brillo y contraste para cuidar la vista
- 🔒 **Toggle de contraseña** - Mostrar/ocultar contraseña en login
- 📱 **Diseño responsivo** - Adaptado a móviles y tablets
- 🔔 **Notificaciones** - Feedback visual de acciones

### Moneda
- 💵 **Bolívares (Bs)** - Formato venezolano (ej. 1.250,00 Bs)

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
│   ├── js/
│   │   ├── app.js               # Punto de entrada (login, modos, UI)
│   │   ├── UI.js                # Clase que maneja DOM y eventos
│   │   ├── Empleado.js          # Modelo y validaciones
│   │   └── api.js               # Funciones fetch para la API
│   ├── index.html               # Estructura HTML
│   └── styles.css               # Estilos CSS (con modo nocturno)
├── package.json                 # Dependencias y scripts
└── README.md                    # Documentación
```

## 🚀 Instalación y ejecución

### Requisitos previos
- Node.js (v22 o superior)
- npm (v11 o superior)

### Pasos para instalar

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sbi447/NominaSystem.git
   cd NominaSystem
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor**
   ```bash
   # Modo producción
   npm start
   
   # Modo desarrollo (con recarga automática)
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Credenciales de acceso

| Campo | Valor |
|-------|-------|
| **Correo electrónico** | `sistemadenomina4@gmail.com` |
| **Contraseña** | `linuxesmejorquewindows11` |

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

## 🎮 Cómo usar el sistema

### Login
1. Ingresa las credenciales proporcionadas
2. Haz clic en "Ingresar"

### Gestión de empleados
- **Registrar:** Completa el formulario y haz clic en "Guardar"
- **Editar:** Haz clic en "Editar" en la fila del empleado, modifica los campos y haz clic en "Actualizar"
- **Eliminar:** Haz clic en "Eliminar" y confirma la acción

### Modos de visualización
- **🌙 Modo nocturno:** Cambia a colores oscuros
- **👁️ Protección visual:** Reduce el brillo de la pantalla

### Búsqueda
- Escribe en la barra de búsqueda para filtrar empleados por cédula o nombre

## 🔒 Seguridad

- Las contraseñas se manejan con cookies HttpOnly
- Los tokens JWT son verificados en cada petición
- Las rutas de empleados están protegidas por autenticación
- La cédula no puede modificarse después del registro
- Validaciones duplicadas en frontend y backend

## 📝 Notas adicionales

- El archivo `empleados.json` se crea automáticamente en `backend/data/`
- El salario mínimo configurado es de **1000 Bs**
- Las sesiones JWT tienen una duración de **24 horas**
- Las preferencias de modo (nocturno/protección visual) se guardan en `localStorage`

## 🧪 Pruebas

Para probar el sistema:
1. Inicia sesión con las credenciales
2. Registra varios empleados
3. Prueba la búsqueda y el filtrado
4. Edita y elimina empleados
5. Prueba los modos de visualización

## 🤝 Contribuciones

Proyecto académico - Equipo 2

## 📄 Licencia

Proyecto educativo - Programación II-V
