const logger = require('../config/logger');
/**
 * @swagger
 * /:
 *   get:
 *     summary: Display homepage
 *     tags: [Main]
 *     responses:
 *       200:
 *         description: Successfully displayed homepage
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
exports.homepage = async (req, res) => {
    try {
        const locals = {
            title: "Laiter",
            description: "Note with social content"
        };

        res.status(200).render('index', locals);
        logger.info("Homepage rendered successfully");
    } catch (error) {
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
}

exports.privacyPolicyPage = async (req, res) => {
    logger.info("Privacy policy page rendered successfully");
    res.status(200).render('privacy-policy', {
        layouts: '../views/layouts/main'
    });
}