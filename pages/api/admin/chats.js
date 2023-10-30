import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_chats chts';
db.primary_key = 'chts.chat_id';
db.primary_field = 'chts.title';
db.select = ['chts.*', 'cnvrsn.title', 'chbt.*', 'CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as fullname,tbl_users.avatar'];
db.join_table = {
    "tbl_users": "tbl_users.user_id = chts.user_id",
    "tbl_conversations cnvrsn": "cnvrsn.conversation_id = chts.conversation_id",
    "tbl_chatbots chbt": "chbt.chatbot_id = cnvrsn.chatbot_id"
}
db.column_search = ['chts.prompt_message, chts.content'];

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
