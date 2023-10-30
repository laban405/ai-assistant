import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_images img';
db.select = [`img.*,CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as fullname`];
db.primary_key = 'image_id';
db.primary_field = 'title';
db.join_table = {"tbl_users": "img.user_id = tbl_users.user_id"}
db.column_search = ['img.title', 'img.description'];
db.order_by = 'img.created_at DESC';
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}