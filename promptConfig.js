const fs = require("fs");

// Cargar el prompt desde el archivo JSON
const promptConfig = JSON.parse(fs.readFileSync("promptConfig.json", "utf-8"));

// Usar el prompt en tu lógica de IA
const systemMessage = promptConfig.content;
const instructions = promptConfig.instructions;

console.log("Mensaje del sistema:", systemMessage);
instructions.forEach((instruction) => {
  console.log(`Paso ${instruction.step}: ${instruction.description}`);
  console.log(instruction.content);
});

// Integrar con tu API de IA (por ejemplo, OpenAI o Eleven Labs)
// Aquí iría la lógica para enviar el prompt a la API.
