const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');

// show dashboard
exports.dashboard = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const notes = await Note.aggregate([
            {$match: {user: new mongoose.Types.ObjectId(req.user.id)}},
            {$sort: {createdAt: -1}}
        ]);

        res.render('dashboard/index', {
            layout: '../views/layouts/dashboard',
            user,
            notes
        });
    } catch (error) {
        console.log(error);
    }
}

// Add Notes
exports.dashboardAddNote = async (req, res) => {
    res.render('dashboard/add',{
        layout: '../views/layouts/dashboard'
    })
}

// Submit Note
exports.dashboardSubmitNote = async(req, res) => {
    try{
        req.body.user = req.user.id;
        await Note.create(req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}
