// Elementos del DOM
const tituloCuento = document.getElementById("titulo-cuento");
const textoCuento = document.getElementById("texto-cuento");
const feedback = document.getElementById("feedback");
const estrellasElem = document.getElementById("estrellas");
let estrellas = 0;
let recognition;

// Función para generar cuentos usando OpenAI API
const apiKey = process.env.OPENAI_API_KEY;

async function generateStory() {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: "Tell me a story",
      max_tokens: 100,
    }),
  });

  const result = await response.json();
  console.log(result);
}
document.getElementById("generate-story").addEventListener('click', generateStory);

// Web Speech API - Reconocimiento de Voz
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
        let feedbackText = "";
        let textoMarcado = "";

        for (let i = 0; i < palabrasOriginales.length; i++) {
            if (palabrasLeidas[i] && palabrasLeidas[i].toLowerCase() !== palabrasOriginales[i].toLowerCase()) {
                textoMarcado += `<span class="highlight-error">${palabrasOriginales[i]}</span> `;
            } else {
                textoMarcado += palabrasOriginales[i] + " ";
            }
        }

        textoCuento.innerHTML = textoMarcado.trim();

        // Verificar si hubo errores
        if (feedbackText === "") {
            feedback.textContent = "¡Muy bien! Has leído todo correctamente.";
            estrellas++;
            estrellasElem.textContent = estrellas;
        } else {
            feedback.textContent = "Has cometido algunos errores.";
        }
    };
} else {
    feedback.textContent = "Tu navegador no soporta la Web Speech API.";
}
