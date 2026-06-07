const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const TARGET_DIR = path.join(__dirname, './'); 
const BACKUP_DIR = path.join(__dirname, './html-backup-' + Date.now());

async function cleanHtmlExtensions() {
    try {
        const files = await fs.readdir(TARGET_DIR);
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        if (htmlFiles.length === 0) {
            console.log("No HTML files found in the target directory.");
            return;
        }

        // Create a safety backup directory
        await fs.ensureDir(BACKUP_DIR);
        console.log(`🛡️  Safety backup created at: ${BACKUP_DIR}`);

        for (const file of htmlFiles) {
            const filePath = path.join(TARGET_DIR, file);
            
            // Backup original file
            await fs.copy(filePath, path.join(BACKUP_DIR, file));

            // Read and parse file
            const htmlContent = await fs.readFile(filePath, 'utf8');
            const $ = cheerio.load(htmlContent, {
                decodeEntities: false // Prevents breaking special characters
            });

            let changesMade = 0;

            // Target ONLY anchor links (<a>) that have an href attribute
            $('a[href]').each((index, element) => {
                const href = $(element).attr('href');

                // CRITICAL RULES FOR LINKS:
                // 1. Must end with .html
                // 2. Must NOT be an external absolute link (http/https)
                // 3. Must NOT contain a hash anchor (#) like 'about-me.html#disclaimer'
                if (href && 
                    href.endsWith('.html') && 
                    !href.startsWith('http://') && 
                    !href.startsWith('https://') && 
                    !href.includes('#')
                ) {
                    // Safe to strip the .html extension
                    const cleanHref = href.slice(0, -5); 
                    $(element).attr('href', cleanHref);
                    changesMade++;
                }
            });

            if (changesMade > 0) {
                // Save the safely modified DOM back to the file
                await fs.writeFile(filePath, $.html(), 'utf8');
                console.log(`✅ Fixed ${changesMade} links in: ${file}`);
            } else {
                console.log(`ℹ️  No standard anchor extensions to strip in: ${file}`);
            }
        }

        console.log("\n🚀 All done! Your files have been safely updated.");
        
    } catch (error) {
        console.error("❌ An error occurred during processing:", error);
    }
}

cleanHtmlExtensions();