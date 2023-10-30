import mysql from "serverless-mysql";
import {myDetailApi} from "../pages/api/admin/common";


const database = mysql({
    config: {
        host: process.env.NEXT_PUBLIC_MYSQL_HOST,
        user: process.env.NEXT_PUBLIC_MYSQL_USER,
        password: process.env.NEXT_PUBLIC_MYSQL_PASSWORD,
        port: process.env.NEXT_PUBLIC_MYSQL_PORT,
        database: process.env.NEXT_PUBLIC_MYSQL_DB_NAME, // prevent too many connections
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0, // debug: true,
    },
});

class MySQL {
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
    #search_value = "";
    #sql = "";
    menu_id = 0;
    where = "";
    dependency = {};
    more_table = "";
    limit = null;
    #makeQuery = async (where = null, whereIn = null, limit = null) => {
        this.#sql = "";
        if (this.select) {
            for (let i = 0; i < this.select.length; i++) {
                if (i === 0) {
                    this.#sql += `SELECT ${this.select[i]}`;
                } else {
                    this.#sql += `, ${this.select[i]}`;
                }
            }
        } else {
            this.#sql += `SELECT *`;
        }
        this.#sql += ` FROM ${this.table}`;
        if (this.join_table) {
            for (let key in this.join_table) {
                this.#sql += ` LEFT JOIN ${key} ON ${this.join_table[key]}`;
            }
        }
        if (this.column_search) {
            if (this.#search_value) {
                this.#sql += ` WHERE`;
                for (let i = 0; i < this.column_search.length; i++) {
                    if (i === 0) {
                        // group_start
                        this.#sql += ` (`;
                        this.#sql += ` ${this.column_search[i]} LIKE '%${this.#search_value}%'`;
                    } else {
                        this.#sql += ` OR ${this.column_search[i]} LIKE '%${this.#search_value}%'`;
                    }
                    if (i === this.column_search.length - 1) {
                        // group_end
                        this.#sql += ` )`;
                    }
                }
            } else {
                this.#search_value = "";
            }
        }

        if (where) {
            if (this.#search_value) {
                this.#sql += ` AND ${where}`;
            } else {
                this.#sql += ` WHERE ${where}`;
            }
        }
        if (whereIn) {
            if (where) {
                this.#sql += ` AND ${whereIn}`;
            } else {
                if (this.#search_value) {
                    this.#sql += ` AND ${whereIn}`;
                } else {
                    this.#sql += ` WHERE ${whereIn}`;
                }
            }
        }

        if (this.group_by) {
            this.#sql += ` GROUP BY ${this.group_by}`;
        }

