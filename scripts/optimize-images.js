const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
    inputDir: './frontend/assets/images/original',
    outputDir: './frontend/assets/images',
    formats: ['webp', 'jpeg'],
    sizes: [
        { suffix: '', width: 1920, quality: 85 },     // Original
        { suffix: '-lg', width: 1200, quality: 80 },  // Large
        { suffix: '-md', width: 800, quality: 75 },   // Medium
        { suffix: '-sm', width: 400, quality: 70 },   // Small
        { suffix: '-thumb', width: 200, quality: 65 } // Thumbnail
    ]
};

/**
 * Optimise une image en générant plusieurs formats et tailles
 * @param {string} inputPath - Chemin vers l'image source
 * @param {string} outputDir - Répertoire de destination
 * @param {string} baseName - Nom de base du fichier (sans extension)
 */
async function optimizeImage(inputPath, outputDir, baseName) {
    console.log(`📷 Optimisation de ${baseName}...`);

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        console.log(`   ℹ️  Dimensions originales: ${metadata.width}x${metadata.height}`);
        console.log(`   ℹ️  Format original: ${metadata.format}`);

        for (const size of config.sizes) {
            for (const format of config.formats) {
                const outputName = `${baseName}${size.suffix}.${format}`;
                const outputPath = path.join(outputDir, outputName);

                await image
                    .resize(size.width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .toFormat(format, {
                        quality: size.quality,
                        progressive: true,
                        mozjpeg: format === 'jpeg'
                    })
                    .toFile(outputPath);

                const stats = await fs.stat(outputPath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`   ✅ ${outputName} - ${size.width}px - ${sizeKB}KB`);
            }
        }

        console.log(`   🎉 ${baseName} optimisé avec succès!\n`);

    } catch (error) {
        console.error(`   ❌ Erreur lors de l'optimisation de ${baseName}:`, error.message);
    }
}

/**
 * Génère des favicons à partir d'une image source
 * @param {string} inputPath - Chemin vers l'image source
 * @param {string} outputDir - Répertoire de destination
 */
