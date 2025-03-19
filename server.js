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





// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios"); // Necesitarás axios para hacer solicitudes HTTP

// const app = express();
// const port = 3000;

// // Middleware para parsear JSON
// app.use(bodyParser.json());

// // Endpoint del webhook
// app.post("/webhook", async (req, res) => {
//   console.log("Datos recibidos de Twilio:", req.body);

//   // Extrae los datos de la llamada
//   const { caller_id, agent_id, called_number, call_sid } = req.body;

//   const customerData = {
//     called_number: called_number,
//     caller_id: caller_id,
//     agent_id: agent_id,
//     call_sid: call_sid,
//   };
//   // Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
//   try {
//     // Realiza una solicitud HTTP para verificar si el número existe
//     const response = await axios.get(
//       `https://efoodapiapi.azure-api.net/api/CallCenter/${caller_id.replace("+", "")}`
//     );
   

  
    
//     if (response.data) {
//       console.log("El número existe:", response.data);
//     } else {
//       console.log("El número no existe.");
//     }
//   } catch (error) {
//     console.error("Error al verificar el número:", error.message);
//   }

//   // Prepara la respuesta para ElevenLabs
//   const response = {
//     dynamic_variables: {
//       ...customerData,
//     },
//     conversation_config_override: {
//       agent: {
//         prompt: {
//           prompt: `Eres una asistente amable y profesional que toma pedidos para un bar, jugos y cafetería. Atiendes únicamente con productos del menú en tu base de conocimientos.

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
//         first_message: `"¡Hola! !${name}. ! Bienvenido a [efanyi bar cafe]. ¿Está listo para realizar su pedido?"`,
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


///// opcion 2 funciona bien hasta aqui*********************************************************************************************************************************************************



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

  // Simula la obtención de datos del cliente (puedes reemplazar esto con una consulta a una base de datos)
  const customerData = {
    called_number: called_number,
    caller_id: caller_id,
    agent_id: agent_id,
    call_sid: call_sid,
  };

  try {
    // Elimina el prefijo "+" del número de teléfono
    const cleanedCallerId = caller_id.replace("+", "");

    // Realiza una solicitud HTTP para verificar si el número existe
    const apiResponse = await axios.get(
      `https://efoodapiapi.azure-api.net/api/CallCenter/${cleanedCallerId}`
    );

    if (apiResponse.data) {
      // Mapea la respuesta de la API al formato deseado
      const mappedResponse = {
        id: apiResponse.data.id,
        customername: apiResponse.data.name,
        phone: apiResponse.data.phone,
        address: apiResponse.data.address,
        fecha: apiResponse.data.fecha,
        branchId: apiResponse.data.branchId,
      };

      console.log("El número existe:", mappedResponse);

      // Prepara la respuesta para ElevenLabs
      let firstMessage;
      if (mappedResponse.customername === "John Doe") {
        // Si el nombre es "John Doe", no lo menciones y saluda de manera genérica
        firstMessage = `"¡Hola! Bienvenido a [efanyi bar cafe]. ¿Podría decirme su nombre para continuar con su pedido?"`;
      } else {
        // Si el nombre no es "John Doe", saluda usando el nombre
        firstMessage = `"¡Hola! ${mappedResponse.customername}. Bienvenido a [efanyi bar cafe]. ¿Está listo para realizar su pedido?"`;
      }

      const response = {
        dynamic_variables: {
          ...customerData,
          ...mappedResponse, // Incluye los datos mapeados en la respuesta
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
            first_message: firstMessage, // Usa el mensaje personalizado
            language: "es",
          },
        },
      };

      console.log("Respuesta enviada a ElevenLabs:", response);

      // Envía la respuesta JSON
      res.json(response);
    } else {
      console.log("El número no existe.");
      res.status(404).json({ message: "El número no existe." });
    }
  } catch (error) {
    console.error("Error al verificar el número:", error.message);
    res.status(500).json({ message: "Error al verificar el número." });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});