        if (this.order_by) {
            // check if order_by is an object or string
            if (typeof this.order_by === "object") {
                for (let key in this.order_by) {
                    this.#sql += ` ORDER BY ${key} ${this.order_by[key]}`;
                }
            } else if (typeof this.order_by === "string") {
                this.#sql += ` ORDER BY ${this.order_by}`;
            } else {
                this.#sql += ` ORDER BY ${this.primary_key} DESC`;
            }
        }
        if (limit) {
            this.#sql += ` LIMIT ${limit}`;
        }
    }
    #makeWhere = (where = null, query = null) => {
        // check where is parseInt or string
        if (parseInt(where) > 0) {
            where = `${this.primary_key} = ${where}`;
        } else if (where) {
            let where_sql = "";
            if (where?.puser_id && where?.puser_id !== "") {
                const user_id = where.puser_id;
                const designation_id = where.pdesignation_id;
                // group_start
                where_sql += ` (`;
                // permission == all,select_individual_people,select_designations
                // permission_value == all == all
                // permission_value == select_individual_people == 1,2,3,4,5
                // permission_value == select_designations == 1,2,3,4,5
                where_sql += ` permission = 'all'`;
                if (user_id) {
                    where_sql += ` OR (permission = 'select_individual_people' AND FIND_IN_SET(${user_id},permission_value))`;
                }
                if (designation_id) {
                    where_sql += ` OR (permission = 'select_designations' AND FIND_IN_SET(${designation_id},permission_value))`;
                }
                // group_end
                where_sql += ` )`;
            } else {
                // check if where is an object and not empty
                for (let key in where) {
                    // object have not_equal key
                    if (where.where) {
                        // delete not_equal key from where object
                        for (let key in where.where) {
                            if (where_sql === "") {
                                where_sql += `${key} '${where.where[key]}'`;
                            } else {
                                where_sql += ` AND ${key} '${where.where[key]}'`;
                            }
                        }
                        delete where.where;
                    }

                    // if key is 'where' then skip
                    if (key === "where") {
                        continue;
                    }

                    if (where_sql === "") {
                        where_sql += `${key} = '${where[key]}'`;
                    } else {
                        where_sql += ` AND ${key} = '${where[key]}'`;
                    }
                }
            }
            where = where_sql;
        }
        if (query) {
            this.#makeQuery(where);
        }
        return where;
    }
    #makeWhereIn = (whereIn = null, query = null) => {
        let where_in_sql = "";
        if (whereIn) {
            for (let key in whereIn) {
                if (where_in_sql === "") {
                    where_in_sql += `${key} IN ('${whereIn[key].join("','")}')`
                } else {
                    where_in_sql += ` AND ${key} IN ('${whereIn[key].join("','")}')`
                }
            }
        }
        if (query) {
            this.#makeQuery(null, whereIn);
        }
        return where_in_sql;
    }
    #limit = (start, length) => {
        this.#sql += ` LIMIT ${start}, ${length}`;
    }
    #pagination = (page, total, per_page) => {
        const pagination = [];
        let start = 1;
        for (let i = 0; i < total; i += per_page) {
            if (page === start) {
                pagination.push({
                    title: start, active: true, page: start
                });
            } else {
                pagination.push({
                    title: start, page: start, active: false
                });
            }
            start++;
        }
        for (let i = pagination.length - 3; i > 1; i--) {
            if (Math.abs(page - i - 1) > 2) {
                pagination.splice(i, 1);
            }
        }
        if (pagination.length > 1) {
            if (page > 1) {
                pagination.unshift({
                    title: "Previous", page: page - 1, disable: false,
                });
            } else {
                pagination.unshift({
                    title: "Previous", page: page, disable: true,
                });
            }

            let last = 0;
            let pageTotal = start - 1;
            for (let i = 0; i < pageTotal; i++) {
                if (i > last + 1) {
                    pagination.splice(i, 0, {
                        page: "...", active: false, title: "...",
                    });
                }
                last = i;
            }
            if (page <= last) {
                pagination.push({
                    title: "Next", page: page + 1, disable: false,
                });
            } else {
                pagination.push({
                    title: "Next", page: page, disable: true,
                });
            }
            return pagination;
        }

    }
    get = async (where = null, row = null) => {
        this.#makeWhere(where, true);
        const results = await database.query(this.#sql);
        await database.end();
        this.#sql = "";
        if (row !== null && row !== 'res') {
            return results[0];
        } else if (row === null) {
            return results;
        }
        try {
            return row.status(200).json(results);
        } catch (e) {
            return row.status(500).json({message: e.message});
        }
    }
    getBy = async (where = null) => {
        return this.get(where, true);
    }
    save = async (data, id = null, onlyOne = null) => {
        // check if table name have space or have
        await this.getTableIfAs();
        if (id) {
            if (onlyOne) {
                this.#sql = `UPDATE ${this.table} SET ? WHERE ${this.primary_key} != ${id}`;
                await database.query(this.#sql, onlyOne);
                await database.end();
                this.#sql = "";
            }
            const where = await this.#makeWhere(id);
            this.#sql = `UPDATE ${this.table} SET ? WHERE ${where}`;
        } else {
            this.#sql = `INSERT INTO ${this.table} SET ?`;
        }
        const results = await database.query(this.#sql, data);
        await database.end();
        return results;
    }
    checkDependency = async (id) => {

        const dependency = [];
        for (let key in this.dependency) {
            const sql = `SELECT ${this.dependency[key]}
                         FROM ${key}
                         WHERE ${this.dependency[key]} = ${id} LIMIT 1`;
            const results = await database.query(sql);
            await database.end();
            if (results.length > 0) {
                dependency.push(results);
            }
        }
        return dependency;
    }
    getTableIfAs = async () => {
        if (this.table.indexOf(" ") !== -1) {
            // split table name by space
            const table = this.table.split(" ");
            // get first index of table name
            this.table = table[0];
        }
        // check if primary key have table name
        if (this.primary_key.indexOf(".") !== -1) {
            // split primary key by dot
            const primary_key = this.primary_key.split(".");
            // get second index of primary key
            this.primary_key = primary_key[1];
        }
    }
    delete = async (id) => {
        if (this.dependency) {
            const dependency = await this.checkDependency(id);
            if (dependency.length > 0) {
                return {
                    status: false, message: "This record is in use by another record.",
                };
            }
        }
        await this.getTableIfAs();
        this.#sql = `DELETE FROM ${this.table}`;
        const where = this.#makeWhere(id);
        this.#sql += ` WHERE ${where}`;
        const results = await database.query(this.#sql);
        await database.end();
        return {
            status: true, message: "Record deleted successfully.",
        }
    }
    #countSql = (where = null, whereIn = null) => {
        this.#sql = `SELECT COUNT(*) AS count FROM ${this.table}`;

        if (this.join_table) {
            for (let key in this.join_table) {
                this.#sql += ` LEFT JOIN ${key} ON ${this.join_table[key]}`;
            }
        }

        if (where) {
            where = this.#makeWhere(where);
            if (where) {
                this.#sql += ` WHERE ${where}`;
            }
        }
        if (whereIn) {
            whereIn = this.#makeWhereIn(whereIn);
            if (where) {
                this.#sql += ` AND ${whereIn}`;
            } else {
                this.#sql += ` WHERE ${whereIn}`;
            }
            // this.#sql += ` WHERE ${whereIn}`;
        }

        return this.#sql;
    }
    count = async ({where = null, whereIn = null, limit = null}) => {
        this.#sql = this.#countSql(where, whereIn);
        if (limit) {
            this.#sql += ` LIMIT ${limit}`;
        }
        const res = await database.query(this.#sql);
        await database.end();
        this.#sql = "";
        return res[0].count;
    }


    sum = async ({where = null, whereIn = null, field = null}) => {
        this.#sql = `SELECT SUM(${field}) AS sum FROM ${this.table}`;
        if (where) {
            where = this.#makeWhere(where);
            if (where) {
                this.#sql += ` WHERE ${where}`;
            }
        }
        if (whereIn) {
            whereIn = this.#makeWhereIn(whereIn);
            if (where) {
                this.#sql += ` AND ${whereIn}`;
            } else {
                this.#sql += ` WHERE ${whereIn}`;
            }
        }
        const res = await database.query(this.#sql);
        await database.end();
        this.#sql = "";
        return res[0].sum;
    }
    totalSum = async (req, res) => {
        try {
            const {where, whereIn, field} = req;
            // make where sql for all post
            let totalData = {};
            // check if field is object or not
            if (typeof field === "object") {
                for (const key of Object.keys(field)) {
                    const {where} = field[key];
                    totalData[key] = await this.sum({where, whereIn, field: field[key].field}) || 0;
                }
            } else {
                totalData = await this.sum({where, whereIn, field}) || 0;
            }
            res.status(200).json(totalData);
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    }
    totalRows = async (res) => {
        const where = res.where;
        const limit = res.limit || null;

        // make where sql for all post
        //  where all = all rows of table
        //  where in_progress = all rows of table where status = in_progress
        //  where on_hold = all rows of table where status = on_hold
        //  where completed = all rows of table where status = completed
        //  where canceled = all rows of table where status = canceled
        // return total rows of table according to where
        let totalData = {};
        if (where) {
            const values = Object.values(where);
            // check values is object or not
            if (typeof values[1] === "object") {
                for (let key in where) {
                    totalData[key] = await this.count({where: where[key], limit});
                }
            } else {
                totalData['all'] = await this.count({where, limit});
            }
        } else {
            totalData = await this.count({limit});
        }
        return totalData;
    }
    unique = async (req, res) => {
        try {
            const {field, value, oldValue, id} = req.body;
            let sql = `SELECT COUNT(*) AS count
                       FROM ${this.table}
                       WHERE ${field} = '${value}'`;
            if (id) {
                sql += ` AND ${this.primary_key} != ${id}`;
            } else if (oldValue) {
                sql += ` AND ${field} != '${oldValue}'`;
            }

            const results = await database.query(sql);
            await database.end();
            const data = {
                status: '', message: '',
            }
            if (results[0].count > 0) {
                data.status = "error";
                data.message = `The ${field} already exists`;
            } else {
                data.status = "success";
                data.message = `the ${field} is available.`;
            }
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({error: e});
        }
    }
    countTable = async (where, whereIn) => {
        if (this.select) {
            this.#select = this.select;
            this.select = ["COUNT(*) AS count"];
        } else {
            this.select = ["COUNT(*) AS count"];
        }
        if (this.#search_value) {
            this.#makeWhere(where, true);
        } else {
            this.#sql = this.#countSql(where, whereIn);
        }
        const results = await database.query(this.#sql);
        await database.end();
        if (this.#select) {
            this.select = this.#select;
            this.#select = null;
        } else {
            this.select = null;
        }
        this.#sql = "";
        return results[0].count;
    }
    mTable = async (params) => {
        const {page = 1, limit, filter, sortField, order, where, whereIn} = params;
        if (sortField) {
            this.order_by = sortField + " " + order;
        }
        if (filter !== "") {
            this.#search_value = filter;
        } else {
            this.#search_value = "";
        }
        // convert to int process.env.tables_pagination_limit
        const per_page = limit ? parseInt(limit) : parseInt(process.env.tables_pagination_limit) || 10;
        let getWhere = null;
        let whereTest = null;
        if (where) {
            getWhere = this.#makeWhere(where);
        }
        let getWhereIn = null;
        if (whereIn) {
            getWhereIn = this.#makeWhereIn(whereIn);
        }
        const total = await this.countTable(where, whereIn);

        this.#sql = "";
        const totalData = await this.count({
            where, whereIn
        });
        this.#sql = "";
        const pages = Math.ceil(total / per_page);
        const start = (page - 1) * per_page;
        await this.#makeQuery(getWhere, getWhereIn);
        this.#limit(start, per_page);
        const mysql = this.#sql;
        const results = await database.query(this.#sql);
        await database.end();
        this.#sql = "";
        // showing 1 to 15 of 15 entries
        let showing = `Showing ${start + 1} to ${start + results.length} of ${total} entries`;
        if (this.#search_value) {
            // (filtered from 5 Total Entries)
            showing += ` (filtered from ${totalData} Total Entries)`;
        }
        const pagination = this.#pagination(page, total, per_page);
        return {
            total, // total rows
            per_page, //
            page, // current page
            pages,// total pages
            showing, // showing 1 to 15 of 15 entries
            pagination, // pagination list of page numbers
            results, mysql
        }
    }
    selectField = async (params) => {
        let {table, select, where} = params;
        if (!table) {
            table = this.table;
        }
        let sql = `SELECT ${select}
                   FROM ${table}`;
        if (where) {
            where = this.#makeWhere(where);
            sql += ` WHERE ${where}`;
        }
        const results = await database.query(sql);
        await database.end();
        return results[0][select];
    }
    selectData = async (params) => {
        let {table, id, value = null, where = null, join = null, order_by = null, array = null} = params;
        this.#sql = '';
        let select = `SELECT ${id}`;
        if (value) {
            select += `, ${value}`;
        }
        this.#sql += select;
        this.#sql += ` FROM ${table}`;
        if (join) {
            for (const [tbl, wh] of Object.entries(join)) {
                this.#sql += ` LEFT JOIN ${tbl} ON ${wh}`;
            }
        }
        if (where) {
            where = this.#makeWhere(where);
            if (where) {
                this.#sql += ` WHERE ${where}`;
            }
        }
        if (order_by) {
            this.#sql += ` ORDER BY ${order_by}`;
        }

        const results = await database.query(this.#sql);
        await database.end();
        if (array) {
            return results;
        }
        if (id.includes(".")) {
            id = id.split(".")[1];
        }
        if (value.includes(".")) {
            value = value.split(".")[1];
        }
        let options = []
        for (const row of results) {
            if (Array.isArray(value)) {
                // if value is array then join first_name and last_name
                let label = "";
                for (const val of value) {
                    if (val === 'percentage') {
                        label += `| ${row[val]}%`;
                    } else {
                        label += `${row[val]} `;
                    }
                }
                options.push({
                    key: `value${row[id]}`, label: label, value: row[id],
                });
            } else {
                options.push({
                    key: `value${row[id]}`, label: row[value], value: row[id],
                });
            }
        }
        return options;
    }

    getDepartmentDesignation = async () => {
        const params = {
            table: 'tbl_departments', key: 'deptname', id: 'designation_id', value: 'designation', where: null, join: {
                'tbl_designations': 'tbl_departments.department_id = tbl_designations.department_id',
            }
        }
        const results = await this.selectGroupData(params);
        return results;
    }
    allEmployee = async (param) => {
        const {menu_id, dropdwon = null} = param;
        // make where condition from tbl_users where role_id != 2 and active = 1
        let where = {
            'tbl_users.activated': 1, where: {
                'tbl_users.role_id !=': 2,
            }
        }
        if (menu_id) {
            where['tbl_user_role.menu_id'] = `${menu_id}`;
        }
        const params = {
            table: 'tbl_users',
            key: 'tbl_designations.designation',
            id: 'tbl_users.user_id',
            value: 'tbl_users.first_name,tbl_users.last_name',
            where: where,
            join: {
                'tbl_designations': 'tbl_users.designation_id = tbl_designations.designation_id',
                'tbl_user_role': 'tbl_users.designation_id = tbl_user_role.designation_id',
            }
        }
        try {
            const results = await this.selectGroupData(params);
            return results;
        } catch (e) {
            return e;
        }
    }
    selectGroupData = async (params) => {
        let {table, key, id, value, where = null, join = null} = params;
        this.#sql = '';
        this.#sql += `SELECT ${id},${value},${key}`;
        this.#sql += ` FROM ${table}`;
        if (join) {
            for (const [tbl, wh] of Object.entries(join)) {
                this.#sql += ` LEFT JOIN ${tbl} ON ${wh}`;
            }
        }
        if (where) {
            where = this.#makeWhere(where);
            if (where) {
                this.#sql += ` WHERE ${where}`;
            }
        }
        const results = await database.query(this.#sql);
        await database.end();
        if (id.includes(".")) {
            id = id.split(".")[1];
        }
        if (value.includes(".")) {
            // tbl_users.first_name,tbl_users.last_name
            // get first_name and last_name from value
            // check if value has comma
            if (value.includes(",")) {
                value = value.split(",");
                // remove tbl_users from tbl_users.first_name, tbl_users.last_name
                for (let i = 0; i < value.length; i++) {
                    if (value[i].includes(".")) {
                        value[i] = value[i].split(".")[1];
                    }
                }
            } else {
                value = value.split(".")[1];
            }
        }
        if (key.includes(".")) {
            key = key.split(".")[1];
        }
        let groupedOptions = [];
        // multi level loop
        for (const row of results) {
            let group = groupedOptions.find(group => group.label === row[key]);
            if (!group) {
                group = {
                    label: row[key], key: `group${row[key]}`, options: [],
                };
                groupedOptions.push(group);
            }
            if (Array.isArray(value)) {
                // if value is array then join first_name and last_name
                let label = "";
                for (const val of value) {
                    label += row[val] + " ";
                }
                group.options.push({
                    key: `value${row[id]}`, label: label, value: row[id],
                });
            } else {
                group.options.push({
                    key: `value${row[id]}`, label: row[value], value: row[id],
                });
            }
        }
        return groupedOptions;
    }
    data = async (table = null, where = null, join = null, row = null, limit) => {
        if (!table) {
            table = this.table;
        }
        this.#sql = '';
        this.#sql += `SELECT *
                      FROM ${table}`;
        if (join) {
            for (const [tbl, wh] of Object.entries(join)) {
                this.#sql += ` LEFT JOIN ${tbl} ON ${wh}`;
            }
        }
        if (where) {
            where = this.#makeWhere(where);
            if (where) {
                this.#sql += ` WHERE ${where}`;
            }
        }
        if (limit) {
            this.#sql += ` LIMIT ${limit}`;
        }
        const results = await database.query(this.#sql);
        await database.end();
        if (row) {
            return results[0];
        }
        return results;
    }
    query = async (sql) => {
        const result = await database.query(sql);
        await database.end();
        return result;
    }
    getTable = async (req, res) => {
        try {
            const where = req.body.where;
            if (where?.permission) {
                if (where.permission === 'my') {
                    const session = await myDetailApi(req, res);
                    ;where.puser_id = session?.user?.user_id;
                    where.pdesignation_id = session?.user?.designation_id;
                } else {
                    // user:1, department:2, all:3
                    // get user id from user:1
                    const permission = where.permission.split(":");
                    if (permission[0] === 'user') {
                        where.puser_id = permission[1];
                        where.pdesignation_id = await this.selectField({
                            table: 'tbl_users', where: {user_id: permission[1]}, select: 'designation_id'
                        });
                    }
                }
                delete where.permission;
            }
            const results = await this.mTable(req.body);
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }

    create = async (req, res, update = null) => {
        try {
            let id = null;
            let onlyOne = null;
            let dependency = null;
            if (update) {
                id = req.body.edit_id;
                if (req.body.onlyOne) {
                    onlyOne = req.body.onlyOne;
                    delete req.body.onlyOne;
                }
                if (req.body.dependency) {
                    dependency = req.body.dependency; //  {field: 'user_id', value: 1}
                    const where = this.#makeWhere(dependency);
                    const sql = `SELECT ${this.primary_key}
                                 FROM ${this.table}
                                 WHERE ${where} LIMIT 1`;
                    const results = await database.query(sql);
                    await database.end();
                    if (results.length) {
                        const fid = results[0][this.primary_key];
                        if (fid) {
                            const isDependent = await this.checkDependency(fid);
                            if (isDependent.length > 0) {
                                return res.status(200).json({
                                    status: false,
                                    message: `There is dependent on other table. Delete the dependency first.`
                                });
                            }
                        }
                    }
                    delete req.body.dependency;
                }
                delete req.body.edit_id;
            }

            // if (req.body.password) {
            //     // req.body.password = await bcrypt.hash(req.body.password, 10);
            // }

            let moreTableData = [];

            if (this.more_table) {
                const moreTable = this.more_table;
                moreTable.forEach((allData, index) => {
                    const {table, field, fieldArray, primaryKey, insertKey, deletedField, updateTo} = allData;
                    if (req.body.deleteField) {
                        const deleteField = req.body.deleteField || [];
                        delete req.body.deleteField;
                        JSON.parse(deleteField).forEach((fieldData, key) => {
                            this.table = table;
                            this.primary_key = primaryKey;
                            for (let [key, value] of Object.entries(fieldData)) {
                                if (key === primaryKey) {
                                    this.delete(value);
                                }
                            }
                            this.table = null;
                            this.primary_key = null;
                        });
                    }
                    // check if field value is null
                    // if null then set it from req.body
                    const data = {
                        table, primaryKey, insertKey, updateTo, data: []
                    };
                    if (fieldArray) {
                        const fieldArrayData = req.body[fieldArray] || [];
                        if (fieldArrayData.length > 0) {
                            JSON.parse(fieldArrayData).forEach((fieldData, key) => {
                                const multiData = {};
                                // if fieldData value is array then json encode it and set it to data.data
                                for (let [key, value] of Object.entries(fieldData)) {
                                    if (Array.isArray(value)) {
                                        value = JSON.stringify(value);
                                    }
                                    multiData[key] = value;
                                }
                                data.data.push(multiData);
                            });
                        }
                    }
                    if (field) {
                        const fd = {};
                        for (const [key, value] of Object.entries(field)) {
                            if (value === null) {
                                // data.data[key] = req.body[key];
                                fd[key] = req.body[key];
                            }
                            // check value is string and start with # then get the value from req.body
                            else if (typeof value === 'string' && value.toString().startsWith('#')) {
                                const val = value.toString().replace('#', '');
                                // data.data[key] = req.body[val];
                                fd[key] = req.body[val];
                            } else {
                                // data.data[key] = value;
                                fd[key] = value;
                            }
                        }
                        data.data.push(fd);
                    }
                    if (deletedField) {
                        // delete the field from req.body according to deletedField array value
                        for (const field of deletedField) {
                            delete req.body[field];
                        }
                    }
                    moreTableData.push(data);
                });
            }
            if (req.body.deleteField) {
                delete req.body.deleteField;
            }

            let results = null;
            // check this.table is empty or not
            if (this.table && Object.keys(req.body).length > 0) {
                // if onlyOne is true then update other data except id
                results = await this.save(req.body, id, onlyOne);
            }
            if (moreTableData.length > 0) {
                for (const data of moreTableData) {
                    this.table = data.table;
                    this.primary_key = data.primaryKey;
                    let moreId = null;
                    let AllData = data.data;

                    for (const [key, value] of Object.entries(AllData)) {
                        // update insertKey value in data.data
                        if (data.insertKey) {
                            value[data.insertKey] = results?.insertId || id;
                        }
                        // check primary key is exist or not in data
                        // if exist then update the data
                        // else insert the data
                        if (value[data.primaryKey]) {
                            moreId = value[data.primaryKey];
                            await this.save(value, value[data.primaryKey]);
                        } else {
                            const saved = await this.save(value);
                            moreId = saved.insertId;
                        }
                        if (data.updateTo) {
                            const {table, primaryKey, field} = data.updateTo;
                            this.table = table;
                            this.primary_key = primaryKey;

                            const updateData = {};
                            updateData[field] = moreId;
                            await this.save(updateData, results?.insertId || id);
                        }
                    }
                }
            }
            if (results) {
                return res.status(200).json(results);
            } else {
                return res.status(200).json({affectedRows: 1});
            }
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    getRows = async (req, res) => {
        try {
            const {
                table,
                select,
                join_table,
                column_search,
                search_value,
                group_by,
                order_by,
                where,
                whereIn,
                array,
                include,
                limit,
            } = req.body;

            this.table = table || this.table;
            if (include) {
                this.select = select || '*';
                this.group_by = group_by || '';
                this.order_by = order_by || '';
            } else {
                this.select = select || this.select;
                this.group_by = group_by || this.group_by;
                this.order_by = order_by || this.order_by;
            }

            this.join_table = join_table || this.join_table;
            this.column_search = column_search || this.column_search;
            this.#search_value = search_value;
            let getWhere = null;
            let getWhereIn = null;
            if (where) {
                getWhere = this.#makeWhere(where);
            }

            if (whereIn) {
                getWhereIn = this.#makeWhereIn(whereIn);
            }
            await this.#makeQuery(getWhere, getWhereIn, limit);
            const results = await database.query(this.#sql);
            await database.end();
            if (array) {
                return results;
            }
            this.#sql = '';
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    getRow = async (req, res) => {
        const {id, array} = req.body;
        try {
            const results = await this.getBy(id);
            if (array) {
                return results;
            }
            return res.status(200).json(results);
        } catch (error) {
            if (array) {
                return [];
            }
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    deleteAll = async (req, res) => {
        try {
            const {id} = req.body;
            let results = '';
            for (let i = 0; i < id.length; i++) {
                results = await this.delete(id[i]);
            }
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    deleteRow = async (req, res) => {
        try {
            const {id, where} = req.body;
            const results = await this.delete(id, where);
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    getOptions = async (req, res) => {
        const value = (req.body.value) ? req.body.value : (req.body.label) ? req.body.label : this.primary_field;
        try {
            const params = {
                table: (req.body.table) ? req.body.table : this.table,
                id: (req.body.id) ? req.body.id : this.primary_key,
                value: value,
                where: (req.body.where) ? req.body.where : this.where,
                join: (req.body.join) ? req.body.join : req?.body?.getJoin ? this.join_table : null,
                order_by: (req.body.order_by) ? req.body.order_by : this.order_by,
            };
            let results = '';
            if (req.body.key) {
                params.key = req.body.key;
                results = await this.selectGroupData(params);
            } else {
                results = await this.selectData(params);
            }
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    getPrefix = async (req, res) => {
        try {
            const {number, format, prefix} = req.body;
            // explode number_format to array by "[number]"
            const setFormat = format?.split("[number]") || [];
            const date = new Date();
            // get first part of setFormat
            let first = null;
            let last = null;
            if (setFormat.length > 0) {
                first = setFormat[0];
            }
            if (setFormat.length > 0) {
                last = setFormat[1];
            }

            const checkNextNumber = async (number) => {
                // check the number is exist in database
                const sql = `SELECT ${this.primary_key}, number
                             FROM ${this.table}
                             WHERE number = ${number}`;
                const results = await database.query(sql);
                await database.end();
                if (results.length > 0) {
                    // if exist then call the function again
                    return checkNextNumber(number + 1);
                } else {
                    // if not exist then return the number
                    return number;
                }
            }

            const generatePrefix = async () => {
                let nextNumber = '';
                const sql = `SELECT ${this.primary_key}, number
                             FROM ${this.table}
                             WHERE ${this.primary_key} = (SELECT MAX(${this.primary_key}) FROM ${this.table})`;
                const startNo = 1;
                const results = await database.query(sql);
                await database.end();
                if (results.length > 0) {
                    const number = results[0].number;
                    nextNumber = results[0][this.primary_key] + 1;
                    if (nextNumber < number) {
                        nextNumber = number + 1;
                    }
                    if (nextNumber < startNo) {
                        nextNumber = startNo;
                    }
                    nextNumber = await checkNextNumber(nextNumber);
                    nextNumber = nextNumber.toString().padStart(4, '0');
                } else {
                    //  $next_number = sprintf('%04d', $next_number);
                    nextNumber = startNo.toString().padStart(4, '0');
                }
                return nextNumber;
            }

            const data = {}

            if (first) {
                // replace [PREFIX] to prefix
                let myPrefix = setFormat[0].replace("[PREFIX]", prefix);
                // replace [yyyy] to current year
                myPrefix = myPrefix.replace("[yyyy]", date.getFullYear());
                // replace [yy] to current year
                myPrefix = myPrefix.replace("[yy]", date.getFullYear().toString().substr(-2));
                // replace [mm] to current month
                myPrefix = myPrefix.replace("[mm]", ("0" + (date.getMonth() + 1)).slice(-2));
                // replace [m] to current month
                myPrefix = myPrefix.replace("[m]", (date.getMonth() + 1));
                // replace [dd] to current day
                myPrefix = myPrefix.replace("[dd]", ("0" + date.getDate()).slice(-2));
                // replace [d] to current day
                myPrefix = myPrefix.replace("[d]", date.getDate());
                data.input_first = myPrefix;
            }
            if (last) {
                // replace [PREFIX] to prefix
                let Prefix = setFormat[1].replace("[PREFIX]", prefix);
                // replace [yyyy] to current year
                Prefix = Prefix.replace("[yyyy]", date.getFullYear());
                // replace [yy] to current year
                Prefix = Prefix.replace("[yy]", date.getFullYear().toString().substr(-2));
                // replace [mm] to current month
                Prefix = Prefix.replace("[mm]", ("0" + (date.getMonth() + 1)).slice(-2));
                // replace [m] to current month
                Prefix = Prefix.replace("[m]", (date.getMonth() + 1));
                // replace [dd] to current day
                Prefix = Prefix.replace("[dd]", ("0" + date.getDate()).slice(-2));
                // replace [d] to current day
                Prefix = Prefix.replace("[d]", date.getDate());
                data.input_last = Prefix;
            }
            data.prefix = prefix;
            data.format = format;

            if (number && number > 0) {
                data.number = number;
            } else {
                data.number = await generatePrefix();
            }
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }

    }
    getPermission = async (req, res) => {
        try {
            const {user, department} = req.body;
            const menu_id = (req.body.menu_id) ? req.body.menu_id : this.menu_id;
            const data = {}
            if (user) {
                data.allUsers = await this.allEmployee({menu_id});
            } else if (department) {
                data.department = await this.getDepartmentDesignation();
            } else {
                data.everyone = 'everyone';
                data.department = await this.getDepartmentDesignation();
                data.allUsers = await this.allEmployee({menu_id});
            }
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }
    allEmployeeEmails = async (req, res) => {
        let {data, id} = req.body;
        if (!data) {
            data = await this.getBy(id);
        }
        const {permission, permission_value} = data;
        let where = '';
        const params = {
            table: 'tbl_users', id: 'tbl_users.email', array: true,
        }
        if (permission === 'select_individual_people') {
            const users = permission_value.split(',');
            where = `tbl_users.role_id != 2 AND tbl_users.activated = 1 AND tbl_users.user_id IN (${users})`;
            params.where = where;
        } else if (permission === 'select_designations') {
            const designations = permission_value.split(',');
            where = `tbl_users.role_id != 2 AND tbl_users.activated = 1 AND tbl_users.designation_id IN (${designations})`;
            params.where = where;
        } else {
            where = `tbl_users.role_id != 2 AND tbl_users.activated = 1 AND tbl_user_role.menu_id = ${this.menu_id}`;
            params.where = where;
            params.join = {
                'tbl_designations': 'tbl_users.designation_id = tbl_designations.designation_id',
                'tbl_user_role': 'tbl_users.designation_id = tbl_user_role.designation_id',
            };
        }
        try {
            const allEmail = await this.selectData(params);
            const emails = allEmail.map((item) => {
                return item.email;
            });
            return emails;
        } catch (error) {
            return error;
        }

    }
    searchData = async (req, res) => {
        try {
            const {search, limit, offset, where} = req.body;


        } catch (error) {
            return res.status(500).json({error: error.message || error.toString()});
        }
    }

}

export default MySQL;

