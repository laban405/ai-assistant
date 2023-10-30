import Stripe from 'stripe';
import {configItems} from '../admin/common';


export default async function handler(req, res) {
    const config = await configItems();
    const stripe = new Stripe(config?.NEXT_PUBLIC_STRIPE_SECRET_KEY);
    if (req.method === 'POST') {
        const {item} = req.body;
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd', unit_amount: item.price * 100, product_data: {
                            // name: 'T-shirt',
                            name: item.name, // description: 'Comfortable cotton t-shirt',
                            description: item.description, // images: [item.image],
                        },
                    }, quantity: 1,
                }, // Add additional line items as needed
                ],
                mode: 'payment',
                success_url: `${item.success_url}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: item.cancel_url || config?.NEXT_PUBLIC_BASE_URL,
            });

            res.status(200).json({id: session.id});
        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Failed to create session'});
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}