async function generateFavicons(inputPath, outputDir) {
    console.log('🔗 Génération des favicons...');

    const faviconSizes = [
        { name: 'favicon.ico', size: 32 },
        { name: 'favicon-16x16.png', size: 16 },
        { name: 'favicon-32x32.png', size: 32 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'android-chrome-192x192.png', size: 192 },
        { name: 'android-chrome-512x512.png', size: 512 }
    ];

    try {
        for (const favicon of faviconSizes) {
            const outputPath = path.join(outputDir, favicon.name);
            const format = favicon.name.endsWith('.ico') ? 'png' : path.extname(favicon.name).slice(1);

            await sharp(inputPath)
                .resize(favicon.size, favicon.size, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat(format, { quality: 90 })
                .toFile(outputPath);

            console.log(`   ✅ ${favicon.name} - ${favicon.size}x${favicon.size}px`);
        }

        console.log('   🎉 Favicons générés avec succès!\n');

    } catch (error) {
        console.error('   ❌ Erreur lors de la génération des favicons:', error.message);
    }
}

/**
 * Génère une image optimisée pour les réseaux sociaux (Open Graph)
 * @param {string} inputPath - Chemin vers l'image source
 * @param {string} outputDir - Répertoire de destination
 */
async function generateSocialImage(inputPath, outputDir) {
    console.log('📱 Génération de l\'image pour les réseaux sociaux...');

    try {
        const outputPath = path.join(outputDir, 'og-image.jpg');

        // Image Open Graph: 1200x630px
        await sharp(inputPath)
            .resize(1200, 630, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 85, progressive: true })
            .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   ✅ og-image.jpg - 1200x630px - ${sizeKB}KB`);
        console.log('   🎉 Image sociale générée avec succès!\n');

    } catch (error) {
        console.error('   ❌ Erreur lors de la génération de l\'image sociale:', error.message);
    }
}

/**
 * Crée un fichier manifest.json pour les favicons
 * @param {string} outputDir - Répertoire de destination
 */
async function generateManifest(outputDir) {
    console.log('📄 Génération du manifest.json...');

    const manifest = {
        name: "click.storm51 - Eloi Photographe",
        short_name: "click.storm51",
        description: "Photographe professionnel spécialisé en mariage, portrait et événements dans la Marne (51)",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#ff6b35",
        icons: [
            {
                src: "/assets/images/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/assets/images/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };

    try {
        const manifestPath = path.join(outputDir, 'manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('   ✅ manifest.json généré avec succès!\n');

    } catch (error) {
        console.error('   ❌ Erreur lors de la génération du manifest:', error.message);
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🚀 Démarrage de l\'optimisation des images...\n');

    try {
        // Créer les répertoires s'ils n'existent pas
        await fs.mkdir(config.inputDir, { recursive: true });
        await fs.mkdir(config.outputDir, { recursive: true });

        // Vérifier si le répertoire source existe et contient des images
        let files;
        try {
            files = await fs.readdir(config.inputDir);
        } catch (error) {
            console.log('📁 Création du répertoire source...');
            await fs.mkdir(config.inputDir, { recursive: true });

            console.log(`\n⚠️  Le répertoire ${config.inputDir} est vide.`);
            console.log('📝 Pour optimiser vos images, placez vos fichiers dans ce répertoire, puis relancez le script.');
            console.log('\n📋 Formats supportés: JPG, JPEG, PNG, WEBP, TIFF');
            console.log('📐 Recommandations:');
            console.log('   • Images portfolio: minimum 1920px de largeur');
            console.log('   • Photos équipe: minimum 800px de largeur');
            console.log('   • Logo/favicon: format carré, minimum 512px');

            return;
        }

        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext);
        });

        if (imageFiles.length === 0) {
            console.log('⚠️  Aucune image trouvée dans le répertoire source.');
            console.log(`📁 Placez vos images dans: ${config.inputDir}`);
            return;
        }

        console.log(`📊 ${imageFiles.length} image(s) trouvée(s)\n`);

        // Optimiser chaque image
        for (const file of imageFiles) {
            const inputPath = path.join(config.inputDir, file);
            const baseName = path.parse(file).name;

            await optimizeImage(inputPath, config.outputDir, baseName);
        }

        // Générer les favicons si une image logo est trouvée
        const logoFile = imageFiles.find(file =>
            file.toLowerCase().includes('logo') ||
            file.toLowerCase().includes('favicon') ||
            file.toLowerCase().includes('icon')
        );

        if (logoFile) {
            const logoPath = path.join(config.inputDir, logoFile);
            await generateFavicons(logoPath, config.outputDir);
            await generateManifest(config.outputDir);
        }

        // Générer l'image sociale si une image principale est trouvée
        const heroFile = imageFiles.find(file =>
            file.toLowerCase().includes('hero') ||
            file.toLowerCase().includes('main') ||
            file.toLowerCase().includes('og')
        ) || imageFiles[0]; // Prendre la première image par défaut

        if (heroFile) {
            const heroPath = path.join(config.inputDir, heroFile);
            await generateSocialImage(heroPath, config.outputDir);
        }

        console.log('🎉 Optimisation terminée avec succès!');
        console.log('\n📈 Résumé:');
        console.log(`   • ${imageFiles.length} image(s) source(s) traitée(s)`);
        console.log(`   • ${config.sizes.length * config.formats.length} variant(s) par image`);
        console.log(`   • ${logoFile ? 'Favicons générés' : 'Aucun logo détecté pour les favicons'}`);
        console.log(`   • ${heroFile ? 'Image sociale générée' : 'Aucune image principale détectée'}`);

        console.log('\n💡 Conseils d\'utilisation:');
        console.log('   • Utilisez les images WebP pour une meilleure performance');
        console.log('   • Adaptez la taille selon l\'usage (thumbnail, medium, large)');
        console.log('   • Mettez à jour les balises <img> avec les attributs width/height');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = {
    optimizeImage,
    generateFavicons,
    generateSocialImage,
    generateManifest
};