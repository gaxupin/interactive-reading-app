// Elementos del DOM
const tituloCuento = document.getElementById("titulo-cuento");
const textoCuento = document.getElementById("texto-cuento");
const feedback = document.getElementById("feedback");
const estrellasElem = document.getElementById("estrellas");
let estrellas = 0;
let recognition;

// Fetch Spanish book from backend
async function fetchBookFromBackend() {
    try {
        const response = await fetch('/api/get-book');
        const data = await response.json();

        if (response.ok) {
            tituloCuento.textContent = data.title;
            textoCuento.textContent = data.text; // Display the extracted text in the UI
        } else {
            feedback.textContent = data.message || "Error al obtener el libro.";
        }
    } catch (error) {
        console.error("Error al cargar el libro desde el backend:", error);
        feedback.textContent = "Hubo un problema al cargar el libro. Inténtalo de nuevo más tarde.";
    }
}

// Función para buscar libros en español para niños
async function fetchBookFromGutenberg() {
    try {
        // Solicitud para obtener libros en español y relacionados con niños
        const response = await fetch('https://gutendex.com/books?search=children&language=es&mime_type=text%2Fplain');
        const data = await response.json();

        // Verificamos que existen resultados
        if (data.results.length === 0) {
            feedback.textContent = "Lo siento, no se encontraron libros adecuados.";
            return;
        }

        const book = data.results[0]; // Tomamos el primer libro disponible

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

        // Extraer un fragmento desde la mitad del libro
        const middleIndex = Math.floor(bookText.length / 2);
        const endIndex = middleIndex + 500;
        bookText = bookText.substring(middleIndex, endIndex) + '...';
        
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

// Web Speech API - Word-by-word color feedback
recognition.onresult = (event) => {
    const textoLeido = event.results[0][0].transcript;
    const textoOriginal = textoCuento.textContent.split(" ");
    const palabrasLeidas = textoLeido.split(" ");

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

    textoCuento.innerHTML = textoMarcado.trim();

    // Provide feedback based on correct words
    const totalPalabras = textoOriginal.length;
    if (numCorrectas === totalPalabras) {
        feedback.textContent = "¡Excelente! Has leído todo correctamente.";
        estrellas++;
    } else {
        feedback.textContent = `Palabras correctas: ${numCorrectas}/${totalPalabras}`;
    }
    estrellasElem.textContent = estrellas;
};

// Event listener for loading the book from backend
document.getElementById("load-book").addEventListener('click', fetchBookFromBackend);
