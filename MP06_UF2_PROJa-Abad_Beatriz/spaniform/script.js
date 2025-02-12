document.addEventListener("DOMContentLoaded", async()=>{
    //-Input:text per a Nom complet
        const form = document.querySelectorAll("body form")[0];
        form.id ="form";
        const name = document.createElement("p");
        name.innerHTML="Nom Complet:";
        const input = document.createElement("input");
        input.id = "nameInput";
        input.type = "text";
        input.placeholder = "Nom complet";
        const br = document.createElement("br");
        const br2 = document.createElement("br");
        
        form.insertBefore(br, form.children[0]);
        form.insertBefore(br2, form.children[1]);
        form.insertBefore(input, form.firstChild);
        form.insertBefore(name, form.firstChild);
   
    //-Select per a llista de Comunitats Autònomes. S’ha d’emplenar automàticament
    // (AL CARREGAR LA PÀGINA) a partir del JSON:
    //https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json
    // if (!window.fetch){
    //     let xhr = new XMLHttpRequest();
    // }else{
    const listCCAA = document.getElementById("ccaa");
    const urlCCAA= "https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json";
        // (async (urlCCAA)=> {
            fetch(urlCCAA)
                .then(response => response.json())
                .then(data => {
                    data.forEach(ca => {
                        // if(ca.parent_code === "0"){
                            const option = document.createElement("option"); //creation de las opciones de seleccion
                            option.value = ca.code;
                            option.textContent = ca.label;
                            listCCAA.appendChild(option); 
                    
                    });
                });
        
    listCCAA.addEventListener("change", ()=>{
        const selectedCCAA = listCCAA.value; //guardo el valor de la ccaa seleccionada en selectedCCAA
        console.log('selected ccaa', selectedCCAA);
        listProv.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>'; //limpiamos cuando cambia

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json")
            .then(response => response.json())
            .then(data =>{
                data.forEach(prov => {
                    //comparacion de la seleccion con el parent_code de la provincia
                    if(prov.parent_code === selectedCCAA) { //no hace falta hacer selectedCCAA.code porque no estamos buscando una propiedad
                    //porque está implícito
                        const option = document.createElement("option");
                        option.value = prov.code; //asignamos a opcion el valor de la provincia con code (clave unica)
                        option.textContent = prov.label;
                        listProv.appendChild(option);
                    }
                });
            });
    });

    const listProv = document.getElementById("provincia");    
    const listPobl = document.getElementById("poblacion");

//-Select per a llista de Poblacions. S’ha d’emplenar automàticament (AL SELECCIONAR UNA PROVÍNCIA) a partir del JSON:
    //https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json
    
    listProv.addEventListener('change', ()=>{
        const selectedProv = listProv.value;
        console.log('selected province: ', selectedProv);
        listPobl.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        
        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json")
            .then(response=>response.json())
            .then(data =>{
                data.forEach(pobl => {
                    //el parentcode de poblaciones es el code de provincias
                    if(pobl.parent_code === selectedProv){
                        const option = document.createElement("option");
                        option.value = pobl.code; 
                        option.textContent = pobl.label;
                        listPobl.appendChild(option);
                    }
                })
            })
        });
        
    //Al clicar el botó de submit, s’ha d’interrompre l’enviament del formulari i, coma acció alternativa, s’ha de demanar a l’API de Wikimedia les 10 primeres fotos de la població seleccionada:
    //https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacio)}&gimlimit=10&prop=imageinfo&iiprop=url … i mostrar en el DOM les imatges descarregades. Si no hi ha cap foto de la poblaciótriada, mostrar un missatge 

        const submit = document.getElementById("form"); 
        //añadimos el addEventListener en el formulario en sí
        submit.addEventListener('submit', async (event)=>{
            event.preventDefault();
            
            //obtencion del nombre del select con selectedIndex.text
            const poblacio = document.getElementById("poblacion").options[document.getElementById("poblacion").selectedIndex
            ].text;
            console.log('selected poblacio', poblacio);

            const imagesApi = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacio)}&gimlimit=10&prop=imageinfo&iiprop=url`
            console.log(imagesApi);
            try {
                // Hacer la petición a la API
                const response = await fetch(imagesApi);
                const data = await response.json();
        
                if (!data.query || !data.query.pages) {
                    console.error("No se encontraron imágenes.");
                    return;
                }
        
                const imageContainer = document.getElementById("image-container");
                imageContainer.innerHTML = "";
        
                //recorremos el objeto y sus propiedades para acceder a la imagen
                Object.values(data.query.pages).forEach((page) => {
                    if (page.imageinfo && page.imageinfo[0]) {
                        const img = document.createElement("img");
                        img.src = page.imageinfo[0].url;
                        img.alt = page.title;
                        img.style.width = "200px"; 
                        img.style.margin = "10px";
                        imageContainer.appendChild(img);
        
                        console.log("imagen:", page.imageinfo[0].url);
                    }
                });
        
            } catch (error) {
                console.error("no se han encontrado imágenes", error);
            }
        });
    })


