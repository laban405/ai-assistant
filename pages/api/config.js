import DB from "../../lib/db";
import {myDetailApi} from "./admin/common";


const db = new DB();
db.table = 'tbl_config';
db.primary_key = 'config_key';
db.primary_field = 'config_key';
// select 1  column from table tbl_config
db.select = ['config_key', 'config_value'];


export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const {getConfig, input, key} = req.body;
            if (getConfig) {
                try {
                    if (key) {
                        const config = await db.getBy({config_key: key});
                        if (key) {
                            return res.status(200).json(config.config_value);
                        }
                        return res.status(200).json(config);
                    } else {
                        const allConfig = await db.get();
                        const config = {};
                        allConfig.forEach(item => {
                            config[item.config_key] = item.config_value;
                        });
                        return res.status(200).json(config);
                    }
                } catch (error) {
                    return res.status(500).json({error: error.message || error.toString()});
                }
            } else {
                const session = await myDetailApi(req, res);

                if (!session) {
                    return res.status(200).json({
                        error: {
                            message: "Unauthorized",
                        }
                    });
                } else if (session?.user?.role_id === 1) {

                    const input = req.body;
                    // delete object key name is last word is _deleted
                    Object.keys(input).forEach(key => {
                        if (key.split("_").pop() === "deleted") {
                            delete input[key];
                        }
                        const config_key = key;
                        const config_value = input[key];

                        // check config_key is exist into tbl_config table or not if not exist then insert it otherwise update it
                        db.getBy({config_key}).then(async config => {
                            if (config) {
                                // update config_value into tbl_config table
                                await db.save({config_value}, {config_key});
                            } else {
                                // insert config_key and config_value into tbl_config table
                                await db.save({config_key, config_value});
                            }
                        });
                    });
                    return res.status(200).json({affectedRows: 1});
                } else {
                    return res.status(200).json({
                        error: {
                            message: "You are not allowed to access this page",
                        }
                    });
                }
            }
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    } else {
        return res.status(405).json({error: "Method not allowed"});
    }
}