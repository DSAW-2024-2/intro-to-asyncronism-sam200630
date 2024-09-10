document.addEventListener("DOMContentLoaded", () => {
    const contenedorPokemon = document.getElementById("contenedor-pokemon");
    const botonBuscar = document.getElementById("boton-buscar");
    const inputBusqueda = document.getElementById("pokemon-busqueda");
    const filtroTipo = document.getElementById("filtro-tipo");
    const botonCargarMas = document.getElementById("boton-cargar-mas");

    const traducciones = {
        types: {
            fire: "Fuego",
            water: "Agua",
            grass: "Planta",
            electric: "Eléctrico",
            bug: "Bicho",
            normal: "Normal",
            poison: "Veneno",
            flying: "Volador",
            fighting: "Lucha",
            ground: "Tierra",
            rock: "Roca",
            ghost: "Fantasma",
            psychic: "Psíquico",
            ice: "Hielo",
            dragon: "Dragón",
            dark: "Siniestro",
            fairy: "Hada",
            steel: "Acero",
        },
        stats: {
            hp: "HP",
            attack: "Ataque",
            defense: "Defensa",
            "special-attack": "Ataque Esp.",
            "special-defense": "Defensa Esp.",
            speed: "Velocidad",
        }
    };

    function cargarTipos() {
        fetch('https://pokeapi.co/api/v2/type')
            .then(response => response.json())
            .then(data => {
                data.results.forEach(tipo => {
                    const opcion = document.createElement('option');
                    opcion.value = tipo.name;
                    opcion.textContent = traducciones.types[tipo.name] || tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1);
                    filtroTipo.appendChild(opcion);
                });
            });
    }

    async function fetchPokemonData(pokemonId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const pokemon = await response.json();

            // Obtener la información de los biomas
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const species = await speciesResponse.json();

            const habitatUrls = species.habitat ? [species.habitat.url] : [];
            const habitatPromises = habitatUrls.map(url => fetch(url).then(res => res.json()));
            const habitats = await Promise.all(habitatPromises);

            return { ...pokemon, habitats: habitats.map(habitat => habitat.name) };
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
        }
    }

    function crearCartaPokemon(data) {
        const pokemonCarta = document.createElement("div");
        pokemonCarta.classList.add("pokemon-carta");

        const tipos = data.types.map(typeInfo => typeInfo.type.name);
        const tipoPrincipal = tipos[0];
        const claseTipo = `carta-${tipoPrincipal}`;

        pokemonCarta.classList.add(claseTipo);

        const cabecera = document.createElement("div");
        cabecera.classList.add("cabecera");
        cabecera.innerHTML = `
            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
            <span class="tipo">Tipos: ${tipos.map(tipo => traducciones.types[tipo]).join(", ")}</span>
        `;

        const imagenContenedor = document.createElement("div");
        imagenContenedor.classList.add("imagen-pokemon");
        const imagen = document.createElement("img");
        imagen.src = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;
        imagen.alt = data.name;
        imagenContenedor.appendChild(imagen);

        const info = document.createElement("div");
        info.classList.add("info-pokemon");
        info.innerHTML = `
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <p><strong>Experiencia Base:</strong> ${data.base_experience}</p>
            <p><strong>Habilidades:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p><strong>Biomas:</strong> ${data.habitats.join(', ')}</p>
        `;

        const pie = document.createElement("div");
        pie.classList.add("pie");
        pie.innerText = `#${data.id.toString().padStart(3, '0')}`;

        // Contenedor de estadísticas
        const estadisticasContenedor = document.createElement("div");
        estadisticasContenedor.classList.add("estadisticas-pokemon");
        estadisticasContenedor.style.display = "none"; // Oculto por defecto

        // Añadir estadísticas
        data.stats.forEach(stat => {
            const estadistica = document.createElement("div");
            estadistica.classList.add("estadistica");

            const nombreEstadistica = document.createElement("span");
            nombreEstadistica.classList.add("estadistica-nombre");
            nombreEstadistica.textContent = traducciones.stats[stat.stat.name] || stat.stat.name;

            const barraContenedor = document.createElement("div");
            barraContenedor.classList.add("estadistica-barra");

            const barra = document.createElement("div");
            barra.style.width = `${stat.base_stat}%`;
            barra.style.backgroundColor = getColorForType(tipoPrincipal);

            barraContenedor.appendChild(barra);
            estadistica.appendChild(nombreEstadistica);
            estadistica.appendChild(barraContenedor);

            estadisticasContenedor.appendChild(estadistica);
        });

        pokemonCarta.appendChild(cabecera);
        pokemonCarta.appendChild(imagenContenedor);
        pokemonCarta.appendChild(info);
        pokemonCarta.appendChild(pie);
        pokemonCarta.appendChild(estadisticasContenedor);

        pokemonCarta.addEventListener("click", () => {
            if (pokemonCarta.classList.contains("expandida")) {
                pokemonCarta.classList.remove("expandida");
                estadisticasContenedor.style.display = "none";
            } else {
                pokemonCarta.classList.add("expandida");
                estadisticasContenedor.style.display = "flex";
            }
        });

        contenedorPokemon.appendChild(pokemonCarta);
    }

    function cargarPokemon(offset = 0, limit = 21) {
        fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                const promesas = data.results.map(pokemon => fetchPokemonData(pokemon.name));
                Promise.all(promesas)
                    .then(pokemones => pokemones.forEach(pokemon => crearCartaPokemon(pokemon)));
            })
            .catch(error => console.error('Error al cargar los Pokémon:', error));
    }

    botonBuscar.addEventListener("click", () => {
        const nombrePokemon = inputBusqueda.value.toLowerCase();
        if (nombrePokemon) {
            contenedorPokemon.innerHTML = ''; // Limpiar resultados anteriores
            fetchPokemonData(nombrePokemon).then(data => {
                if (data) crearCartaPokemon(data);
            });
        }
    });

    filtroTipo.addEventListener("change", () => {
        const tipoSeleccionado = filtroTipo.value;
        if (tipoSeleccionado === "todos") {
            contenedorPokemon.innerHTML = '';
            cargarPokemon();
        } else {
            fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`)
                .then(response => response.json())
                .then(data => {
                    contenedorPokemon.innerHTML = '';
                    const promesas = data.pokemon.map(p => fetchPokemonData(p.pokemon.name));
                    Promise.all(promesas)
                        .then(pokemones => pokemones.forEach(pokemon => crearCartaPokemon(pokemon)));
                });
        }
    });

    botonCargarMas.addEventListener("click", () => {
        const numeroActualPokemon = document.querySelectorAll(".pokemon-carta").length;
        cargarPokemon(numeroActualPokemon);
    });

    function getColorForType(type) {
        switch (type) {
            case 'fire': return '#f08030'; /* Color para tipo Fuego */
            case 'water': return '#6890f0'; /* Color para tipo Agua */
            case 'grass': return '#78c850'; /* Color para tipo Planta */
            case 'electric': return '#f8d030'; /* Color para tipo Eléctrico */
            case 'bug': return '#a8b820'; /* Color para tipo Bicho */
            case 'normal': return '#a8a878'; /* Color para tipo Normal */
            case 'poison': return '#a040a0'; /* Color para tipo Veneno */
            case 'flying': return '#a890f0'; /* Color para tipo Volador */
            case 'fighting': return '#c03028'; /* Color para tipo Lucha */
            case 'ground': return '#e0c068'; /* Color para tipo Tierra */
            case 'rock': return '#6b6b6b'; /* Color para tipo Roca */
            case 'ghost': return '#ffffff'; /* Color para tipo Fantasma */
            case 'psychic': return '#f85888'; /* Color para tipo Psíquico */
            case 'ice': return '#98d8d8'; /* Color para tipo Hielo */
            case 'dragon': return '#ff0000'; /* Color para tipo Dragón */
            case 'dark': return '#6f6f6f'; /* Color para tipo Siniestro */
            case 'fairy': return '#ff77ff'; /* Color para tipo Hada */
            case 'steel': return '#a8a8a8'; /* Color para tipo Acero */
            default: return '#a0a0a0'; /* Color predeterminado */
        }
    }

    cargarTipos();
    cargarPokemon();
});