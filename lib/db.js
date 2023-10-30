import { configItems } from "../pages/api/admin/common";
import MySQL from "./mysql";
import nodemailer from "nodemailer";

class DB {
    table = "";
    primary_key = "";
    primary_field = "";
    order_by = "";
    select = "";
    #select = "";
    column_order = "";
    join_table = "";
    group_by = "";
    custom_fields = "";
    column_search = "";
    search_value = "";
    sql = "";
    db = "";
    menu_id = 0;
    where = "";
    dependency = {};
    more_table = "";


    constructor() {
        const dbProvider = process.env.DATABASE_PROVIDER;
        if (dbProvider === "mysql") {
            this.db = new MySQL();
        }
    }

    setTable() {
        this.db.table = this.table;
        this.db.primary_key = this.primary_key;
        this.db.primary_field = this.primary_field;
        this.db.order_by = this.order_by;
        this.db.select = this.select;
        this.db.column_order = this.column_order;
        this.db.join_table = this.join_table;
        this.db.group_by = this.group_by;
        this.db.custom_fields = this.custom_fields;
        this.db.column_search = this.column_search;
        this.db.search_value = this.search_value;
        this.db.sql = this.sql;
        this.db.menu_id = this.menu_id;
        this.db.where = this.where;
        this.db.dependency = this.dependency;
        this.db.more_table = this.more_table;
    }

