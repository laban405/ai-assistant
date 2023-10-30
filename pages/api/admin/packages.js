import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_packages';
db.primary_key = 'package_id';
db.primary_field = ['package_name'];
db.order_by = 'package_id DESC';
db.select = ['tbl_packages.*'];
db.column_search = ['tbl_packages.package_name'];
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}