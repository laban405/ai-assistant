import DB from "../../../lib/db";
import bcrypt from "bcrypt";

const db = new DB();
db.table = 'tbl_companies cmpny';
db.primary_key = 'cmpny.company_id';
db.primary_field = 'cmpny.category_name';
db.join_table = {"tbl_companies_history cmpnyDetail": "cmpnyDetail.company_id = cmpny.company_id"};
db.order_by = 1; // true means descending from primary key
db.column_search = ['cmpny.company_name', 'cmpny.company_email', 'cmpny.mobile', 'cmpny.address'];
export default async function handler(req, res) {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}



