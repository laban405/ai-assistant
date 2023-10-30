import AWS from "aws-sdk";
import Helper from "../../../lib/Helper";
import DB from "../../../lib/db";
import moment from "moment";
import {checkBadWords, configItems, GetUsedContent, myDetailApi, PackageInfo} from "./common";
import {uploadFileToCloudinary, uploadFileToS3} from "../upload";


const db = new DB();

async function generateSpeech(req, res) {
    const config = await configItems();
    const region = config?.NEXT_PUBLIC_AWS_REGION;
    const access_key = config?.NEXT_PUBLIC_AWS_ACCESS_KEY;
    const secret_key = config?.NEXT_PUBLIC_AWS_SECRET_KEY;

    const aws = new AWS.Polly({
        accessKeyId: access_key, secretAccessKey: secret_key, region: region,
    });

    const session = await myDetailApi(req, res);


    if (!aws.config.credentials.accessKeyId) {
        res.status(200).json({
            error: {
                message: "Please add your API key in settings page.",
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

    const usedContents = (await GetUsedContent(session?.user?.company_id)) || {};
    const packageDetails = (await PackageInfo(session?.user?.company_id)) || {};

    const badWords = await checkBadWords(req.body.text || req.body.title);
    if (badWords && badWords.length > 0) {
        res.status(200).json({
            error: {
                message: "Your content contains bad words. Please remove them and try again.",
            }
        });
        return;
    }

    const {text, voice, title, language} = req.body;

    const words = Math.round(text.length / 4);
    if (packageDetails?.words_per_month !== -1 && packageDetails?.words_per_month !== 0) {
        const totalWords = usedContents?.used_words + words;
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
    if (packageDetails?.text_to_speech === 0) {
        res.status(200).json({
            error: {
                message: `Please upgrade your plan to generate more speech. ${'<a href="/admin/upgrades">Upgrade</a>'}`,
            }
        });
        return;
    }


    const params = {
        Text: text, OutputFormat: "mp3", VoiceId: voice, LanguageCode: language,
    };

    try {
        const data = await aws.synthesizeSpeech(params).promise();
        const fileName = `${new Date().getTime()}_${Helper.slugify(title)}.mp3`;
        const files = {
            newFilename: fileName,
            originalFilename: `${Helper.slugify(title)}.mp3`,
            mimetype: data.ContentType,
            Body: Buffer.from(data.AudioStream),
        };
        let url = "";
        if (config?.NEXT_PUBLIC_FILESYSTEM_DRIVER === 's3') {
            url = await uploadFileToS3(files);
        } else {
            url = await uploadFileToCloudinary(files);
        }
        const file = {
            newFilename: fileName,
            originalFilename: `${Helper.slugify(title)}.mp3`,
            mimetype: data.ContentType,
            fileUrl: url,
        };
        const dataURL = audioStreamToDataURL(data.AudioStream);
        const input = {
            voice,
            title,
            language,
            text,
            favorite: "No",
            company_id: session?.user?.company_id,
            created_by: session?.user?.user_id,
            file: JSON.stringify(file),
        };
        input.date = moment().format("YYYY-MM-DD");

        const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

        const saveIntoUsedContents = async (words, field = "used_words") => {
            db.table = "tbl_used_contents";
            db.primary_key = "used_content_id";
            if (usedContents?.used_content_id) {
                const input = {
                    [field]: usedContents[field] + words,
                };
                input['used_text_to_speech'] = usedContents.used_text_to_speech + 1;
                await db.save(input, usedContents.used_content_id);
            } else {
                const input = {
                    company_id: session?.user?.company_id, month: monthYear, update_by: session?.user?.user_id,
                };
                input[field] = words;
                input['used_text_to_speech'] = 1;
                await db.save(input);
            }
        };
        await saveIntoUsedContents(words).then(r => r).catch(e => e);

        db.table = "tbl_text_to_speech";
        db.primary_key = "text_to_speech_id";
        const result = await db.save(input);
        return {
            text_to_speech_id: result.insertId, text, favorite: "No", success: true, dataURL,
        };
    } catch (error) {
        return {
            success: false, error: error,
        };
    }
}

function audioStreamToDataURL(audioStream) {
    const buffer = Buffer.from(audioStream);
    const base64Data = buffer.toString("base64");
    const dataURL = `data:audio/mp3;base64,${base64Data}`;
    return dataURL;
}

export default async function handler(req, res) {
    try {
        const result = await generateSpeech(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(200).json({error: "Failed to generate speech"});
    }
}
