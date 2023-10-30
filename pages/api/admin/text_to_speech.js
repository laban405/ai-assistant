import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_text_to_speech tts';
db.primary_key = 'text_to_speech_id';
db.primary_field = 'title';
db.column_search = ['title', 'file'];
db.order_by = 1;
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}