const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const prompt = req.body?.prompt || "Escribe una historia corta para niños.";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
      }),
    });

    const result = await response.json();
    res.status(200).json({ story: result.choices[0].message.content });
  } catch (error) {
    console.error("Error generando historia:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
