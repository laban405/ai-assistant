import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_categories';
db.primary_key = 'category_id';
db.primary_field = 'category_name';
db.group_by = 'tbl_categories.category_id';
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}