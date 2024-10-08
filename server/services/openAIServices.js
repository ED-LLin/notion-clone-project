require('dotenv').config({ path: '../../.env' }); // Specify the path to the .env file
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const logger = require('../config/logger');

exports.singleTurnConversationJsonFormat = async function(systemMessage, prompt) {
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object"}
    });

    const finishReason = completion.choices[0].finish_reason;
    switch (finishReason) {
        case 'stop':
            logger.info('API returned a complete message.');
            break;
        case 'length':
            logger.warn('Incomplete model output due to max_tokens parameter or token limit.');
            break;
        case 'function_call':
            logger.info('The model decided to call a function.');
            break;
        case 'content_filter':
            logger.warn('Omitted content due to a flag from our content filters.');
            break;
        case 'null':
            logger.warn('API response still in progress or incomplete.');
            break;
        default:
            logger.error('Unknown finish reason.');
    }

    // logger.info(`response by AI: ${JSON.stringify(completion, null, 2)}`);
    return completion;
}