const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const TEMPLATES_FILE = path.join(__dirname, '../data/email-templates.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Default templates
const defaultTemplates = {
    contactConfirmation: {
        name: 'Confirmation de contact',
        subject: 'Merci pour votre message - click.storm51',
        body: `Bonjour {{clientName}},

J'ai bien reçu votre message et je vous remercie pour l'intérêt que vous portez à mon travail.

Je vais étudier votre demande avec attention et vous recontacter dans les 24 heures pour discuter de votre projet photo.

En attendant, n'hésitez pas à consulter mon portfolio sur click.storm51.

Cordialement,
Eloi
Photographe click.storm51
📧 jeannoseloi@gmail.com
📱 +33 6 23 14 14 05
📍 Marne (51) et région Grand Est`,
        variables: ['clientName', 'service', 'date']
    },
    quoteConfirmation: {
        name: 'Envoi de devis',
        subject: 'Votre devis {{quoteNumber}} - click.storm51',
        body: `Bonjour {{clientName}},

Suite à votre demande, veuillez trouver ci-joint votre devis personnalisé n° {{quoteNumber}}.

Service : {{service}}
Date de prestation : {{date}}
Montant total : {{totalAmount}} €

Ce devis est valable 30 jours. N'hésitez pas à me contacter pour toute question ou modification.

Cordialement,
Eloi
Photographe click.storm51
📧 jeannoseloi@gmail.com
📱 +33 6 23 14 14 05`,
        variables: ['clientName', 'quoteNumber', 'service', 'date', 'totalAmount']
    },
    bookingConfirmation: {
        name: 'Confirmation de réservation',
        subject: 'Réservation confirmée pour le {{date}} - click.storm51',
        body: `Bonjour {{clientName}},

Votre réservation est confirmée ! 🎉

📅 Date : {{date}}
📸 Service : {{service}}
💰 Montant : {{totalAmount}} €

Un acompte de 30% ({{depositAmount}} €) est demandé pour valider définitivement la réservation.

Je vous recontacte prochainement pour finaliser les détails de la prestation.

Au plaisir de travailler avec vous,
Eloi
Photographe click.storm51`,
        variables: ['clientName', 'date', 'service', 'totalAmount', 'depositAmount']
    },
    paymentReminder: {
        name: 'Rappel de paiement',
        subject: 'Rappel : Paiement prestation du {{date}}',
        body: `Bonjour {{clientName}},

Je me permets de vous rappeler que le solde de votre prestation du {{date}} est à régler.

Montant restant : {{remainingAmount}} €

Merci de procéder au règlement avant la date de la prestation.

Cordialement,
Eloi`,
        variables: ['clientName', 'date', 'remainingAmount']
    },
    thankYou: {
        name: 'Remerciement après prestation',
        subject: 'Merci pour votre confiance ! 🙏',
        body: `Bonjour {{clientName}},

Un grand merci pour votre confiance lors de notre collaboration du {{date}}.

Ce fut un réel plaisir de capturer ces moments précieux pour vous.

Vos photos seront disponibles d'ici 2-3 semaines. Je vous enverrai un lien de téléchargement sécurisé.

Si vous avez apprécié mon travail, n'hésitez pas à laisser un avis sur mon site : {{siteUrl}}/laisser-avis.html

À très bientôt,
Eloi
click.storm51`,
        variables: ['clientName', 'date', 'siteUrl']
    }
};

// Load templates
async function loadTemplates() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(TEMPLATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default templates if file doesn't exist
        return defaultTemplates;
    }
}

// Save templates
async function saveTemplates(templates) {
    await ensureDataDirectory();
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
}

// GET all templates
router.get('/', async (req, res) => {
    try {
        const templates = await loadTemplates();
        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('Erreur lecture templates:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des templates'
        });
    }
});

// GET single template
router.get('/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const templates = await loadTemplates();
        
        if (!templates[templateId]) {
            return res.status(404).json({
                success: false,
                message: 'Template non trouvé'
            });
        }

        res.json({
            success: true,
            template: templates[templateId]
        });
    } catch (error) {
        console.error('Erreur lecture template:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du template'
        });
    }
});

// PATCH update template
router.patch('/:templateId', async (req, res) => {
    try {
        const { templateId } = req.params;
        const { subject, body } = req.body;

        const templates = await loadTemplates();
        
        if (!templates[templateId]) {
            return res.status(404).json({
                success: false,
                message: 'Template non trouvé'
            });
        }

        if (subject) templates[templateId].subject = subject;
        if (body) templates[templateId].body = body;
        templates[templateId].updatedAt = new Date().toISOString();

        await saveTemplates(templates);

        console.log('✅ Template mis à jour:', templateId);

        res.json({
            success: true,
            message: 'Template mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour template:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
});

// POST reset template to default
router.post('/:templateId/reset', async (req, res) => {
    try {
        const { templateId } = req.params;
        
        if (!defaultTemplates[templateId]) {
            return res.status(404).json({
                success: false,
                message: 'Template non trouvé'
            });
        }

        const templates = await loadTemplates();
        templates[templateId] = { ...defaultTemplates[templateId] };
        
        await saveTemplates(templates);

        console.log('🔄 Template réinitialisé:', templateId);

        res.json({
            success: true,
            message: 'Template réinitialisé aux valeurs par défaut'
        });
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réinitialisation'
        });
    }
});

// POST test template (send preview email)
router.post('/:templateId/test', async (req, res) => {
    try {
        const { templateId } = req.params;
        const { testEmail, variables } = req.body;

        if (!testEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email de test requis'
            });
        }

        const templates = await loadTemplates();
        const template = templates[templateId];

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template non trouvé'
            });
        }

        // Replace variables
        let subject = template.subject;
        let body = template.body;

        if (variables) {
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                subject = subject.replace(regex, variables[key]);
                body = body.replace(regex, variables[key]);
            });
        }

        console.log('📧 Email de test envoyé pour:', templateId);

        res.json({
            success: true,
            message: 'Email de test envoyé (simulation)',
            preview: { subject, body }
        });
    } catch (error) {
        console.error('Erreur test template:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du test'
        });
    }
});

module.exports = router;

