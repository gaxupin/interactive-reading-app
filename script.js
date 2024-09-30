// Variables del DOM
const tituloCuento = document.getElementById("titulo-cuento");
const textoCuento = document.getElementById("texto-cuento");
const feedback = document.getElementById("feedback");
const progressBar = document.getElementById('progress-bar-fill');
let recognition;

// Método para generar cuentos con IA (OpenAI API)
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
        console.error("Error al generar cuento con IA:", error);
    }
}

// Método para obtener libros desde Project Gutenberg
async function fetchBookFromGutenberg() {
    try {
        const response = await fetch('https://gutendex.com/books/?topic=children');
        const data = await response.json();

        // Selecciona un libro aleatorio de la respuesta
        const randomBook = data.results[Math.floor(Math.random() * data.results.length)];
        const bookText = await fetch(randomBook.formats['text/plain; charset=utf-8']);
        const text = await bookText.text();

        tituloCuento.textContent = randomBook.title;
        textoCuento.textContent = text.slice(0, 1000); // Muestra solo las primeras 1000 palabras

    } catch (error) {
        console.error("Error al obtener libro de Project Gutenberg:", error);
    }
}

// Lógica de selección de fuente del libro
document.getElementById("generate-book").addEventListener('click', async function() {
    const selectedOption = document.getElementById('book-selection').value;
    
    if (selectedOption === 'gutenberg') {
        await fetchBookFromGutenberg();
    } else if (selectedOption === 'ai') {
        await generateStoryWithAI();
    }
});

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
