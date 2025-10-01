const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const contactRoutes = require('./routes/contact');
const reviewsRoutes = require('./routes/reviews');
const calendarRoutes = require('./routes/calendar');
const portfolioRoutes = require('./routes/portfolio');
const quotesRoutes = require('./routes/quotes');
const templatesRoutes = require('./routes/templates');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "https://images.unsplash.com", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Trop de requêtes depuis cette IP, réessayez plus tard.' });
app.use(limiter);

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Trop de messages envoyés, réessayez dans une heure.' });

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint non trouvé' });
});

module.exports = app;


