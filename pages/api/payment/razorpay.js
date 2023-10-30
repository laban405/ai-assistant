import Razorpay from "razorpay";
import {configItems} from "../admin/common";

export default async function handler(req, res) {
    const config = await configItems();
    if (req.method === "POST") {
        const {item} = req.body;
        const razorpay = new Razorpay({
            key_id: config?.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: config?.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
        });
        try {
            const payment_capture = 1;
            const amount = item.price;
            const currency = item.currency || 'INR';
            const options = {
                amount: (amount * 100), currency, receipt: Math.random().toString().replace('0.', ''), // generate receipt id randomly
                payment_capture,
            }
            const response = await razorpay.orders.create(options);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json(error);
        }
    }

}
