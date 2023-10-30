
import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_affiliates';
db.primary_key = 'affiliate_id';
db.primary_field = 'email';
db.order_by = 'affiliate_id DESC';
db.menu_id = 58
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}