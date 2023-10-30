import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_sections';
db.primary_key = 'id';
db.primary_field = 'title';
db.order_by = 1; // true means descending from primary key
db.column_search = ['title', 'descriptions'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}