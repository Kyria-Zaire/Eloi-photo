const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Paths to data files
const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');
const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');
const QUOTES_FILE = path.join(__dirname, '../data/quotes.json');
const CALENDAR_FILE = path.join(__dirname, '../data/calendar.json');
const PORTFOLIO_FILE = path.join(__dirname, '../data/portfolio.json');

// Helper to load JSON file
async function loadJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// GET global statistics
router.get('/dashboard', async (req, res) => {
    try {
        const [messages, reviews, quotes, calendar, portfolio] = await Promise.all([
            loadJSON(MESSAGES_FILE),
            loadJSON(REVIEWS_FILE),
            loadJSON(QUOTES_FILE),
            loadJSON(CALENDAR_FILE).then(c => c || { blockedDates: [], bookings: [] }),
            loadJSON(PORTFOLIO_FILE)
        ]);

        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const thisYear = now.getFullYear().toString();

        // Messages stats
        const messagesThisMonth = messages.filter(m => m.createdAt.startsWith(thisMonth)).length;
        const messagesThisYear = messages.filter(m => m.createdAt.startsWith(thisYear)).length;

        // Reviews stats
        const approvedReviews = reviews.filter(r => r.status === 'approved').length;
        const avgRating = reviews.filter(r => r.status === 'approved').length > 0
            ? (reviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.rating, 0) / approvedReviews).toFixed(1)
            : 0;

        // Quotes stats
        const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0);
        const revenueThisMonth = quotes
            .filter(q => q.status === 'accepted' && q.createdAt.startsWith(thisMonth))
            .reduce((sum, q) => sum + q.totalAmount, 0);
        const revenueThisYear = quotes
            .filter(q => q.status === 'accepted' && q.createdAt.startsWith(thisYear))
            .reduce((sum, q) => sum + q.totalAmount, 0);

        // Bookings stats
        const upcomingBookings = (calendar.bookings || []).filter(b => 
            b.status === 'confirmed' && b.date >= now.toISOString().split('T')[0]
        ).length;

        // Performance by service
        const serviceStats = {};
        ['wedding', 'portrait', 'event', 'corporate'].forEach(service => {
            const serviceQuotes = quotes.filter(q => q.service === service);
            const accepted = serviceQuotes.filter(q => q.status === 'accepted').length;
            const total = serviceQuotes.length;
            const revenue = serviceQuotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0);

            serviceStats[service] = {
                total,
                accepted,
                rejected: serviceQuotes.filter(q => q.status === 'rejected').length,
                conversionRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : 0,
                revenue
            };
        });

        res.json({
            success: true,
            stats: {
                overview: {
                    totalMessages: messages.length,
                    messagesThisMonth,
                    messagesThisYear,
                    totalReviews: reviews.length,
                    approvedReviews,
                    avgRating,
                    totalQuotes: quotes.length,
                    totalRevenue,
                    revenueThisMonth,
                    revenueThisYear,
                    upcomingBookings,
                    portfolioItems: portfolio.length
                },
                serviceStats,
                monthlyData: getMonthlyData(quotes, messages),
                recentActivity: getRecentActivity(messages, reviews, quotes)
            }
        });
    } catch (error) {
        console.error('Erreur stats dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// Helper: Get monthly data for charts
function getMonthlyData(quotes, messages) {
    const monthlyData = {};
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const monthMessages = messages.filter(m => m.createdAt.startsWith(monthKey)).length;
        const monthQuotes = quotes.filter(q => q.createdAt.startsWith(monthKey)).length;
        const monthRevenue = quotes
            .filter(q => q.status === 'accepted' && q.createdAt.startsWith(monthKey))
            .reduce((sum, q) => sum + q.totalAmount, 0);

        monthlyData[monthName] = {
            messages: monthMessages,
            quotes: monthQuotes,
            revenue: monthRevenue
        };
    }

    return monthlyData;
}

// Helper: Get recent activity
function getRecentActivity(messages, reviews, quotes) {
    const activities = [];

    messages.slice(-5).reverse().forEach(m => {
        activities.push({
            type: 'message',
            icon: '📬',
            text: `Nouveau message de ${m.name}`,
            date: m.createdAt
        });
    });

    reviews.slice(-5).reverse().forEach(r => {
        activities.push({
            type: 'review',
            icon: '⭐',
            text: `Nouvel avis de ${r.name} (${r.rating}★)`,
            date: r.createdAt
        });
    });

    quotes.slice(-5).reverse().forEach(q => {
        activities.push({
            type: 'quote',
            icon: '💰',
            text: `Devis ${q.quoteNumber} créé (${q.totalAmount}€)`,
            date: q.createdAt
        });
    });

    return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
}

// GET export data as CSV
router.get('/export/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let data = [];
        let headers = [];
        let filename = '';

        switch (type) {
            case 'messages':
                data = await loadJSON(MESSAGES_FILE);
                headers = ['Date', 'Nom', 'Email', 'Téléphone', 'Service', 'Budget', 'Message', 'Statut'];
                filename = 'messages-export.csv';
                break;

            case 'reviews':
                data = await loadJSON(REVIEWS_FILE);
                headers = ['Date', 'Nom', 'Email', 'Service', 'Note', 'Commentaire', 'Statut'];
                filename = 'avis-export.csv';
                break;

            case 'quotes':
                data = await loadJSON(QUOTES_FILE);
                headers = ['N° Devis', 'Date', 'Client', 'Email', 'Service', 'Montant', 'Statut', 'Paiement'];
                filename = 'devis-export.csv';
                break;

            case 'bookings':
                const calendarData = await loadJSON(CALENDAR_FILE);
                data = (calendarData && calendarData.bookings) ? calendarData.bookings : [];
                headers = ['Date', 'Client', 'Service', 'Notes', 'Statut'];
                filename = 'reservations-export.csv';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Type d\'export invalide'
                });
        }

        // Generate CSV
        const csv = generateCSV(data, headers, type);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv); // BOM for UTF-8
    } catch (error) {
        console.error('Erreur export:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export'
        });
    }
});

// Helper: Generate CSV
function generateCSV(data, headers, type) {
    let csv = headers.join(';') + '\n';

    data.forEach(item => {
        let row = [];

        switch (type) {
            case 'messages':
                row = [
                    new Date(item.createdAt).toLocaleDateString('fr-FR'),
                    item.name,
                    item.email,
                    item.phone || '',
                    item.service || '',
                    item.budget || '',
                    `"${item.message.replace(/"/g, '""')}"`,
                    item.status
                ];
                break;

            case 'reviews':
                row = [
                    new Date(item.createdAt).toLocaleDateString('fr-FR'),
                    item.name,
                    item.email,
                    item.service,
                    item.rating,
                    `"${item.comment.replace(/"/g, '""')}"`,
                    item.status
                ];
                break;

            case 'quotes':
                row = [
                    item.quoteNumber,
                    new Date(item.createdAt).toLocaleDateString('fr-FR'),
                    item.clientName,
                    item.clientEmail,
                    item.service,
                    item.totalAmount.toFixed(2),
                    item.status,
                    item.paymentStatus
                ];
                break;

            case 'bookings':
                row = [
                    new Date(item.date).toLocaleDateString('fr-FR'),
                    item.clientName,
                    item.service || '',
                    item.notes || '',
                    item.status
                ];
                break;
        }

        csv += row.join(';') + '\n';
    });

    return csv;
}

module.exports = router;

