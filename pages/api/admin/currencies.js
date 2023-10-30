import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_currencies';
db.primary_key = 'currency_id';
db.primary_field = ['currency_name', 'symbol'];
db.column_search = ['currency_name', 'currency_code', 'symbol', 'decimal_separator', 'thousand_separator', 'decimal_places', 'exchange_rate'];
db.order_by = 1;
db.dependency = {
    tbl_invoices: 'currency',
}
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}