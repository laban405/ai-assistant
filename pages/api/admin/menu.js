
import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_front_menu_items';
db.primary_key = 'id';
db.primary_field = 'menu';
db.order_by = 1; // true means descending from primary key
db.column_search = ['menu', 'descriptions'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}