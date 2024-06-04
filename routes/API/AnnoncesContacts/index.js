import express from "express";
import Annonces_contacts from "../../../models/annonces_contacts.js";
import Users from "../../../models/users.js";
import Annonces from "../../../models/annonces.js";
import {Op} from "sequelize";
import Categories from "../../../models/categories.js";
import Types_annonce from "../../../models/types_annonce.js";
import Messages from "../../../models/messages.js";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const {id_annonce, id_user} = req.query;

        const annonce = await Annonces.findByPk(id_annonce);
        if (!id_user) {
            return res.status(405).json({message: "Utilisateur introuvable."});
        }

        if (!annonce) {
            return res.status(404).json({message: "Annonce non trouvée."});
        }

        let contactExists;
        console.log("annonce.id_type_annonce", annonce.id_type_annonce);
        if (annonce.id_type_annonce === 1) {
            contactExists = await Annonces_contacts.findOne({
                where: {
                    id_annonce: id_annonce,
                    id_prestataire: id_user
                }
            });
        } else if (annonce.id_type_annonce === 2) {
            contactExists = await Annonces_contacts.findOne({
                where: {
                    id_annonce: id_annonce,
                    id_demandeur: id_user
                }
            });
        } else {
            return res.status(400).json({message: "Type d'annonce inconnu."});
        }

        if (contactExists) {
            console.log(contactExists.id);
            return res.status(200).json({
                contactExists: contactExists,
                idAnnoncesContacts: contactExists.id,
                message: "Utilisateur a déjà contacté la personne de l'annonce."
            });
        } else {
            return res.status(200).json({message: "Aucun contact précédent trouvé pour cet utilisateur et cette annonce."});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Erreur lors de la vérification des contacts de l'utilisateur."});
    }
});
// Route GET pour récupérer les contacts d'un utilisateur
router.get('/contacts', async (req, res) => {
    try {
        // Récupère l'id de l'utilisateur à partir des paramètres de la requête
        const { id_user } = req.query;

        // Vérifie si l'id de l'utilisateur est fourni
        if (!id_user) {
            return res.status(400).json({ message: "Utilisateur introuvable." });
        }

        // Cherche l'utilisateur dans la base de données
        const user = await Users.findByPk(id_user);

        // Vérifie si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Récupère les contacts de l'utilisateur en fonction de son rôle (demandeur ou prestataire)
        const contacts = await Annonces_contacts.findAll({
            where: {
                [Op.or]: [
                    { id_demandeur: id_user },
                    { id_prestataire: id_user }
                ]
            },
            // Inclut les annonces, catégories, utilisateurs et types d'annonce associés
            include: [
                {
                    model: Annonces,
                    include: [
                        {
                            model: Categories,
                            attributes: ['id', 'label']
                        },
                        {
                            model: Users,
                            attributes: ['id', 'firstname', 'name', 'avatar']
                        },
                        {
                            model: Types_annonce,
                            attributes: ['id', 'label']
                        }
                    ]
                }
            ]
        });

        // Si aucun contact n'est trouvé, retourne un message approprié
        if (!contacts.length) {
            return res.status(200).json({ message: "Aucun contact trouvé pour cet utilisateur." });
        }

        // Tableau pour stocker les informations des autres utilisateurs en contact
        const otherUsers = [];

        // Boucle sur chaque contact pour récupérer les informations supplémentaires nécessaires
        for (const contact of contacts) {
            let otherUser;

            // Vérifie le rôle de l'utilisateur pour déterminer l'autre utilisateur en contact
            if (contact.id_demandeur === parseInt(id_user)) {
                otherUser = await Users.findByPk(contact.id_prestataire, {
                    attributes: ['id', 'firstname', 'name', 'avatar']
                });
            } else {
                otherUser = await Users.findByPk(contact.id_demandeur, {
                    attributes: ['id', 'firstname', 'name', 'avatar']
                });
            }

            // Convertit les données de l'autre utilisateur en JSON
            otherUser = otherUser.toJSON();

            // Ajoute l'ID du contact d'annonce et les détails de l'annonce aux informations de l'autre utilisateur
            otherUser.annoncesContactsId = contact.id;
            otherUser.annonce = {
                id: contact.annonce.id,
                titre: contact.annonce.titre,
                categorie: contact.annonce.category ? contact.annonce.category.label : null,
                type: contact.annonce.type ? contact.annonce.type.label : null,
                user: contact.annonce.user,
            };

            // Récupère le dernier message échangé pour ce contact
            const lastMessage = await Messages.findOne({
                where: { id_annonces_contacts: contact.id },
                order: [['date', 'DESC']]
            });

            // Ajoute le dernier message aux informations de l'autre utilisateur ou null si aucun message trouvé
            if (lastMessage) {
                otherUser.lastMessage = lastMessage;
            } else {
                otherUser.lastMessage = null;
            }

            // Compte le nombre de messages non vus pour ce contact
            otherUser.unseenMessagesCount = await Messages.count({
                where: {
                    id_annonces_contacts: contact.id,
                    vue: false
                }
            });

            // Ajoute l'autre utilisateur au tableau des autres utilisateurs
            otherUsers.push(otherUser);
        }

        // Trie les autres utilisateurs par date du dernier message (du plus récent au plus ancien)
        otherUsers.sort((a, b) => {
            if (a.lastMessage && b.lastMessage) {
                return new Date(b.lastMessage.date) - new Date(a.lastMessage.date);
            }
            if (a.lastMessage) return -1;
            if (b.lastMessage) return 1;
            return 0;
        });

        // Log des autres utilisateurs pour le débogage
        console.log(otherUsers);

        // Retourne les autres utilisateurs avec un statut 200
        return res.status(200).json(otherUsers);
    } catch (error) {
        // Log de l'erreur et retour d'un message d'erreur avec un statut 500
        console.error(error);
        return res.status(500).json({ message: "Erreur lors de la récupération des contacts de l'utilisateur." });
    }
});


router.post('/create', async (req, res) => {
    try {
        const {id_annonce, id_demandeur, id_prestataire} = req.body;

        if (!id_annonce || !id_demandeur || !id_prestataire) {
            return res.status(400).json({message: "Erreur inconnue !"});
        }

        const demandeur = await Users.findByPk(id_demandeur);
        const prestataire = await Users.findByPk(id_prestataire);
        const annonce = await Annonces.findByPk(id_annonce);

        if (!demandeur) {
            return res.status(404).json({message: "Demandeur non trouvé."});
        }
        if (!prestataire) {
            return res.status(404).json({message: "Prestataire non trouvé."});
        }

        if (!annonce) {
            return res.status(404).json({message: "Annonce non trouvée."});
        }

        const newMessage = await Annonces_contacts.create({
            id_annonce: id_annonce,
            id_demandeur: id_demandeur,
            id_prestataire: id_prestataire
        });

        return res.status(201).json({message: "Contact créé avec succès", data: newMessage});
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return res.status(500).json({message: "Erreur lors de l'envoi du message."});
    }
});

export default router;
