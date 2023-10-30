import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_document_editor';
db.primary_key = 'document_editor_id';
db.primary_field = 'title';
db.column_search = ['title', 'description'];
db.order_by = 1;
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}