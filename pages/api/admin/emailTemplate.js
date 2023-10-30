import DB from "../../../lib/db";
import * as fs from "fs";

const db = new DB();
db.table = 'tbl_email_templates';
db.primary_key = 'email_template_id';

export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(400).json({message: "Bad Request"});
    }
}
