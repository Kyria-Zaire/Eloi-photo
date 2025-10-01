const fs = require('fs').promises;
const path = require('path');

/**
 * Script de test pour valider le projet click.storm51
 */

class ProjectTester {
    constructor() {
        this.results = {
            files: [],
            structure: [],
            content: [],
            errors: []
        };
    }

    async runAllTests() {
        console.log('🧪 Démarrage des tests du projet click.storm51\n');

        try {
            await this.testFileStructure();
            await this.testFileContents();
            await this.testConfiguration();
            await this.showResults();
        } catch (error) {
            console.error('❌ Erreur lors des tests:', error.message);
        }
    }

    async testFileStructure() {
        console.log('📁 Test de la structure des fichiers...');

        const requiredFiles = [
            'package.json',
            'README.md',
            '.env.example',
            'backend/server.js',
            'backend/routes/contact.js',
            'frontend/index.html',
            'frontend/assets/css/style.css',
            'frontend/assets/js/main.js',
            'frontend/mentions-legales.html',
            'frontend/politique-confidentialite.html',
            'frontend/sitemap.xml',
            'scripts/optimize-images.js'
        ];

        for (const file of requiredFiles) {
            const exists = await this.checkFileExists(file);
            this.results.files.push({
                file,
                exists,
                status: exists ? '✅' : '❌'
            });
        }

        const requiredDirs = [
            'backend',
            'backend/routes',
            'frontend',
            'frontend/assets',
            'frontend/assets/css',
            'frontend/assets/js',
            'scripts'
        ];

        for (const dir of requiredDirs) {
            const exists = await this.checkDirExists(dir);
            this.results.structure.push({
                dir,
                exists,
                status: exists ? '✅' : '❌'
            });
        }
    }

    async testFileContents() {
        console.log('📄 Test du contenu des fichiers...');

        const tests = [
            {
                file: 'package.json',
                test: () => this.testPackageJson(),
                name: 'package.json valide'
            },
            {
                file: 'frontend/index.html',
                test: () => this.testIndexHtml(),
                name: 'HTML principal avec SEO'
            },
            {
                file: 'backend/server.js',
                test: () => this.testServerJs(),
                name: 'Serveur Express configuré'
            },
            {
                file: 'frontend/assets/css/style.css',
                test: () => this.testStyleCss(),
                name: 'CSS avec thème sombre/clair'
            },
            {
                file: 'frontend/assets/js/main.js',
                test: () => this.testMainJs(),
                name: 'JavaScript avec toutes les fonctionnalités'
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.results.content.push({
                    name: test.name,
                    passed: result,
                    status: result ? '✅' : '❌'
                });
            } catch (error) {
                this.results.content.push({
                    name: test.name,
                    passed: false,
                    status: '❌',
                    error: error.message
                });
            }
        }
    }

    async testConfiguration() {
        console.log('⚙️  Test de la configuration...');

        const envExists = await this.checkFileExists('.env');
        const envExampleExists = await this.checkFileExists('.env.example');

        this.results.content.push({
            name: 'Fichier .env.example présent',
            passed: envExampleExists,
            status: envExampleExists ? '✅' : '❌'
        });

        if (envExists) {
            this.results.content.push({
                name: 'Fichier .env configuré',
                passed: true,
                status: '✅'
            });
        } else {
            this.results.content.push({
                name: 'Fichier .env à configurer',
                passed: false,
                status: '⚠️'
            });
        }
    }

    async testPackageJson() {
        const content = await fs.readFile('package.json', 'utf8');
        const pkg = JSON.parse(content);

        const requiredScripts = ['start', 'dev', 'optimize-images'];
        const requiredDeps = ['express', 'nodemailer', 'helmet'];

        for (const script of requiredScripts) {
            if (!pkg.scripts || !pkg.scripts[script]) {
                throw new Error(`Script manquant: ${script}`);
            }
        }

        for (const dep of requiredDeps) {
            if (!pkg.dependencies || !pkg.dependencies[dep]) {
                throw new Error(`Dépendance manquante: ${dep}`);
            }
        }

        return true;
    }

    async testIndexHtml() {
        const content = await fs.readFile('frontend/index.html', 'utf8');

        const requiredElements = [
            'meta name="description"',
            'meta property="og:title"',
            'script type="application/ld+json"',
            'class="testimonials"',
            'class="faq"',
            'id="cookieBanner"',
            'class="theme-toggle"'
        ];

        for (const element of requiredElements) {
            if (!content.includes(element)) {
                throw new Error(`Élément manquant: ${element}`);
            }
        }

        return true;
    }

