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

// View Note
exports.dashboardViewNote = async(req, res) => {
    const note = await Note.findById(req.params.id)
                            .where({ user: req.user.id })
                            .lean();

    if (note) {
        res.render('dashboard/view-notes', {
            noteID: req.params.id,
            note,
            layout: '../views/layouts/dashboard'
        });
    } else {
        res.send("Note not found or no permission");
    }
};

// Update Note
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
