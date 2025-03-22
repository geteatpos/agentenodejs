const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Cargar el prompt desde el archivo JSON
let promptConfig;
try {
  promptConfig = JSON.parse(fs.readFileSync("promptConfig.ts", "utf-8"));
  console.log("Prompt cargado correctamente.");
} catch (error) {
  console.error("Error al cargar el archivo promptConfig.json:", error.message);
  process.exit(1); // Detiene la ejecución si no se puede cargar el archivo
}

// Endpoint del webhook
app.post("/webhook", async (req, res) => {
  console.log("Datos recibidos de Twilio:", req.body);

  // Extrae los datos de la llamada
  const { caller_id, agent_id, called_number, call_sid } = req.body;

  // Valida que los datos necesarios estén presentes
  if (!caller_id || !agent_id || !called_number || !call_sid) {
    return res
      .status(400)
      .json({ message: "Datos incompletos en la solicitud." });
  }

  // Simula la obtención de datos del cliente
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
        firstMessage = `"¡Hola! Bienvenido a [efanli bar cafe]. ¿Podría decirme su nombre para continuar con su pedido?"`;
      } else {
        // Si el nombre no es "John Doe", saluda usando el nombre
        firstMessage = `"¡Hola! ${mappedResponse.customername}. Bienvenido a [efandlli bar cafe]. ¿Está listo para realizar su pedido?"`;
      }

      // Construye el prompt dinámico
      const dynamicPrompt = promptConfig.instructions
        .map((instruction) => instruction.content)
        .join("\n");

      const response = {
        dynamic_variables: {
          ...customerData,
          ...mappedResponse, // Incluye los datos mapeados en la respuesta
        },
        conversation_config_override: {
          agent: {
            prompt: {
              prompt: dynamicPrompt, // Usa el prompt dinámico
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
