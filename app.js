import express from "express";
import axios from "axios";
import http from "http";
import {Sequelize} from "sequelize";
import bodyParser from "body-parser";
import config from "./config/config.json" assert {type: 'json'};
import {config as configDotenv} from 'dotenv';
import { Server } from 'socket.io';

// Import des routes
import AuthRoutes from "./routes/API/Auth/index.js";
import CategoriesRoutes from "./routes/API/Categories/index.js";
import ProfileRoutes from "./routes/API/Profile/index.js";
import AnnoncesRoutes from "./routes/API/Annonces/index.js";
import AnnoncesContactsRoutes from "./routes/API/AnnoncesContacts/index.js";
import MessagesRoutes from "./routes/API/Messages/index.js";
import cors from "cors";
import * as path from "path";
configDotenv();

// Configuration initiale
const app = express();
const port = config.portApp;
const server = http.createServer(app);
const sequelize = new Sequelize(config.production);
const io = new Server(server);
//test
// CORS
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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
app.use(express.urlencoded({extended: true}));

// Routes API
app.use('/auth', AuthRoutes);
app.use('/categories', CategoriesRoutes);
app.use('/profile', ProfileRoutes);
app.use('/annonces', AnnoncesRoutes);
app.use('/annoncesContacts', AnnoncesContactsRoutes);
app.use('/messages', MessagesRoutes(io));
app.post('/restart', (req, res) => {
    if (req.headers['x-github-event'] === 'pull_request') {
        console.log('pull_request event detected!');
        console.log(req);
        console.log('req.headers["x-hub-signature-256"]', req.headers["x-hub-signature-256"]);
        const apiUrl = config.apiUrl;
        const apiToken = config.serverToken;
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
                res.status(200).send('Webhook  received and server restarted');
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