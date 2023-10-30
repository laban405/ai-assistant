import {Configuration, OpenAIApi} from "openai";
import DB from "../../../lib/db";
import Helper from "../../../lib/Helper";
import {checkBadWords, configItems, GetUsedContent, myDetailApi, PackageInfo} from "./common";
import moment from "moment/moment";
import {uploadFileToCloudinary, uploadFileToS3} from "../upload";


const db = new DB();
export default async function (req, res) {
    const config = await configItems();
    const configuration = new Configuration({
        apiKey: config?.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    if (!configuration.apiKey) {
        res.status(500).json({
            error: {
                message: "OpenAI API key not configured, please follow instructions in README.md",
            }
        });
        return;
    }
    const session = await myDetailApi(req, res);
    if (!session) {
        res.status(200).json({
            error: {
                message: "Unauthorized",
            }
        });
        return;
    }
    const {
        title,
        id,
        description,
        art_style,
        lighting_style,
        mood,
        image_type,
        image_size,
        aspect_ratio,
        private_image,
        number_of_images
    } = req.body;
    // check badWords in the content and return error if found
    const badWords = await checkBadWords(description);
    if (badWords && badWords.length > 0) {
        res.status(200).json({
            error: {
                message: "Your content contains bad words. Please remove them and try again.",
            }
        });
        return;
    }
    // get package details of the company
    const usedContents = await GetUsedContent(session?.user?.company_id);
    const packageDetails = await PackageInfo(session?.user?.company_id);

    if (packageDetails?.images_per_month !== -1 && packageDetails?.images_per_month !== 0) {
        if (usedContents?.used_images >= packageDetails?.images_per_month) {
            res.status(200).json({
                error: {

                    message: `You have reached your monthly limit of words. Please upgrade your plan to generate more content. ${'<a href="/admin/upgrades">Upgrade</a>'}`,
                }
            });
            return;
        }
    } else if (packageDetails?.images_per_month === 0) {
        res.status(200).json({
            error: {
                message: `Please upgrade your plan to generate more content. ${'<a href="/admin/upgrades">Upgrade</a>'}`,
            }
        });
        return;
    }

    req.body.user_id = session?.user?.user_id;
    req.body.company_id = session?.user?.company_id;
    req.body.full_name = session?.user?.full_name;


    // const prompt =description;
    // generate a prompt to generate the image based on the request body
    const prompt = `This is a ${art_style} ${lighting_style} ${mood} ${image_type} ${aspect_ratio} ${number_of_images} ${description}`;

    // const imageModel = "DALL-E";
    // const config?.NEXT_PUBLIC_IMAGE_MODEL = "stable-diffusion";
    if (config?.NEXT_PUBLIC_IMAGE_MODEL === 'stable-diffusion') {
        const engineId = 'stable-diffusion-v1-5'
        const apiHost = config?.API_HOST ?? 'https://api.stability.ai'
        const apiKey = config?.NEXT_PUBLIC_STABILITY_API_KEY
        if (!apiKey) throw new Error('Missing Stability API key.')
        try {
            // get width and height from image size image_size == 512x512
            const [width, height] = image_size?.split('x').map((s) => parseInt(s, 10)) ?? [512, 512]
            const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${apiKey}`,
                }, body: JSON.stringify({
                    text_prompts: [{
                        text: prompt,
                    },], cfg_scale: 20, // clip_guidance_preset: 'FAST_BLUE',
                    height: height, width: width, samples: number_of_images, steps: 50,
                }),
            })
            if (!response.ok) {
                // throw new Error(`Non-200 response: ${await response.text()}`)
                // show error message
                const error = await response.json();
                res.status(200).json({
                    error: error.message
                });
            } else {
                const responseJSON = await response.json();
                req.body.imagesUrl = responseJSON.artifacts;
                const result = await saveImage(req.body, usedContents);
                res.status(200).json({result});
            }
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                // console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(500).json({
                    error: {
                        message: error.message
                    }
                });
            }
        }
    } else {
        try {
            const completion = await openai.createImage({
                prompt: prompt, n: number_of_images || 1, size: image_size || "256x256", response_format: "url"
            })
            req.body.imagesUrl = completion.data.data;
            const result = await saveImage(req.body, usedContents, config);
            res.status(200).json({result});
        } catch (error) {
            // Consider adjusting the error handling logic for your use case
            if (error.response) {
                console.error(error.response.status, error.response.data);
                res.status(error.response.status).json(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                res.status(500).json({
                    error: {
                        message: error
                    }
                });
            }
        }
    }
}

// saveImage function
async function saveImage(data, usedContents, config) {
    const {
        title,
        description,
        art_style,
        lighting_style,
        mood,
        image_type,
        image_size,
        aspect_ratio,
        private_image,
        number_of_images,
        imagesUrl,
        user_id,
        company_id,
    } = data;
    const images = [];
    const input = {
        title,
        description,
        art_style,
        lighting_style,
        mood,
        image_type,
        image_size,
        aspect_ratio,
        private_image,
        number_of_images,
        company_id,
    }
    input.user_id = user_id;
    if (imagesUrl?.length > 0) {
        const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

        db.table = 'tbl_used_contents';
        db.primary_key = 'used_content_id';
        if (usedContents?.used_content_id) {
            const input = {
                used_images: usedContents.used_images + imagesUrl.length,
            }
            await db.save(input, usedContents.used_content_id);
        } else {
            const input = {
                company_id: company_id, month: monthYear, used_images: imagesUrl.length, update_by: user_id,
            }
            await db.save(input);
        }

        // loop through imagesUrl array and save each image into local directory by image.url
        for (const image of imagesUrl) {
            const imageName = `${new Date().getTime()}_${Helper.slugify(title)}.png`
            let imageData = '';
            if (config?.NEXT_PUBLIC_IMAGE_MODEL === 'stable-diffusion') {
                imageData = Buffer.from(image.base64, 'base64');
            } else { // DALL-E
                const imageUrl = image.url;
                const response = await fetch(imageUrl);
                imageData = await response.arrayBuffer();
            }
            try {
                const file = {
                    newFilename: imageName, mimetype: 'image/png', Body: Buffer.from(new Uint8Array(imageData)),
                }
                let url = '';
                if (config?.NEXT_PUBLIC_FILESYSTEM_DRIVER === 's3') {
                    url = await uploadFileToS3(file);
                } else {
                    url = await uploadFileToCloudinary(file);
                }
                const img = {
                    url: url, image_size, title
                }
                input.image = img.url;
                input.date = moment().format('YYYY-MM-DD');
                // save image into database
                db.table = 'tbl_images';
                db.primary_key = 'image_id';
                const result = await db.save(input);
                img.image_id = result.insertId;
                image.fullname = data.full_name;
                images.push(img);
            } catch (error) {
                console.log('Upload Image Error: ', error);
            }
        }
    }
    return images;

}

