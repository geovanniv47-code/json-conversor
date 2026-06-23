exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { text, mode } = JSON.parse(event.body);

  const prompt = mode === "json-to-text"
    ? `Convierte este JSON a un texto natural y fluido, como si fuera un mensaje o descripción normal que escribiría una persona. Sin listas, sin viñetas, Sin saltos de línea innecesarios. Solo un párrafo continuo y natural. No expliques nada, solo da el texto resultante.\n\nJSON:\n${text}`
    : `Convierte este texto a un JSON bien estructurado. Extrae toda la información y organízala en campos con nombres en inglés (camelCase). Devuelve SOLO el JSON válido, sin explicaciones ni markdown.\n\nTexto:\n${text}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || "No se pudo convertir";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result })
  };
};
