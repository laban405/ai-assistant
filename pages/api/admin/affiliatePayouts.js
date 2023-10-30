import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_affiliate_payouts payout';
db.primary_key = 'affiliate_payout_id';
db.select = ['payout.*,CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as fullname'];
db.join_table = {
    "tbl_users": "payout.user_id = tbl_users.user_id",
};
db.order_by = 'affiliate_payout_id DESC';
db.column_search = ['payout.amount', 'payout.notes', 'payout.created_at', 'payout.updated_at'];
db.menu_id = 59
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}