import DB from "../../../lib/db";
import * as fs from "fs";

const db = new DB();
db.table = 'tbl_projects';
db.primary_key = 'projects_id';
db.select = ['tbl_projects.*', 'tbl_clients.name as client_name'];
db.join_table = {"tbl_clients": "tbl_projects.client_id = tbl_clients.client_id"}
db.column_search = ['tbl_projects.project_name', 'tbl_clients.name', 'tbl_projects.start_date', 'tbl_projects.end_date', 'tbl_projects.description'];

export default async function handler(req, res) {
    if (req.body.table) {
        return await db.getTable(req, res);
    } else if (req.body.edit) {
        return await db.getRow(req, res);
    } else if (req.body.getPrefix) {
        return await db.getPrefix(req, res);
    } else if (req.body.getUnique) {
        return await db.unique(req, res);
    } else if (req.body.deleteAll) {
        return await db.deleteAll(req, res);
    } else if (req.method === "POST") {
        return await db.updateConfig(req, res);
    } else if (req.method === "PUT") {
        return await db.create(req, res, true);
    } else if (req.method === "DELETE") {
        return await db.deleteRow(req, res);
    } else {
        return updateConfig(req, res);
    }
    return res.status(400).json({message: "Bad Request"});
}
const updateConfig = async (req, res) => {
    try {
        // update project_number_format from .env file
        const input = {
            NEXT_PUBLIC_PROJECT_NUMBER_FORMAT: '[yyyy]-[mm]-[number]-[PREFIX]',
            NEXT_PUBLIC_PROJECT_PREFIX: 'PROJ',
            INVOICE_NUMBER_FORMAT: '[yyyy]-[mm]-[number]-[PREFIX]',
            INVOICE_PREFIX: 'INV',
            ESTIMATE_NUMBER_FORMAT: '[yyyy]-[mm]-[number]-[PREFIX]',
            ESTIMATE_PREFIX: 'EST',
            PROPOSAL_NUMBER_FORMAT: '[yyyy]-[mm]-[number]-[PREFIX]',
            PROPOSAL_PREFIX: 'PRO',
            QUOTE_NUMBER_FORMAT: '[yyyy]-[mm]-[number]-[PREFIX]',
            QUOTE_PREFIX: 'QUO',
        }
        let env = fs.readFileSync(".env", "utf8");
        // update all input value into .env file
        Object.keys(input).forEach(key => {
            // not exist key into .env file then add it otherwise update it
            if (env.indexOf(key) === -1) {
                // add new key into .env file with value with break line
                env += `${key}=${input[key]}${env[env.length - 1] === "\n" ? "\n" : "\r\n"}`;
                // env += `${key}=${input[key]}${key === Object.keys(input)[Object.keys(input).length - 1] ? "" : "\n"}`;
            } else {
                env = env.replace(new RegExp(`${key}=(.*)`), `${key}=${input[key]}`);
            }
        });
        fs.writeFileSync(".env", env);
        // const newEnv = env.replace(/PROJECT_NUMBER_FORMAT=.*\n/, `PROJECT_NUMBER_FORMAT=${project_number_format} \n`);
        // fs.writeFileSync(".env", newEnv);
        return res.status(200).json({message: "Project number format updated successfully"});
    } catch (error) {
        return res.status(500).json({error});
    }
}