const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WS_PORT = 8080; // Puerto WebSocket para Media Streams

// Twilio Media Stream Route
app.post('/media-stream', (req, res) => {
    console.log("✅ Recibida solicitud en /media-stream");

    try {
        const twiml = new twilio.twiml.VoiceResponse();
        const stream = twiml.connect().stream({
            url: 'wss://agentenodejs.onrender.com/ws', // ⚠️ REEMPLAZA con la URL real de Render
        });

        console.log("📡 Enviando TwiML a Twilio...");
        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error("❌ Error en /media-stream:", error);
        res.status(500).send("Error en Media Stream");
    }
});

// WebSocket Server para recibir audio en tiempo real
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log("🔗 Conexión WebSocket establecida con Twilio Media Stream");

    ws.on('message', async (data) => {
        console.log("🎙️ Recibiendo audio y datos en tiempo real... (chunk de datos)");

        // Aquí podríamos integrar Whisper para transcribir en tiempo real
    });

    ws.on('error', (err) => {
        console.error("❌ Error en WebSocket:", err);
    });

    ws.on('close', () => {
        console.log("🔌 Conexión WebSocket cerrada");
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    console.log(`🟢 WebSocket escuchando en ws://localhost:${WS_PORT}`);
});
