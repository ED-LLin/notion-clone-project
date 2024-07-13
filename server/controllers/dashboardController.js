const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');
const { search } = require('../routes');
const SocialData = require('../models/SocialData');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: 顯示使用者的儀表板
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: 成功顯示儀表板
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: 使用者未登入
 *       500:
 *         description: 伺服器錯誤
 */
exports.dashboard = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const notes = await Note.aggregate([
            {$match: {user: new mongoose.Types.ObjectId(req.user.id)}},
            {$sort: {createdAt: -1}}
        ]);
        const socialData = await SocialData.aggregate([
            { $match: {user: new mongoose.Types.ObjectId(req.user._id)}},
            { $sort: {createdAt: -1}}
        ]);

        res.status(200).render('dashboard/index', {
            layout: '../views/layouts/dashboard',
            user,
            notes,
            socialData
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/add:
 *   get:
 *     summary: 顯示新增筆記頁面
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: 成功顯示新增筆記頁面
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: 使用者未登入
 *       500:
 *         description: 伺服器錯誤
 */
exports.dashboardAddNote = async (req, res) => {
    try {
        res.status(200).render('dashboard/add', {
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/notes:
 *   post:
 *     summary: 提交新筆記
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       302:
 *         description: 成功重定向到儀表板
 *       401:
 *         description: 未登入
 *       500:
 *         description: 伺服器錯誤
 */
exports.dashboardSubmitNote = async(req, res) => {
    try{
        req.body.user = req.user.id;
        await Note.create(req.body);
        res.status(302).redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   get:
 *     summary: 查看特定筆記
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功顯示筆記
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: 使用者未登入
 *       404:
 *         description: 筆記未找到或無權限
 *       500:
 *         description: 伺服器錯誤
 */
exports.dashboardViewNote = async(req, res) => {
    try {
        const noteId = req.params.id;

        // 檢查 noteId 是否為有效的 ObjectId
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(404).send("Note not found or no permission");
        }

        const note = await Note.findById(noteId)
                                .where({ user: req.user.id })
                                .lean();

        if (note) {
            res.status(200).render('dashboard/view-notes', {
                noteID: noteId,
                note,
                layout: '../views/layouts/dashboard'
            });
        } else {
            res.status(404).send("Note not found or no permission");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   put:
 *     summary: 更新特定筆記
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       302:
 *         description: 成功重定向到儀表板
 *       401:
 *         description: 使用者未登入
 *       500:
 *         description: 無法更新筆記
 */
exports.dashboardUpdateNote = async(req, res) => {
    try {
        const { title, body } = req.body;
        const noteId = req.params.id;

        // 更新筆記
        await Note.findByIdAndUpdate(noteId, {
            title: title,
            body: body
        }, { new: true }); // new: true 會返回更新後的文檔

        res.redirect('/dashboard'); // 重定向到筆記的查看頁面
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to update note.");
    }
};

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   delete:
 *     summary: 刪除特定筆記
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: 成功重定向到儀板
 *       401:
 *         description: 使用者未登入
 *       500:
 *         description: 刪除筆記時出錯
 */
exports.dashboardDeleteNote = async(req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);

        await Note.deleteOne({ _id: noteId , user: req.user.id});
        res.status(302).redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting the note.");
    }
};

/**
 * @swagger
 * /dashboard/search:
 *   get:
 *     summary: 搜尋筆記
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功顯示搜尋結果
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: 使用者未登入
 *       500:
 *         description: 搜尋過程中出錯
 */
exports.dashboardSearch = async (req, res) => {
    try {
        let searchTerm = req.query.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^\w\u4e00-\u9fff]/g, "");
        const notes = await Note.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChars, 'i') }},
            ]
        }).where({ user: req.user.id})
        .lean();

        res.status(200).render('dashboard/search', {
            notes,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error during search.");
    }
};