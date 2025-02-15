const express = require("express");
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.use(cors({
    origin: 'http://localhost:5500',
    credentials:true,
}
));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Permitir solicitudes desde localhost:3000
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Permitir estos métodos
//     next();
//   });
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.get("/serpapi", async (req, res) =>{
    //const {query} = req.query;
    const query = req.query.q;
    const apiKey = "f8910fee8f3babe4f359b438e2e02f9b9762b4c34acae3ddec0f3463bb692970";

    
    const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&tbm=isch&api_key=${encodeURIComponent(apiKey)}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data); //envio de datos al frontend
    } catch(error){
        res.status(500).json({error: 'no se han encontrado imagenes'})
    }
});

app.listen(3000, () => console.log('servidor corriendo en http://localhost:3000'));