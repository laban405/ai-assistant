import DB from "../../../lib/db";
import React from "react";

const db = new DB();
db.table = 'tbl_coupon';
db.primary_key = 'coupon_id';
db.order_by = 'coupon_id DESC';
db.select = ['tbl_coupon.*'];
db.column_search = ['tbl_coupon.name'];
db.menu_id = 74;
export default async function handler(req, res) {
    try {
        return await db.handler(req, res);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}