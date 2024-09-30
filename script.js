// Elementos del DOM
const selection = document.getElementById("selection");
const gutenbergSelection = document.getElementById("gutenberg-selection");
const aiSelection = document.getElementById("ai-selection");
const gutenbergBookDiv = document.getElementById("gutenberg-book");
const aiBookDiv = document.getElementById("ai-book");
const storyType = document.getElementById("storyType");
const protagonistName = document.getElementById("protagonistName");
const setting = document.getElementById("setting");
const genre = document.getElementById("genre");

// Mostrar/Ocultar opciones según la selección
selection.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value === "gutenberg") {
        gutenbergSelection.classList.remove("hidden");
        aiSelection.classList.add("hidden");
    } else {
        aiSelection.classList.remove("hidden");
        gutenbergSelection.classList.add("hidden");
    }
});

// Implementar la carga desde Project Gutenberg con filtros
document.getElementById("load-gutenberg").addEventListener("click", async () => {
    const selectedGenre = genre.value;
    const response = await fetch(`https://gutendex.com/books?topic=${selectedGenre}`);
    const data = await response.json();

    // Tomamos el primer libro para mostrarlo
    const book = data.results[0];
    const bookTitle = book.title;
    const bookAuthor = book.authors[0].name;
    const bookText = book.formats['text/plain'];

    // Mostrar libro en el div
    gutenbergBookDiv.innerHTML = `<h3>${bookTitle} - ${bookAuthor}</h3><p>${bookText}</p>`;
});

// Implementar la generación de cuentos con IA usando preguntas dinámicas
async function generateStory() {
    const selectedStoryType = storyType.value;
    const protagonist = protagonistName.value || "El héroe";
    const storySetting = setting.value || "un lugar mágico";

    const prompt = `Escribe una historia de ${selectedStoryType} donde el protagonista sea ${protagonist} en ${storySetting}.`;

    const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    const result = await response.json();
    aiBookDiv.innerHTML = `<h3>Historia Generada</h3><p>${result.story}</p>`;
}

document.getElementById("generate-story").addEventListener('click', generateStory);


// Web Speech API - Reconocimiento de voz para la lectura
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    document.getElementById('start-reading').addEventListener('click', () => {
        recognition.start();
    });

    recognition.onresult = (event) => {
        const textoLeido = event.results[0][0].transcript;
        const textoOriginal = textoCuento.textContent;
        const palabrasOriginales = textoOriginal.split(" ");
        const palabrasLeidas = textoLeido.split(" ");
        let correctWords = 0;
        let textoMarcado = "";

        for (let i = 0; i < palabrasOriginales.length; i++) {
            if (palabrasLeidas[i] && palabrasLeidas[i].toLowerCase() === palabrasOriginales[i].toLowerCase()) {
                textoMarcado += `<span class="highlight-correct">${palabrasOriginales[i]}</span> `;
                correctWords++;
            } else {
                textoMarcado += `<span class="highlight-error">${palabrasOriginales[i]}</span> `;
            }
        }

        textoCuento.innerHTML = textoMarcado.trim();

        // Actualiza la barra de progreso
        const progressPercentage = (correctWords / palabrasOriginales.length) * 100;
        progressBar.style.width = progressPercentage + "%";

        if (correctWords === palabrasOriginales.length) {
            feedback.textContent = "¡Muy bien! Has leído todo correctamente.";
        } else {
            feedback.textContent = "Has cometido algunos errores.";
        }
    };
} else {
    feedback.textContent = "Tu navegador no soporta la Web Speech API.";
}