    handler = async (req, res) => {
        try {
            if (req.body.tbl) {
                this.table = req.body.tbl;
                delete req.body.tbl;
            }
            if (req.body.primaryKey) {
                this.primary_key = req.body.primaryKey;
                delete req.body.primaryKey;
            }
            this.setTable();
            if (req.body.tableData) {
                delete req.body.tableData;
                return await this.db.getTable(req, res);
            } else if (req.body.GetResult) {
                delete req.body.GetResult;
                return await this.GetResult(req, res);
            } else if (req.body.getRows) {
                delete req.body.getRows;
                return await this.db.getRows(req, res);
            } else if (req.body.isSearch) {
                delete req.body.isSearch;
                return await this.db.searchData(req, res);
            } else if (req.body.getTotalRows) {
                delete req.body.getTotalRows;
                return await this.totalRows(req.body, res);
            } else if (req.body.getTotalSum) {
                delete req.body.getTotalSum;
                return await this.db.totalSum(req.body, res);
            } else if (req.body.getPermission) {
                delete req.body.getPermission;
                return await this.db.getPermission(req, res);
            } else if (req.body.allEmployeeEmails) {
                delete req.body.allEmployeeEmails;
                return await this.db.allEmployeeEmails(req, res);
            } else if (req.body.sendEmail) {
                delete req.body.sendEmail;
                return await this.SendEmail(req, res);
            } else if (req.body.getEmailTemplate) {
                delete req.body.getEmailTemplate;
                return await this.makeEmailTemplate(req, res);
            } else if (req.body.getInfo) {
                delete req.body.getInfo;
                return await this.db.getRow(req, res);
            } else if (req.body.total) {
                delete req.body.total;
                return await this.db.count(req, res);
            } else if (req.body.getPrefix) {
                if (req.body.value) {
                    req.body.prefix = req.body.value.prefix;
                    req.body.format = req.body.value.format;
                    req.body.number = req.body.value.number;
                }
                return await this.db.getPrefix(req, res);
            } else if (req.body.getUnique) {
                delete req.body.getUnique;
                if (req.body.editData) {
                    req.body.id = req.body.editData[this.db.primary_key];
                }
                return await this.db.unique(req, res);
            } else if (req.body.select) {
                delete req.body.select;
                return await this.db.getOptions(req, res);
            } else if (req.body.deleteAll) {
                delete req.body.deleteAll;
                return await this.db.deleteAll(req, res);
            } else if (req.body.DownloadZip) {
                delete req.body.DownloadZip;
                return await this.DownloadZip(req, res);
            } else if (req.method === "POST") {
                return await this.db.create(req, res);
            } else if (req.method === "PUT") {
                return await this.db.create(req, res, true);
            } else if (req.method === "DELETE") {
                return await this.db.deleteRow(req, res);
            } else {
                return res.status(405).json({message: "Method Not Allowed"});
            }
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }

    totalRows = async (body, res) => {
        try {
            const result = await this.db.totalRows(body);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }
    GetResult = async (req, res) => {
        try {
            const {where, row} = req.body;
            const result = await this.db.get(where, row);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }

    DownloadZip = async (req, res) => {
        const {where} = req.body;
        const result = await this.db.get(where);
        if (result.length > 0) {
            // get all the files
            const files = result.map((item) => {
                const attachments = item.attachments || item.attachment || item.file || item.files || item.images || item.image;
                // return item.attachments with json parse
                return JSON.parse(attachments);
            });
            // flatten the array
            const flattenFiles = [].concat.apply([], files);
            // get all the file paths
            const filePaths = flattenFiles.map((item) => {
                return item.fileUrl;
            });
            // get all the file names
            const fileNames = flattenFiles.map((item) => {
                return item.originalFilename;
            });
            // zip the files
            var AdmZip = require("adm-zip");
            var zip = new AdmZip();
            filePaths.forEach((filePath, index) => {
                zip.addLocalFile(`public/${filePath}`, "", fileNames[index]);
            });
            // get the zip as a buffer
            const willSendthis = zip.toBuffer();
            // send the file to the browser
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-disposition", "attachment; filename=attachments.zip");
            res.send(willSendthis);
        }


    }

    get = async (where) => {
        this.setTable();
        return await this.db.get(where);
    }
    getBy = async (where) => {
        this.setTable();
        return await this.db.getBy(where);
    }
    data = async (table, where, join, row, limit) => {
        return await this.db.data(table, where, join, row, limit);
    }
    save = async (data, id = null, onlyOne = null) => {
        this.setTable();
        return await this.db.save(data, id, onlyOne);
    }
    getRows = async (req, res) => {
        this.setTable();
        return await this.db.get(req, res);
    }
    setPrefix = async (props) => {
        let setPrefix = '';
        const {number, format, prefix} = props;
        if (format) {
            const date = new Date();
            setPrefix = format?.replace("[PREFIX]", prefix);
            setPrefix = setPrefix?.replace("[yyyy]", date.getFullYear());
            setPrefix = setPrefix?.replace("[yy]", date.getFullYear().toString().substr(-2));
            setPrefix = setPrefix?.replace("[mm]", (date.getMonth() + 1).toString().padStart(2, '0'));
            setPrefix = setPrefix?.replace("[m]", (date.getMonth() + 1));
            setPrefix = setPrefix?.replace("[dd]", date.getDate().toString().padStart(2, '0'));
            setPrefix = setPrefix?.replace("[d]", date.getDate());
            setPrefix = setPrefix?.replace("[number]", number);
        } else {
            setPrefix = number;
        }
        return setPrefix;
    }
    makeEmailTemplate = async (req, res) => {
        let {data, emailGroup, id, accessor, value} = req.body;
        if (!data) {
            data = await this.db.getBy(id);
        }
        const allTemplate = [];
        if (Array.isArray(emailGroup)) {
            for (const key in emailGroup) {
                let template = {};
                if (emailGroup[key]?.when === value) {
                    template = await this.emailTemplate(emailGroup[key].name);
                } else if (emailGroup[key]?.when == null) {
                    template = await this.emailTemplate(emailGroup[key].name);
                }
                if (emailGroup[key]?.to) {
                    template.sendTo = [];
                    const toList = emailGroup[key].to.split(",");
                    for (const toKey in toList) {
                        template.sendTo.push(data[toList[toKey]]);
                    }
                } else {
                    const allEmployeeEmails = await this.db.allEmployeeEmails(req, res);
                    template.sendTo = allEmployeeEmails;
                }
                allTemplate.push(template);
            }
        } else {
            const template = await this.emailTemplate(emailGroup);
            allTemplate.push(template);
        }
        return allTemplate;
    }

    emailTemplate = async (emailGroup) => {
        const where = {
            email_group: emailGroup, code: 'en', active: 1
        }
        return await this.db.data('tbl_email_templates', where, null, 'row');
    }
    SendEmail = async (req, res) => {
        const config = await configItems();

        try {
            let {emailBody, template, emailGroup, id, accessor, value, sendTo, attachments,} = req.body;
            let response = {};
            if (template) {
                response = await this.sendMail(template);
            } else {
                const allTemplate = await this.makeEmailTemplate(req, res);
                // set email  body data into all template
                for (const template of allTemplate) {
                    let body = template.message;
                    let subject = template.subject;
                    for (const key in emailBody) {
                        let value = emailBody[key].value;
                        if (emailBody[key].link) {
                            value = `${config.BASE_URL}/admin/${emailBody[key].value}`;
                            if (emailBody[key].client && template.send_to === 'client') {
                                value = `${config.BASE_URL}/client/${emailBody[key].value}`;
                            }
                        }
                        body = body.replace(`{${emailBody[key].key}}`, value);
                        subject = subject.replace(`{${emailBody[key].key}}`, value);
                    }
                    template.message = body;
                    template.subject = subject;
                    response = await this.sendMail(template);
                }
            }
            return res.status(200).json(response);
        } catch (e) {
            return res.status(500).json(e);
        }
    }
    sendMail = async (template, emails = null) => {
        const config = await configItems();

        try {
            const transporter = nodemailer.createTransport({
                host: config.NEXT_PUBLIC_SMTP_HOST,
                port: config.NEXT_PUBLIC_SMTP_PORT,
                secure: config.NEXT_PUBLIC_SMTP_SECURE, // true for 465, false for other ports
                auth: {
                    user: config.NEXT_PUBLIC_SMTP_USERNAME, // generated ethereal user
                    pass: config.NEXT_PUBLIC_SMTP_PASSWORD // generated ethereal password
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false,
                },
            });
            let sendFrom = template.send_from;
            sendFrom?.replace(`{COMPANY_NAME}`, config.NEXT_PUBLIC_COMPANY_EMAIL);
            const mailOptions = {
                from: sendFrom ? sendFrom : config.NEXT_PUBLIC_COMPANY_EMAIL || config.NEXT_PUBLIC_SMTP_USERNAME, // sender address
                to: template?.sendTo || emails, // list of receivers
                subject: template.subject, // Subject line
                html: template?.message ? template.message : template.body, // html body
                attachments: template.attachments ? template.attachments : []  // attachments: [{ filename: 'profile.png', path: './images/profile.png' }]
            }
            const result = await transporter.sendMail(mailOptions);
            if (result.accepted.length > 0) {
                return {
                    status: true, message: 'Email sent successfully',
                }
            } else {
                const error = result?.response?.toString();
                return {
                    status: false, message: 'Email not sent', error: error
                }
            }
        } catch (e) {
            const error = e?.response?.toString();
            return {
                status: false, message: 'Email not sent', error: error
            };
        }

    }
}

export default DB;

