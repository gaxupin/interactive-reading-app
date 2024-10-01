const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.get('/api/get-book', async (req, res) => {
    try {
        // Fetch Spanish books for children from Gutenberg
        const response = await fetch('https://gutendex.com/books?search=children&languages=es&mime_type=text%2Fplain');
        const data = await response.json();

        if (data.results.length === 0) {
            return res.status(404).json({ message: "No se encontraron libros." });
        }

        const book = data.results[0]; // Choose the first book for now

        const bookTextUrl = book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"];
        if (!bookTextUrl) {
            return res.status(400).json({ message: "No se encontró un formato de texto adecuado." });
        }

        // Fetch the full text of the book
        const bookTextResponse = await fetch(bookTextUrl);
        const bookText = await bookTextResponse.text();

        // Extract a middle section of the book (approximate middle of the text)
        const middleIndex = Math.floor(bookText.length / 2);
        const excerpt = bookText.substring(middleIndex, middleIndex + 500); // Grab 500 characters from the middle

        res.json({
            title: book.title,
            text: excerpt
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el libro.", error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en el puerto 3000');
});
