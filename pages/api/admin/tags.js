import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_tags';
db.primary_key = 'tag_id';
db.primary_field = 'tbl_tags';
db.order_by = 'tag_id DESC';
db.column_search = ['tag_name', 'style'];

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}