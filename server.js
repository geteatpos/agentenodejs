const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.post('/incoming-call', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Hola, bienvenido al restaurante. ¿Cómo puedo ayudarle?");
    
    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
