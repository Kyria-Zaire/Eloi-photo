const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const router = express.Router();

const PORTFOLIO_FILE = path.join(__dirname, '../data/portfolio.json');
const UPLOAD_DIR = path.join(__dirname, '../../frontend/assets/images/portfolio');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
            cb(null, UPLOAD_DIR);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seules les images (JPEG, PNG, WebP) sont autorisées'));
        }
    }
});

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load portfolio data
async function loadPortfolio() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(PORTFOLIO_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save portfolio data
async function savePortfolio(portfolio) {
    await ensureDataDirectory();
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2), 'utf8');
}

// GET all portfolio items
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let portfolio = await loadPortfolio();

        if (category && category !== 'all') {
            portfolio = portfolio.filter(item => item.category === category);
        }

        // Sort by order
        portfolio.sort((a, b) => (a.order || 0) - (b.order || 0));

        res.json({
            success: true,
            portfolio
        });
    } catch (error) {
        console.error('Erreur lecture portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du portfolio'
        });
    }
});

// GET portfolio stats (for admin)
router.get('/admin/stats', async (req, res) => {
    try {
        const portfolio = await loadPortfolio();

        const stats = {
            total: portfolio.length,
            wedding: portfolio.filter(p => p.category === 'wedding').length,
            portrait: portfolio.filter(p => p.category === 'portrait').length,
            event: portfolio.filter(p => p.category === 'event').length,
            corporate: portfolio.filter(p => p.category === 'corporate').length,
            commercial: portfolio.filter(p => p.category === 'commercial').length,
            artistic: portfolio.filter(p => p.category === 'artistic').length
        };

        res.json({
            success: true,
            stats,
            portfolio
        });
    } catch (error) {
        console.error('Erreur stats portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des stats'
        });
    }
});

// POST upload new image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucune image fournie'
            });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            // Delete uploaded file if validation fails
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Titre et catégorie requis'
            });
        }

        const portfolio = await loadPortfolio();

        const newItem = {
            id: Date.now().toString(),
            title,
            description: description || '',
            category,
            image: `/assets/images/portfolio/${req.file.filename}`,
            order: portfolio.length,
            createdAt: new Date().toISOString()
        };

        portfolio.push(newItem);
        await savePortfolio(portfolio);

        console.log('✅ Nouvelle image ajoutée au portfolio:', title);

        res.json({
            success: true,
            message: 'Image ajoutée avec succès',
            item: newItem
        });
    } catch (error) {
        console.error('Erreur upload:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload de l\'image'
        });
    }
});

// PATCH update portfolio item
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, order } = req.body;

        const portfolio = await loadPortfolio();
        const itemIndex = portfolio.findIndex(p => p.id === id);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item non trouvé'
            });
        }

        // Update fields
        if (title) portfolio[itemIndex].title = title;
        if (description !== undefined) portfolio[itemIndex].description = description;
        if (category) portfolio[itemIndex].category = category;
        if (order !== undefined) portfolio[itemIndex].order = parseInt(order);
        portfolio[itemIndex].updatedAt = new Date().toISOString();

        await savePortfolio(portfolio);

        console.log('✅ Portfolio mis à jour:', id);

        res.json({
            success: true,
            message: 'Portfolio mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
});

// POST reorder portfolio
router.post('/reorder', async (req, res) => {
    try {
        const { items } = req.body; // Array of {id, order}

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Format de données invalide'
            });
        }

        const portfolio = await loadPortfolio();

        items.forEach(({ id, order }) => {
            const item = portfolio.find(p => p.id === id);
            if (item) {
                item.order = order;
            }
        });

        await savePortfolio(portfolio);

        console.log('✅ Portfolio réorganisé');

        res.json({
            success: true,
            message: 'Ordre mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur réorganisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réorganisation'
        });
    }
});

// DELETE portfolio item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const portfolio = await loadPortfolio();
        const item = portfolio.find(p => p.id === id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item non trouvé'
            });
        }

        // Delete image file if it's a local file
        if (item.image && item.image.startsWith('/assets/images/portfolio/')) {
            const imagePath = path.join(__dirname, '../../frontend', item.image);
            try {
                await fs.unlink(imagePath);
                console.log('🗑️ Image supprimée:', item.image);
            } catch (err) {
                console.warn('Image déjà supprimée ou inexistante');
            }
        }

        // Remove from portfolio
        const filteredPortfolio = portfolio.filter(p => p.id !== id);
        await savePortfolio(filteredPortfolio);

        console.log('🗑️ Item portfolio supprimé:', id);

        res.json({
            success: true,
            message: 'Item supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
});

module.exports = router;

