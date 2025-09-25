const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta raíz 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
