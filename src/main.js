// Importa jsPDF
const { jsPDF } = window.jspdf;

// Get dom elements
// Inputs
const selectedPokemon = document.getElementById("pokemon");
const customSelectedPokemon = document.getElementById("pokemonCustom");
const pokemonNick = document.getElementById("pokemonNick");
const humanName = document.getElementById("humanName");
const customDate = document.getElementById("customDate");

// Divs and other elements
const customNameDiv = document.getElementById("customNameContainer");
const pokemonDataDiv = document.getElementById("pokemonData");
const pokemonDataSprite = document.getElementById("pokemonDataSprite");
const pokemonDataName = document.getElementById("pokemonDataName");
const additionalDataForm = document.getElementById("additionalDataForm");
const loadingData = document.getElementById("loadingData");
const buttonGenerateContainer = document.getElementById(
  "buttonGenerateContainer"
);
const docDiv = document.getElementById("acta");

// Buttons
const searchBtn = document.getElementById("searchBtn");
const generateBtn = document.getElementById("generateBtn");

let pokemonToMarry;

// Check if Pokémon exists
searchBtn.addEventListener("click", searchPokemon);

// Event Listener for the generate doc button
generateBtn.addEventListener("click", generateDoc);
selectedPokemon.addEventListener("change", (event) => {
  let value = event.target.value;
  if (value === "custom") {
    customNameDiv.classList.remove("hidden");
  } else {
    customNameDiv.classList.add("hidden");
  }
});

async function searchPokemon() {
  const selectedPokemonValue = selectedPokemon.value;
  const customSelectedPokemonValue = customSelectedPokemon.value;
  if (!selectedPokemonValue) {
    alert("Debes seleccionar un Pokémon");
    return;
  }

  let pokemonSearchQuery;
  if (selectedPokemonValue === "custom") {
    if (!customSelectedPokemonValue) {
      alert("Escribe el nombre o número del Pokémon");
      return;
    } else {
      pokemonSearchQuery = customSelectedPokemonValue;
    }
  } else {
    pokemonSearchQuery = selectedPokemonValue;
  }

  pokemonDataDiv.classList.add("hidden");
  buttonGenerateContainer.classList.add("hidden");
  loadingData.classList.remove("hidden");

  try {
    const request = await fetch(
      "https://pokeapi.co/api/v2/pokemon/" + pokemonSearchQuery.toLowerCase()
    );
    const data = await request.json();
    pokemonToMarry = data;
    pokemonDataDiv.classList.remove("hidden");
    pokemonDataSprite.src = pokemonToMarry?.sprites?.front_default;
    pokemonDataName.innerText = capitalizeFirstLetter(
      pokemonToMarry?.name || ""
    );
    additionalDataForm.classList.remove("hidden");
    buttonGenerateContainer.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    pokemonToMarry = undefined;
    pokemonDataDiv.classList.add("hidden");
    additionalDataForm.classList.add("hidden");
		docDiv.style.display = "none";
    alert(
      "Pokémon no encontrado, intenta buscar por otro nombre o número de Pokédex"
    );
  }
  loadingData.classList.add("hidden");
}

async function generateDoc() {
  // Get values from form
  if (!pokemonToMarry) {
    alert("No hay un Pokémon seleccionado");
    return;
  }
  const humanNameValue = humanName.value.trim();
  const selectedPokemonValue = selectedPokemon.value;
  const selectedDateValue = customDate.value;
  const region = capitalizeFirstLetter(
    document.getElementById("region").value || ""
  );

  // Validate form
  if (!humanNameValue || !selectedPokemonValue || !region) {
    alert("Por favor, completa los campos requeridos.");
    return;
  }

  // Get current date
  let currentDate = new Date();
	let day = currentDate.getDate();
	let month = currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();
	if (selectedDateValue) {
		currentDate = new Date(selectedDateValue);
		day = currentDate.getUTCDate();
		month = currentDate.getUTCMonth() + 1;
	}

  const pokedexNumber = pokemonToMarry.id;

  const professorName = `Profesor Harkness`;

  // Pokemon name or nick
  const officialPokemonName = capitalizeFirstLetter(pokemonToMarry.name);
  let customPokemonName = capitalizeFirstLetter(pokemonToMarry.name);
  if (pokemonNick.value) {
    customPokemonName = capitalizeFirstLetter(pokemonNick.value);
  }

  // Create doc in HTML
  const docHTML = `
        <h2>ACTA DE MATRIMONIO</h2>
        <p><strong>En la Liga Pokémon de la región ${region}, a los ${day} días del mes de ${getMonthName(
    month
  )}, del año ${year}, se declara formalmente el matrimonio entre:</p>
    
        <p><strong class="nombre-humano">${humanNameValue}</strong><br>
        Humano/a perteneciente a la región de ${region}.</p>
    
        <p><strong>${customPokemonName}</strong><br>
        Especie: ${officialPokemonName}<br>
        Número en la Pokédex: #${pokedexNumber}</p>
    
        <p>Bajo la supervisión del Alto Mando de la región de ${region}, así como del ${professorName}, ambos individuos han decidido unirse en matrimonio bajo las leyes y regulaciones de la Liga Pokémon.</p>
    
        <p>Se declara que, de ahora en adelante, ambas partes se comprometen a respetar y protegerse mutuamente en salud, en batalla, y en cualquier aventura o desafío que enfrenten en el futuro.</p>
    
        <p><strong>Certificado por:</strong><br>
        ${professorName} de la región de ${region}.</p>
    
        <p><strong>Fecha de expedición:</strong> ${day}/${month}/${year}</p>
      `;

  docDiv.innerHTML = docHTML;
  docDiv.style.display = "block";

  // Generar y descargar el PDF
  generatePDF(humanNameValue, customPokemonName);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get month name by month number (0 - 11)
function getMonthName(monthNumber) {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return meses[monthNumber - 1];
}

// Función para generar y descargar el PDF
function generatePDF(nombreHumano, nombreOficialPokemon) {
  const doc = new jsPDF();

  doc.setFont("Open Sans", "italic");

  const docContent = document.getElementById("acta").innerText;

  const lines = doc.splitTextToSize(docContent, 180);
  let y = 20;

  lines.forEach((line) => {
    if (line.includes(nombreHumano)) {
      const parts = line.split(nombreHumano);
      if (parts.length > 1) {
        doc.setFont("Open Sans", "italic");
        doc.text(parts[0], 10, y);
        doc.setFont("Oleo Script", "normal");
        doc.text(nombreHumano, 10 + doc.getTextWidth(parts[0] + " "), y);
        doc.setFont("Open Sans", "italic");
        doc.text(
          parts[1],
          10 + doc.getTextWidth(parts[0] + " " + nombreHumano + " "),
          y
        );
      } else {
        doc.text(line, 10, y);
      }
    } else {
      doc.text(line, 10, y);
    }
    y += 10;
  });

  // Download pdf
  doc.save(`${nombreHumano}_${nombreOficialPokemon}_Acta.pdf`);
}
