document.addEventListener("DOMContentLoaded", () => {
    const contenedorPokemon = document.getElementById("contenedor-pokemon");
    const botonBuscar = document.getElementById("boton-buscar");
    const inputBusqueda = document.getElementById("pokemon-busqueda");
    const filtroTipo = document.getElementById("filtro-tipo");

    // Diccionario de traducciones
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
            fairy: "Hada"
            // Agrega aquí otros tipos si es necesario
        },
        abilities: {
        }
    };

    // Función para obtener todos los tipos de Pokémon de la API y llenar el filtro de tipo
    function cargarTipos() {
        fetch('https://pokeapi.co/api/v2/type')
            .then(response => response.json())
            .then(data => {
                data.results.forEach(tipo => {
                    // Excluir los tipos "steel" y "unknown"
                    if (tipo.name !== 'steel' && tipo.name !== 'unknown') {
                        const opcion = document.createElement('option');
                        opcion.value = tipo.name;
                        opcion.textContent = traducciones.types[tipo.name] || tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1);
                        filtroTipo.appendChild(opcion);
                    }
                });
            })
            .catch(error => console.error('Error al cargar los tipos:', error));
    }

    // Función para obtener datos de un Pokémon por nombre o ID
    function obtenerDatosPokemon(identificadorPokemon) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${identificadorPokemon}`)
            .then(response => response.json())
            .then(data => {
                crearCartaPokemon(data);
            })
            .catch(error => console.error('Error al obtener los datos del Pokémon:', error));
    }

    // Función para crear y mostrar una carta de Pokémon
    function crearCartaPokemon(data) {
        const pokemonCarta = document.createElement("div");

        // Asignar clase de categoría basado en el poder
        let claseCategoria = 'carta-basica'; 
        if (data.stats[1].base_stat > 100) {
            claseCategoria = 'carta-rara';
        }
        if (data.stats[1].base_stat > 150) {
            claseCategoria = 'carta-legendaria';
        }
        
        // Asignar clase de tipo basado en el tipo de Pokémon
        const tipo = data.types[0].type.name;
        let claseTipo = '';
        switch(tipo) {
            case 'fire':
                claseTipo = 'carta-fuego';
                break;
            case 'water':
                claseTipo = 'carta-agua';
                break;
            case 'grass':
                claseTipo = 'carta-planta';
                break;
            case 'electric':
                claseTipo = 'carta-electrico';
                break;
            default:
                claseTipo = '';
        }

        pokemonCarta.classList.add("pokemon-carta", claseCategoria, claseTipo);

        const contenidoPokemon = `
            <div class="cabecera">
                <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                <span class="tipo">Tipo: ${data.types.map(typeInfo => traducciones.types[typeInfo.type.name] || typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)).join(", ")}</span>
            </div>
            <div class="imagen-pokemon">
                <img src="${data.sprites.front_default}" alt="${data.name}">
            </div>
            <div class="info-pokemon">
                <p><strong>N.º:</strong> ${data.id}</p>
                <p><strong>Altura:</strong> ${data.height / 10} m</p>
                <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
                <p><strong>Habilidad:</strong> ${data.abilities.map(abilityInfo => traducciones.abilities[abilityInfo.ability.name] || abilityInfo.ability.name.charAt(0).toUpperCase() + abilityInfo.ability.name.slice(1)).join(", ")}</p>
            </div>
        `;
        pokemonCarta.innerHTML = contenidoPokemon;
        contenedorPokemon.appendChild(pokemonCarta);
    }

    async function mostrarPokemonsAleatorios(cantidad) {
        contenedorPokemon.innerHTML = "";
        const idsAleatorios = Array.from({ length: cantidad }, () => Math.floor(Math.random() * 898) + 1);

        idsAleatorios.forEach(id => {
            obtenerDatosPokemon(id);
        });
    }

    async function filtrarPokemons() {
        const tipoSeleccionado = filtroTipo.value;

        contenedorPokemon.innerHTML = "";

        if (tipoSeleccionado === "todos") {
            mostrarPokemonsAleatorios(200);
        } else {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`);
                const typeData = await response.json();
                typeData.pokemon.forEach(pokemonInfo => {
                    obtenerDatosPokemon(pokemonInfo.pokemon.name);
                });
            } catch (error) {
                console.error('Error al obtener Pokémon por tipo:', error);
            }
        }
    }

    botonBuscar.addEventListener("click", () => {
        const entradaBusqueda = inputBusqueda.value.toLowerCase().trim();
        if (entradaBusqueda) {
            contenedorPokemon.innerHTML = "";
            // Verifica si la entrada es un número o nombre
            const esNumero = !isNaN(entradaBusqueda);
            obtenerDatosPokemon(esNumero ? parseInt(entradaBusqueda) : entradaBusqueda);
        }
    });

    filtroTipo.addEventListener("change", filtrarPokemons);

    cargarTipos();
    mostrarPokemonsAleatorios(200);
});



