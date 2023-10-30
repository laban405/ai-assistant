import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_payment_methods';
db.primary_key = 'payment_method_id';
db.primary_field = 'method_name';
db.column_search = ['method_name', 'method_description'];
db.order_by = 1; // true means descending from primary key
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}