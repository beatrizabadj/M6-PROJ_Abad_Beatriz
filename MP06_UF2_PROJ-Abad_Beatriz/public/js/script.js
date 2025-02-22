document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelectorAll("body form")[0];
    form.id = "form";
    const name = document.createElement("p");
    name.innerHTML = "Introdueix alguna cosa:";
    const input = document.createElement("input");
    input.id = "nameInput";
    input.type = "text";
    input.placeholder = "Introdueix alguna cosa...";
    const br = document.createElement("br");
    const br2 = document.createElement("br");

    form.insertBefore(br, form.children[0]);
    form.insertBefore(br2, form.children[1]);
    form.insertBefore(input, form.firstChild);
    form.insertBefore(name, form.firstChild);

    //ccaa
    const listCCAA = document.getElementById("ccaa");
    const urlCCAA = "https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json";

    fetch(urlCCAA)
        .then(response => response.json())
        .then(data => {
            data.forEach(ca => {
                const option = document.createElement("option");
                option.value = ca.code;
                option.textContent = ca.label;
                listCCAA.appendChild(option);
            });
        });

    //provincia
    listCCAA.addEventListener("change", () => {
        const selectedCCAA = listCCAA.value;
        console.log('selected ccaa', selectedCCAA);
        const listProv = document.getElementById("provincia");
        listProv.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json")
            .then(response => response.json())
            .then(data => {
                data.forEach(prov => {
                    if (prov.parent_code === selectedCCAA) {
                        const option = document.createElement("option");
                        option.value = prov.code;
                        option.textContent = prov.label;
                        listProv.appendChild(option);
                    }
                });
            });
    });

    //poblacion
    const listProv = document.getElementById("provincia");
    const listPobl = document.getElementById("poblacion");

    listProv.addEventListener('change', () => {
        const selectedProv = listProv.value;
        console.log('selected province: ', selectedProv);
        listPobl.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json")
            .then(response => response.json())
            .then(data => {
                data.forEach(pobl => {
                    if (pobl.parent_code === selectedProv) {
                        const option = document.createElement("option");
                        option.value = pobl.code;
                        option.textContent = pobl.label;
                        listPobl.appendChild(option);
                    }
                });
            });
    });

    //peticion a unsplash en el input, al darle enviar
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const query = input.value.trim();
        const selectedPobl = listPobl.options[listPobl.selectedIndex]?.text; //accedo al texto de la poblacion

        if (!query && !selectedPobl) return; 

        const imageContainer = document.getElementById("image-container");
        imageContainer.innerHTML = "";

        if (query) {
            await fetchUnsplash(query, imageContainer);  
        } else if (selectedPobl) {
            await searchByLocation(selectedPobl); 
        }
    });

        //funcion busqueda por unsplash
        async function fetchUnsplash(query, imageContainer){
    
            const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=jpnIjj7QJrREAm4VDnctJQ4tJIVHXH7q5sdstE8dnfw`;
    
            try {
                const response = await fetch(unsplashUrl);
                const data = await response.json();
    
                if (data.results && data.results.length > 0) {
                    imageContainer.innerHTML = `<h3>Qué bien! Existen imágenes en Unsplash</h3>`;

                    data.results.forEach((photo) => {
                        createImageCard(photo.urls.small, photo.description || "unsplash image", imageContainer);
                        console.log('imagen de unsplash');

                    });
                } else {
                    console.log("No se encontraron imágenes en Unsplash.");
                    imageContainer.innerHTML = `<h3>Parece que tampoco hay nada en Unsplash...</h3>`;

                    setTimeout(()=>{
                        imageContainer.innerHTML = `<h3>Tendrás que buscar otra cosa...</h3>`;

                    }, 3000);

                }
            } catch (error) {
                console.error("Error buscando imágenes en Unsplash", error);
                imageContainer.innerHTML = `<h3>Error buscando en unsplash...</h3>`;

            }
        }
     
        //busqueda de imagenes por commons
        const searchByLocation = async (location) => {
            const imageContainer = document.getElementById("image-container");
            imageContainer.innerHTML = ""; 

            const imagesCommons = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(location)}&gimlimit=10&prop=imageinfo&iiprop=url`;

            try {
                const response = await fetch(imagesCommons);
                const data = await response.json();

                if (data.query && data.query.pages) {
                    let imagesFound = false;

                    Object.values(data.query.pages).forEach((page) => {
                        imageContainer.innerHTML = `<h3>A la primera!! Estas son imágenes de Commons</h3>`;

                        if (page.imageinfo && page.imageinfo[0]) {
                            imagesFound = true;
                            createImageCard(page.imageinfo[0].url, page.title, imageContainer);
                        }
                    });

                    if (!imagesFound) {
                        console.log("No se encontraron imágenes en Commons. Buscando en SerpAPI...");
                        imageContainer.innerHTML = `<h3>No he encontrado imágenes en Commons. Voy a buscar en Serpapi...</h3>`;
                        await fetchSerpApi(location, imageContainer);
                    }
                } else {
                    console.log("No se encontraron imágenes en Commons. Buscando en SerpAPI...");
                    imageContainer.innerHTML = `<h3>No he encontrado imágenes en Commons. Voy a buscar en Serpapi...</h3>`;
                    await fetchSerpApi(location, imageContainer);
                }
            } catch (error) {
                console.error("Error buscando imágenes en Commons", error);
                imageContainer.innerHTML = `<h3>Error buscando en Commons...</h3>`;
                await fetchSerpApi(location, imageContainer);
            }
        };

            //busqueda de imagenes por serpapi
            async function fetchSerpApi(query, imageContainer) {
            const apiKey = "f8910fee8f3babe4f359b438e2e02f9b9762b4c34acae3ddec0f3463bb692970";

            try {
                const apiUrl = window.location.hostname === "localhost"
                    ? `http://localhost:3000/serpapi?q=${encodeURIComponent(query)}` //port 3000 en local
                    : `https://m6-proj-abad-beatriz.onrender.com/serpapi?q=${encodeURIComponent(query)}`;
        
                const response = await fetch(apiUrl, {
                    method: 'GET',
                });
                const data = await response.json();

                if (data.images_results && data.images_results.length > 0) {
                    data.images_results.slice(0, 5).forEach((image) => {
                        createImageCard(image.original, "Imagen de Google", imageContainer);
                    });
                } else {
                    console.log("No se encontraron imágenes en SerpAPI.");
                    imageContainer.innerHTML = `<h3>Has superado el máximo de búsquedas en Serpapi. Voy a buscar en Unsplash...</h3>`;
                    await fetchUnsplash(query, imageContainer);
                }
            } catch (error) {
                console.error("Error buscando imágenes en SerpAPI", error);
                imageContainer.innerHTML = `<h3>Error buscando imágenes en Serpapi...</h3>`;
                await fetchUnsplash(query, imageContainer);

            }
        }

        //creacion de tarjeta para cada imagen
        function createImageCard(imageUrl, altText, container) {
            const card = document.createElement("div");
            card.className = "image-card";
            card.style.padding = "10px";
            card.style.margin = "10px";
            card.style.textAlign = "center";

            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = altText;
            img.style.width = "300px"; 
            img.style.height = "auto";
            img.style.borderRadius = "10px";
            img.loading = "lazy"; //mejora el rendimiento
            card.appendChild(img);

            //boton donde metemos las tres funciones
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.justifyContent = "center";
            buttonContainer.style.gap = "10px";
            buttonContainer.style.marginTop = "10px";

            //API CLIPBOARD
            const copyButton = createButton("📋", "Copiar URL", () => {
                navigator.clipboard.writeText(img.src).then(() => {
                    alert("URL copiada al portapapeles: " + img.src);
                });
            });
            buttonContainer.appendChild(copyButton);

            //API SHARE
            const shareButton = createButton("🔗", "Compartir", () => {
                navigator.share({
                    title: "Imagen de " + altText,
                    url: img.src,
                }).catch((error) => {
                    console.error("Error al compartir la imagen", error);
                });
            });
            buttonContainer.appendChild(shareButton);

            //API FULLSCREEN para los distintos navegadores
            const fullscreenButton = createButton("🔍", "Pantalla completa", () => {
                if (img.requestFullscreen) {
                    img.requestFullscreen();
                } else if (img.mozRequestFullScreen) { //firefox
                    img.mozRequestFullScreen();
                } else if (img.webkitRequestFullscreen) { //chrome, safari, opera
                    img.webkitRequestFullscreen();
                } else if (img.msRequestFullscreen) { //ie/edge
                    img.msRequestFullscreen();
                }
            });
            buttonContainer.appendChild(fullscreenButton);

            card.appendChild(buttonContainer);
            container.appendChild(card);
        }

        //creacion de botones y sus iconos
        function createButton(icon, tooltip, onClick) {
            const button = document.createElement("button");
            button.innerHTML = icon;
            button.title = tooltip;
            button.style.border = "none";
            button.style.background = "none";
            button.style.cursor = "pointer";
            button.style.fontSize = "20px";
            button.addEventListener("click", onClick);
            return button;
        }

        //EXPLICACION VISUAL

        //tooltips de los selects
        listCCAA.title = "Select que se llena inmediatamente al cargar la página y devuelve una lista de las CCAA de España.";

        listProv.title = "Select segmentado al seleccionar la CCAA. Devuelve una lista de las provincias de España.";

        listPobl.title = "Select segmentado al seleccionar la provincia. Devuelve una lista de las poblaciones de España.";

        //boton para el modal
        const infoButton = document.createElement("button");
        infoButton.innerHTML = "Apis usadas";
        infoButton.style.position = "fixed";
        infoButton.style.top = "10px";
        infoButton.style.right = "10px";
        infoButton.style.padding = "10px";
        infoButton.style.backgroundColor = "rgb(254, 254, 255)";
        infoButton.style.color = "#black";
        infoButton.style.border = "none";
        infoButton.style.borderRadius = "5px";
        infoButton.style.cursor = "pointer";
        document.body.appendChild(infoButton);

        //modal para 
        const modal = document.createElement("div");
        modal.style.display = "none";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.backgroundColor = "#2a5298";
        modal.style.padding = "30px";
        modal.style.borderRadius = "15px";
        modal.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
        modal.style.zIndex = "1000";
        modal.style.color = "white";
        modal.style.width = "400px";
        modal.style.maxWidth = "90%";
        modal.style.textAlign = "center";
        modal.innerHTML = `
            <h2 style="margin-bottom: 20px; font-size: 24px; color:rgb(246, 246, 247);">¿Cómo funciona?</h2>
            <p style="font-size: 16px; line-height: 1.6; text-decoration:underline;">APIs REST utilizadas:</p>
            <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                <li style="margin-bottom: 10px;"><strong>Wikimedia Commons</strong>: Búsqueda de imágenes.</li>
                <li style="margin-bottom: 10px;"><strong>Serpapi</strong>: Búsqueda de imágenes por población. (Nos hemos quedado sin solicitudes)</li>
                <li style="margin-bottom: 10px;"><strong>Unsplash</strong>: Búsqueda de imágenes.</li>
            </ul>
            <p style="font-size: 16px; line-height: 1.6;text-decoration:underline;">APIs de navegador implementadas:</p>
            <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                <li style="margin-bottom: 10px;"><strong>Clipboard API</strong>: Copia la url de las imágenes!</li>
                <li style="margin-bottom: 10px;"><strong>Web Share API</strong>: Comparte las imágenes desde el navegador!</li>
                <li style="margin-bottom: 10px;"><strong>Fullscreen API</strong>: Mira las imágenes en pantalla completa.</li>
            </ul>
            <p style="font-size: 16px; line-height: 1.6; text-decoration:underline;">Explicación visual usando:</p>
            <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                <li style="margin-bottom: 10px;"><strong>Este modal</strong></li>
                <li style="margin-bottom: 10px;"><strong>Tooltips</strong></li>
            </ul>
            <button id="closeModal" style="padding: 10px 20px; background-color: #ff6f61; color: #FFF; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Cerrar</button>
            `;
        document.body.appendChild(modal);

        //tooltips 
        function createTooltip(element, text) {
            const tooltip = document.createElement("div");
            tooltip.textContent = text;
            tooltip.style.position = "absolute";
            tooltip.style.backgroundColor = "#333";
            tooltip.style.color = "#FFF";
            tooltip.style.padding = "5px 10px";
            tooltip.style.borderRadius = "5px";
            tooltip.style.fontSize = "14px";
            tooltip.style.zIndex = "1001";
            tooltip.style.display = "none";
            tooltip.style.top = "100%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translateX(-50%)";
            tooltip.style.whiteSpace = "nowrap";
            tooltip.style.marginTop = "5px";

            element.style.position = "relative";
            element.appendChild(tooltip);

            element.addEventListener("mouseover", () => {
                tooltip.style.display = "block";
            });

            element.addEventListener("mouseout", () => {
                tooltip.style.display = "none";
            });
        }
        //fondo oscuro para el modal
        const overlay = document.createElement("div");
        overlay.style.display = "none";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "999";
        document.body.appendChild(overlay);

        //al abrir el modal se pone el fondo oscuro
        infoButton.addEventListener("click", () => {
            modal.style.display = "block";
            overlay.style.display = "block";
        });

        document.getElementById("closeModal").addEventListener("click", () => {
            modal.style.display = "none";
            overlay.style.display = "none";
        });

        overlay.addEventListener("click", () => {
            modal.style.display = "none";
            overlay.style.display = "none";
        });
       
        infoButton.addEventListener("click", () => {
            modal.style.display = "block";
        });

        document.getElementById("closeModal").addEventListener("click", () => {
            modal.style.display = "none";
            
        });
    }
);