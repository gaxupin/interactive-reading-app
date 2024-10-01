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
        // Hacemos la solicitud para obtener los libros con el tema "children"
        const response = await fetch('https://gutendex.com/books?search=children&mime_type=text%2Fplain');
        const data = await response.json();

        // Verificamos que existen resultados
        if (data.results.length === 0) {
            feedback.textContent = "Lo siento, no se encontraron libros adecuados.";
            return;
        }

        const book = data.results[0]; // Tomamos el primer libro de la lista

        // Obtenemos el título del libro
        tituloCuento.textContent = book.title;

        // Obtenemos la URL del formato de texto plano
        const bookTextUrl = book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"];

        if (!bookTextUrl) {
            console.error("No se encontró un formato de texto adecuado.");
            feedback.textContent = "Lo siento, no se pudo cargar el contenido de este libro.";
            return;
        }

        // Descargamos el texto del libro
        const bookTextResponse = await fetch(bookTextUrl);
        let bookText = await bookTextResponse.text();

        // Limitar el texto a una longitud adecuada para un niño de 7 años (ej: 500 caracteres)
        bookText = bookText.substring(0, 500) + '...';
        textoCuento.textContent = bookText;

    } catch (error) {
        console.error("Error al cargar el libro desde Gutenberg:", error);
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
    recognition.continuous = true;  // Permitir que escuche continuamente

    document.getElementById('start-reading').addEventListener('click', () => {
        recognition.start();
    });

    recognition.onresult = (event) => {
        const textoLeido = event.results[0][0].transcript;
        const textoOriginal = textoCuento.textContent.split(" ");
        const palabrasLeidas = textoLeido.split(" ");
        
        let textoMarcado = "";
        let numCorrectas = 0;

        // Comparar las palabras leídas con las originales
        for (let i = 0; i < textoOriginal.length; i++) {
            if (palabrasLeidas[i] && palabrasLeidas[i].toLowerCase() === textoOriginal[i].toLowerCase()) {
                textoMarcado += `<span class="highlight-correct">${textoOriginal[i]}</span> `;
                numCorrectas++;
            } else if (palabrasLeidas[i]) {
                textoMarcado += `<span class="highlight-almost">${textoOriginal[i]}</span> `;
            } else {
                textoMarcado += `<span class="highlight-incorrect">${textoOriginal[i]}</span> `;
            }
        }

        textoCuento.innerHTML = textoMarcado.trim();

        // Mostrar feedback basado en el número de palabras correctas
        const totalPalabras = textoOriginal.length;
        if (numCorrectas === totalPalabras) {
            feedback.textContent = "¡Excelente! Has leído todo correctamente.";
            estrellas++;
        } else {
            feedback.textContent = `Palabras correctas: ${numCorrectas}/${totalPalabras}`;
        }
        estrellasElem.textContent = estrellas;
    };

    recognition.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        feedback.textContent = "Hubo un error con el reconocimiento de voz. Intenta de nuevo.";
    };
} else {
    feedback.textContent = "Tu navegador no soporta la Web Speech API.";
}

