import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_companies_payment cmpnyPayment';
db.primary_key = 'company_payment_id';
db.primary_field = 'company_payment_id';
db.join_table = {
    "tbl_companies cmpny": "cmpny.company_id = cmpnyPayment.company_id",
    "tbl_companies_history": "tbl_companies_history.company_history_id = cmpnyPayment.company_history_id"
};
db.order_by = 1; // true means descending from primary key
db.column_search = ['company_payment_id', 'cmpny.company_name', 'tbl_companies_history.package_name', 'cmpnyPayment.payment_date', 'cmpnyPayment.total_amount', 'cmpnyPayment.payment_method', 'cmpnyPayment.payment_status'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}



