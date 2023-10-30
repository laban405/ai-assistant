import DB from "../../../lib/db";

const db = new DB();
db.table = "tbl_tickets";
db.primary_key = "tickets_id";
db.order_by = 'tickets_id DESC';
db.select = ["tbl_tickets.*", 'CONCAT(tbl_users_creator.first_name, " ", tbl_users_creator.last_name) as createdByName', 'CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as reporterName',];
db.join_table = {
    "tbl_users as tbl_users_creator": "tbl_tickets.created_by = tbl_users_creator.user_id",
    tbl_users: "tbl_tickets.reporter = tbl_users.user_id",
}
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}