exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { text, mode } = JSON.parse(event.body);

  const prompt = mode === "json-to-text"
    ? `Convierte este JSON a un texto natural y fluido, como si fuera un mensaje o descripción normal que escribiría una persona. Sin listas, sin viñetas, sin saltos de línea innecesarios. Solo un párrafo continuo y natural. No expliques nada, solo da el texto resultante.\n\nJSON:\n${text}`
    : `Convierte este texto a un JSON bien estructurado. Extrae toda la información y organízala en campos con nombres en inglés (camelCase). Devuelve SOLO el JSON válido, sin explicaciones ni markdown.\n\nTexto:\n${text}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const result = data.content?.[0]?.text || "No se pudo convertir";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result })
  };
};
