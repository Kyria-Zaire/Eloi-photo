const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const QUOTES_FILE = path.join(__dirname, '../data/quotes.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load quotes
async function loadQuotes() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(QUOTES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save quotes
async function saveQuotes(quotes) {
    await ensureDataDirectory();
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf8');
}

// Generate quote number
function generateQuoteNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEVIS-${year}${month}-${random}`;
}

// GET all quotes (for admin)
router.get('/admin', async (req, res) => {
    try {
        const { status } = req.query;
        const quotes = await loadQuotes();
        
        let filteredQuotes = quotes;
        if (status && ['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
            filteredQuotes = quotes.filter(q => q.status === status);
        }

        filteredQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate stats
        const stats = {
            total: quotes.length,
            draft: quotes.filter(q => q.status === 'draft').length,
            sent: quotes.filter(q => q.status === 'sent').length,
            accepted: quotes.filter(q => q.status === 'accepted').length,
            rejected: quotes.filter(q => q.status === 'rejected').length,
            totalAmount: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0),
            pendingAmount: quotes.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.totalAmount, 0)
        };

        res.json({
            success: true,
            quotes: filteredQuotes,
            stats
        });
    } catch (error) {
        console.error('Erreur lecture devis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des devis'
        });
    }
});

// POST create new quote
router.post('/', async (req, res) => {
    try {
        const { clientName, clientEmail, clientPhone, service, date, items, notes } = req.body;

        if (!clientName || !clientEmail || !service || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes'
            });
        }

        const quotes = await loadQuotes();

        // Calculate total
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newQuote = {
            id: Date.now().toString(),
            quoteNumber: generateQuoteNumber(),
            clientName,
            clientEmail,
            clientPhone: clientPhone || null,
            service,
            date: date || null,
            items,
            totalAmount,
            notes: notes || null,
            status: 'draft', // draft, sent, accepted, rejected, expired
            paymentStatus: 'pending', // pending, partial, paid
            paidAmount: 0,
            createdAt: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        quotes.push(newQuote);
        await saveQuotes(quotes);

        console.log('✅ Devis créé:', newQuote.quoteNumber);

        res.json({
            success: true,
            message: 'Devis créé avec succès',
            quote: newQuote
        });
    } catch (error) {
        console.error('Erreur création devis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du devis'
        });
    }
});

// PATCH update quote
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const quotes = await loadQuotes();
        const quoteIndex = quotes.findIndex(q => q.id === id);

        if (quoteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        // Update allowed fields
        const allowedFields = ['status', 'paymentStatus', 'paidAmount', 'notes', 'items', 'date'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                quotes[quoteIndex][field] = updates[field];
            }
        });

        // Recalculate total if items changed
        if (updates.items) {
            quotes[quoteIndex].totalAmount = updates.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        quotes[quoteIndex].updatedAt = new Date().toISOString();

        await saveQuotes(quotes);

        console.log('✅ Devis mis à jour:', quotes[quoteIndex].quoteNumber);

        res.json({
            success: true,
            message: 'Devis mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour devis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
});

// POST add payment to quote
router.post('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, method, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Montant invalide'
            });
        }

        const quotes = await loadQuotes();
        const quoteIndex = quotes.findIndex(q => q.id === id);

        if (quoteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        const quote = quotes[quoteIndex];

        // Initialize payments array if not exists
        if (!quote.payments) {
            quote.payments = [];
        }

        // Add payment
        quote.payments.push({
            id: Date.now().toString(),
            amount: parseFloat(amount),
            method: method || 'virement',
            notes: notes || null,
            date: new Date().toISOString()
        });

        // Update paid amount
        quote.paidAmount = quote.payments.reduce((sum, p) => sum + p.amount, 0);

        // Update payment status
        if (quote.paidAmount >= quote.totalAmount) {
            quote.paymentStatus = 'paid';
        } else if (quote.paidAmount > 0) {
            quote.paymentStatus = 'partial';
        }

        quote.updatedAt = new Date().toISOString();

        await saveQuotes(quotes);

        console.log('💰 Paiement ajouté:', amount, '€');

        res.json({
            success: true,
            message: 'Paiement enregistré avec succès'
        });
    } catch (error) {
        console.error('Erreur ajout paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout du paiement'
        });
    }
});

// DELETE quote
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const quotes = await loadQuotes();
        const filteredQuotes = quotes.filter(q => q.id !== id);

        if (filteredQuotes.length === quotes.length) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        await saveQuotes(filteredQuotes);

        console.log('🗑️ Devis supprimé:', id);

        res.json({
            success: true,
            message: 'Devis supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression devis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
});

// GET quote PDF/HTML (for sending to client)
router.get('/:id/preview', async (req, res) => {
    try {
        const { id } = req.params;
        const quotes = await loadQuotes();
        const quote = quotes.find(q => q.id === id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        const serviceNames = {
            wedding: 'Mariage',
            portrait: 'Portrait',
            event: 'Événement',
            corporate: 'Corporate'
        };

        // Generate HTML preview
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Devis ${quote.quoteNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; border-bottom: 3px solid #ff6b35; padding-bottom: 2rem; }
        .logo { font-size: 2rem; font-weight: 800; color: #ff6b35; }
        table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .total { font-size: 1.5rem; font-weight: 800; color: #ff6b35; text-align: right; margin-top: 1rem; }
        .footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd; font-size: 0.875rem; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">click.storm51</div>
        <h1>DEVIS</h1>
        <p><strong>N° ${quote.quoteNumber}</strong></p>
        <p>Valide jusqu'au ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
            <h3>Photographe</h3>
            <p><strong>Eloi - click.storm51</strong><br>
            📧 jeannoseloi@gmail.com<br>
            📱 +33 6 23 14 14 05<br>
            📍 Marne (51), France</p>
        </div>
        <div>
            <h3>Client</h3>
            <p><strong>${quote.clientName}</strong><br>
            📧 ${quote.clientEmail}<br>
            ${quote.clientPhone ? `📱 ${quote.clientPhone}<br>` : ''}
            ${quote.date ? `📅 Prestation prévue le ${new Date(quote.date).toLocaleDateString('fr-FR')}` : ''}</p>
        </div>
    </div>

    <h3>Prestation : ${serviceNames[quote.service] || quote.service}</h3>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${quote.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)} €</td>
                    <td>${(item.price * item.quantity).toFixed(2)} €</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total">
        TOTAL : ${quote.totalAmount.toFixed(2)} € TTC
    </div>

    ${quote.notes ? `<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 2rem;"><strong>Notes :</strong><br>${quote.notes}</div>` : ''}

    <div class="footer">
        <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
        <p>Conditions de paiement : Acompte de 30% à la réservation, solde à régler avant la prestation.</p>
        <p><strong>click.storm51</strong> • Photographie professionnelle • SIRET: XXX XXX XXX XXXXX</p>
    </div>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Erreur aperçu devis:', error);
        res.status(500).send('Erreur lors de la génération du devis');
    }
});

module.exports = router;

