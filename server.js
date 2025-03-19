const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Función para generar la respuesta de ElevenLabs
const generateResponse = (customerData) => {
  return {
    dynamic_variables: {
      ...customerData,
    },
    conversation_config_override: {
      agent: {
        prompt: {
          prompt: `Eres un asistente de voz amigable y profesional que trabaja para un restaurante. Tu tarea es tomar pedidos de comida para delivery, confirmar los detalles del pedido y asegurarte de que el cliente tenga una experiencia agradable. Debes ser claro, conciso y asegurarte de capturar toda la información necesaria para procesar el pedido correctamente. No preguntes por el número de teléfono, ya que ya lo tienes. Pregunta por el nombre y apellido del cliente, la dirección de entrega, el pedido que desea realizar y si desea agregar algo más a su pedido. No repitas el pedido y si el cliente no lo solicita no lo hagas.`,
        },
        first_message: `"¡Hola! Bienvenido a [La sorpresa bakery]. ¿Está listo para realizar su pedido de comida?"`,
        language: "es",
      },
      tts: {
        voice_id: "86V9x9hrQds83qf7zaGn",
      },
    },
  };
};

// Endpoint del webhook
app.post("/webhook", (req, res) => {
  console.log("Datos recibidos de Twilio:", req.body);

  // Verificar que los datos esenciales están presentes en el cuerpo de la solicitud
  const { caller_id, agent_id, called_number, call_sid, caller_name } =
    req.body;

  if (!caller_id || !agent_id || !called_number || !call_sid || !caller_name) {
    console.error("Datos faltantes en la solicitud");
    return res
      .status(400)
      .json({ error: "Faltan datos necesarios en la solicitud" });
  }

  // Simula la obtención de datos del cliente
  const customerData = {
    called_number,
    caller_id,
    caller_name,
    agent_id,
    call_sid,
  };

  // Prepara la respuesta para ElevenLabs
  const response = generateResponse(customerData);

  console.log("Respuesta enviada a ElevenLabs:", response);

  // Envía la respuesta JSON
  res.json(response);
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
