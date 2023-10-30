import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_payments';
db.primary_key = 'payment_id';
db.order_by = 1; // true means descending from primary key
db.column_search = ['tax_name', 'percentage'];
db.select = ['tbl_payments.*,tbl_invoices.number as in_number,tbl_invoices.format as in_format,tbl_invoices.prefix as in_prefix, tbl_clients.client_name, tbl_currencies.*'];
db.join_table = {
    "tbl_invoices": "tbl_invoices.invoice_id = tbl_payments.module_id AND tbl_payments.module = 'invoice'",
    "tbl_clients": "tbl_payments.paid_by = tbl_clients.client_id",
    "tbl_currencies": "tbl_payments.currency_id = tbl_currencies.currency_id",
}
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}