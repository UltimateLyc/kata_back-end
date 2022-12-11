// Conexion a la base de datos
const {Pool} = require('pg')
const pool = new Pool ({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'zoologicos'
})

/* Consulta a la base de daros  */
const getZoo = async (req, res) => {
    // Usar Try Catch sirve para detectar la falla y evitar la muerte de servidor
    try {
        // Query sirve para mandar parametros atravez de la URL
        let response = await pool.query('SELECT * FROM zoo')

        // Diccionario 
        // Meto de busqueda: http://localhost:3000/zoo?ciudad=CDMX&pais=Mexico&tipo_busqueda=ciudadPais
        const tipo_busqueda = req.query.tipo_busqueda
        const {ciudad, pais, tamanio} = req.query

        let dictionary = {
            'pais' : await pool.query('SELECT * FROM zoo WHERE pais = $1', [pais]),
            'ciudad' : await pool.query('SELECT * FROM zoo WHERE ciudad = $1', [ciudad]),
            'tamanio' : await pool.query('SELECT * FROM zoo WHERE tamanio = $1', [tamanio]),
            'ciudadPais' : await pool.query('SELECT * FROM zoo WHERE ciudad = $1 AND pais = $2', [ciudad,pais]),
            'ciudadPaisTamanio' : await pool.query('SELECT * FROM zoo WHERE ciudad = $1 AND pais = $2 AND tamanio = $3', [ciudad,pais, tamanio])
        }
        if(Object.keys(req.query).length){
            response = dictionary[tipo_busqueda]
        }

        

        // const response = await pool.query('SELECT * FROM zoo')
        // console.log(response) // Muestra toda la informacion a la peticion a la BD
        // console.log(response.rowCount)
        
        /* if ( response.rowCount === 0 ){
            res.status(200).json({'Status':'No existe ningun registro'})
            return 
        } => */ if(sinDatos(response, res)) return

        //console.log(response.rows) // Muestra los datos del response en rows
        //console.log(req) // Muestra toda la informacion enviada por el URL 
        // console.log(req.query) // Imprime lo enviado en http://localhost:3000/zoo?ciudad=villa *imprimiendo { ciudad: 'villa' }*
        res.status(200).json(response.rows) // Imprime la peticion de la base de datos
        
    } catch (error) {
        res.status(500).json({'error': error.message}) // atrapamos el error y lo mandamos a impresion 
    }
} 

const getEspecies = async (req, res) => {
    try {
        let response = await pool.query('SELECT * FROM especie')

        // Esta es otra forma de comparar pero es mas optimo usar los diccionarios
        if(Object.keys(req.query).includes('nombre_vulgal') ){
            const {nombre_vulgal} = req.query
            response = await pool.query('SELECT * FROM especie WHERE nombre_vulgal = $1', [nombre_vulgal])
        } else if (Object.keys(req.query).includes('nombre_cientifico')){
            const nombre_cientifico = req.query
            response = await pool.query('SELECT * FROM especie WHERE nombre_cientifico = $1', [nombre_cientifico])
        } else if (Object.keys(req.query).includes('peligro_ext')){
            const peligro_ext = req.query
            response = await pool.query('SELECT * FROM especie WHERE peligro_ext = $1', [peligro_ext])
        }

        // este if es para validar si existe informacion en caso de que no exista arroja mensaje
        if(response.rowCount === 0){
            res.status(200).json({'Status': 'No existe registro'})
            return
        }
        res.status(200).json(response.rows)
    } catch (error) {
        res.status(500).json({'error': error.message})
    }
}

// Test
const holaDev = (req,res) => {
    console.log('Hola DEV')
    res.json('Hola DEV')
}

const getAnimales = async (req,res) => {
    // Agregar la consulta de que animales tiene el zoo 

    try {
        let response = await pool.query ('SELECT animal.*, especie.nombre_vulgal FROM animal INNER JOIN especie ON animal.id_especie = especie.id_especie')

        if(Object.keys(req.query).includes('nombre_vulgal')){
            const {nombre_vulgal} = req.query // req.query nos muestra la informacion enviada por tipo GET atravez de la URL
            let aux = await pool.query(
                'SELECT id_especie FROM especie WHERE nombre_vulgal = $1', [nombre_vulgal]
            )

            if(sinDatos(aux, res)) return

            aux = aux.rows[0].id_especie
            console.log(aux)
            response = await pool.query(
                'SELECT animal.*, especie.nombre_vulgal FROM animal INNER JOIN especie ON animal.id_especie = especie.id_especie WHERE especie.id_especie = $1', [aux]
            ) // Para poder juntar los datos se realiza una consulta especifica
        }

        if(sinDatos(response, res))return

        res.status(200).json(response.rows)

    } catch (error) {
        res.status(500).json({'error': error.message})
    }
}

const addZoo = async (req, res) => {
    try {
        // Expresion regular
        // Solo letras ^[a-zA-Z]+$
        // Solo numeros ^[0-9]*$
        // Solo numeros con punto decimal ^[0-9]+[.]+[0-9]*$
        let exTexto = new RegExp('^[a-zA-Z]+$')
        let exNumero = new RegExp('^[0-9]*$')
        let exReal = new RegExp('^[0-9]+[.]+[0-9]*$')

        const {nombre, ciudad, pais, tamanio, presupuesto_anual} = req.body
        
        console.log('nombre: ',exTexto.test( nombre)) // test compara la expresion regular con el dato enviado 
        console.log('ciudad: ',exTexto.test( ciudad))
        console.log('pais: ',exTexto.test( pais))
        console.log('tamanio: ', exReal.test(tamanio))

        if((!exTexto.test(nombre) || !exTexto.test(ciudad) || !exTexto.test(pais) || !exReal.test(tamanio) || !exReal.test(presupuesto_anual)) && !exNumero.test(tamanio) && !exNumero.test(presupuesto_anual)){
            res.status(200).json({'Status': 'falso', 'message': 'Tu registro no se pudo registrar'})
            return
        }

        //Envio de datos a la BD
        await pool.query(
            'INSERT INTO zoo (nombre, ciudad, pais, tamanio, presupuesto_anual) VALUES ($1, $2, $3, $4, $5)', 
            [nombre, ciudad, pais, tamanio, presupuesto_anual]
        )
        //res.status(200).json(req.body) // req.body nos muestra los valores enviados en tipo POST
        res.status(200).json({'Status': 'ok', 'message': 'Tu registro fue exitoso'})
        
    } catch (error) {
        res.status(500).json({'error': error.message})
    }
}

const sinDatos = (consulta, res) => {
    if(consulta.rowCount === 0){
        res.status(200).json({'Status': 'No existe registro'})
        return true
    }
    return false
}

// Exportamos las funciones
module.exports = {
    holaDev,
    getAnimales,
    getZoo,
    getEspecies,
    addZoo
}
