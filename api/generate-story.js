const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const prompt = req.body.prompt || "Escribe una historia para niños.";
  
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 100,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    res.status(200).json({ story: result.choices[0].text });
  } else {
    res.status(500).json({ error: result });
  }
};
