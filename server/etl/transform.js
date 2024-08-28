const { singleTurnConversationJsonFormat } = require("../services/openAIServices");
const logger = require('../config/logger');
require('dotenv').config({ path: '../../.env' });

exports.transformData = async (socialUrl, platform, extractedData, userId) => {
    let transformedData = {};

    // 取出社群資料
    if (platform === 'instagram') {
        transformedData = {
            platform: 'instagram',
            url: socialUrl,
            title:  '',
            creator: extractedData.data.owner ? extractedData.data.owner.username : '',
            textContent: extractedData.data.caption ? extractedData.data.caption.text : '',
            images: extractedData.data.image_versions && extractedData.data.image_versions.items ? [
                extractedData.data.image_versions.items.reduce((max, item) => {
                    return item.height > max.height ? item : max;
                }).url
            ] : [],
            audios: extractedData.data.clips_metadata && extractedData.data.clips_metadata.original_sound_info ? [extractedData.data.clips_metadata.original_sound_info.progressive_download_url] : [],
            videos: extractedData.data.video_versions ? [
                extractedData.data.video_versions.reduce((max, video) => {
                    return video.height > max.height ? video : max;
                }).url
            ] : []
        };
    } else if (platform === 'facebook') {
        transformedData = {
            platform: 'facebook',
            url: socialUrl,
            title: extractedData.data.responseMessage, 
            creator: extractedData.data.postDetails.owning_profile.id, 
            textContent: extractedData.data.postDetails.text, 
            images: extractedData.data.postDetails.imageUrlList 
        };
    } else if (platform === 'youtube') {
        transformedData = {
            platform: 'youtube',
            url: socialUrl,
            title: extractedData.title,
            creator: extractedData.channelTitle,
            textContent: '',
            images: extractedData.thumbnail ? [
                extractedData.thumbnail.reduce((max, item) => {
                    return item.width > max.width ? item : max;
                }).url
            ] : [],
            videos: extractedData.adaptiveFormats ? [
                extractedData.adaptiveFormats
                    .filter(format => format.mimeType.includes('video'))
                    .reduce((max, format) => {
                        return format.width > max.width ? format : max;
                    }).url
            ] : [],
            audios: extractedData.adaptiveFormats ? [
                extractedData.adaptiveFormats
                    .filter(format => format.mimeType.includes('audio'))
                    .reduce((max, format) => {
                        return format.bitrate > max.bitrate ? format : max;
                    }).url
            ] : []
        };
    }
    // 在資料中加入 user ID
    transformedData.user = userId;
    logger.info(`transform set user to: ${transformedData.user}`);

    // 增加 AI 標籤
    const titleAndTextContent = transformedData.title + transformedData.textContent;
    const systemMessage = "You are a helpful knowledge assistant, who reply anything in traditional Chinese and always output JSON. Please only return a JSON object with a single key 'tags' which is an array of three category tags."
    const prompt = `為以下內容提供三個分類標籤 ${titleAndTextContent}`

    try {
        const aiResponse = await singleTurnConversationJsonFormat(systemMessage, prompt);
        const aiTags = JSON.parse(aiResponse.choices[0].message.content).tags;
        logger.info(`AI tagging success!`, aiTags);
        transformedData.aiTags = aiTags;
    } catch (error) {
        logger.error('Error during social content AI tagging', error);
        throw error;
    }

    logger.info(`transformed.js is transformed`);
    return transformedData;
};