const express = require('express');
const twilio = require('twilio');
const WebSocket = require('ws');
const http = require('http');
const OpenAI = require('openai');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY no está configurada en las variables de entorno.");
    process.exit(1); // Detener ejecución si falta la clave
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// 🔹 Almacenar los datos de audio
let audioBuffer = Buffer.alloc(0);

// 🟢 WebSocket para Twilio Media Streams
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
    
            // Guarda el audio recibido para verificarlo
            const rawAudioPath = './audio.raw';
            fs.writeFileSync(rawAudioPath, audioBuffer);
            console.log(`✅ Audio guardado en ${rawAudioPath}`);
    
            // Intenta convertirlo con ffmpeg
            const wavAudioPath = './audio.wav';
    
            ffmpeg()
                .setFfmpegPath(ffmpegStatic) // Asegurar que usa la versión correcta de FFmpeg
                .input(rawAudioPath)
                .inputFormat('mulaw') // Twilio envía audio en formato mu-law
                .outputOptions('-ar 16000') // Convertir a 16 kHz para Whisper
                .output(wavAudioPath)
                .on('start', (cmd) => console.log(`▶ Ejecutando FFmpeg: ${cmd}`))
                .on('error', (err) => console.error("❌ Error en FFmpeg:", err))
                .on('end', async () => {
                    console.log("🎧 Audio convertido, enviando a Whisper...");
    
                    try {
                        const transcription = await openai.audio.transcriptions.create({
                            file: fs.createReadStream(wavAudioPath),
                            model: "whisper-1",
                        });
    
                        console.log("📝 Transcripción:", transcription.text);
    
                        // 🔹 Eliminar archivos temporales
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

// 🔹 Escuchamos en el mismo servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor Express y WebSocket corriendo en http://localhost:${PORT}`);
});
