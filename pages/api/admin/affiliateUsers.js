
import DB from "../../../lib/db";
import {myDetailApi} from "./common";


const db = new DB();
db.table = 'tbl_users as usr';
db.primary_key = 'user_id';
db.primary_field = 'first_name';
db.order_by = 'user_id DESC';
db.select = ['usr.*,CONCAT(usr.first_name, " ", usr.last_name) as fullname,(SELECT COUNT(tbl_users2.user_id) FROM tbl_users as tbl_users2 WHERE usr.user_id = tbl_users2.referral_by) AS total_referral,' + 'COALESCE((SELECT SUM(tbl_affiliate_payouts.amount) FROM tbl_affiliate_payouts WHERE tbl_affiliate_payouts.user_id = usr.user_id AND tbl_affiliate_payouts.status = "approved"), 0) AS withdrawal_amount,' + 'COALESCE(SUM(tbl_affiliates.get_amount), 0) AS total_balance'];
db.join_table = {
    "tbl_affiliates": "usr.user_id = tbl_affiliates.referral_by",
    "tbl_affiliate_payouts": "usr.user_id = tbl_affiliate_payouts.user_id",
    "tbl_users as tbl_users2": "usr.referral_by = tbl_users2.user_id",
};
db.column_search = ['tbl_users.first_name', 'tbl_users.last_name', 'tbl_users.email', 'tbl_users.username', 'tbl_users.phone', 'tbl_users.address', 'tbl_users.city', 'tbl_users.state', 'tbl_users.zip', 'tbl_users.country', 'tbl_users.status', 'tbl_users.created_at', 'tbl_users.updated_at'];
db.group_by = 'usr.user_id';
db.menu_id = 58
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}