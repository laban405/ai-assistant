import DB from "../../../lib/db";
const db = new DB();
db.table = 'tbl_chatbots';
db.primary_key = 'chatbot_id';
db.primary_field = 'name';
db.column_search = ['tbl_chatbots.name', 'tbl_chatbots.role'];

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
