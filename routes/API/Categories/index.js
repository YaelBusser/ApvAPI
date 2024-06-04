import express from "express";
import Categories from "../../../models/categories.js";


const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Categories.findAll();
        return res.json(categories);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Erreur lors de la récupération des catégories."});
    }
});

export default router;
