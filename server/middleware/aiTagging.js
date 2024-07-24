const { singleTurnConversationJsonFormat } = require("../services/openAIServices");

const generateAiTags = async (contentToBeTagged) => {
    const systemMessage = "You are a helpful knowledge assistant, who reply anything in traditional Chinese 繁體中文 and always output JSON. Please only return a JSON object with a single key 'tags' which is an array of three category tags.";
    const prompt = `為以下內容提供三個分類標籤 ${contentToBeTagged}`;
    try{
        const aiResponse = await singleTurnConversationJsonFormat(systemMessage, prompt);
        return JSON.parse(aiResponse.choices[0].message.content).tags;
    } catch (error) {
        console.log('Error calling openAiService', error);
        return [];
    }
}

exports.addAiTagForNote = async (req, res, next) => {
    const noteTitleAndBody = req.body.title + req.body.body;
    try {
        const aiTags  = await generateAiTags(noteTitleAndBody);
        req.body.aiTags = aiTags;
        console.log(`AI tagging for note success`, aiTags);
        next();
    } catch (error) {
        console.error('Ai Tagging error, returned empty value', error);
        next(error);
    }
}

exports.generateAiTags = generateAiTags;