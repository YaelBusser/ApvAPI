import express from "express";
import axios from "axios";
import http from "http";
import { Sequelize } from "sequelize";
import bodyParser from "body-parser";
import config from "./config/config.json" assert { type: 'json' };
import { config as configDotenv } from 'dotenv';
import { Server } from 'socket.io';
import cors from "cors";
import * as path from "path";
import crypto from 'crypto';
const secret = config.secretKey;

// For these headers, a sigHashAlg of sha1 must be used instead of sha256
// GitHub: X-Hub-Signature
// Gogs:   X-Gogs-Signature
const sigHeaderName = 'X-Hub-Signature-256'
const sigHashAlg = 'sha256'
configDotenv();

// Configuration initiale
const app = express();
const port = config.portApp;
const server = http.createServer(app);
const sequelize = new Sequelize(config.production);
const io = new Server(server);


// CORS
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
// bodyparser
app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    },
}))
app.use(express.static('public'));

// Connexion à la base de données
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données établie avec succès.');
    } catch (error) {
        console.error('Impossible de se connecter à la base de données:', error);
    }
})();

// Configuration des vues
app.use(express.urlencoded({ extended: true }));

// Routes API
import AuthRoutes from "./routes/API/Auth/index.js";
import CategoriesRoutes from "./routes/API/Categories/index.js";
import ProfileRoutes from "./routes/API/Profile/index.js";
import AnnoncesRoutes from "./routes/API/Annonces/index.js";
import AnnoncesContactsRoutes from "./routes/API/AnnoncesContacts/index.js";
import MessagesRoutes from "./routes/API/Messages/index.js";

app.use('/auth', AuthRoutes);
app.use('/categories', CategoriesRoutes);
app.use('/profile', ProfileRoutes);
app.use('/annonces', AnnoncesRoutes);
app.use('/annoncesContacts', AnnoncesContactsRoutes);
app.use('/messages', MessagesRoutes(io));

// Middleware
function verifyPostData(req, res, next) {
    if (!req.rawBody) {
        return next('Request body empty')
    }

    const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8')
    const hmac = crypto.createHmac(sigHashAlg, secret)
    const digest = Buffer.from(sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8')
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`)
    }

    return next()
}



//Validate payload
app.post('/restart',verifyPostData, async (req, res) => {
    if (req.headers['x-github-event'] === 'pull_request') {
        console.log('pull_request event detected!');
        const apiUrl = config.apiUrl;
        const apiToken = config.serverToken;
        //TEST PR
        const headers = {
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        axios.post(apiUrl, { 'signal': 'restart' }, headers)
            .then(response => {
                console.log('Server restarted');
                res.status(200).send('Webhook received and server restarted');
            })
            .catch(error => {
                console.error('Error restarting the server:', error);
                res.status(500).send('Error restarting the server');
            });
    } else {
        res.status(400).send('Invalid event or irrelevant payload');
    }
});

// Gestion de la connexion Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', data.user);
    });

    socket.on('stop typing', (data) => {
        socket.to(data.room).emit('stop typing', data.user);
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', {
            message: data.message,
            user: data.user,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Démarrage du serveur
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
