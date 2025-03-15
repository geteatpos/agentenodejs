const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Endpoint del webhook
app.post("/webhook", (req, res) => {
  console.log("Datos recibidos de Twilio:", req.body);

  // Extrae los datos de la llamada
  const { caller_id, agent_id, called_number, call_sid } = req.body;

  // Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
  const customerData = {
    customer_name: "John Doe",
    account_status: "premium",
    last_interaction: "2024-01-15",
  };

  // Prepara la respuesta para ElevenLabs
  const response = {
    dynamic_variables: {
      ...customerData,
    },
    conversation_config_override: {
      agent: {
        prompt: {
          prompt:
            "The customer's bank account balance is $100. They are based in San Francisco.",
        },
        first_message: "Hi, how can I help you today?",
        language: "en",
      },
      tts: {
        voice_id: "new-voice-id",
      },
    },
  };

  console.log("Respuesta enviada a ElevenLabs:", response);

  // Envía la respuesta JSON
  res.json(response);
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
