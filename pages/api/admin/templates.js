import DB from "../../../lib/db";

const db = new DB();
db.select = ["tmpl.*,tbl_categories.category_name"];
db.table = 'tbl_templates tmpl';
db.primary_key = 'tmpl.template_id';
db.primary_field = 'tmpl.name';
db.join_table = {"tbl_categories": "tbl_categories.category_id = tmpl.category_id"};
db.column_search = ['tmpl.description', 'tmpl.name', 'tmpl.slug'];
db.order_by = 1;
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}