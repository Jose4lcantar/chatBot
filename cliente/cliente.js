const express = require('express');
const path = require('path');

const app = express();

// Configurar la ruta estática para servir los archivos estáticos
app.use(express.static(path.join(__dirname, 'cliente')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cliente', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