    async testServerJs() {
        const content = await fs.readFile('backend/server.js', 'utf8');

        const requiredFeatures = [
            'require(\'helmet\')',
            'require(\'cors\')',
            'require(\'express-rate-limit\')',
            'require(\'./routes/contact\')',
            '/api/contact',
            '/api/health'
        ];

        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                throw new Error(`Fonctionnalité manquante: ${feature}`);
            }
        }

        return true;
    }

    async testStyleCss() {
        const content = await fs.readFile('frontend/assets/css/style.css', 'utf8');

        const requiredFeatures = [
            '[data-theme="light"]',
            '.cookie-banner',
            '.testimonials',
            '.faq',
            '.lightbox',
            '@media (max-width: 768px)'
        ];

        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                throw new Error(`Style manquant: ${feature}`);
            }
        }

        return true;
    }

    async testMainJs() {
        const content = await fs.readFile('frontend/assets/js/main.js', 'utf8');

        const requiredFunctions = [
            'toggleTheme',
            'initializePortfolio',
            'initializeFAQ',
            'handleFormSubmission',
            'openLightbox',
            'acceptCookies'
        ];

        for (const func of requiredFunctions) {
            if (!content.includes(func)) {
                throw new Error(`Fonction manquante: ${func}`);
            }
        }

        return true;
    }

    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async checkDirExists(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    showResults() {
        console.log('\n📊 Résultats des tests\n');

        // Structure des fichiers
        console.log('📁 Structure des fichiers:');
        this.results.files.forEach(result => {
            console.log(`   ${result.status} ${result.file}`);
        });

        console.log('\n📂 Structure des dossiers:');
        this.results.structure.forEach(result => {
            console.log(`   ${result.status} ${result.dir}/`);
        });

        // Contenu des fichiers
        console.log('\n📄 Contenu et fonctionnalités:');
        this.results.content.forEach(result => {
            console.log(`   ${result.status} ${result.name}`);
            if (result.error) {
                console.log(`      ↳ ${result.error}`);
            }
        });

        // Résumé
        const totalFiles = this.results.files.length;
        const existingFiles = this.results.files.filter(f => f.exists).length;

        const totalDirs = this.results.structure.length;
        const existingDirs = this.results.structure.filter(d => d.exists).length;

        const totalTests = this.results.content.length;
        const passedTests = this.results.content.filter(t => t.passed).length;

        console.log('\n📈 Résumé:');
        console.log(`   📁 Fichiers: ${existingFiles}/${totalFiles} (${Math.round(existingFiles/totalFiles*100)}%)`);
        console.log(`   📂 Dossiers: ${existingDirs}/${totalDirs} (${Math.round(existingDirs/totalDirs*100)}%)`);
        console.log(`   ✅ Tests: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);

        // Recommandations
        console.log('\n💡 Prochaines étapes:');

        if (existingFiles < totalFiles) {
            console.log('   • Vérifiez les fichiers manquants');
        }

        if (!this.results.content.find(t => t.name.includes('.env configuré'))?.passed) {
            console.log('   • Configurez le fichier .env avec vos paramètres SMTP');
        }

        console.log('   • Placez vos images dans frontend/assets/images/original/');
        console.log('   • Exécutez npm run optimize-images');
        console.log('   • Personnalisez le contenu avec vos informations');
        console.log('   • Testez le formulaire de contact avec une configuration SMTP valide');

        const overallScore = Math.round(((existingFiles/totalFiles) + (existingDirs/totalDirs) + (passedTests/totalTests)) / 3 * 100);

        if (overallScore >= 90) {
            console.log('\n🎉 Excellent ! Le projet est prêt pour la production.');
        } else if (overallScore >= 75) {
            console.log('\n✅ Bon ! Quelques ajustements et le projet sera parfait.');
        } else {
            console.log('\n⚠️  Des améliorations sont nécessaires avant la mise en production.');
        }

        console.log(`\n📊 Score global: ${overallScore}%`);
    }
}

// Exécuter les tests
if (require.main === module) {
    const tester = new ProjectTester();
    tester.runAllTests().catch(console.error);
}

module.exports = ProjectTester;