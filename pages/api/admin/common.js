import DB from "../../../lib/db";
import nodemailer from "nodemailer";
import {getServerSession} from "next-auth/next";
import {authOptions} from "../auth/[...nextauth]";

export default async function handler(req, res) {
    const db = new DB();
    if (req.body.menu) {
        return await getMenu(req, res);
    } else if (req.body.permissionById) {
        return await getPermissionById(req, res);
    } else if (req.body.designationById) {
        return await getDesignationById(req, res);
    } else if (req.body.userById) {
        return await getUserById(req, res);
    } else if (req.body.getTotalRows) {
        return await getTotalRows(req, res);
    } else if (req.body.GetData) {
        return await GetData(req, res);
    } else if (req.body.getTags) {
        req.body.table = 'tbl_tags';
        req.body.order_by = 'tag_id';
        req.body.getRows = true;
    } else if (req.body.getCountry) {
        db.table = 'tbl_countries';
        db.primary_key = 'id';
        db.primary_field = 'value'
        db.order_by = 1;
        delete req.body.getCountry;
    } else if (req.body.save) {
        req.body.primary_key = req.body.primaryKey;
    }
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
    return res.status(400).json({message: "Bad Request"});
}

const SendMail = async (req, res) => {
    const config = await configItems();

    // const {email, subject, message} = req.body;
    const to = 'uniquecoder007@gmail.com';
    const subject = 'Test Mail';
    const message = '<p>You have a contact form submission</p><br>\n        <p><strong>Email: </strong> nayeem.edu01@gmail.com</p><br>\n        <p><strong>Message: </strong> This is cool test for you</p><br>';
    const attachments = null;
    const transporter = nodemailer.createTransport({
        host: config?.MAIL_HOST, port: config?.MAIL_PORT, secure: config?.MAIL_SECURE, // true for 465, false for other ports
        auth: {
            user: config?.MAIL_USERNAME, // generated ethereal user
            pass: config?.MAIL_PASSWORD // generated ethereal password
        }, tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });
    try {
        await transporter.sendMail({
            from: config?.MAIL_FROM, // sender address
            to, subject, html: message, attachments
        });
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
    return res.status(200).json({error: ""});

}

const GetData = async (req, res) => {
    const db = new DB();
    try {
        const table = req.body.table;
        const where = req.body.where;
        const join = req.body.join;
        const row = req.body.row;
        const results = await db.data(table, where, join, row);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
}
const getTotalRows = async (req, res) => {
    const db = new DB();
    try {
        db.table = req.body.table;
        const results = await db.handler(req, res);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
}
const getMenu = async (req, res) => {
    const db = new DB();
    try {
        const session = await myDetailApi(req, res);
        db.table = 'tbl_menu';
        db.primary_key = 'menu_id';
        db.order_by = 'sort';
        const where = {
            status: 1
        };
        if (session?.user?.role_id === 1) {
            where.status = 2;
        }
        let allMenu = await db.get(where);
        // get package details from tbl_companies_history by company_id
        const companyPackage = await db.data('tbl_companies_history', {
            company_id: session?.user?.company_id, active: 1
        }, null, true);
        if (companyPackage) {
            // check ai_chat is active or not in package
            // if not active then remove chat from menu
            if (companyPackage.ai_chat !== 1) {
                // remove chat from menu by link
                // if match then remove from menu list
                // /admin/chats , /admin/chats/all or any other link  after /admin/chats then remove from menu
                allMenu = allMenu.filter(item => !item.link.match(/^\/admin\/chats/));
            }
            if (companyPackage.ai_transcriptions !== 1) {
                allMenu = allMenu.filter(item => !item.link.match(/^\/admin\/transcripts/));
            }
            // images_per_month
            if (companyPackage.images_per_month === 0) {
                allMenu = allMenu.filter(item => !item.link.match(/^\/admin\/images/));
            }
            // words_per_month
            if (companyPackage.words_per_month === 0) {
                allMenu = allMenu.filter(item => !item.link.match(/^\/admin\/documents/));
                allMenu = allMenu.filter(item => !item.link.match(/^\/admin\/templates/));
            }
        }
        const userInfo = await db.data('tbl_users', {
            user_id: session?.user?.user_id
        }, null, true);

        if (userInfo?.isAffiliate === 1) {
            // add affiliate menu in menu list with sub menu
            const affiliateMenu = {
                menu_id: 1000,
                label: 'Affiliates',
                link: '/admin/affiliates',
                icon: 'fa fa-users',
                parentId: 0,
                sort: 1000,
                status: 1,
            }
            allMenu.push(affiliateMenu);
        }

        // Create a multidimensional array to conatin a list of items and parents
        const menu = {
            'items': [], 'parents': []
        }
        allMenu.forEach(item => {
            menu['items'][item.menu_id] = item;
            menu['parents'][item.parentId] = menu['parents'][item.parentId] || [];
            menu['parents'][item.parentId].push(item.menu_id);
        });

        // Build array of item with children
        const buildMenu = (parentId) => {
            let result = [];
            if (menu.parents[parentId]) {
                menu.parents[parentId].forEach(menuId => {
                    let item = menu.items[menuId];
                    item.subItems = buildMenu(menuId);
                    result.push(item);
                });
            }
            return result;
        }
        const menuItems = buildMenu(0);
        return res.status(200).json(menuItems);
    } catch (error) {
        return res.status(500).json({error});
    }
}
const getPermissionById = async (req, res) => {
    const db = new DB();
    try {
        const permission = req.body.permission;
        if (permission === 'select_designations') {
            const designation_id = req.body.id;
            let where = {
                'designation_id': designation_id
            }
            const designation = await db.data('tbl_designations', where);
            return res.status(200).json(designation[0]);
        } else {
            const user_id = req.body.id;
            let where = {
                'tbl_users.user_id': user_id
            }
            const user = await db.data('tbl_users', where);
            return res.status(200).json(user[0]);
        }
    } catch (error) {
        return res.status(500).json({error: error.message || error.toString()});
    }
}

const getDesignationById = async (req, res) => {
    const db = new DB();
    try {
        const designation_id = req.body.id;
        let where = {
            'designation_id': designation_id
        }
        const designation = await db.data('tbl_designations', where);
        return res.status(200).json(designation[0]);
    } catch (error) {
        return res.status(500).json({error});
    }
}
const getUserById = async (req, res) => {
    const db = new DB();
    try {
        const user_id = req.body.id;
        let where = {
            'tbl_users.user_id': user_id
        }
        const user = await db.data('tbl_users', where);
        return res.status(200).json(user[0]);
    } catch (error) {
        return res.status(500).json({error});
    }
}
const getConfig = async (req, res) => {
    const db = new DB();
    try {
        const results = await db.get();
        const config = Object.assign({}, ...results.map(item => ({[item.config_key]: item.value})));
        return res.status(200).json(config);
    } catch (error) {
        return res.status(500).json({error});
    }
}

export const GetUsedContent = async (company_id) => {
    const db = new DB();
    const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const where = {
        company_id, month: monthYear
    }
    const results = await db.data('tbl_used_contents', where, {}, true);
    return results;
}
export const PackageInfo = async (company_id) => {
    const db = new DB();
    const where = {
        'tbl_companies.company_id': company_id, 'tbl_companies_history.active': 1,
    }
    const results = await db.data('tbl_companies', where, {
        tbl_companies_history: "tbl_companies_history.company_id = tbl_companies.company_id",
    }, true);
    return results;
}

export const checkBadWords = async (content) => {
    const config = await configItems();
    if (!content) return;
    const badWords = config?.NEXT_PUBLIC_BAD_WORDS.split(',');
    const badWordsRegex = new RegExp(badWords.join('|'), 'gi');
    const badWordsFound = content.match(badWordsRegex);
    return badWordsFound;
}
export const myDetailApi = async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    return session;
}
export const configItems = async (key) => {
    const db = new DB();
    db.table = 'tbl_config';
    db.primary_key = 'config_key';
    try {
        if (key) {
            const config = await db.getBy({config_key: key});
            return config.config_value;
        } else {
            const allConfig = await db.get();
            const config = {};
            allConfig.forEach(item => {
                config[item.config_key] = item.config_value;
            });
            return config;
        }
    } catch (error) {
        return error
    }
}


