/**
 * @swagger
 * /:
 *   get:
 *     summary: 顯示首頁
 *     tags: [Main]
 *     responses:
 *       200:
 *         description: 成功顯示首頁
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: 伺服器錯誤
 */
exports.homepage = async (req, res) => {
    try {
        const locals = {
            title: "Notion Clone",
            description: "Created by NodeJS"
        };

        res.status(200).render('index', locals);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}