import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_histories';
db.primary_key = 'history_id';
db.primary_field = 'result';
db.column_search = ['result', 'word', 'module'];
db.order_by = 1;
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}