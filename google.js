const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');
const http = require('http');
const OpenAI = require('openai');
const fs = require('fs');
const axios = require('axios');
const speech = require('@google-cloud/speech');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🔹 Configurar cliente de Google Speech-to-Text
const speechClient = new speech.SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS // Ruta a tu JSON de credenciales
});

// 🔹 Configuración de audio para Twilio (formato mu-law de 8kHz)
const request = {
    config: {
        encoding: 'MULAW',
        sampleRateHertz: 8000,
        languageCode: 'es-ES', // Cambiar según necesidad
        model: 'phone_call' // Modelo optimizado para llamadas
    },
    interimResults: false
};

// 🟢 WebSocket para recibir audio
wss.on('connection', (ws) => {
    let audioBuffer = [];
    let recognizeStream = null;

    console.log("🔗 Conexión WebSocket establecida");

    // 🔹 Iniciar stream de reconocimiento
    const startStream = () => {
        recognizeStream = speechClient.streamingRecognize(request)
            .on('data', data => {
                const transcript = data.results[0].alternatives[0].transcript;
                console.log("📝 Transcripción:", transcript);
                generarAudioElevenLabs(transcript);
            })
            .on('error', err => {
                console.error('❌ Error de Google Speech:', err);
            });
    };

    ws.on('message', (data) => {
        if (!recognizeStream) startStream();
        
        // 🔹 Enviar audio directamente a Google sin conversión
        recognizeStream.write(data);
    });

    ws.on('close', () => {
        console.log("🔌 Conexión cerrada");
        if (recognizeStream) {
            recognizeStream.end();
        }
    });
});

// 🔹 Función ElevenLabs (sin cambios)
async function generarAudioElevenLabs(texto) {
    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
            { text: texto },
            {
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        // 🔹 Aquí enviarías el audio de respuesta a Twilio
        console.log("✅ Audio generado con éxito");
        return response.data;
        
    } catch (error) {
        console.error("❌ Error ElevenLabs:", error);
    }
}

// 🔹 Ruta Twilio (sin cambios)
app.post('/media-stream', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.connect().stream({
        url: `wss://${req.hostname}/ws`,
    });
    res.type('text/xml').send(twiml.toString());
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});