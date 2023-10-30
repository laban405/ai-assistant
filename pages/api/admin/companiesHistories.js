import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_companies_history cmpnyDetail';
db.primary_key = 'cmpnyDetail.company_history_id';
db.primary_field = 'cmpny.package_name';
db.order_by = 1; // true means descending from primary key
db.join_table = {"tbl_companies cmpny": "cmpny.company_id = cmpnyDetail.company_id"};
db.column_search = ['cmpny.company_name', 'cmpnyDetail.package_name', 'cmpny.company_email', 'cmpny.mobile', 'cmpny.address'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}