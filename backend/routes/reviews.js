const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load reviews from file
async function loadReviews() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(REVIEWS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

// Save reviews to file
async function saveReviews(reviews) {
    await ensureDataDirectory();
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
}

// Validation rules
const reviewValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),

    body('service')
        .isIn(['wedding', 'portrait', 'event', 'corporate', 'commercial', 'artistic'])
        .withMessage('Service invalide'),

    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),

    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Le commentaire est requis')
        .isLength({ min: 20, max: 1000 })
        .withMessage('Le commentaire doit contenir entre 20 et 1000 caractères'),

    body('date')
        .optional()
        .trim()
];

// GET all approved reviews (public)
router.get('/', async (req, res) => {
    try {
        const reviews = await loadReviews();
        const approvedReviews = reviews
            .filter(r => r.status === 'approved')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            reviews: approvedReviews
        });
    } catch (error) {
        console.error('Erreur lecture avis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des avis'
        });
    }
});

// POST new review
router.post('/', reviewValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { name, email, service, rating, comment, date } = req.body;

        // Load existing reviews
        const reviews = await loadReviews();

        // Create new review
        const newReview = {
            id: Date.now().toString(),
            name,
            email,
            service,
            rating: parseInt(rating),
            comment,
            date: date || null,
            status: 'pending', // pending, approved, rejected
            createdAt: new Date().toISOString()
        };

        // Add to reviews
        reviews.push(newReview);

        // Save to file
        await saveReviews(reviews);

        console.log('✅ Nouvel avis reçu:', {
            nom: name,
            service,
            note: rating
        });

        res.json({
            success: true,
            message: 'Merci ! Votre avis a été envoyé et sera publié après validation.'
        });

    } catch (error) {
        console.error('Erreur création avis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de l\'avis'
        });
    }
});

// GET all reviews with filter (for admin)
router.get('/admin', async (req, res) => {
    try {
        const { status } = req.query;
        const reviews = await loadReviews();
        
        let filteredReviews = reviews;
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filteredReviews = reviews.filter(r => r.status === status);
        }

        filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            reviews: filteredReviews,
            stats: {
                total: reviews.length,
                pending: reviews.filter(r => r.status === 'pending').length,
                approved: reviews.filter(r => r.status === 'approved').length,
                rejected: reviews.filter(r => r.status === 'rejected').length
            }
        });
    } catch (error) {
        console.error('Erreur lecture avis admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des avis'
        });
    }
});

// UPDATE review status (approve/reject)
router.patch('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const reviews = await loadReviews();
        const reviewIndex = reviews.findIndex(r => r.id === id);

        if (reviewIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Avis non trouvé'
            });
        }

        reviews[reviewIndex].status = status;
        reviews[reviewIndex].moderatedAt = new Date().toISOString();

        await saveReviews(reviews);

        console.log(`✅ Avis ${status === 'approved' ? 'approuvé' : 'rejeté'}:`, reviews[reviewIndex].name);

        res.json({
            success: true,
            message: `Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`
        });
    } catch (error) {
        console.error('Erreur modification avis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'avis'
        });
    }
});

// DELETE review
router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await loadReviews();
        const filteredReviews = reviews.filter(r => r.id !== id);

        if (filteredReviews.length === reviews.length) {
            return res.status(404).json({
                success: false,
                message: 'Avis non trouvé'
            });
        }

        await saveReviews(filteredReviews);

        console.log('🗑️ Avis supprimé:', id);

        res.json({
            success: true,
            message: 'Avis supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression avis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'avis'
        });
    }
});

module.exports = router;

