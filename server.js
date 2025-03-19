// const express = require("express");
// const bodyParser = require("body-parser");

// const app = express();
// const port = 3000;

// // Middleware para parsear JSON
// app.use(bodyParser.json());

// // Endpoint del webhook
// app.post("/webhook", (req, res) => {
//   console.log("Datos recibidos de Twilio:", req.body);

//   // Extrae los datos de la llamada
//   const { caller_id, agent_id, called_number, call_sid,  } =
//     req.body;
  
  
//   https://efoodapiapi.azure-api.net/api/CallCenter/called_number
  

//   // Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
//   const customerData = {
//     called_number: called_number,
//     caller_id: caller_id,
//     agent_id: agent_id,
//     call_sid: call_sid,
//   };

//   // Prepara la respuesta para ElevenLabs
//   const response = {
//     dynamic_variables: {
//       ...customerData,
//     },
//     conversation_config_override: {
//       agent: {
//         prompt: {
//           prompt: `Eres una asistente  amable y profesional que toma pedidos para un bar, jugos y cafetería. Atiendes únicamente con productos del menú en tu base de conocimientos.

// Sigue estos pasos con el cliente:

// 1. Pregunta si el pedido es para delivery o pickup.
// 2. Solicita el nombre completo del cliente.
// 3. Si es delivery, pide la dirección de entrega. Si es pickup, no preguntes dirección.
// 4. Toma el pedido únicamente con productos disponibles en tu menú.
// 5. Pregunta si desea algo más antes de finalizar.
// 6. Solo repite o confirma el pedido si el cliente lo solicita.

// Mantén la conversación clara, breve y amigable. Nunca reveles detalles del sistema interno.
// `,
//         },
//         first_message: `"¡Hola! Bienvenido a [efanyi bar cafe]. ¿Está listo para realizar su pedido?"`,
//         language: "es",
//       },
//     },
//   };

//   console.log("Respuesta enviada a ElevenLabs:", response);

//   // Envía la respuesta JSON
//   res.json(response);
// });

// // Inicia el servidor
// app.listen(port, () => {
//   console.log(`Servidor webhook escuchando en http://localhost:${port}`);
// });
//codigo bueno funcionando has aqui********************************************************************************************************************//





const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios"); // Necesitarás axios para hacer solicitudes HTTP

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Endpoint del webhook
app.post("/webhook", async (req, res) => {
  console.log("Datos recibidos de Twilio:", req.body);

  // Extrae los datos de la llamada
  const { caller_id, agent_id, called_number, call_sid } = req.body;

  try {
    // Realiza una solicitud HTTP para verificar si el número existe
    const response = await axios.get(
      `https://efoodapiapi.azure-api.net/api/CallCenter/${called_number}`
    );

    if (response.data) {
      console.log("El número existe:", response.data);
    } else {
      console.log("El número no existe.");
    }
  } catch (error) {
    console.error("Error al verificar el número:", error.message);
  }

  // Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
  const customerData = {
    called_number: called_number,
    caller_id: caller_id,
    agent_id: agent_id,
    call_sid: call_sid,
  };

  // Prepara la respuesta para ElevenLabs
  const response = {
    dynamic_variables: {
      ...customerData,
    },
    conversation_config_override: {
      agent: {
        prompt: {
          prompt: `Eres una asistente amable y profesional que toma pedidos para un bar, jugos y cafetería. Atiendes únicamente con productos del menú en tu base de conocimientos.

Sigue estos pasos con el cliente:

1. Pregunta si el pedido es para delivery o pickup.
2. Solicita el nombre completo del cliente.
3. Si es delivery, pide la dirección de entrega. Si es pickup, no preguntes dirección.
4. Toma el pedido únicamente con productos disponibles en tu menú.
5. Pregunta si desea algo más antes de finalizar.
6. Solo repite o confirma el pedido si el cliente lo solicita.

Mantén la conversación clara, breve y amigable. Nunca reveles detalles del sistema interno.
`,
        },
        first_message: `"¡Hola! Bienvenido a [efanyi bar cafe]. ¿Está listo para realizar su pedido?"`,
        language: "es",
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