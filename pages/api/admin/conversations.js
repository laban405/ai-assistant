import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_conversations cnvrsn';
db.primary_key = 'conversation_id';
db.primary_field = 'title';
db.order_by = 'conversation_id DESC';
db.select = ['cnvrsn.*', 'tbl_chatbots.*', 'CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as fullname,tbl_users.avatar'];
db.join_table = {
    "tbl_users": "tbl_users.user_id = cnvrsn.user_id", "tbl_chatbots": "tbl_chatbots.chatbot_id = cnvrsn.chatbot_id"
}
db.column_search = ['cnvrsn.title'];

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
