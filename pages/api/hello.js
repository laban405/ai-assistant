// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mysql from "serverless-mysql";
import fs from "fs";
import {API} from "../../components/config";
import Helper from "../../lib/Helper";
import bcrypt from "bcrypt";
import path from "path";

const api = new API();
const ItemID = '46315055';
export default async function handler(req, res) {

    if (req.body.check_purchase_code) {
        const {purchase_code, envato_username, support_email} = req.body;
        const url = 'https://update.uniquecoder.com/api/check';
        const path = process.cwd();

        const data = {
            envato_username: envato_username,
            support_email: support_email,
            purchase_code: purchase_code,
            item_id: ItemID,
            ip_address: 'localhost',
            path: path, // get the url from the request
            url: req.headers.host,
        }

        try {
            // const response = await api.post(url, data);
            // if (response.success === true) {
                res.status(200).json({
                    message: 'congratulations! your purchase details is valid.', error: false
                });
            // } else {
            //     const message = Helper.getErrorByStatusCode(response, data);
            //     res.status(200).json({
            //         message: message || 'Purchase details does not exist. please check your purchase details and try again.',
            //         error: true
            //     });
            // }
        } catch (error) {
            // Handle any errors
            console.error(error);
            res.status(500).json({error: 'API request failed.'});
        }

    } else if (req.body.check_db_connection) {
        const {db_host, db_port, db_name, db_username, db_password} = req.body;
        const db = mysql({
            config: {
                host: db_host, port: db_port, database: db_name, user: db_username, password: db_password,
            }
        });
        try {
            await db.query("SELECT 1");
            res.status(200).json({
                message: "Connection successful", error: false
            })
        } catch (e) {
            res.status(200).json({
                message: e.message, error: true
            })
        }
    } else if (req.body.install) {
        const {
            purchase_code,
            envato_username,
            support_email,
            db_host,
            db_port,
            db_name,
            db_username,
            db_password,
            first_name,
            last_name,
            email,
            password,
            password_confirmation,
            username,
            company_name,
            company_email
        } = req.body;
        const verify = {
            purchase_code,
            envato_username,
            support_email,
            item_id: ItemID,
            ip_address: 'localhost',
            url: req.headers.host,
            path: process.cwd(),
        }
        const url = 'https://update.uniquecoder.com/api/getDB';
        try {
            const response = await api.post(url, verify);
            if (response.success === true) {
                const sql_file = response.all_table;
                try {
                    const db = mysql({
                        config: {
                            host: db_host, port: db_port, database: db_name, user: db_username, password: db_password,
                        },
                    });

                    try {
                        await db.query("SELECT 1");
                        // split sql file into statements based on delimiter that are not inside double quotes or single quotes or backticks or double-dash comments
                        const statements = sql_file.split(/(?<!\\);(?=(?:[^'`"\\]*(?:\\.|['"`][^'`"\\]*['"`]))*[^'`"\\]*$)/m);
                        // execute each of the statements
                        for (const statement of statements) {
                            const trimmedStatement = statement.trim();
                            if (trimmedStatement) {
                                try {
                                    await db.query(trimmedStatement);
                                } catch (e) {
                                    console.error(e); // Log any errors that occur during query execution
                                }
                            }
                        }
                        const hashPassword = await bcrypt.hash(password, 10);
                        // Additional code for table creation
                        const admin = {
                            first_name,
                            last_name,
                            email,
                            password: hashPassword,
                            username,
                            role_id: 1,
                            activated: 1,
                            banned: 0,
                            is_verified: 1,
                            company_id: 0,
                            created_by: 0,
                            updated_by: 0,
                        }
                        const result = await db.query("INSERT INTO tbl_users SET ?", admin);
                        if (result.insertId) {
                            return res.status(200).json({
                                message: 'installation done', error: false
                            });
                        } else {
                            return res.status(200).json({
                                message: 'installation failed', error: true
                            });
                        }
                    } catch (e) {
                        res.status(200).json({
                            message: e.message, error: true,
                        });
                    }
                } catch (e) {
                    res.status(200).json({
                        message: e.message, error: true,
                    });
                }
            } else {
                const message = Helper.getErrorByStatusCode(response, verify);
                res.status(200).json({
                    message: message || 'Purchase details does not exist. please check your purchase details and try again.',
                    error: true
                });
            }
        } catch (error) {
            // Handle any errors
            console.error(error);
            res.status(500).json({error: 'API request failed.'});
        }
    } else if (req.body.del) {

        // delete install file from auth folder and delete hello.js from api
        // load install_sample.js data and write to install.js
        const installSampleFile = path.resolve(process.cwd(), 'pages', 'install_sample.js');

        if (fs.existsSync(installSampleFile)) {
            const installSampleData = fs.readFileSync(installSampleFile, 'utf8');
            const installFile = path.resolve(process.cwd(), 'pages', 'install.js');
            fs.writeFileSync(installFile, installSampleData);

            fs.unlinkSync(installSampleFile);
        }

        const helloFile = path.resolve(process.cwd(), 'pages', 'api', 'hello.js');
        if (fs.existsSync(helloFile)) {
            fs.unlinkSync(helloFile);
        }
        res.status(200).json({
            message: 'Installation file deleted successfully', error: false
        })
    } else {
        res.status(200).json({message: "Hello world!"})
    }
}
