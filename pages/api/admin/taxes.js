import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_taxes';
db.primary_key = 'tax_id';
db.primary_field = ['tax_name', 'percentage'];
db.order_by = 1; // true means descending from primary key
db.column_search = ['tax_name', 'percentage'];
db.menu_id = 39;

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}