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
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

exports.privacyPolicyPage = async (req, res) => {
    res.render('privacy-policy', {
        layouts: '../views/layouts/main'
    })
}