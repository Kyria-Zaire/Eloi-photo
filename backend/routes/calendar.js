const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const CALENDAR_FILE = path.join(__dirname, '../data/calendar.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load calendar data
async function loadCalendar() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(CALENDAR_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            blockedDates: [],
            bookings: []
        };
    }
}

// Save calendar data
async function saveCalendar(calendar) {
    await ensureDataDirectory();
    await fs.writeFile(CALENDAR_FILE, JSON.stringify(calendar, null, 2), 'utf8');
}

// GET calendar data
router.get('/', async (req, res) => {
    try {
        const calendar = await loadCalendar();
        res.json({
            success: true,
            calendar
        });
    } catch (error) {
        console.error('Erreur lecture calendrier:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du calendrier'
        });
    }
});

// POST block a date
router.post('/block', async (req, res) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date requise'
            });
        }

        const calendar = await loadCalendar();

        // Check if date already blocked
        const existingBlock = calendar.blockedDates.find(b => b.date === date);
        if (existingBlock) {
            return res.status(400).json({
                success: false,
                message: 'Cette date est déjà bloquée'
            });
        }

        // Add blocked date
        calendar.blockedDates.push({
            id: Date.now().toString(),
            date,
            reason: reason || 'Indisponible',
            createdAt: new Date().toISOString()
        });

        await saveCalendar(calendar);

        console.log('🚫 Date bloquée:', date);

        res.json({
            success: true,
            message: 'Date bloquée avec succès'
        });
    } catch (error) {
        console.error('Erreur blocage date:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du blocage de la date'
        });
    }
});

// DELETE unblock a date
router.delete('/block/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const calendar = await loadCalendar();

        calendar.blockedDates = calendar.blockedDates.filter(b => b.id !== id);

        await saveCalendar(calendar);

        console.log('✅ Date débloquée:', id);

        res.json({
            success: true,
            message: 'Date débloquée avec succès'
        });
    } catch (error) {
        console.error('Erreur déblocage date:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du déblocage de la date'
        });
    }
});

// POST add booking
router.post('/booking', async (req, res) => {
    try {
        const { date, clientName, service, notes } = req.body;

        if (!date || !clientName) {
            return res.status(400).json({
                success: false,
                message: 'Date et nom du client requis'
            });
        }

        const calendar = await loadCalendar();

        // Add booking
        calendar.bookings.push({
            id: Date.now().toString(),
            date,
            clientName,
            service: service || null,
            notes: notes || null,
            status: 'confirmed', // confirmed, cancelled
            createdAt: new Date().toISOString()
        });

        await saveCalendar(calendar);

        console.log('📅 Réservation ajoutée:', date, clientName);

        res.json({
            success: true,
            message: 'Réservation ajoutée avec succès'
        });
    } catch (error) {
        console.error('Erreur ajout réservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la réservation'
        });
    }
});

// UPDATE booking status
router.patch('/booking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const calendar = await loadCalendar();
        const bookingIndex = calendar.bookings.findIndex(b => b.id === id);

        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Réservation non trouvée'
            });
        }

        calendar.bookings[bookingIndex].status = status;
        calendar.bookings[bookingIndex].updatedAt = new Date().toISOString();

        await saveCalendar(calendar);

        console.log(`✅ Réservation mise à jour:`, status);

        res.json({
            success: true,
            message: 'Réservation mise à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur modification réservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la réservation'
        });
    }
});

// DELETE booking
router.delete('/booking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const calendar = await loadCalendar();

        calendar.bookings = calendar.bookings.filter(b => b.id !== id);

        await saveCalendar(calendar);

        console.log('🗑️ Réservation supprimée:', id);

        res.json({
            success: true,
            message: 'Réservation supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression réservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la réservation'
        });
    }
});

module.exports = router;

