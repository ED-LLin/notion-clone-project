const Note = require('../models/Note');

// show dashboard
exports.dashboard = async(req, res) => {

    try{
        const notes = await Note.find({});

        res.render('dashboard/index', {
            layout: '../views/layouts/dashboard',
            notes
            })
    } catch (error) {

    }   


}