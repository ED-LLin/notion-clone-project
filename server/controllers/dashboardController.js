const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');
const { search } = require('../routes');
const SocialData = require('../models/SocialData');
const logger = require('../config/logger');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Display user dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successfully displayed the dashboard, including user information, notes, and social data
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: User not logged in
 *       500:
 *         description: Server error
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

        logger.info(`User ${req.user.id} accessed the dashboard successfully.`);
        res.status(200).render('dashboard/index', {
            layout: '../views/layouts/dashboard',
            user,
            notes,
            socialData
        });
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error: ${error}`);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/add:
 *   get:
 *     summary: Display add note page
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successfully displayed the add note page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: User not logged in
 *       500:
 *         description: Server error
 */
exports.dashboardAddNote = async (req, res) => {
    try {
        res.status(200).render('dashboard/add', {
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/notes:
 *   post:
 *     summary: Submit a new note
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
 *         description: Successfully redirected to the dashboard
 *       401:
 *         description: Not logged in
 *       500:
 *         description: Server error
 */
exports.dashboardSubmitNote = async(req, res) => {
    try{
        req.body.user = req.user.id;
        await Note.create(req.body);
        logger.info(`User ${req.user.id} created a new note with title: ${req.body.title}`);
        res.status(302).redirect('/dashboard');
    } catch (error) {
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
}

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   get:
 *     summary: View a specific note
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully displayed the note
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: User not logged in
 *       404:
 *         description: Note not found or no permission
 *       500:
 *         description: Server error
 */
exports.dashboardViewNote = async(req, res) => {
    try {
        const noteId = req.params.id;

        // 檢查 noteId 是否為有效的 ObjectId
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            logger.warn(`User ${req.user.id} provided an invalid note ID format: ${noteId}`);
            return res.status(404).send("Note not found or no permission");
        }

        const note = await Note.findById(noteId)
                                .where({ user: req.user.id })
                                .lean();

        if (note) {
            logger.info(`User ${req.user.id} accessed note: ${noteId}`);
            res.status(200).render('dashboard/view-notes', {
                noteID: noteId,
                note,
                layout: '../views/layouts/dashboard'
            });
        } else {
            logger.warn(`User ${req.user.id} attempted to access a note that was not found or had no permission: ${noteId}`);
            res.status(404).send("Note not found or no permission");
        }
    } catch (error) {
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   put:
 *     summary: Update a specific note
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
 *         description: Successfully redirected to the dashboard
 *       401:
 *         description: User not logged in
 *       500:
 *         description: Unable to update the note
 */
exports.dashboardUpdateNote = async(req, res) => {
    try {
        const { title, body, aiTags } = req.body; // 加入 aiTags
        const noteId = req.params.id;

        // 更新筆記
        await Note.findByIdAndUpdate(noteId, {
            title: title,
            body: body,
            aiTags: aiTags // 更新 aiTags 欄位
        }, { new: true }); // new: true 會返回更新後的文檔

        logger.info(`User ${req.user.id} updated note: ${noteId}`);
        res.status(302).redirect('/dashboard');
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error: ${error}`);
        res.status(500).send("Unable to update note.");
    }
};

/**
 * @swagger
 * /dashboard/notes/{id}:
 *   delete:
 *     summary: Delete a specific note
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Successfully redirected to the dashboard
 *       401:
 *         description: User not logged in
 *       500:
 *         description: Error deleting the note
 */
exports.dashboardDeleteNote = async(req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);

        await Note.deleteOne({ _id: noteId , user: req.user.id});
        logger.info(`User ${req.user.id} deleted note: ${noteId}`);
        res.status(302).redirect('/dashboard');
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error: ${error}`);
        res.status(500).send("Error deleting the note.");
    }
};

/**
 * @swagger
 * /dashboard/search:
 *   get:
 *     summary: Search notes
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully displayed search results
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: User not logged in
 *       500:
 *         description: Error during the search process
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

        logger.info(`User ${req.user.id} performed a search with term: ${searchTerm}`);
        res.status(200).render('dashboard/search', {
            notes,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error: ${error}`);
        res.status(500).send("Error during search.");
    }
};

/**
 * @swagger
 * /dashboard/view-tag/{tag}:
 *   get:
 *     summary: View notes and social data by tag
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: The tag to filter notes and social data
 *     responses:
 *       200:
 *         description: Successfully retrieved notes and social data for the specified tag
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error while retrieving data
 */
exports.viewTag = async (req, res) => {
    try {
        const tag = req.params.tag;
        const userId = req.user.id;
        const notes = await Note.aggregate([
            { $match: {user: new mongoose.Types.ObjectId(userId) } },
            { $match: { aiTags: { $regex: new RegExp(tag, 'i') } } },
            {$sort: {createdAt: -1}}
        ]);
        const socialData = await SocialData.aggregate([
            { $match: {user: new mongoose.Types.ObjectId(userId), aiTags: tag }},
            { $match: { aiTags: { $regex: new RegExp(tag, 'i') } } },
            { $sort: {createdAt: -1}}
        ]);
        
        logger.info(`User ${userId} viewed tag: ${tag}`);
        res.status(200).render('dashboard/view-tag', { 
            layouts: '../views/layouts/dashboard',
            tag,
            socialData, 
            notes 
        });
    } catch (error) {
        logger.error(`User ${userId} encountered an error: ${error}`);
        res.status(500).send({ message: 'Server Error' });
    }
};