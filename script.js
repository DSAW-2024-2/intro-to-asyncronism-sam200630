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
            unknown: "Desconocido"
        },
        abilities: {
            // Agregar traducciones de habilidades si es necesario
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

    function obtenerDatosPokemon(identificadorPokemon) {
        return fetch(`https://pokeapi.co/api/v2/pokemon/${identificadorPokemon}`)
            .then(response => response.json())
            .catch(error => console.error('Error al obtener los datos del Pokémon:', error));
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
            <p>Altura: ${data.height / 10} m</p>
            <p>Peso: ${data.weight / 10} kg</p>
        `;

        const pie = document.createElement("div");
        pie.classList.add("pie");
        pie.innerText = `#${data.id.toString().padStart(3, '0')}`;

        pokemonCarta.appendChild(cabecera);
        pokemonCarta.appendChild(imagenContenedor);
        pokemonCarta.appendChild(info);
        pokemonCarta.appendChild(pie);

        contenedorPokemon.appendChild(pokemonCarta);
    }

    function cargarPokemon(offset = 0, limit = 20) {
        fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                const promesas = data.results.map(pokemon => obtenerDatosPokemon(pokemon.name));
                Promise.all(promesas)
                    .then(pokemones => pokemones.forEach(pokemon => crearCartaPokemon(pokemon)));
            })
            .catch(error => console.error('Error al cargar los Pokémon:', error));
    }

    botonBuscar.addEventListener("click", () => {
        const nombrePokemon = inputBusqueda.value.toLowerCase();
        if (nombrePokemon) {
            contenedorPokemon.innerHTML = ''; // Limpiar resultados anteriores
            obtenerDatosPokemon(nombrePokemon).then(data => {
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
                    const promesas = data.pokemon.map(p => obtenerDatosPokemon(p.pokemon.name));
                    Promise.all(promesas)
                        .then(pokemones => pokemones.forEach(pokemon => crearCartaPokemon(pokemon)));
                });
        }
    });

    botonCargarMas.addEventListener("click", () => {
        const numeroActualPokemon = document.querySelectorAll(".pokemon-carta").length;
        cargarPokemon(numeroActualPokemon);
    });

    // Inicialización
    cargarTipos();
    cargarPokemon();
});


