const express = require('express');
const path = require('path');
const empleadosRouter = require('./routes/empleados');

const app = express();
const PORT = process.env.PORT || 3000;

const frontendPath = path.join(__dirname, '..', 'frontend');
console.log('Sirviendo estaticos desde: ', frontendPath);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/empleados', empleadosRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
