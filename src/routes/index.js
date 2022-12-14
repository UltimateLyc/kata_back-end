const {Router, application} = require('express') // Traemos al enrutador
const router = Router()

//importacion de metodos para las rutas 
const {holaDev, getAnimales, getZoo, getEspecies, addZoo, deleteZoo, updateZoo} = require('../controllers/index.controller')

// Definicion de rutas
/**
 * GET - Traer Datos
 * POST - Insertar o modificar datos
 * DELETE - Eliminar datos
 * PUT - Lo mismo que POST pero con XML
 */

/**
 * req - request
 * res - response
 */
router.get('/', holaDev) //endpoints o rutas

router.get('/animales', getAnimales)

router.get('/zoo', getZoo)

router.get('/especies', getEspecies)

router.post('/addZoo', addZoo)

router.delete('/deleteZoo', deleteZoo)

router.post('/updateZoo', updateZoo)

module.exports = router