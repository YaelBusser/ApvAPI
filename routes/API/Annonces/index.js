import express from 'express';
import Annonce from '../../../models/annonces.js';
import Types_annonce from "../../../models/types_annonce.js";

import multer from 'multer';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import Categories from "../../../models/categories.js";
import Users from "../../../models/users.js";
import * as fs from "fs";
import {sequelize} from "../../../sequelize.js";
import {Op} from "sequelize";

const router = express.Router();
const __filenameDemandes = fileURLToPath(import.meta.url);
const __dirnameDemandes = dirname(__filenameDemandes);
const uploadDirDemandes = join(__dirnameDemandes, '../../../public/annonces/couvertures');
const storageDemandes = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirDemandes);
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
        cb(null, filename);
    }
});

const uploadDemandes = multer({storage: storageDemandes});

const __filenameServices = fileURLToPath(import.meta.url);
const __dirnameServices = dirname(__filenameServices);
const uploadDirServices = join(__dirnameServices, '../../../public/annonces/couvertures');
const storageServices = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirServices);
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
        cb(null, filename);
    }
});

const uploadServices = multer({storage: storageServices});

const __filenameEdit = fileURLToPath(import.meta.url);
const __dirnameEdit = dirname(__filenameEdit);
const uploadDirEdit = join(__dirnameEdit, '../../../public/annonces/couvertures');
const storageEdit = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirEdit);
    },
    filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
        cb(null, filename);
    }
});

const uploadEdit = multer({storage: storageEdit});
router.post('/create/demande', uploadDemandes.single('couverture'), async (req, res) => {
    try {
        const {title, description, idCategory, user, uuid} = req.body;
        const image = req.file ? req.file.filename : null;
        const parsedUser = JSON.parse(user);

        if (!title || !description || !image || !idCategory) {
            return res.status(400).json({message: 'Tous les champs sont requis.'});
        }

        const newAnnonce = await Annonce.create({
            id_user: parsedUser.id,
            id_categorie: idCategory,
            id_type_annonce: 1,
            titre: title,
            description: description,
            image: `annonces/couvertures/${image}`,
            uuid: uuid,
        });

        res.status(200).json(newAnnonce);
    } catch (error) {
        console.error('Erreur lors de la création de l\'annonce:', error);
        res.status(500).json({message: 'Erreur lors de la création de l\'annonce.'});
    }
});

router.post('/create/service', uploadServices.single('couverture'), async (req, res) => {
    try {
        const {title, description, idCategory, user, uuid} = req.body;
        const image = req.file ? req.file.filename : null;
        const parsedUser = JSON.parse(user);

        if (!title || !description || !image || !idCategory) {
            return res.status(400).json({message: 'Tous les champs sont requis.'});
        }

        const newAnnonce = await Annonce.create({
            id_user: parsedUser.id,
            id_categorie: idCategory,
            id_type_annonce: 2,
            titre: title,
            description: description,
            image: `annonces/couvertures/${image}`,
            uuid: uuid,
        });

        res.status(200).json(newAnnonce);
    } catch (error) {
        console.error('Erreur lors de la création de l\'annonce:', error);
        res.status(500).json({message: 'Erreur lors de la création de l\'annonce.'});
    }
});

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const demandes = await Annonce.findAll({
            where: {
                id_user: userId,
                id_type_annonce: 1
            },
            include: {
                model: Categories,
                attributes: ['label'],
            },
            order: [['id', 'DESC']]
        });

        const services = await Annonce.findAll({
            where: {
                id_user: userId,
                id_type_annonce: 2
            },
            include: {
                model: Categories,
                attributes: ['label'],
            },
            order: [['id', 'DESC']]
        });
        console.log(demandes);
        res.status(200).json({demandes, services});
    } catch (error) {
        console.error('Erreur lors de la récupération des annonces:', error);
        res.status(500).json({message: 'Erreur lors de la récupération des annonces.'});
    }
});

router.get('/details/:id', async (req, res) => {
    const idAnnonce = req.params.id;
    try {
        const annonce = await Annonce.findOne({
            where: {id: idAnnonce},
            include: [
                {
                    model: Categories,
                    attributes: ['label'],
                },
                {
                    model: Users,
                    attributes: ['id', 'firstname', 'name', 'avatar']
                },
                {
                    model: Types_annonce,
                    attributes: ['id', 'label']
                },
            ],
        });

        if (annonce) {
            res.status(200).json(annonce);
        } else {
            res.status(404).json({message: 'Annonce non trouvée'});
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'annonce:', error);
        res.status(500).json({message: 'Erreur lors de la récupération de l\'annonce.'});
    }
});

router.put('/edit/:id', uploadEdit.single('couverture'), async (req, res) => {
    const annonceId = req.params.id;
    const { titre, description } = req.body;
    const image = req.file ? req.file.filename : null;
    console.log("TITRE", titre);
    try {
        const annonce = await Annonce.findByPk(annonceId);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée.' });
        }
        annonce.titre = titre || annonce.titre;
        annonce.description = description || annonce.description;
        if (image) {
            const oldImagePath = join(__dirnameEdit, '../../../public', annonce.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            annonce.image = `annonces/couvertures/${image}`;
        }
        await annonce.save();
        res.status(200).json({ message: 'Annonce mise à jour avec succès.', annonce });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'annonce.' });
    }
});
router.delete('/delete/:id', async (req, res) => {
    const annonceId = req.params.id;
    try {
        const annonce = await Annonce.findByPk(annonceId);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée.' });
        }

        const imagePath = join(__dirnameEdit, '../../../public', annonce.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await annonce.destroy();
        res.status(200).json({ message: 'Annonce supprimée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'annonce:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'annonce.' });
    }
});
router.get('/', async (req, res) => {
    const { category, idCategory, search } = req.query;
    try {
        let demandes;
        let prestations;
        const whereClause = {
            id_categorie: idCategory
        };

        if (category && category !== 'Tout') {
            if (search) {
                demandes = await Annonce.findAll({
                    where: {
                        ...whereClause,
                        id_type_annonce: 1, // Type annonce pour demandeur
                        [Op.or]: [
                            { titre: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });

                prestations = await Annonce.findAll({
                    where: {
                        ...whereClause,
                        id_type_annonce: 2, // Type annonce pour offreur
                        [Op.or]: [
                            { titre: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });
            } else {
                demandes = await Annonce.findAll({
                    where: {
                        ...whereClause,
                        id_type_annonce: 1 // Type annonce pour demandeur
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });

                prestations = await Annonce.findAll({
                    where: {
                        ...whereClause,
                        id_type_annonce: 2 // Type annonce pour offreur
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });
            }
        } else {
            if (search) {
                demandes = await Annonce.findAll({
                    where: {
                        id_type_annonce: 1, // Type annonce pour demandeur
                        [Op.or]: [
                            { titre: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });

                prestations = await Annonce.findAll({
                    where: {
                        id_type_annonce: 2, // Type annonce pour offreur
                        [Op.or]: [
                            { titre: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });
            } else {
                demandes = await Annonce.findAll({
                    where: {
                        id_type_annonce: 1 // Type annonce pour demandeur
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });

                prestations = await Annonce.findAll({
                    where: {
                        id_type_annonce: 2 // Type annonce pour offreur
                    },
                    include: {
                        model: Categories,
                        attributes: ['id', 'label'],
                    },
                    order: [['id', 'DESC']]
                });
            }
        }
        res.status(200).json({ demandes, prestations });
    } catch (error) {
        console.error('Erreur lors de la récupération des annonces:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des annonces.' });
    }
});

export default router;
