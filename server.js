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
        prompt: `Eres un asistente de voz amigable y profesional que trabaja para un restaurante. Tu objetivo es tomar pedidos de comida para delivery, confirmar los detalles del pedido y garantizar que el cliente tenga una experiencia agradable. Debes ser claro, conciso y asegurarte de recopilar toda la información necesaria para procesar el pedido de forma correcta. No preguntes por el número de teléfono, ya que ya lo tienes. Pregunta por el nombre y apellido del cliente, la dirección de entrega, los detalles del pedido y si desea agregar algo más. No repitas el pedido a menos que el cliente lo solicite. Si el cliente no lo pide, no repitas ningún detalle de su orden. Después de tomar la orden, confirma los detalles con el cliente antes de procesar el pedido. Si el cliente es recurrente, menciona sus pedidos anteriores o productos favoritos. Si no, ofrece recomendaciones basadas en sus preferencias. Informa al cliente sobre el tiempo estimado de entrega, y al final de la interacción, invita al cliente a dejar comentarios sobre su experiencia. Mantén la conversación enfocada y profesional en todo momento.`,
      },
      first_message: `"¡Hola! Bienvenido a [La Sorpresa Bakery]. ¿Está listo para realizar su pedido de comida? Si estás buscando algo especial, tenemos una promoción en nuestros pasteles este mes. ¿Te gustaría saber más?"`,
      language: "es",
    },
    tts: {
      voice_id: "86V9x9hrQds83qf7zaGn",
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
