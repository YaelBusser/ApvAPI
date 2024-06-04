// index.js

import express from "express";
import http from "http";
import mysql from "mysql2";
import bodyParser from "body-parser";
import dotenv from 'dotenv';

// Import des routes
import AuthRoutes from "./routes/API/Auth/index.js";
import CategoriesRoutes from "./routes/API/Categories/index.js";
import ProfileRoutes from "./routes/API/Profile/index.js";
import AnnoncesRoutes from "./routes/API/Annonces/index.js";
import cors from "cors";
import * as path from "path";

dotenv.config();

// Configuration initiale
const index = express();
const port = 4001;
const server = http.createServer(index);

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.LOCAL_DB_HOST,
    user: process.env.LOCAL_DB_USERNAME,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_DATABASE
};

const connection = mysql.createConnection(dbConfig);

// Vérification de la connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Impossible de se connecter à la base de données:', err);
        return;
    }
    console.log('Connexion à la base de données établie avec succès.');
});

// CORS
index.use(cors());

// Middleware
index.use(bodyParser.urlencoded({ extended: true }));
index.use(bodyParser.json());
index.use(express.static('public'));

// Routes API
index.use('/auth', AuthRoutes);
index.use('/categories', CategoriesRoutes);
index.use('/profile', ProfileRoutes);
index.use('/annonces', AnnoncesRoutes);

// Démarrage du serveur
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
