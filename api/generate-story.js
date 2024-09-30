const fetch = require('node-fetch');

export default async function handler(req, res) {
  const prompt = req.body.prompt; // Recibe el prompt desde el frontend
  
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Usando la API Key desde las variables de entorno
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 100,
      }),
    });

    const data = await response.json();

    res.status(200).json({ story: data.choices[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Error generating story' });
  }
}
