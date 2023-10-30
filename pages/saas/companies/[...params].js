import React, {useContext, useEffect, useState} from "react";
import MyTable from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Fb, {notify} from "../../../components/Fb";
import {useRouter} from "next/router";
import {
    API, GetPaymentMethods, GetRows, Info, getRow,
} from "../../../components/config";
import moment from "moment";
import CompanyDetails from "../../../components/CompanyDetails";
import {Context} from "../../_app";
import Helper from "../../../lib/Helper";

const api = new API();
let info = "";
let url = "/api/admin/companies";
let page = "";
let newPages = "";
export default function Companies() {
    const {config} = useContext(Context);
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [checkPaid, setCheckPaid] = useState(false);
    const [packages, setPackages] = useState("monthly");
    const {t} = useTranslation();
    const router = useRouter();
    const {params} = router.query || {};
    if (params && params.length > 1) {
        const id = params[1];
        info = Info(url, id);
        if (params[0] === "edit") {
            page = "edit";
        } else if (params[0] === "details") {
            page = "details";
        }
    } else if (params[0] === "new") {
        info = "";
    }
    const [packageInfo, setPackageInfo] = useState({});

    const {data: pricing, isLoading: PackagePricingLoading} = GetRows("/api/admin/packages", {
        where: {
            package_id: info?.data?.package_id,
        },
    }, {}, 'allPackages');

    useEffect(() => {
        if (info?.data?.package_id) {
            if (pricing) {
                setPackageInfo(pricing[0]);
                if (info?.data?.frequency) {
                    setPackages(info?.data?.frequency);
                }
            }
        }
    }, [pricing, info?.data]);


    const saveCompany = async (values) => {
        if (values.password !== values.password_confirmation) {
            notify("warning", `Confirm Password Doesn't match!`);
            return true;
        }

        if (values.email) {
            const userEmailExits = await api.post("/api/admin/users", {
                id: {email: values.email}, getInfo: true,
            });
            if (userEmailExits.email) {
                if (info?.data?.company_id !== userEmailExits?.company_id) {
                    notify("warning", t("Email_already_exist"));
                    return true;
                }
            }
        }
        const data = {
            company_name: values.company_name,
            company_email: values.email,
            mobile: values.mobile,
            address: values.address,
        };

        if (info?.data?.company_id) {
            const result = await api.update("/api/admin/companies", data, info?.data?.company_id);
            if (result?.affectedRows > 0) {
                notify("success", `Info Update Successfully`);
            }
            return true;
        }

        // get referrer from local storage
        const referrer = localStorage.getItem("referrer");
        // get package details by package id
        const packageDetails = await api.post("/api/admin/packages", {
            id: {package_id: values.package_id}, getInfo: true,
        });

        const expired_date = values.frequency == "monthly" ? moment().add(30, "days").format("YYYY-MM-DD") : values.frequency == "annual" ? moment().add(365, "days").format("YYYY-MM-DD") : null;

        const companyData = {
            company_name: values.company_name,
            company_email: values.email,
            mobile: values.mobile,
            password: values.password,
            address: values.address,
            frequency: values.frequency,
            amount: packageDetails[values.frequency + "_price"],
            trial_period: packageDetails.trial_days,
            is_trial: packageDetails.trial_days > 0 ? "Yes" : "No", // expired_date if values.frequency == 'monthly' ? 30 days : 365 days if lifetime then null
            expired_date: expired_date,
        };
        const res = await api.create("/api/admin/companies", companyData);
        if (res.insertId) {
            const companyHistoryData = {
                company_id: res.insertId,
                package_id: values.package_id,
                payment_method: values.payment_method,
                package_name: packageDetails.package_name,
                ai_templates: packageDetails.ai_templates,
                ai_chat: packageDetails.ai_chat,
                words_per_month: packageDetails.words_per_month,
                images_per_month: packageDetails.images_per_month,
                ai_transcriptions: packageDetails.ai_transcriptions,
                text_to_speech: packageDetails.text_to_speech,
                speech_file_size: packageDetails.speech_file_size,
                frequency: values.frequency,
                amount: packageDetails[values.frequency + "_price"],
                i_have_read_agree: values.terms,
                validity: expired_date,
                active: 1,
            };
            const ressult = await api.create("/api/admin/companiesHistories", companyHistoryData);
            if (ressult.insertId) {
                const companyData = {
                    company_history_id: ressult.insertId,
                };
                await api.update("/api/admin/companies", companyData, ressult.insertId);
            }
            // values.name
            const first_name = values.name.split(" ").slice(0, -1).join(" ");
            const last_name = values.name.split(" ").slice(-1).join(" ");

            const companyUsersData = {
                company_id: res.insertId,
                username: values.email,
                first_name: first_name ? first_name : values.name,
                last_name: last_name ? last_name : "",
                email: values.email,
                password: values.password,
                role_id: 2,
                activated: 1,
                banned: 0,
                is_verified: 0,
            };
            let userInfo = null;
            const isAffiliate = config?.NEXT_PUBLIC_ENABLE_AFFILIATE;
            if (referrer && isAffiliate === "yes") {
                userInfo = await api.post("/api/admin/users", {
                    id: {referral_link: referrer}, getInfo: true,
                });
                if (userInfo && userInfo.user_id) companyUsersData.referral_by = userInfo.user_id;
            }
            const userdata = await api.create("/api/admin/users", companyUsersData);
            const id = userdata.insertId;
            if (referrer && isAffiliate === "yes" && userInfo && userInfo.user_id) {
                const paymentRules = config?.NEXT_PUBLIC_PAYMENT_RULES_FOR_AFFILIATES;
                if (paymentRules === "no_payment_required_will_get_commission_according_to_affiliate_rule") {
                    const affiliateRule = config?.NEXT_PUBLIC_AFFILIATE_RULE;
                    const commissionType = config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE;
                    const commissionValue = config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE;
                    const affiliateData = {
                        referral_to: userdata.insertId,
                        referral_by: userInfo.user_id,
                        amount_was: packageDetails[values.frequency + "_price"],
                        commission_type: commissionType,
                        commission_value: commissionValue,
                        get_amount: commissionType === "percentage" ? (packageDetails[values.frequency + "_price"] * commissionValue) / 100 : commissionValue,
                        payment_method: "direct",
                        date: moment().format("YYYY-MM-DD HH:mm:ss"),
                    };
                    if (affiliateRule === "only_first_subscription") {
                        const getAffilicate = await api.post("/api/admin/affiliates", {
                            referral_by: userInfo.user_id, getInfo: true,
                        });
                        if (!getAffilicate) {
                            const affiliate = await api.create("/api/admin/affiliates", affiliateData);
                        }
                    } else {
                        const affiliate = await api.create("/api/admin/affiliates", affiliateData);
                    }
                }
            }
            const mail = await api.sendEmail("/api/admin/users", {
                emailGroup: [{
                    name: "activate_account", to: "email",
                },], id, values,
            });

            if (values.amount && values.payment_date && values.payment_method) {
                const paymentData = {
                    company_history_id: ressult.insertId,
                    company_id: res.insertId,
                    notes: values.notes,
                    amount: values.amount,
                    payment_date: values.payment_date,
                    payment_method: values.payment_method,
                    payment_status: "paid",
                };
                await api.create("/api/admin/companiesPayments", paymentData);
            }
            notify("success", t("account_created_successfully"));
            router.push("/saas/companies");
        }
    };

    const meta = {
        columns: 1, flexible: true, formItemLayout: [4, 8], fields: [{
            name: "company_name",
            type: "text",
            label: t("company_name"),
            required: true,
            placeholder: t("company_name"),
            value: info?.data?.company_name,
        }, {
            name: "email",
            type: "text",
            label: t("email"),
            placeholder: t("email"),
            required: true,
            value: info?.data?.company_email,
            unique: true,
        }, {
            name: "package_id", type: "select", label: t("package"), value: info?.data?.package_id, getOptions: {
                url: "/api/admin/packages",
            }, onChange: async (id) => {
                const getPackage = await getRow("/api/admin/packages", {
                    "tbl_packages.package_id": id,
                });
                if (getPackage) {
                    setPackageInfo(getPackage);
                }
            }, required: true,
        }, {
            // frequency
            name: "frequency",
            label: t("frequency"),
            type: "select",
            required: true,
            value: info?.data?.frequency,
            fieldClass: `${packageInfo?.package_id ? "" : "d-none"}`,
            options: [{
                label: t("monthly"), value: "monthly",
            }, {
                label: t("yearly"), value: "annual",
            }, {
                label: t("lifetime"), value: "lifetime",
            },],
            onChange: async (value) => {
                setPackages(value);
            },
        }, {
            label: t("paid"), selectOne: true, type: "checkbox", // name: "mark_paid",
            customClass: "form-switch form-check-inline mt-2 ", onClick: (e) => {
                if (e.target.checked) {
                    document.querySelectorAll(".paid_action").forEach((el) => {
                        el.classList.remove("d-none");
                    });
                    setCheckPaid(true);
                } else {
                    document.querySelectorAll(".paid_action").forEach((el) => {
                        el.classList.add("d-none");
                    });
                    setCheckPaid(false);
                }
            },
        },

            {
                name: "amount",
                label: t("amount"),
                labelClass: "paid_action d-none",
                type: "text",
                required: checkPaid,
                placeholder: t("amount"),
                fieldClass: "paid_action d-none",
            },

            {
                name: "payment_date",
                label: t("payment_date"),
                type: "date",
                required: checkPaid,
                fieldClass: "paid_action d-none",
            }, {
                name: "payment_method",
                label: t("payment_method"),
                labelClass: "paid_action d-none",
                type: "select",
                required: checkPaid,
                options: Helper.paymentMethods().map((item) => ({
                    label: t(item.name), value: item.name,
                })),
                fieldClass: "paid_action d-none",
            }, {
                name: "notes",
                label: t("notes"),
                labelClass: "paid_action d-none",
                type: "textarea",
                fieldClass: "paid_action d-none",
            }, {
                name: "name", label: t("name"), type: "text", required: true, placeholder: t("name"), unique: true,
            }, {
                name: "password",
                label: t("password"),
                type: "password",
                required: true,
                placeholder: t("password"),
                onChange: (e) => {
                    setPassword(e.target.value);
                },
            }, {
                name: "password_confirmation",
                label: t("password_confirmation"),
                type: "password",
                required: true,
                placeholder: t("password_confirmation"),
                onChange: (e) => {
                    setConfirmPass(e.target.value);
                },
                help: password !== confirmPass && t("confirm_password_doesn_t_match"),
            }, {
                name: "mobile", type: "text", label: t("phone"), value: info?.data?.mobile,
            }, {
                name: "address", type: "textarea", label: t("address"), value: info?.data?.address,
            },

            {
                type: "submit", label: t("submit"),
            },],
    };

    if (info?.data?.company_id) {
        meta.fields.splice(2, 10, {type: "hidden"});
    }
    newPages = (<>
        <BreadCrumb title={t("companies")} pageTitle={t("company_list")}/>
        <Card className={"row"}>
            <CardHeader>
                <h5>
                    {info?.data?.company_id ? t("edit_company") : t("new_company")}
                </h5>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col md={7}>
                        <Fb meta={meta}
                            isLoading={PackagePricingLoading || info?.isLoading}
                            form={true} onSubmit={saveCompany}/>
                    </Col>
                    <Col md={1}></Col>
                    {packageInfo?.package_id && (<Col md={4}>
                        <div className="card pricing-box">
                            <div className="card-body bg-light m-2 p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="flex-grow-1">
                                        <h5 className="mb-0 fw-semibold">
                                            {packageInfo?.package_name}
                                        </h5>
                                    </div>
                                    <div className="ms-auto">
                                        <h2 className="month mb-0 d-block">
                                            $
                                            {packages === "monthly" ? packageInfo.monthly_price : packages === "annual" ? packageInfo.annual_price : packageInfo.lifetime_price}{" "}
                                            <small className="fs-13 text-muted">
                                                /
                                                {packages === "monthly" ? "month" : packages === "annual" ? "year" : "lifetime"}
                                            </small>
                                        </h2>
                                    </div>
                                </div>
                                <p className="text-muted">
                                    {t('excellent_for_scaling_teams_to_build_culture_special_plan_for_professional_business')}

                                </p>
                                <ul className="list-unstyled vstack gap-3">
                                    <li>
                                        <div className="d-flex">
                                            <div className="flex-shrink-0 text-success me-1">
                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <b>
                                                    {packageInfo?.ai_templates && JSON.parse(packageInfo?.ai_templates)?.length}
                                                </b>{" "}
                                                {t("ai_templates")}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="d-flex">
                                            <div
                                                className={`flex-shrink-0 me-1 ${packageInfo?.words_per_month === 0 ? "text-danger" : "text-success"}`}
                                            >
                                                {packageInfo?.words_per_month === 0 ? (
                                                    <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.words_per_month === -1 ? (<>
                                                    <b> {t("unlimited")} </b>
                                                </>) : packageInfo?.words_per_month === 0 ? (<b>
                                                    <del>{t("words")}</del>
                                                </b>) : (<>
                                                    <b> {packageInfo?.words_per_month} </b>{" "}
                                                </>)}{" "}
                                                {packageInfo?.words_per_month === 0 ? "" : t("words") + " / " + t("month")}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="d-flex">
                                            <div
                                                className={`flex-shrink-0 me-1 ${packageInfo?.images_per_month === 0 ? "text-danger" : "text-success"}`}
                                            >
                                                {packageInfo?.images_per_month === 0 ? (
                                                    <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.images_per_month === -1 ? (<>
                                                    <b> {t("unlimited")} </b>
                                                </>) : packageInfo?.images_per_month === 0 ? (<b>
                                                    <del>{t("images")}</del>
                                                </b>) : (<>
                                                    <b> {packageInfo?.images_per_month} </b>{" "}
                                                </>)}{" "}
                                                {packageInfo?.images_per_month === 0 ? "" : t("images") + " / " + t("month")}
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="d-flex">
                                            <div
                                                className={`flex-shrink-0 me-1 ${packageInfo?.ai_chat === 0 ? "text-danger" : "text-success"}`}
                                            >
                                                {packageInfo?.ai_chat === 0 ? (
                                                    <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.ai_chat === 1 ? (<>
                                                    <b> {t("chats")} </b>
                                                </>) : (<b>
                                                    <del>{t("chats")}</del>
                                                </b>)}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="d-flex">
                                            <div
                                                className={`flex-shrink-0 me-1 ${packageInfo?.ai_transcriptions === 0 ? "text-danger" : "text-success"}`}
                                            >
                                                {packageInfo?.ai_transcriptions === 0 ? (
                                                    <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.ai_transcriptions === 1 ? (<>
                                                    <b> {t("transcriptions")} </b>
                                                </>) : (<b>
                                                    <del>{t("transcriptions")}</del>
                                                </b>)}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="d-flex">
                                            <div
                                                className={`flex-shrink-0 me-1 ${packageInfo?.text_to_speech === 0 ? "text-danger" : "text-success"}`}
                                            >
                                                {packageInfo?.text_to_speech === 0 ? (
                                                    <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.text_to_speech === 1 ? (<>
                                                    <b> {t("text_to_speech")} </b>
                                                </>) : (<b>
                                                    <del>{t("text_to_speech")}</del>
                                                </b>)}
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="d-flex">
                                            <div className="flex-shrink-0 text-success me-1">
                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                {packageInfo?.speech_file_size === -1 ? (<>
                                                    <b> {t("unlimited")} </b>
                                                </>) : (<>
                                                    <b>
                                                        {" "}
                                                        {packageInfo?.speech_file_size} {t("MB")}{" "}
                                                    </b>{" "}
                                                </>)}{" "}
                                                {t("speech_file_size")}
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="d-flex">
                                            <div className="flex-shrink-0 text-success me-1">
                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <b>24/7</b> {t("support")}
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Col>)}
                </Row>
            </CardBody>
        </Card>
    </>);


    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">{newPages}</div>
        </div>
    </React.Fragment>);
}
export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
