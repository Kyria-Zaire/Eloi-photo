const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load messages from file
async function loadMessages() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save messages to file
async function saveMessages(messages) {
    await ensureDataDirectory();
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Validation rules
const contactValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^(\+33|0)[1-9](\d{8})$/)
        .withMessage('Numéro de téléphone français invalide'),

    body('service')
        .optional()
        .isIn(['wedding', 'portrait', 'event', 'corporate', 'commercial', 'artistic'])
        .withMessage('Service invalide'),

    body('budget')
        .optional()
        .isIn(['200-500', '500-1000', '1000-2000', '2000+'])
        .withMessage('Budget invalide'),

    body('message')
        .trim()
        .notEmpty()
        .withMessage('Le message est requis')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Le message doit contenir entre 10 et 1000 caractères')
];

// Contact form submission
router.post('/', contactValidation, async (req, res) => {
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

        const { name, email, phone, service, budget, message } = req.body;

        // Sauvegarder le message dans la base de données
        const messages = await loadMessages();
        const newMessage = {
            id: Date.now().toString(),
            name,
            email,
            phone: phone || null,
            service: service || null,
            budget: budget || null,
            message,
            status: 'unread', // unread, read, in_progress, done, archived
            createdAt: new Date().toISOString()
        };
        messages.push(newMessage);
        await saveMessages(messages);

        console.log('💾 Message sauvegardé dans la base de données');

        // Service names mapping
        const serviceNames = {
            wedding: 'Mariage',
            portrait: 'Portrait',
            event: 'Événement',
            corporate: 'Corporate',
            commercial: 'Commercial',
            artistic: 'Artistique'
        };

        // Create transporter
        const transporter = createTransporter();

        // Email to photographer
        const photographerEmail = {
            from: process.env.SMTP_USER,
            to: process.env.PHOTOGRAPHER_EMAIL || 'jeannoseloi@gmail.com',
            subject: `Nouveau message de ${name} - click.storm51`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 30px;">
                    <div style="background: linear-gradient(135deg, #ff6b35, #ff8c5a); padding: 20px; border-radius: 15px 15px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">click.storm51</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Nouveau message de contact</p>
                    </div>

                    <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Détails du contact</h2>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 600; color: #555; width: 120px;">Nom:</td>
                                    <td style="padding: 8px 0; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 600; color: #555;">Email:</td>
                                    <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #ff6b35; text-decoration: none;">${email}</a></td>
                                </tr>
                                ${phone ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 600; color: #555;">Téléphone:</td>
                                    <td style="padding: 8px 0; color: #333;"><a href="tel:${phone}" style="color: #ff6b35; text-decoration: none;">${phone}</a></td>
                                </tr>
                                ` : ''}
                                ${service ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 600; color: #555;">Service:</td>
                                    <td style="padding: 8px 0; color: #333;">${serviceNames[service] || service}</td>
                                </tr>
                                ` : ''}
                                ${budget ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: 600; color: #555;">Budget:</td>
                                    <td style="padding: 8px 0; color: #333;">${budget}€</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>

                        <h3 style="color: #333; margin-bottom: 15px;">Message:</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ff6b35;">
                            <p style="color: #333; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="color: #666; font-size: 14px; margin: 0;">
                                Message reçu le ${new Date().toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Auto-reply to client
        const clientEmail = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Merci pour votre message - click.storm51',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 30px;">
                    <div style="background: linear-gradient(135deg, #ff6b35, #ff8c5a); padding: 20px; border-radius: 15px 15px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">click.storm51</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Eloi Photographe</p>
                    </div>

                    <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Merci ${name} !</h2>

                        <p style="color: #555; line-height: 1.6;">
                            J'ai bien reçu votre message et je vous remercie pour l'intérêt que vous portez à mon travail.
                        </p>

                        <p style="color: #555; line-height: 1.6;">
                            Je vais étudier votre demande avec attention et vous recontacter dans les <strong>24 heures</strong>
                            pour discuter de votre projet photo.
                        </p>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                            <h3 style="color: #333; margin-top: 0; font-size: 16px;">Résumé de votre demande:</h3>
                            <p style="color: #555; margin: 5px 0;"><strong>Service:</strong> ${service ? serviceNames[service] : 'Non spécifié'}</p>
                            <p style="color: #555; margin: 5px 0;"><strong>Budget:</strong> ${budget ? budget + '€' : 'À discuter'}</p>
                        </div>

                        <p style="color: #555; line-height: 1.6;">
                            En attendant, n'hésitez pas à consulter mon portfolio sur
                            <a href="${process.env.WEBSITE_URL || 'http://localhost:3000'}" style="color: #ff6b35; text-decoration: none;">click.storm51</a>
                        </p>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 14px; margin: 0;">
                                <strong>Eloi</strong><br>
                                Photographe click.storm51<br>
                                📧 jeannoseloi@gmail.com<br>
                                📱 +33 6 23 14 14 05<br>
                                📍 Marne (51) et région Grand Est
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Envoi réel des emails
        console.log('📧 Envoi d\'email à:', process.env.PHOTOGRAPHER_EMAIL || 'jeannoseloi@gmail.com');
        
        await Promise.all([
            transporter.sendMail(photographerEmail),
            transporter.sendMail(clientEmail)
        ]);

        console.log('✅ Emails envoyés avec succès !');

        res.json({
            success: true,
            message: 'Message envoyé avec succès! Je vous recontacte dans les plus brefs délais.'
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
        });
    }
});

// GET all messages (for admin)
router.get('/admin', async (req, res) => {
    try {
        const { status } = req.query;
        const messages = await loadMessages();
        
        let filteredMessages = messages;
        if (status && ['unread', 'read', 'in_progress', 'done', 'archived'].includes(status)) {
            filteredMessages = messages.filter(m => m.status === status);
        }

        filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            messages: filteredMessages,
            stats: {
                total: messages.length,
                unread: messages.filter(m => m.status === 'unread').length,
                read: messages.filter(m => m.status === 'read').length,
                in_progress: messages.filter(m => m.status === 'in_progress').length,
                done: messages.filter(m => m.status === 'done').length,
                archived: messages.filter(m => m.status === 'archived').length
            }
        });
    } catch (error) {
        console.error('Erreur lecture messages:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des messages'
        });
    }
});

// UPDATE message status
router.patch('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['unread', 'read', 'in_progress', 'done', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const messages = await loadMessages();
        const messageIndex = messages.findIndex(m => m.id === id);

        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        messages[messageIndex].status = status;
        messages[messageIndex].updatedAt = new Date().toISOString();

        await saveMessages(messages);

        console.log(`✅ Message mis à jour:`, status);

        res.json({
            success: true,
            message: 'Message mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur modification message:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du message'
        });
    }
});

// DELETE message
router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await loadMessages();
        const filteredMessages = messages.filter(m => m.id !== id);

        if (filteredMessages.length === messages.length) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        await saveMessages(filteredMessages);

        console.log('🗑️ Message supprimé:', id);

        res.json({
            success: true,
            message: 'Message supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression message:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du message'
        });
    }
});

module.exports = router;