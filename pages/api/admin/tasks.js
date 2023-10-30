import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_tasks';
db.primary_key = 'task_id';
db.primary_field = 'task_name';
db.order_by = 'task_id DESC';
db.select = ["tbl_tasks.*", 'CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as createdByName', 'CONCAT(tbl_update_by.first_name, " ", tbl_update_by.last_name) as updatedByName'];
db.join_table = {
    "tbl_users as tbl_update_by": "tbl_tasks.updated_by = tbl_update_by.user_id",
    tbl_users: "tbl_tasks.created_by = tbl_users.user_id",
};
db.column_search = ['tbl_tasks.task_name', 'tbl_tasks.number', 'tbl_tasks.tags', 'tbl_tasks.due_date', 'tbl_tasks.status', 'tbl_tasks.prefix', 'task_name'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}