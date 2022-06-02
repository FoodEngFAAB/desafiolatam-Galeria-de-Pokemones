//Packages
const axios = require('axios')
const http = require('http')
const fs = require('fs')
const url = require('url')


//Configura puerto en uso
const port = 3000

//Indica cantidad de pokemones a consultar
const pkmQ = 3

//Genera un nuevo arreglo con la data a entregar en el siguiente requerimiento (3)
//Arreglo para la data
let pokeData = []
//Arreglo para promesas
let cutPkeData = []

//Levanta servidor
http
  .createServer(function (req, res) {

    //Acceso a imágenes
    if (req.url.includes('/imagenes')) {
      //Inidica qué tipo de archivo se utilizará. HTML.
      res.writeHead(200, { 'Content-Type': 'text/html' })
      //Lee el index.html y responderemos con dicho index en la página.
      fs.readFile('index.html', 'utf8', (err, html) => {
        //Escribe el html
        res.write(html)
        res.end()
      })
    }

    //Acceso a los pokemones
    if (req.url.includes('/pokemones')) {
      //Indica qué tipo de fichero se trabajará
      res.writeHead(200, { 'Content-Type': 'application/json' })

      //Uso de await/async de consultas de la pokeAPI
      async function getPkmn() {
        const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${pkmQ}`)
        //console.log(data.results) OK
        return data.results
      }

      async function getAll(name) {
        const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
        return data
      }

      //Uso del Promise.all() para ejecutar y obtener la data de las funciones asíncronas
      getPkmn().then((results) => {
        results.forEach((p) => {
          let pokeNameData = p.name
          //console.log(p.name) //OK arroja como resultado nombres de pokemones en cantidad requerida
          pokeData.push(getAll(pokeNameData))
          //console.log(pokeData) //OK arroja como resultado promesas pendientes en cantidad requerida
        })

        Promise.all(pokeData).then((data) => {
          data.forEach((i) => {
            let pokeImg = i.sprites.front_default
            let pokeName = i.name
            cutPkeData.push({pokeImg, pokeName})
            // console.log(cutPkeData)
            // OK arroja arreglo de pokeImg y pokeName en cantidad requerida
          })
          res.write(JSON.stringify(cutPkeData))
          res.end()
        }).catch(e => console.log("error"))
      })
    }
  })
  .listen(port, console.log(`Puerto ${port} en uso.`))