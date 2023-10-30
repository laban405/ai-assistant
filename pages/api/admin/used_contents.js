import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_used_contents usdContent';
db.primary_key = 'used_content_id';
db.primary_field = ['package_name'];
db.order_by = 'used_content_id DESC';
db.select = ['usdContent.*'];
db.join_table = {"tbl_companies": "tbl_companies.company_id = usdContent.company_id"}
db.column_search = ['tbl_companies.company_name'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}