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
	const { caller_id, agent_id, called_number, call_sid , caller_name } = req.body;

	// Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
	const customerData = {
    called_number: called_number,
    caller_id: caller_id,
    caller_name: caller_name,
    agent_id: agent_id,
    call_sid: call_sid
  };

	// Prepara la respuesta para ElevenLabs
	const response = {
    dynamic_variables: {
      ...customerData,
    },
    conversation_config_override: {
      agent: {
        prompt: {
          prompt: `Eres un asistente de voz amigable y profesional que trabaja para un restaurante. Tu tarea es tomar pedidos de comida para delivery, confirmar los detalles del pedido y asegurarte de que el cliente tenga una experiencia agradable. Debes ser claro, conciso y asegurarte de capturar toda la información necesaria para procesar el pedido correctamente. pero no preguntes por el numero de telefono, ya que ya lo tienes  , pregunta por el nombre y el apellido del cliente, la direccion de entrega, el pedido que desea realizar y si desea agregar algo mas a su pedido.no repitas el pedido y si el cliente no lo solicita no lo hagas.`,
        },
        first_message: `"¡Hola! Bienvenido a [La sorpresa bakery]. ¿Está listo para realizar su pedido de comida?"`,
        language: "es",
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
