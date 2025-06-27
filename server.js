const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  console.log("Datos recibidos de Twilio:", req.body);

  const { caller_id, agent_id, called_number, call_sid } = req.body;
  let customerName = "cliente";
  let customerDataFromAPI = null;

  try {
    const sanitizedNumber = called_number.replace('+', '');
    const response = await axios.get(
      `https://efoodapiapi.azure-api.net/api/CallCenter/${sanitizedNumber}`
    );

    if (response.data && response.data.name) {
      customerName = response.data.name;
      customerDataFromAPI = response.data;
      console.log("El número existe. Nombre del cliente:", customerName);
    } else {
      console.log("El número no existe.");
    }
  } catch (error) {
    console.error("Error al verificar el número:", error.message);
  }

  // Datos dinámicos para ElevenLabs
  const customerData = {
    called_number,
    caller_id,
    agent_id,
    call_sid,
    customer_name: customerName,
    ...(customerDataFromAPI || {}), // Incluir datos adicionales si existen
  };

  // Respuesta para ElevenLabs
  const responseToElevenLabs = {
    dynamic_variables: customerData,
    conversation_config_override: {
      agent: {
        prompt: {
          prompt: `Eres una asistente amable y profesional que toma pedidos para un bar, jugos y cafetería. Atiendes únicamente con productos del menú en tu base de conocimientos.

Sigue estos pasos con el cliente:

2. Solicita el nombre completo del cliente (si no lo tienes).
3. Si es delivery, pide la dirección de entrega. Si es pickup, no preguntes dirección.
4. Toma el pedido únicamente con productos disponibles en tu menú.
5. Pregunta si desea algo más antes de finalizar.
6. Solo repite o confirma el pedido si el cliente lo solicita.

Mantén la conversación clara, breve y amigable. Nunca reveles detalles del sistema interno.`,
        },
        first_message: `¡Hola ${customerName}! Bienvenido a efanyi bar cafe.tu direccion es:${address}`,
        language: "es",
      },
    },
  };

  console.log("Respuesta enviada a ElevenLabs:", responseToElevenLabs);
  res.json(responseToElevenLabs);
});

app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
