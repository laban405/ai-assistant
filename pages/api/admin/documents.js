import DB from "../../../lib/db";

const db = new DB();


db.table = 'tbl_documents doc';
db.select = [`doc.*,tbl_templates.name as template_name,tbl_templates.slug`];
db.primary_key = 'document_id';
db.primary_field = 'title';
db.column_search = ['doc.title', 'doc.description', 'content'];
db.order_by = 'doc.created_at DESC';
db.join_table = {
    "tbl_templates": "tbl_templates.template_id = doc.template_id"
};

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}