const { default: mongoose } = require('mongoose');
const SocialData = require('../models/SocialData');

exports.socialContentForm = async(req, res) => {
    try {
        const socialData = await SocialData.find().sort({ createdAt: -1 });
        res.status(200).render('fetch-content/social-content', {
            layout: '../views/layouts/main',
            socialData // 確保變量名稱一致
        });
        console.log(`Controller get socialData`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.socialContentSubmit = async(req, res) => {
    const submittedSocialData = req.body.savedData;
    res.status(302).redirect(`/fetch-content/saved-content/${submittedSocialData._id.toString()}`)
};

exports.viewSocialContent = async(req, res) => {
    try {
        const socialContentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
            return res.status(404).send("Content not found or failed to fetch");
        }

        const socialContent = await SocialData.findById(socialContentId).lean();
    
        if (socialContent) {
            res.status(200).render('./fetch-content/view-content', {
                socialContentId: socialContentId,
                socialContent,
                layout: '../views/layouts/main'
            });
        } else {
            res.status(404).send("Content not found or no permission");
        }
    
    } catch (error) {
        console.log("view socialContent error: ", error);
        res.status(500).send("Server Error");
    }
}

exports.viewContent = async(req, res) => {
    try {
        const socialData = await SocialData.find();
        res.status(200).render('fetch-content/showSocialContent', {
            layout: '../views/layouts/main',
            socialData // 確保變量名稱一致
        });
        console.log(`Controller get socialData: ${socialData}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.autoTagging = async (req, res) => {

};