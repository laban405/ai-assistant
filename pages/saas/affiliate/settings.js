import {useTranslation} from "next-i18next";
import React, {useContext, useState} from "react";
import {GetPaymentMethods} from "../../../components/config";
import {Card, CardBody, CardHeader} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Fb from "../../../components/Fb";
import {Context} from "../../_app";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Helper from "../../../lib/Helper";

let info = "";
export default function CommissionSettings() {
    const {config} = useContext(Context);
    const [signUpCommission, setSignUpCommission] = useState(config?.NEXT_PUBLIC_SIGN_UP_COMMISSION_TYPE === "fixed" ? "$" : "%");
    const {t} = useTranslation();


    const meta = {
        columns: 2, formItemLayout: [4, 7], fields: [{
            name: "NEXT_PUBLIC_ENABLE_AFFILIATE",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("enable_affiliate"),
            value: config?.NEXT_PUBLIC_ENABLE_AFFILIATE,
            options: [{label: "Yes", value: "yes"}],
            selectOne: true,
        }, {
            name: "NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE",
            type: "checkbox",
            className: `sign_up_commission_type ${config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE ? "" : ""}`,
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("commission_type"),
            selectOne: true,
            onChange: (value) => {
                if (value == "fixed") {
                    setSignUpCommission("$");
                    document
                        .querySelectorAll(".sign_up_commission_amount")
                        .forEach((el) => {
                            el.classList.remove("d-none");
                        });
                } else {
                    document
                        .querySelector(".sign_up_commission_amount")
                        .classList.add("d-none");
                }
                if (value == "percentage") {
                    document
                        .querySelectorAll(".sign_up_commission_amount")
                        .forEach((el) => {
                            el.classList.remove("d-none");
                        });
                    setSignUpCommission("%");
                }
            },
            options: [{
                label: "Fixed", value: "fixed",
            }, {
                label: "Percentage", value: "percentage",
            },],

            value: config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE,
        }, {
            name: "NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE",
            className: `sign_up_commission_amount ${config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE ? "" : "d-none"}`,
            addonBefore: signUpCommission,
            type: "text",
            label: t("commission_amount"),
            value: config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE,
        }, {
            // Affiliate Rule
            name: "NEXT_PUBLIC_AFFILIATE_RULE",
            type: "select",
            label: t("affiliate_rule"),
            value: config?.NEXT_PUBLIC_AFFILIATE_RULE,
            options: [{
                label: "Only First Subscription", value: "only_first_subscription",
            }, {label: "Each Subscription", value: "each_subscription"},],
        }, {
            // Payment rules for affiliates
            name: "NEXT_PUBLIC_PAYMENT_RULES_FOR_AFFILIATES",
            type: "select",
            label: t("payment_rules_for_affiliates"),
            value: config?.NEXT_PUBLIC_PAYMENT_RULES_FOR_AFFILIATES,
            options: [{
                label: "No payment required will get commission according to affiliate rule",
                value: "no_payment_required_will_get_commission_according_to_affiliate_rule",
            }, {
                label: "Only first subscription payment", value: "only_first_subscription_payment",
            }, {
                label: "Every Payment of the subscription", value: "every_payment_of_the_subscription",
            },],
        }, {
            name: "NEXT_PUBLIC_MINIMUM_PAYOUT_AMOUNT",
            type: "text",
            label: t("minimum_payout_amount"),
            addonBefore: "$",
            value: config?.NEXT_PUBLIC_MINIMUM_PAYOUT_AMOUNT,
        }, {
            name: "NEXT_PUBLIC_WITHDRAWAL_PAYMENT_METHODS",
            type: "select",
            label: t("withdrawal_payment_methods"),
            options: Helper.paymentMethods().map((item) => ({
                label: t(item.name), value: item.name,
            })),
            isMulti: true,
            value: config?.NEXT_PUBLIC_WITHDRAWAL_PAYMENT_METHODS,
        },

            {
                type: "submit", label: t("submit"),
            },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb
                    title={t("affiliate")}
                    pageTitle={t("affiliate_commission_settings")}
                />
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between">
                            <h5 className="card-title mt-2">
                                {t("affiliate_commission_settings")}
                            </h5>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Fb
                            meta={meta}
                            form={true}
                            url={"/api/config"}
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    </React.Fragment>);
}
export const getServerSideProps = async ({locale}) => ({props: {...(await serverSideTranslations(locale, ["common"])),},});