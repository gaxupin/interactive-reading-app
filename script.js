// Elementos del DOM
const tituloCuento = document.getElementById("titulo-cuento");
const textoCuento = document.getElementById("texto-cuento");
const feedback = document.getElementById("feedback");
const estrellasElem = document.getElementById("estrellas");
let estrellas = 0;
let recognition;

// Función para cargar libro desde Project Gutenberg
async function fetchBookFromGutenberg() {
    try {
        const response = await fetch('https://gutendex.com/books/?search=cuento');
        const data = await response.json();
        const book = data.results[0];
        tituloCuento.textContent = book.title;
        textoCuento.textContent = book.formats["text/plain"];
    } catch (error) {
        console.error("Error al cargar el libro desde Gutenberg:", error);
    }
}

// Función para generar cuentos usando OpenAI API
async function generateStoryWithAI() {
    try {
        const response = await fetch('/api/generate-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: "Genera un cuento para niños sobre animales en el bosque."
            })
        });

        const data = await response.json();
        tituloCuento.textContent = "Cuento Generado con IA";
        textoCuento.textContent = data.story;
    } catch (error) {
        console.error("Error al generar el cuento con IA:", error);
    }
}

// Event listener para cargar o generar libro
document.getElementById("load-book").addEventListener('click', () => {
    const bookSource = document.getElementById("book-source").value;
    if (bookSource === 'gutenberg') {
        fetchBookFromGutenberg();
    } else {
        generateStoryWithAI();
    }
});

// Web Speech API - Reconocimiento de Voz y feedback en tiempo real
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

        // Comparar texto leído con el texto original
        const palabrasOriginales = textoOriginal.split(" ");
        const palabrasLeidas = textoLeido.split(" ");
        let textoMarcado = "";

        for (let i = 0; i < palabrasOriginales.length; i++) {
            if (palabrasLeidas[i] && palabrasLeidas[i].toLowerCase() === palabrasOriginales[i].toLowerCase()) {
                textoMarcado += `<span class="highlight-correct">${palabrasOriginales[i]}</span> `;
            } else if (palabrasLeidas[i]) {
                textoMarcado += `<span class="highlight-almost">${palabrasOriginales[i]}</span> `;
            } else {
                textoMarcado += `<span class="highlight-incorrect">${palabrasOriginales[i]}</span> `;
            }
        }

        textoCuento.innerHTML = textoMarcado.trim();

        // Verificar si hubo errores
        if (palabrasLeidas.every((palabra, index) => palabra.toLowerCase() === palabrasOriginales[index].toLowerCase())) {
            feedback.textContent = "¡Muy bien! Has leído todo correctamente.";
            estrellas++;
        } else {
            feedback.textContent = "Has cometido algunos errores.";
        }
        estrellasElem.textContent = estrellas;
    };
} else {
    feedback.textContent = "Tu navegador no soporta la Web Speech API.";
}
