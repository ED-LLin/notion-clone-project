const SocialData = require('../models/SocialData');

exports.addSocialContentPage = async(req, res) => {
    res.render('./fetch-content/getSocial', {
        layout: '../views/layouts/main'
    });
};

exports.showSubmittedContent = async(req, res) => {
    const submittedSocialData = req.savedData;
    res.render('./fetch-content/fetchSuccess', {
        layout: '../views/layouts/main',
        submittedSocialData
    });
};

exports.viewContent = async(req, res) => {
    try {
        const socialData = await SocialData.find();
        res.status(200).render('fetch-content/showSocialContent', {
            layout: '../views/layouts/main',
            socialData // 確保變量名稱一致
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

