import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_languages';
db.primary_key = 'name';
db.primary_field = ['name'];
db.order_by = 1; // true means descending from primary key
db.column_search = ['code', 'name'];

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}