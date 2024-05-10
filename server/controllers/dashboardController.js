const mongoose = require('mongoose');
const Note = require('../models/Note');

// show dashboard
exports.dashboard = async(req, res) => {
    try {
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        const notes = await Note.aggregate([
            {$match: {user: new mongoose.Types.ObjectId(userId)}},
            {$sort: {createdAt: -1}}
        ]);

        res.render('dashboard/index', {
            layout: '../views/layouts/dashboard',
            notes
        });
    } catch (error) {
        console.log(error);
        res.send('Database error');
    }
}
