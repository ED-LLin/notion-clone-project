const { singleTurnConversationJsonFormat } = require("../services/openAIServices");
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
    console.log('transform set user to:', transformedData.user);

    // 增加 AI 標籤
    const titleAndTextContent = transformedData.title + transformedData.textContent;
    const messages = [
        { role: "system", content: "You are a helpful knowledge assistant, who reply anything in traditional Chinese and always output JSON. Please only return a JSON object with a single key 'tags' which is an array of three category tags." },
        { role: "user", content: `為以下內容提供三個分類標籤 ${titleAndTextContent}` }
    ]

    try {
        const aiResponse = await singleTurnConversationJsonFormat(messages); // 回傳 JSON 字串，而非 JS 物件
        const aiTags = JSON.parse(aiResponse.choices[0].message.content).tags; // 透過 JSON.parse 解析
        console.log(`AI tagging success!`, aiTags);
        transformedData.aiTags = aiTags;
    } catch (error) {
        console.error('Error during AI Tagging', error);
        throw error;
    }

    console.log(`transformed:`, JSON.stringify(transformedData, null, 2));
    return transformedData;
};

// 測試程式碼
// (async () => {
//     const socialUrl = 'https://www.instagram.com/p/C9ANZUiP5O5/?utm_source=ig_web_copy_link';
//     const platform = 'instagram';  
//     const extractedData = require('../../fetchedSampleData/ig-album-data.json');
    
//     const result = await exports.transformData(socialUrl, platform, extractedData);
//     console.log(result);
// })();
