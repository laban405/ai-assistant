import fs from "fs";
import path from "path";

const handler = async (req, res) => {
    try {
        //delete file from public/uploads folder
        const {newFilename} = req.body;
        const filePath = path.join(process.cwd(), `./public/uploads/${newFilename}`);
        try {
            fs.unlinkSync(filePath)
            //file removed
        } catch (err) {
            console.error(err)
        }
        res.status(200).json('File deleted successfully');
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
}
export default handler;

