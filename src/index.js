// Se importa la libreria de express
const express = require('express')
const app = express()

// Configuracion del backend
app.use(express.json())
app.use(express.urlencoded({extended:false})) // Se usa para enviar formularios si el extended es false quiere decir que no enviaremos media

// Comienza el enrutamiento
app.use(require('./routes/index'))

// Se inicia el servidor
app.listen(3000)
console.log('servidor en el puerto 3000')