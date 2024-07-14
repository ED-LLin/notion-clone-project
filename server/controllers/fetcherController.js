const { default: mongoose } = require('mongoose');
const SocialData = require('../models/SocialData');
const User = require('../models/User');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');

exports.socialContentForm = async(req, res) => {
    try {
        const user = await User.findById(req.user);
        // console.log('user through fetcherControllser is:', req.user._id);
        const socialData = await SocialData.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user._id) } }, 
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).render('fetch-content/social-content', {
            layout: '../views/layouts/dashboard',
            user,
            socialData
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.socialContentSubmit = async(req, res) => {
    
    if (req.body.cachedSocialData && req.body.cachedSocialData.tempCacheId) {
        const tempCacheId = req.body.cachedSocialData.tempCacheId;
        res.status(302).redirect(`/fetch-content/saved-content/tempId:${tempCacheId}`);
        try {
            await loadData(req.body.cachedSocialData);
        } catch (error) {
            console.log('failed to load cache content to MongoDB', error);
        }
    } else if (req.body.savedData && req.body.savedData._id) {
        res.status(302).redirect(`/fetch-content/saved-content/${req.body.savedData._id.toString()}`);
    } else {
        res.status(400).send('Invalid request data');
    }
};

exports.viewSocialContent = async(req, res) => {
    try {
        let socialContent;
        const socialContentId = req.params.id;

        if (socialContentId.includes("tempId:")) {
            const tempId = socialContentId.split("tempId:")[1];
            // Get data from Cache
            try {
                socialContent = await redisClient.get(tempId);
                if (!socialContent) {
                    return res.status(404).send('Cache data does not exist or has expired');
                }
                socialContent = JSON.parse(socialContent);
            } catch (error) {
                console.log('Cache data expired or lost');
                return res.status(404).send('Failed to retrieve cache data');
            }
        } else {
            if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
                return res.status(404).send('Content not found in database');
            }

            socialContent = await SocialData.findOne({ _id: socialContentId, user: req.user.id }).lean();
            if (!socialContent) {
                return res.status(404).send('Content not found or no permission');
            }
        }

        res.status(200).render('./fetch-content/view-content', {
            socialContentId,
            socialContent,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.error("Error viewing social content:", error);
        res.status(500).send("Server error");
    }
}

exports.deleteSocialContent = async (req, res) => {
    try {
        const socialContentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
            return res.status(404).send("Content not found or failed to delete");
        }

        const socialContent = await SocialData.findById(socialContentId);

        if (!socialContent) {
            return res.status(404).send("Content not found");
        }

        if (socialContent.user.toString() !== req.user._id.toString()) {
            return res.status(403).send("No permission to delete this content");
        }

        await SocialData.findByIdAndDelete(socialContentId);

        res.status(302).redirect('/dashboard');
    } catch (error) {
        console.log("delete socialContent error: ", error);
        res.status(500).send("Server Error");
    }
}
