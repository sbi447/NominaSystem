const express = require('express');
const path = require('path');
const session = require('express-session');
const empleadosRouter = require('./routes/empleados');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de sesión
app.use(session({
    secret: 'clave-secreta-para-firmar-session-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

const frontendPath = path.join(__dirname, '..', 'frontend');
console.log('Sirviendo estáticos desde:', frontendPath);

app.use(express.json());
app.use(express.static(frontendPath));

// Rutas API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const validEmail = 'sistemadenomina4@gmail.com';
    const validPassword = 'linuxesmejorquewindows11';

    if (email === validEmail && password === validPassword) {
        req.session.user = { email: validEmail };
        res.json({ success: true, message: 'Login exitoso' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.json({ success: true });
    });
});

// Proteger rutas de empleados
const authMiddleware = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado' });
    }
};

app.use('/api/empleados', authMiddleware, empleadosRouter);

// ✅ Sin catch-all - solo servimos index.html para la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Para cualquier otra ruta que no sea API ni archivo estático
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint no encontrado' });
    } else if (!req.path.includes('.')) {
        // Para rutas como /dashboard, /empleados, etc. (SPA)
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
