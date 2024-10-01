const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { bookId } = req.query; // bookId obtenido del frontend
  const gutenbergUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;

  try {
    const response = await fetch(gutenbergUrl);
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Error al descargar el libro' });
    }

    const bookContent = await response.text();
    return res.status(200).json({ content: bookContent });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};
