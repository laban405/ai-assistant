import formidable from "formidable";
import fs from "fs";
import path from "path";
// import S3 from "aws-sdk/clients/s3";
import {S3} from 'aws-sdk';
import {configItems} from "./admin/common";

export const config = {
    api: {
        bodyParser: false,
    },
};
const readFile = (req, saveLocally) => {
    //   const options: formidable.Options
    const options = {}
    const allFiles = [];
    if (saveLocally) {
        // options.uploadDir = path.join(process.cwd(), "./public/uploads");
        options.keepExtensions = true;
        options.multiples = true;
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }
    options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable(options);
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            resolve({fields, files});
        });
    });
}

export const uploadFileToS3 = async (file, body = null) => {
    const config = await configItems();
    const bucketName = config.NEXT_PUBLIC_AWS_BUCKET_NAME;
    const region = config.NEXT_PUBLIC_AWS_REGION;
    const access_key = config.NEXT_PUBLIC_AWS_ACCESS_KEY;
    const secret_key = config.NEXT_PUBLIC_AWS_SECRET_KEY;
    const s3 = new S3({
        region, accessKeyId: access_key, secretAccessKey: secret_key, signatureVersion: 'v4',
    });
    const filePromises = {
        Bucket: bucketName,
        Key: file.newFilename,
        ContentType: file.mimetype,
        Body: file.Body || fs.createReadStream(file.filepath),
    }
    const url = await s3.upload(filePromises).promise();
    return url.Location;
}
export const uploadFileToCloudinary = async (file) => {
    const config = await configItems();
    const cloudName = config.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = config.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = config.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret,
    });

    if (file.Body) {
        const tempFile = path.join(process.cwd(), "./public/uploads", file.newFilename);
        fs.writeFileSync(tempFile, file.Body);
        file.filepath = tempFile;
    }

    const url = await cloudinary.uploader.upload(file.filepath, {
        folder: 'product',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        invalidate: true,
        resource_type: 'auto', // type: 'upload',
    });
    if (file.Body) {
        fs.unlinkSync(file.filepath);
    }
    return url.secure_url;
}


const handler = async (req, res) => {

    try {
        const {fields, files} = await readFile(req, true);
        const {file} = files;
        const fileData = [];
        // check file is array
        if (Array.isArray(file)) {
            for (const item of file) {
                const {newFilename, originalFilename, mimetype, size} = item;
                // const fileUrl = await uploadFileToS3(item);
                // upload file to cloudinary
                const fileUrl = await uploadFileToCloudinary(item);
                fileData.push({newFilename, fileUrl, originalFilename, mimetype, size});
            }
        } else {
            const {newFilename, originalFilename, mimetype, size} = file;
            // const fileUrl = await uploadFileToS3(file);
            // upload file to cloudinary
            const fileUrl = await uploadFileToCloudinary(file);
            fileData.push({newFilename, fileUrl, originalFilename, mimetype, size});
        }
        res.status(200).json({fileData});
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
}
export default handler;

