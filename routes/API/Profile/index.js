import express from "express";

const router = express.Router();

import config from "../../../config/config.json" assert { type: 'json' };

import multer from "multer";
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

import Users from "../../../models/users.js";
import jwt from "jsonwebtoken";
import fs from "fs";

const __filenameAvatar = fileURLToPath(import.meta.url);
const __dirnameAvatar = dirname(__filenameAvatar);
const uploadDirAvatar = join(__dirnameAvatar, '../../../public/users/avatar');
const storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirAvatar);
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
        cb(null, filename);
    }
});

const uploadAvatar = multer({storage: storageAvatar});
router.post('/edit/avatar', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await Users.findByPk(userId);
        const image = req.file ? req.file.filename : null;
        console.log("JE SUIS ICI", image);
        if (!user) {
            return res.status(404).json({message: "Utilisateur non trouvé."});
        }

        if (user.avatar && user.avatar !== "users/avatar/defaultProfile.png") {
            const oldImagePath = join(__dirnameAvatar, '../../../public/', user.avatar);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        user.avatar = `users/avatar/${image}`;
        await user.save();
        res.status(200).json({message: 'Avatar mis à jour avec succès'});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Erreur lors de la mise à jour de l'avatar"});
    }
});

router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization;
        console.log(token);
        if (!token) {
            return res.status(401).json({message: "Token d'authentification manquant."});
        }

        jwt.verify(token, config.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({message: "Token d'authentification invalide."});
            }

            const userId = decoded.id;

            const user = await Users.findByPk(userId);

            if (!user) {
                return res.status(404).json({message: "Utilisateur non trouvé."});
            }

            return res.status(200).json({user});
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erreur lors de la récupération des données de l'utilisateur."});
    }
});
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token d\'authentification manquant.' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token d\'authentification invalide.' });
        }

        req.userId = decoded.id;
        next();
    });
};
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await Users.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
        console.log(user);
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des données de l\'utilisateur.' });
    }
});

export default router;
