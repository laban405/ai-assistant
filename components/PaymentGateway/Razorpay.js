import {Button} from "reactstrap";
import {API, MyDetails, SiteLogo, updatePackage} from "../config";
import {notify} from "../Fb";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Context} from "../../pages/_app";
import {useContext} from "react";
import Image from "next/image";

const api = new API();

const RazorpayPayment = ({data}) => {
    const value = useContext(Context);
    const {t} = useTranslation();

    const myDetails = MyDetails();
    const router = useRouter();
    const initializeRazorpay = async () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const openCheckout = async () => {
        const res = await initializeRazorpay();
        if (!res) {
            console.log("Razorpay SDK failed to load. Are you online?");
            return;
        }
        const amount = data[data.frequency + "_price"];
        data.price = amount;
        // Make API call to the serverless API
        const postData = await api.post("/api/payment/razorpay", {item: data});
        if (!postData) {
            console.log("Server error. Are you online?");
            return;
        }
        const {amount: payAmount, id: order_id, currency} = postData;
        const options = {
            key: value.config.NEXT_PUBLIC_RAZORPAY_KEY,
            currency: currency,
            name: data.package_name,
            amount: payAmount,
            order_id: order_id,
            description: "Purchase of " + data.package_name,
            image: `${value.config.NEXT_PUBLIC_BASE_URL}${SiteLogo()}`, // handler with async/await
            handler: async function (response) {
                data.payment_status = "paid";
                data.payment_id = response.razorpay_payment_id;
                data.currency = response.currency;
                data.amount = response.amount;
                data.payment_method = "razorpay";
                data.company_id = myDetails?.company_id;
                data.reference_no = response.razorpay_order_id;
                data.transaction_id = response.razorpay_payment_id;
                await updatePackage(data)
                    .then((res) => {
                        notify("success", t("your_payment_has_been_successfully_processed"));
                        // redirect to the dashboard after 3 seconds
                        setTimeout(() => {
                            router.push("/admin/dashboard");
                        }, 1000);
                    })
                    .catch((err) => {
                        notify("warning", t("Something_went_wrong_Please_try_again_later"));
                        setTimeout(() => {
                            router.push("/admin/upgrades");
                        }, 1000);
                    });
            },
            prefill: {
                name: myDetails?.first_name + " " + myDetails?.last_name,
                email: myDetails?.email,
                contact: myDetails?.phone ? myDetails?.phone : "",
            },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function (response) {
            notify("warning", "Payment Failed for " + data.package_name);
            setTimeout(() => {
                router.push("/admin/upgrades");
            }, 1000);
        });
    };
    return (<div className={"payment-logo"} onClick={openCheckout}>
        <Image src="/assets/img/razorpay-logo-vector.png" alt=""
               width={200}
               height={200}
        />
    </div>);
};
export default RazorpayPayment;


export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
