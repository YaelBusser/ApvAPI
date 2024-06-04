import express from "express";
import Messages from "../../../models/messages.js";
import moment from "moment";

const MessagesRoutes = (io) => {
    const router = express.Router(io);

    router.post('/send', async (req, res) => {
        try {
            const {id_annonces_contacts, id_sender, message} = req.body;
            console.log(id_annonces_contacts);
            console.log(id_sender);
            console.log(message);
            if (!id_annonces_contacts || !id_sender || !message) {
                return res.status(400).json({message: "Tous les champs sont requis."});
            }
            const newMessage = await Messages.create({
                id_annonces_contacts,
                id_sender,
                messages: message,
                date: moment().locale('fr').add(2, 'hours')
            });
            return res.status(200).json({message: "Message envoyé avec succès.", newMessage});
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            return res.status(500).json({message: "Erreur lors de l'envoi du message."});
        }
    });

    router.put('/mark-as-read', async (req, res) => {
        try {
            const {id_sender, id_annonces_contacts, idUser} = req.body;

            if (!id_sender || !id_annonces_contacts) {
                return res.status(400).json({message: "L'ID de l'expéditeur et l'ID des contacts d'annonce sont requis."});
            }
            if (id_sender !== idUser) {
                const updatedMessages = await Messages.update(
                    {vue: true},
                    {
                        where: {
                            id_sender: id_sender,
                            id_annonces_contacts: id_annonces_contacts
                        }
                    }
                );
                if (updatedMessages[0] === 0) {
                    return res.status(404).json({message: "Aucun message trouvé à mettre à jour."});
                }
            } else {
                return res.status(200).json({message: "Le dernier message a été envoyé par l'utilisateur actuel."});
            }


            return res.status(200).json({message: "Les messages ont été marqués comme lus."});
        } catch (error) {
            console.error('Erreur lors de la mise à jour des messages:', error);
            return res.status(500).json({message: "Erreur lors de la mise à jour des messages."});
        }
    });

    router.get('/', async (req, res) => {
        try {
            const {idAnnoncesContacts} = req.query;
            console.log("idAnnoncesContacts", idAnnoncesContacts);
            if (!idAnnoncesContacts) {
                return res.status(400).json({message: "L'ID des contacts des annonces est requis."});
            }

            const messages = await Messages.findAll({
                where: {
                    id_annonces_contacts: idAnnoncesContacts
                },
                order: [['date', 'ASC']]
            });
            console.log(messages);
            return res.status(200).json({messages});
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            return res.status(500).json({message: "Erreur lors de la récupération des messages."});
        }
    });

    return router;
}

export default MessagesRoutes;
