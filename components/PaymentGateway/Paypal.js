import {
    PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import React, {useContext, useEffect} from "react";
import {API, companyID, updatePackage} from "../config";
import {notify} from "../Fb";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Context} from "../../pages/_app";

const api = new API();

const PayPal = ({
                    data, style = {
        layout: "horizontal",
    }, showSpinner = false, setPaymentStatus,
                }) => {
    const value = useContext(Context);
    const {t} = useTranslation();

    const company_id = companyID();
    const paypalOptions = {
        "client-id": value.config.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", components: "buttons",
    };
    const amount = data[data.frequency + "_price"];

    const createOrder = (info, actions) => {
        // Logic to create the order
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: data[data.frequency + "_price"],
                },
            },],
        });
    };

    const onApprove = (info, actions) => {
        // Logic to handle the payment approval
        return actions.order.capture().then(async function (details) {
            // Show a success message to your buyer
            data.payment_status = "paid";
            data.payment_method = "paypal";
            data.currency = "USD";
            data.company_id = company_id;
            data.reference_no = details.id;
            data.transaction_id = details.id;

            const res = await updatePackage(data);
            if (res.affectedRows > 0) {
                // redirect to the dashboard
                notify("success", t("your_payment_has_been_successfully_processed"));
                setPaymentStatus("success");
            }
        });
    };

    return (<div>
        <PayPalScriptProvider
            options={{
                "client-id": value.config.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", intent: "capture",
            }}
        >
            <PayPalButtons
                fundingSource={"paypal"}
                createOrder={createOrder}
                onApprove={onApprove}
                style={{layout: "horizontal", height: 40, minWidth: 40}}
            />
        </PayPalScriptProvider>
    </div>);
};

export default PayPal;


export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
