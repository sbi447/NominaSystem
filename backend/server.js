const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const empleadosRouter = require('./routes/empleados');

const app = express();
const PORT = process.env.PORT || 3000;

// Secreto para firmar los JWT (en producción usar variable de entorno)
const JWT_SECRET = 'mi-secreto-super-seguro-para-nomina-2024';

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido:', error.message);
        res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
};

// Ruta de login (genera el JWT)
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const validEmail = 'sistemadenomina4@gmail.com';
        const validPassword = 'linuxesmejorquewindows11';

        console.log('Intento de login:', email);

        if (email === validEmail && password === validPassword) {
            // Crear token con datos del usuario (expira en 24 horas)
            const token = jwt.sign(
                { email: validEmail, loginTime: Date.now() },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Enviar token como cookie HTTP-only (segura)
            res.cookie('auth_token', token, {
                httpOnly: true,      // No accesible desde JavaScript
                secure: false,       // true si usas HTTPS
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                sameSite: 'lax'
            });
            
            console.log('✅ Login exitoso para:', email);
            res.json({ success: true, message: 'Login exitoso' });
        } else {
            console.log('❌ Login fallido para:', email);
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// Ruta para verificar sesión (lee la cookie)
app.get('/api/check-session', (req, res) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.json({ loggedIn: false });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ loggedIn: true, user: { email: decoded.email } });
    } catch (error) {
        res.json({ loggedIn: false });
    }
});

// Ruta de logout (elimina la cookie)
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

// Proteger rutas de empleados con el middleware JWT
app.use('/api/empleados', verificarToken, empleadosRouter);

// Servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Manejo de otras rutas (SPA)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API no encontrada' });
    } else if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// Middleware de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 JWT activado - las sesiones persisten aunque el servidor se reinicie`);
});
