const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            // Choose a random book from the results
            let randomIndex;
            let book;
            let bookTextUrl;
            let intentos = 0;
            const maxIntentos = 200;
            
            // Fetch Spanish children's books from Gutendex
            const response = await fetch('https://gutendex.com/books/?languages=es&mime_type=text%2F');
            const data = await response.json();

            if (data.results.length === 0) {
                return res.status(404).json({ message: "No se encontraron libros." });
            }
            
            // Inicializa el libro y la URL en el primer intento
            do {
                randomIndex = Math.floor(Math.random() * data.results.length);
                book = data.results[randomIndex];
            
                // Fetch the plain text file of the book
                bookTextUrl = book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"];
                intentos++;
            } while (!bookTextUrl && intentos < maxIntentos);
            
            if (!bookTextUrl) {
                return res.status(404).json({ message: "No se encontró un formato de texto adecuado después de varios intentos." });
            }
            
            // Fetch the actual text content of the book
            const bookTextResponse = await fetch(bookTextUrl);
            const bookText = await bookTextResponse.text();

            const lengthIndex = Math.floor(Math.random() * 10);
            // Extract a portion from the middle of the book
            const middleIndex = Math.floor(bookText.length / lengthIndex);
            const excerpt = bookText.substring(middleIndex, middleIndex + 500);
            
            // Send the excerpt to the frontend
            res.status(200).json({
                title: book.title,
                text: excerpt
            });

        } catch (error) {
            console.error("Error al obtener el libro:", error);
            res.status(500).json({ message: "Error al obtener el libro.", error: error.message });
        }
    } else {
        // Handle unsupported methods
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
