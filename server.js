const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');
const http = require('http');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔹 Usamos el mismo servidor para Express y WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🟢 WebSocket para Twilio Media Streams
wss.on('connection', (ws) => {
    console.log("🔗 Conexión WebSocket Bien establecida con Twilio Media Stream");

    ws.on('message', async (data) => {
        console.log("🎙️ Recibiendo audio y datos en tiempo real... (chunk de datos)");
        // Aquí puedes integrar Whisper para transcribir en tiempo real
    });

    ws.on('error', (err) => {
        console.error("❌ Error en WebSocket:", err);
    });

    ws.on('close', () => {
        console.log("🔌 Conexión WebSocket cerrada");
    });
});

// 🔹 Ruta para recibir Twilio Media Stream
app.post('/media-stream', (req, res) => {
    console.log("✅ Recibida solicitud en /media-stream");

    try {
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.connect().stream({
            url: `wss://${req.hostname}/ws`, // 🔹 Se genera dinámicamente según el dominio de Render
        });

        console.log("📡 Enviando TwiML a Twilio...");
        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error("❌ Error en /media-stream:", error);
        res.status(500).send("Error en Media Stream");
    }
});

// 🔹 Escuchamos en el mismo servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor Express y WebSocket corriendo en http://localhost:${PORT}`);
});
