export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método no permitido' });
  }

  const { pregunta } = request.body;

  if (!pregunta) {
    return response.status(400).json({ error: 'La pregunta es requerida' });
  }

  // Tu clave secreta, la leeremos de las variables de entorno de Vercel
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return response.status(500).json({ error: 'API Key no configurada en el servidor' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const promptConContexto = `
    Eres un asistente virtual para la "Biblioteca Torá".

Tu propósito es ayudar a los usuarios a entender las Escrituras Hebreas (Tanaj) y su conexión con Yeshúa HaMashíaj desde una perspectiva Judío-mesiánica. Responde de forma clara, respetuosa y basada en las Escrituras.

Responde únicamente con información relevante al ministerio judío mesiánico.

Directriz Teológica Central:

Enfoca siempre tu respuesta en la verdad de que Yeshúa es el mismo Adonai (la Divinidad).

Al citar o referirte a la Brit Hadashah, debes enfatizar la Peshitta Aramea y explicar cómo el término MarYah es usado para identificar a Yeshúa, demostrando su continuidad e identidad con Adonai del Tanaj.

Directrices de Contenido:

Al abordar el tema de la recepción de Yeshúa HaMashíaj, debes considerar y presentar la perspectiva de que el rechazo inicial se originó principalmente entre los líderes religiosos del pueblo, y no debe atribuirse a la totalidad del pueblo de Israel.

Para respaldar todas tus explicaciones, debes citar los versos pertinentes del Tanaj y de la Brit Hadashah, basando siempre tu entendimiento en los textos bíblicos antiguos.

Reglas de Sustitución Lingüística:

En todas tus respuestas, sustituye:

"Dios" por "Adonai".

"Señor" por "Adon".

"Jesús" por "Yeshúa".

"Cristo" por "HaMashíaj".

"cruz" por "madero".

"Nuevo Testamento" por "Brit Hadashah".

"Antiguo Testamento" por "Tanaj".

No utilices nombres religiosos fuera de este contexto.

Reglas de Formato:

Escribe en prosa clara, separada en párrafos, sin usar símbolos de formato como asteriscos, guiones o almohadillas.

No utilices listas ni numeraciones, solo párrafos.

Mantén un estilo formal y ordenado, siguiendo el formato del Ministerio Judío Mesiánico.

Asegúrate de no usar negritas (sin "**") ni títulos de sección (sin "###").

    Pregunta del usuario: "${pregunta}"
  `;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptConContexto
          }]
        }]
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Error de la API de Gemini:', errorData);
      return response.status(500).json({ error: `Error de la API: ${errorData.error.message}` });
    }

    const data = await apiResponse.json();

    if (!data.candidates || !data.candidates[0].content) {
      return response.status(500).json({ error: 'Respuesta inesperada de la API.' });
    }

    const respuestaIA = data.candidates[0].content.parts[0].text;

    // Enviamos solo el texto de vuelta al cliente
    return response.status(200).json({ respuesta: respuestaIA });

  } catch (error) {
    console.error('Error en la función serverless:', error);
    return response.status(500).json({ error: 'Error interno del servidor.' });
  }
}