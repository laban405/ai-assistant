import {Configuration, OpenAIApi} from "openai";
import DB from "../../../lib/db";
import Helper from "../../../lib/Helper";

import {checkBadWords, configItems, GetUsedContent, myDetailApi, PackageInfo} from "./common";
import moment from "moment";


const db = new DB();
export default async function (req, res) {

    const NEXT_PUBLIC_OPENAI_API_KEY = await configItems('NEXT_PUBLIC_OPENAI_API_KEY')
    const configuration = new Configuration({
        apiKey: NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const session = await myDetailApi(req, res);

    if (!configuration.apiKey) {
        res.status(200).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }
    if (!session) {
        res.status(200).json({
            error: {
                message: "Unauthorized",
            }
        });
        return;
    }
    // check badWords in the content and return error if found
    const badWords = await checkBadWords(req.body.message || req.body.description || req.body.title);
    if (badWords && badWords.length > 0) {
        res.status(200).json({
            error: {
                message: "Your content contains bad words. Please remove them and try again.",
            }
        });
        return;
    }

    const {
        type
    } = req.body;

    const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    // get package details of the company
    const usedContents = await GetUsedContent(session?.user?.company_id) || {};
    const packageDetails = await PackageInfo(session?.user?.company_id) || {};
    if (packageDetails?.words_per_month !== -1 && packageDetails?.words_per_month !== 0) {
        if (usedContents?.used_words >= packageDetails?.words_per_month) {
            res.status(200).json({
                error: {
                    message: `You have reached your monthly limit of words. Please upgrade your plan to generate more content.  ${'<a href="/admin/upgrades">Upgrade</a>'}`,
                }
            });
            return;
        }
    } else if (packageDetails?.words_per_month === 0) {
        res.status(200).json({
            error: {
                message: `Please upgrade your plan to generate more content ${'<a href="/admin/upgrades">Upgrade</a>'}`,
            }
        });
        return;
    }
    if (type === 'speech' && packageDetails?.ai_transcriptions === 0) {
        res.status(200).json({
            error: {
                message: `Please upgrade your plan to generate more speech. ${'<a href="/admin/upgrades">Upgrade</a>'}`,
            }
        });
        return;
    }

    const saveIntoUsedContents = async (words, field = 'used_words') => {
        let totalWords = 0;
        if (usedContents?.used_content_id) {
            totalWords = usedContents[field] + words;
        } else {
            totalWords = words;
        }

        if (packageDetails?.words_per_month !== -1 && packageDetails?.words_per_month !== 0) {
            if (totalWords >= packageDetails?.words_per_month) {
                res.status(200).json({
                    error: {
                        message: `You have reached your monthly limit of words. Please upgrade your plan to generate more content.  ${'<a href="/admin/upgrades">Upgrade</a>'}`,
                    }
                });
                return;
            }
        } else if (packageDetails?.words_per_month === 0) {
            res.status(200).json({
                error: {
                    message: `Please upgrade your plan to generate more content ${'<a href="/admin/upgrades">Upgrade</a>'}`,
                }
            });
            return;
        }

        db.table = 'tbl_used_contents';
        db.primary_key = 'used_content_id';
        if (usedContents?.used_content_id) {
            const input = {
                [field]: usedContents[field] + words,
            }
            if (type === 'speech') {
                input['used_speech_to_text'] = usedContents.used_speech_to_text + 1;
            }
            await db.save(input, usedContents.used_content_id);
        } else {
            const input = {
                company_id: session?.user?.company_id, month: monthYear, update_by: session?.user?.user_id,
            }
            input[field] = words || 0;
            if (type === 'speech') {
                input['used_speech_to_text'] = 1;
            }
            await db.save(input);
        }
        return true;
    }

    if (type === 'text') {
        let {name, title, id, description, keyword, language, tone, creativity, variations, max_result} = req.body;
        let prompt = "";
        if (id) {
            const template = await db.data('tbl_templates', {
                'template_id': id
            });
            if (template.length === 0) {
                res.status(400).json({
                    error: {
                        message: "Please enter a valid user",
                    }
                });
                return;
            }
            prompt = template[0]?.prompt
        } else {
            prompt = `Write a description for a [title] that is around ${max_result || 1000} words in a neutral tone. The described in a way that is SEO friendly, highlighting its unique features and benefits.`;
        }
        // replace the [title] in the prompt with the title from the request body
        let newPrompt = prompt.replace('[title]', title);
        // if description is not empty, replace the [description] in the prompt with the description from the request body
        if (description) {
            newPrompt = newPrompt.replace('[description]', description);
        }
        if (name) {
            newPrompt = newPrompt.replace('[name]', name);
        }
        if (language) {
            newPrompt += 'Generate content in the following language:[language]'
            newPrompt = newPrompt.replace('[language]', language);
        }
        if (tone) {
            newPrompt += 'Tone of voice of the intro must be:[tone]'
            newPrompt = newPrompt.replace('[tone]', tone);
        }
        if (keyword) {
            newPrompt += 'Keywords to be included:[keyword]'
            newPrompt = newPrompt.replace('[keyword]', keyword);
        }
        try {
            const completion = await openai.createCompletion({
                model: "text-davinci-003", // model: "text-davinci-003",
                prompt: newPrompt,
                temperature: creativity || 0.5,
                n: variations || 1,
                max_tokens: max_result || 2000,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            // 1 token ~= 4 chars in English
            // 1 token ~= ¾ words
            // 100 tokens ~= 75 words
            let words = 0;
            let result = [];
            completion.data.choices.forEach((choice) => {
                const content = choice.text;
                const word = Math.round(content.length / 4);
                words += word;
                const data = {
                    // if 100 tokens ~= 75 words then 1 token ~= 0.75 words
                    content, word, character: content.length,
                }
                result.push(data);
            });

            if (id) {
                db.table = 'tbl_documents';
                db.primary_key = 'document_id';
                const input = {
                    template_id: id,
                    description,
                    company_id: session?.user?.company_id,
                    keyword,
                    language,
                    tone,
                    creativity,
                    variations,
                    max_result,
                    variant: Helper.slugify(title),
                };
                for (const item of result) {
                    input.word = item.word;
                    input.content = item.content;
                    // input.date = new Date();
                    // save date as mysql date format
                    input.date = moment().format('YYYY-MM-DD');
                    // check if result have multiple items then add number to the title
                    const index = result.indexOf(item);
                    let sTitle = `${title}`;
                    if (result.length > 1) {
                        sTitle = `${title} ${index + 1}`;
                    }
                    input.title = sTitle;
                    const res = await db.save(input);
                    result[index].document_id = res.insertId;
                }
            }
            await saveIntoUsedContents(words);

            // return the result to the client
            res.status(200).json({result: result});
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(200).json({
                    error: {
                        message: 'An error occurred during your request.',
                    }
                });
            }

        }
    } else if (type === 'chat') {
        // check chat is enabled or not for the company
        if (packageDetails?.ai_chat === 0) {
            res.status(200).json({
                error: {
                    message: "Chat is not enabled for your company",
                }
            });
            return;
        }
        const {message, botId, conversationId} = req.body;
        let prompt = "you are a very helpful assistant and I am very grateful for your help.";
        if (!botId) {
            res.status(200).json({
                error: {
                    message: "Please enter a valid chatbot",
                }
            });
            return;
        }
        const messages = [];
        const chatbot = await db.data('tbl_chatbots', {
            'chatbot_id': botId
        });
        if (chatbot.length > 0) {
            prompt = chatbot[0]?.prompt
        }
        messages.push({
            'role': 'system', 'content': prompt
        });
        const conversation = await db.data('tbl_conversations', {
            chatbot_id: botId, conversation_id: conversationId, company_id: session?.user?.company_id
        });
        // get last 10 messages from the tbl_chats table
        const chats = await db.data('tbl_chats', {
            'tbl_conversations.chatbot_id': botId
        }, {
            tbl_conversations: 'tbl_chats.conversation_id = tbl_conversations.conversation_id'
        }, null, 10);
        // add the messages to the history array
        chats.length > 0 && chats.forEach((chat) => {
            messages.push({
                "role": 'user', "content": chat.prompt_message
            });
            if (chat.content) {
                messages.push({
                    "role": 'assistant', "content": chat.content
                });
            }
        });
        const max_tokens = -1;
        messages.push({
            'role': 'user', 'content': message
        });
        try {
            const completion = {
                model: "gpt-3.5-turbo", messages, temperature: 1, frequency_penalty: 0, presence_penalty: 0,
            };
            if (max_tokens !== -1) {
                completion.max_tokens = max_tokens;
            }
            const response = await openai.createChatCompletion(completion);
            const content = response.data.choices[0].message.content;
            const data = {
                content, character: content.length,
            }
            let conversation_id = conversationId;
            // save the chat to the database tbl_chats table with the conversation_id
            if (conversation.length === 0) {
                db.table = 'tbl_conversations';
                db.primary_key = 'conversation_id';
                const input = {
                    chatbot_id: botId,
                    title: message,
                    company_id: session?.user?.company_id,
                    user_id: session?.user?.user_id,
                    last_message: content
                }
                await db.save(input).then((res) => {
                    data.conversation_id = res.insertId;
                    conversation_id = res.insertId;
                });
            } else {
                db.table = 'tbl_conversations';
                db.primary_key = 'conversation_id';
                const input = {
                    last_message: content
                }
                await db.save(input, conversationId);
            }
            const words = Math.round(content.length / 4);
            const input = {
                conversation_id: conversation_id,
                prompt_message: message,
                content: content,
                words: words || 0,
                user_id: session?.user?.user_id,
            }
            db.table = 'tbl_chats';
            db.primary_key = 'chat_id';
            await db.save(input);

            await saveIntoUsedContents(words);

            data.words = words;
            // return the result to the client
            res.status(200).json({result: data});
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(200).json({
                    error: {
                        message: 'An error occurred during your request.',
                    }
                });
            }
        }
    } else if (type === 'speech') {
        const {
            title, language, file, description, favorite
        } = req.body;
        try {
            const words = Math.round(description.length / 4);
            const resulted = await saveIntoUsedContents(words);
            if (resulted) {
                const data = {
                    title,
                    language,
                    description,
                    favorite,
                    company_id: session?.user?.company_id,
                    created_by: session?.user?.user_id,
                    file
                }
                data.date = moment().format('YYYY-MM-DD');
                db.table = 'tbl_speech_to_text';
                db.primary_key = 'speech_to_text_id';
                const result = await db.save(data);
                res.status(200).json({result: {speech_to_text_id: result.insertId}});
            } else {
                res.status(200).json({
                    error: {
                        message: 'You have reached the maximum limit of words for today.',
                    }
                });
            }
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(200).json({
                    error: {
                        message: 'An error occurred during your request.',
                    }
                });
            }

        }

    }

}
