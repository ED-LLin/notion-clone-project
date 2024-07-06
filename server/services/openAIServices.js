require('dotenv').config({ path: '../../.env' }); // Specify the path to the .env file
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.singleTurnConversationJsonFormat = async function(messages) {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object"}
    });

    const finishReason = completion.choices[0].finish_reason;
    switch (finishReason) {
        case 'stop':
            console.log('API returned a complete message.');
            break;
        case 'length':
            console.log('Incomplete model output due to max_tokens parameter or token limit.');
            break;
        case 'function_call':
            console.log('The model decided to call a function.');
            break;
        case 'content_filter':
            console.log('Omitted content due to a flag from our content filters.');
            break;
        case 'null':
            console.log('API response still in progress or incomplete.');
            break;
        default:
            console.log('Unknown finish reason.');
    }

    console.log(`response by AI: ${JSON.stringify(completion, null, 2)}`);
    return completion;
}
