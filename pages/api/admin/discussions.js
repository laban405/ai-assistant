import DB from "../../../lib/db";

const db = new DB();
db.table = 'tbl_discussions';
db.primary_key = 'discussion_id';
db.primary_field = 'title';
db.order_by = 'discussion_id DESC';
db.select = ['tbl_discussions.*', 'CONCAT(tbl_users.first_name, " ", tbl_users.last_name) as fullname,tbl_users.avatar'];
db.join_table = {
    "tbl_users": "tbl_users.user_id = tbl_discussions.user_id"
}
db.column_search = ['tbl_projects.title', 'tbl_projects.description', 'tbl_projects.module', 'tbl_projects.attachments'];

export default async function handler(req, res) {
    try {
        if (req.body.getComment) {
            delete req.body.getComment;
            const result = await getComment(req.body);
            return res.status(200).json(result);
        } else {
            return await db.handler(req, res);
        }

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const getComment = async (where) => {
    if (where.where) {
        where = where.where;
    }
    const allComments = await db.get(where);
    const comments = [];
    if (allComments.length > 0) {
        for (const item of allComments) {
            const comment = item;
            comment.replies = [];
            const where = {
                module_id: item.discussion_id, module: 'comments', type: 'reply',
            }
            const replies = await db.get(where);
            if (replies.length > 0) {
                comment.replies = replies;
            }
            comments.push(comment);
        }
    }
    return comments;
}
