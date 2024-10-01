const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            // Fetch Spanish children's books from Gutendex
            const response = await fetch('https://gutendex.com/books?search=children&languages=es&mime_type=text%2Fplain');
            const data = await response.json();

            if (data.results.length === 0) {
                return res.status(404).json({ message: "No se encontraron libros." });
            }

            const book = data.results[0]; // Choose the first book for now

            // Fetch the plain text file of the book
            const bookTextUrl = book.formats["text/plain; charset=utf-8"] || book.formats["text/plain"];
            if (!bookTextUrl) {
                return res.status(400).json({ message: "No se encontró un formato de texto adecuado." });
            }

            // Fetch the actual text content of the book
            const bookTextResponse = await fetch(bookTextUrl);
            const bookText = await bookTextResponse.text();

            // Extract a portion from the middle of the book
            const middleIndex = Math.floor(bookText.length / 2);
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
