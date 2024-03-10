const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar la ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'cliente', 'index.html'));
});

io.on('connection', socket => {
  console.log('Cliente conectado.');

  let step = 0;
  const steps = [
    'Por favor ingrese si desea pagar "Agua" o "Luz": ',
    'Por favor ingrese los 5 dígitos de su recibo: ',
    '¿Desea pagar con tarjeta de "Crédito" o "Débito"? ',
    'Ingrese el monto a pagar: ',
    '¿Desea "Cancelar" o "Continuar" la transacción? '
  ];

  socket.emit('message', steps[step]);

  let transactionCompleted = false;

  socket.on('message', message => {
    const lowerCaseMessage = message.trim().toLowerCase();
    console.log('Cliente dice:', lowerCaseMessage);

    if (transactionCompleted) {
      if (lowerCaseMessage === 'sí') {
        step = 0;
        transactionCompleted = false;
        socket.emit('message', steps[step]);
      } else if (lowerCaseMessage === 'no') {
        socket.emit('message', 'Gracias por usar nuestro servicio. Adiós.');
        socket.disconnect(); // Cerrar la conexión
      }
      return;
    }

    switch (step) {
      case 0: // Si es el primer paso
        if (lowerCaseMessage === 'agua' || lowerCaseMessage === 'luz') {
          step++;
        }
        break;
      case 1: // Si es el segundo paso
        if (/^\d{5}$/.test(lowerCaseMessage)) {
          step++;
        }
        break;
      case 2: // Si es el tercer paso
        if (lowerCaseMessage === 'crédito' || lowerCaseMessage === 'débito') {
          step++;
        }
        break;
      case 3: // Si es el cuarto paso
        if (!isNaN(parseFloat(lowerCaseMessage))) {
          step++;
        }
        break;
      case 4: // Si es el quinto paso
        if (lowerCaseMessage === 'cancelar') {
          socket.emit('message', '¿Desea iniciar una nueva transacción o terminar el chat? (Nueva petición/Terminar chat): ');
          step++;
        } else if (lowerCaseMessage === 'continuar') {
          socket.emit('message', 'El pago se realizó con éxito.\n\n¿Te puedo ayudar con algo más? (sí/no): ');
          transactionCompleted = true;
        }
        break;
    }

    // Si todavía hay pasos restantes y no se completó la transacción, enviar el siguiente paso al cliente
    if (!transactionCompleted && step < steps.length) {
      socket.emit('message', steps[step]);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado.');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
