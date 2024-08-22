const { socialContentForm, socialContentSubmit, viewSocialContent, deleteSocialContent } = require('../../server/controllers/fetcherController');
const User = require('../../server/models/User');
const SocialData = require('../../server/models/SocialData');
const mongoose = require('mongoose');
const { loadData } = require('../../server/etl/load'); // Import loadData function
const redisClient = require('../../server/config/redisClient');

jest.mock('../../server/models/User');
jest.mock('../../server/models/SocialData');
jest.mock('../../server/etl/load'); // Mock loadData function

// Dynamically mock redisClient
jest.mock('../../server/config/redisClient', () => {
    return {
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        quit: jest.fn()
    };
});

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        Types: {
            ObjectId: {
                isValid: jest.fn()
            }
        }
    };
});

describe('socialContentSubmit', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
            send: jest.fn()
        };
    });

    test('should redirect to temp cache ID if cachedSocialData is provided', async () => {
        req.body.cachedSocialData = { tempCacheId: 'temp123' };
        loadData.mockResolvedValue({ _id: 'temp123' }); // 模擬 loadData 函數成功返回

        await socialContentSubmit(req, res);

        expect(res.status).toHaveBeenCalledWith(302);
        expect(res.redirect).toHaveBeenCalledWith('/fetch-content/saved-content/tempId:temp123');
    });

    test('should redirect to savedData ID if savedData is provided', async () => {
        req.body.savedData = { _id: 'saved123' };

        await socialContentSubmit(req, res);

        expect(res.status).toHaveBeenCalledWith(302);
        expect(res.redirect).toHaveBeenCalledWith('/fetch-content/saved-content/saved123');
    });

    test('should return 400 if request data is invalid', async () => {
        await socialContentSubmit(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid request data');
    });

    test('should return 500 if there is an error', async () => {
        req.body.cachedSocialData = { tempCacheId: 'temp123' };
        const errorMessage = 'Failed to load data';
        loadData.mockRejectedValue(new Error(errorMessage)); // 模擬 loadData 函數拋出錯誤

        await socialContentSubmit(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });
});

describe('viewSocialContent', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            user: { id: 'userId', _id: 'userId' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            render: jest.fn(),
            send: jest.fn()
        };
    });

    test('should return 404 if redis resource not found', async() => {
        req.params.id = 'tempId:123';
        redisClient.get.mockResolvedValue(null);

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Cache data does not exist or has expired');
    });

    test('should return 500 if redis error', async() => {
        req.params.id = 'tempId:123';
        redisClient.get.mockRejectedValue(new Error('Redis error'));

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Failed to fetch cache data');
    });

    test('should return 400 if content ID format is invalid', async () => {
        req.params.id = 'invalidObjectId';
        mongoose.Types.ObjectId.isValid.mockReturnValue(false); // 模擬無效的 ObjectId

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid content ID format');
    });

    test('should return 404 if content not found in database', async () => {
        req.params.id = '507f1f77bcf86cd799439011'
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        SocialData.findOne.mockReturnValue({
            lean : jest.fn().mockResolvedValue(null)
        });

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Content not found or no permission');
    });

    test('should return 404 when content is found but user ID does not match', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        SocialData.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null) // 模擬 lean 方法
        });

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Content not found or no permission');
    });
    
    test('should return 200 and render view when successfully retrieving data', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { id: '507f1f77bcf86cd799439011' };
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        const mockSocialData = {
            _id: '507f1f77bcf86cd799439011',
            user: 'userId123',
            platform: 'facebook',
            url: 'http://example.com',
            title: 'Test Title',
            creator: 'Test Creator',
            textContent: 'Test Content',
            aiTags: ['tag1', 'tag2'],
            images: ['image1.jpg'],
            audios: ['audio1.mp3'],
            videos: ['video1.mp4'],
            createdAt: new Date()
        };
        SocialData.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockSocialData)
        });

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.render).toHaveBeenCalledWith('./fetch-content/view-content', {
            socialContentId: '507f1f77bcf86cd799439011',
            socialContent: mockSocialData,
            layout: '../views/layouts/dashboard'
        });
    });

    test('should return 500 status code when an error occurs', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);
        SocialData.findOne.mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
        });

        await viewSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server error');
    });
});

describe('deleteSocialContent', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            user: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            redirect: jest.fn()
        };
        // mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    });

    test('should return 400 when socialContentId is invalid', async () => {
        mongoose.Types.ObjectId.isValid.mockReturnValue(false);

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid content ID format');
    });

    test('should return 401 when user is not authorized', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        mongoose.Types.ObjectId.isValid.mockReturnValue(true);

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    test('should return 404 when content is not found', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439011' };
        SocialData.findById.mockResolvedValue(null);

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Content not found');
    });

    test('should return 403 when user has no permission to delete content', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439012' }; // 用戶 ID 不同
        SocialData.findById.mockResolvedValue({
            user: '507f1f77bcf86cd799439011' // 內容的用戶 ID
        });

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('No permission to delete this content');
    });

    test('should return 500 when deletion fails', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439012' };
        
        SocialData.findById.mockResolvedValue({
            user: '507f1f77bcf86cd799439012'
        });
        SocialData.findByIdAndDelete.mockResolvedValue(null);

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Failed to delete content');
    });

    test('should redirect to dashboard after successful deletion', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439011' };
        
        SocialData.findById.mockResolvedValue({
            user: '507f1f77bcf86cd799439011'
        });
        SocialData.findByIdAndDelete.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(302);
        expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    test('should return 500 when database connection error occurs', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439011' };

        SocialData.findById.mockRejectedValue(new mongoose.Error('Database connection error'));

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Database connection error');
    });

    test('should return 500 when other errors occur', async () => {
        req.params.id = '507f1f77bcf86cd799439011';
        req.user = { _id: '507f1f77bcf86cd799439011' };
        SocialData.findById.mockRejectedValue(new Error('Some other error'));

        await deleteSocialContent(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server Error');
    });
});