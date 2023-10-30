import DB from "../../../lib/db";
import bcrypt from "bcrypt";
import {configItems, myDetailApi} from "./common";

const db = new DB();
db.table = 'tbl_users usr';
db.primary_key = 'user_id';
db.primary_field = ['first_name', 'last_name'];
db.order_by = 'user_id DESC';
db.select = ['usr.*,CONCAT(usr.first_name, " ", usr.last_name) as fullname'];
db.column_search = ['tbl_tasks.task_name', 'tbl_tasks.number', 'tbl_tasks.tags', 'tbl_tasks.due_date', 'tbl_tasks.status', 'tbl_tasks.prefix', 'tbl_categories.category_name'];
export default async function handler(req, res) {
    try {

        if (req.body?.user_password) {
            const session = await myDetailApi(req, res);
            ;const user = await db.data('tbl_users', {
                user_id: session.user.user_id
            }, null, true)
            if (user) {
                const passwordValid = await bcrypt.compare(req.body.password, user.password);
                let result = true;
                if (!passwordValid) {
                    result = false;
                }
                return res.status(200).json({result});
            }
        } else {
            if (req.body.sendEmailByTemplate) {
                req.body.emailBody = await EmailBody(req, res);
                // get all employee email allEmployeeEmails
                // req.body.allEmployeeEmails = true;
                // req.body.array = true;
                // const allEmployeeEmails = await db.handler(req, res);
                // req.body.sendTo = allEmployeeEmails
                req.body.sendEmail = true;
            }
            if (req.body?.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

        }
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const EmailBody = async (req, res) => {
    req.body.getInfo = true;
    req.body.array = true;
    const getInfo = await db.handler(req, res);
    const emailBody = [{
        key: 'COMPANY_NAME', value: config?.NEXT_PUBLIC_COMPANY_NAME
    }, {
        key: 'COMPANY_EMAIL', value: config?.NEXT_PUBLIC_COMPANY_EMAIL
    }, {
        key: 'COMPANY_ADDRESS', value: config?.NEXT_PUBLIC_COMPANY_ADDRESS
    }, {
        key: 'COMPANY_PHONE', value: config?.NEXT_PUBLIC_COMPANY_PHONE
    }, {
        key: 'COMPANY_URL', value: config?.NEXT_PUBLIC_COMPANY_URL
    }, {
        key: 'COMPANY_LOGO', value: config?.NEXT_PUBLIC_COMPANY_LOGO
    }, {
        key: 'EMAIL_SIGNATURE', value: config?.NEXT_PUBLIC_EMAIL_SIGNATURE
    }, {
        key: 'ACTIVATE_URL', value: 'auth/activate', link: true
    }, {
        key: 'ACTIVATION_PERIOD', value: config?.NEXT_PUBLIC_ACTIVATION_PERIOD
    }, {
        key: 'USERNAME', value: getInfo.username
    }, {
        key: 'EMAIL', value: getInfo.email
    }, {
        key: 'PASSWORD', value: req.body.values.password
    }, {
        key: 'FIRST_NAME', value: getInfo.first_name
    }, {
        key: 'LAST_NAME', value: getInfo.last_name
    }, {
        key: 'FULL_NAME', value: getInfo.first_name + ' ' + getInfo.last_name
    }];
    return emailBody;
}