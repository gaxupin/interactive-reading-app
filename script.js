// DOM Elements
const tituloCuento = document.getElementById("titulo-cuento");
const textoCuento = document.getElementById("texto-cuento");
const feedback = document.getElementById("feedback");
const estrellasElem = document.getElementById("estrellas");
let estrellas = 0;
let recognition;

// Fetch Spanish book from backend (instead of directly from Gutenberg)
async function fetchBookFromBackend() {
    try {
        // Fetch the book content from the backend
        const response = await fetch('/api/get-book'); // Fetching the book from your backend
        const data = await response.json();

        if (response.ok) {
            tituloCuento.textContent = data.title; // Set the title
            textoCuento.textContent = data.text;   // Display the book excerpt
        } else {
            feedback.textContent = data.message || "Error al obtener el libro.";
        }
    } catch (error) {
        console.error("Error al cargar el libro desde el backend:", error);
        feedback.textContent = "Hubo un problema al cargar el libro. Inténtalo de nuevo más tarde.";
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
        fetchBookFromBackend();
    } else {
        generateStoryWithAI();
    }
});

// Web Speech API - Word-by-word color feedback
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "es-ES"; // Set language to Spanish

        recognition.onresult = (event) => {
            const textoLeido = event.results[0][0].transcript; // Text read by the user
            const textoOriginal = textoCuento.textContent.split(" "); // Original book text
            const palabrasLeidas = textoLeido.split(" "); // Words read by the user

            let textoMarcado = "";
            let numCorrectas = 0;

            for (let i = 0; i < textoOriginal.length; i++) {
                if (palabrasLeidas[i] && palabrasLeidas[i].toLowerCase() === textoOriginal[i].toLowerCase()) {
                    // Correct word (green)
                    textoMarcado += `<span style="color: green">${textoOriginal[i]}</span> `;
                    numCorrectas++;
                } else if (palabrasLeidas[i]) {
                    // Almost correct (orange)
                    textoMarcado += `<span style="color: orange">${textoOriginal[i]}</span> `;
                } else {
                    // Incorrect or missed (red)
                    textoMarcado += `<span style="color: red">${textoOriginal[i]}</span> `;
                }
            }

            textoCuento.innerHTML = textoMarcado.trim(); // Update the displayed text with colored feedback

            // Provide feedback based on the number of correct words
            const totalPalabras = textoOriginal.length;
            if (numCorrectas === totalPalabras) {
                feedback.textContent = "¡Excelente! Has leído todo correctamente.";
                estrellas++;
            } else {
                feedback.textContent = `Palabras correctas: ${numCorrectas}/${totalPalabras}`;
            }
            estrellasElem.textContent = estrellas; // Update the stars count
        };
    }
}

// Event listener for starting the speech recognition
document.getElementById("start-reading").addEventListener('click', () => {
    initializeSpeechRecognition();
    recognition.start();
});
