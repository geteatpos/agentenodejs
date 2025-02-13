const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');
const http = require('http');
const OpenAI = require('openai');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const axios = require('axios');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🔹 Verificar API Keys antes de iniciar
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY no está configurada.");
    process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
    console.error("❌ ERROR: ELEVENLABS_API_KEY no está configurada.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Almacenar datos de audio en tiempo real
let audioBuffer = Buffer.alloc(0);

// 🟢 WebSocket para recibir audio en tiempo real de Twilio
wss.on('connection', (ws) => {
    console.log("🔗 Conexión WebSocket establecida con Twilio Media Stream");

    ws.on('message', async (data) => {
        console.log("🎙️ Recibiendo audio en tiempo real... (chunk de datos)");
        audioBuffer = Buffer.concat([audioBuffer, data]);
    });

    ws.on('close', async () => {
        console.log("🔌 Conexión WebSocket cerrada, procesando audio...");

        if (audioBuffer.length > 0) {
            console.log(`🔍 Tamaño del audio recibido: ${audioBuffer.length} bytes`);

            // Guardar el audio temporalmente
            const rawAudioPath = './audio.raw';
            fs.writeFileSync(rawAudioPath, audioBuffer);
            console.log(`✅ Audio guardado en ${rawAudioPath}`);

            // Convertir a WAV
            const wavAudioPath = './audio.wav';

            ffmpeg()
                .setFfmpegPath(ffmpegStatic)
                .input(rawAudioPath)
                .inputFormat('mulaw') // Twilio envía audio en formato mu-law
                .outputOptions([
                    '-ar 16000', // Convertir a 16 kHz
                    '-ac 1', // Canal mono
                    '-b:a 128k', // Calidad de audio alta
                    '-f wav'
                ])
                .output(wavAudioPath)
                .on('start', (cmd) => console.log(`▶ Ejecutando FFmpeg: ${cmd}`))
                .on('error', (err) => console.error("❌ Error en FFmpeg:", err))
                .on('end', async () => {
                    console.log("🎧 Audio convertido, enviando a Whisper...");

                    try {
                        // Transcribir el audio con Whisper
                        const transcription = await openai.audio.transcriptions.create({
                            file: fs.createReadStream(wavAudioPath),
                            model: "whisper-1",
                            language: "es", // Cambiar a "en" si es inglés
                            response_format: "text"
                        });

                        console.log("📝 Transcripción:", transcription.text);

                        // 🔥 Generar respuesta en voz con Eleven Labs
                        const respuestaAudio = await generarAudioElevenLabs(transcription.text);
                        if (respuestaAudio) {
                            console.log(`📢 Respuesta generada en: ${respuestaAudio}`);
                        }

                        // Limpiar archivos temporales
                        fs.unlinkSync(rawAudioPath);
                        fs.unlinkSync(wavAudioPath);
                    } catch (error) {
                        console.error("❌ Error en la transcripción:", error);
                    }
                })
                .run();
        } else {
            console.error("❌ No se recibió audio válido.");
        }
    });

    ws.on('error', (err) => {
        console.error("❌ Error en WebSocket:", err);
    });
});

// 🔹 Función para generar respuesta en voz con Eleven Labs
async function generarAudioElevenLabs(texto) {
    console.log("🎙️ Generando audio con Eleven Labs...");

    try {
        const response = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech/2qEjXpSVHAkqHEoF1x8h', // ⚠️ Reemplaza con tu Voice ID
            {
                text: texto,
                voice_settings: { stability: 0.5, similarity_boost: 0.7 }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                responseType: 'arraybuffer'
            }
        );

        const respuestaAudioPath = './respuesta.mp3';
        fs.writeFileSync(respuestaAudioPath, response.data);
        console.log("✅ Audio generado y GUARDADO POR MI  como respuesta.mp3");

        return respuestaAudioPath;
    } catch (error) {
        console.error("❌ Error generando audio en Eleven Labs:", error);
        return null;
    }
}

// 🔹 Ruta para recibir Twilio Media Stream
app.post('/media-stream', (req, res) => {
    console.log("✅ Recibida solicitud en /media-stream");

    try {
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.connect().stream({
            url: `wss://${req.hostname}/ws`,
        });

        console.log("📡 Enviando TwiML a Twilio...");
        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error("❌ Error en /media-stream:", error);
        res.status(500).send("Error en Media Stream");
    }
});

// 🔹 Escuchar en el mismo servidor Express
server.listen(PORT, () => {
    console.log(`🚀 Servidor Express y WebSocket corriendo en http://localhost:${PORT}`);
});
