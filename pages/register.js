import React, {useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import Seo from "../components/frontend/Seo";
import Fb, {notify} from "../components/Fb";
import {API, GetRows, getRow} from "../components/config";
import moment from "moment";
import {useRouter} from "next/router";
import {Context} from "./_app";

const api = new API();

export default function Register({id, packages = "monthly", setModal}) {
    const {config} = useContext(Context);
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [emailExits, setEmailExits] = useState("");
    const [packageInfo, setPackageInfo] = useState({});
    const [packageType, setPackageType] = useState();
    const {t} = useTranslation();
    const router = useRouter();
    const {ref} = router.query || {};
    const url = "/api/admin/packages";
    const {data: pricing, isLoading: PackagePricingLoading} = GetRows(url, {
        where: {
            package_id: id,
        },
    });

    // set ref to local storage

    useEffect(() => {
        if (pricing && pricing.length > 0) {
            setPackageInfo(pricing[0]);
        }
        if (packages) {
            setPackageType(packages);
        }

        if (ref) {
            localStorage.setItem("referrer", ref);
        }
    }, [ref, pricing]);

    const meta = {
        columns: 1, flexible: true, formItemLayout: [4, 8], fields: [{
            name: "package_id", label: t("package"), type: "select", required: true, getOptions: {
                url: "/api/admin/packages",
            }, value: id, onChange: async (id) => {
                const getPackage = await getRow("/api/admin/packages", {
                    "tbl_packages.package_id": id,
                });
                if (getPackage) {
                    setPackageInfo(getPackage);
                }
            },
        }, {
            name: "frequency", label: t("frequency"), type: "select", required: true, value: packages, options: [{
                label: t("monthly"), value: "monthly",
            }, {
                label: t("yearly"), value: "yearly",
            }, {
                label: t("lifetime"), value: "lifetime",
            },], onChange: async (value) => {
                setPackageType(value);
            },
        }, {
            name: "company_name",
            type: "text",
            label: t("company_name"),
            required: true,
            placeholder: t("company_name"),
        }, {
            name: "name", label: t("name"), type: "text", required: true, placeholder: t("name"),
        }, {
            name: "email",
            label: t("email"),
            type: "email",
            required: true,
            placeholder: t("email"),
            unique: true,
            onChange: async (e) => {
                const result = await getRow("/api/admin/users", {
                    "usr.email": e.target.value,
                });
                if (result?.email) {
                    setEmailExits(t("Email_already_exist"));
                } else {
                    setEmailExits("");
                }
            },
            help: emailExits,
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
            name: "terms",
            label: t("terms"),
            customClass: "form-switch form-check-inline mt-2 ",
            type: "checkbox",
            required: true,
            placeholder: t("terms"),
            options: [{
                label: t("i_agree_to_the_terms_and_conditions"), value: true,
            },],
        }, {
            name: "submit", label: t("submit"), type: "submit", setModal,
        },],
    };

    const registerCompany = async (values) => {
        if (values.password !== values.password_confirmation) {
            return true;
        }

        if (values.email) {
            const userEmailExits = await api.post("/api/admin/users", {
                id: {email: values.email}, getInfo: true,
            });
            if (userEmailExits.email) {
                return true;
            }
        }

        // get referrer from local storage
        const referrer = localStorage.getItem("referrer");
        // get package details by package id
        const packageDetails = await api.post("/api/admin/packages/", {
            id: {package_id: values.package_id}, getInfo: true,
        });

        const userInfo = await api.post("/api/admin/users", {
            id: {referral_link: referrer}, getInfo: true,
        });

        const expired_date = values.frequency === "monthly" ? moment().add(30, "days").format("YYYY-MM-DD") : values.frequency === "annual" ? moment().add(365, "days").format("YYYY-MM-DD") : null;

        const compayData = {
            company_name: values.company_name,
            company_email: values.email,
            frequency: values.frequency,
            amount: packageDetails[values.frequency + "_price"],
            trial_period: packageDetails.trial_days,
            is_trial: packageDetails.trial_days > 0 ? t("yes") : t("no"), // expired_date if values.frequency == 'monthly' ? 30 days : 365 days if lifetime then null
            expired_date: expired_date,
        };
        const res = await api.create("/api/admin/companies", compayData);
        if (res.insertId) {
            const companyHistoryData = {
                company_id: res.insertId,
                package_id: values.package_id,
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
                i_have_read_agree: values.terms ? t("yes") : t("no"), // 'Yes' or 'No
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
                activated: config?.NEXT_PUBLIC_NEED_EMAIL_VERIFICATION === "1" ? 1 : 0,
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
            setModal(false);
            const mail = await api.sendEmail("/api/admin/users", {
                emailGroup: [{
                    name: "activate_account", to: "email",
                },], id, values,
            });
            notify("success", t("account_created_successfully"));
            router.push("/auth/login");
            // setTimeout(() => {
            //     window.location.href = "/";
            // }, 2000);
        }
    };

    return (<>
        <div className="app-root">
            <Seo pageTitle="Home Default"/>
            <main className="nk-pages">
                <div className="row">
                    <div className="col-8">
                        <section className="section section-bottom-0 pb-5 has-mask pt-0">
                            <div className="container">
                                <div className="section-head">
                                    <div className="">
                                        <h6 className="overline-title text-primary mb-0 ms-1">
                                            {t("start_your_journey")}
                                        </h6>
                                        <h2 className="title">{t('create_account')}</h2>
                                    </div>
                                </div>
                                <div className="section-content">
                                    <div className="row g-gs justify-content-center">
                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm rounded-4">
                                                <div className="card-body">
                                                    <Fb
                                                        meta={meta}
                                                        form={true}
                                                        onSubmit={registerCompany}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-center mt-4">
                                                {t("already_have_an_account")}{" "}
                                                <a href="/auth/login">{t("login")}</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="col-4">
                        {packageInfo?.package_id && (<div className={"pricing border mt-100  rounded-0"}>
                            <div className="pricing-body">
                                <div className="text-center">
                                    <h3 className="mb-4">{packageInfo.package_name}</h3>
                                    <h3 className="mb-4 price">
                                        $
                                        {packageType === "monthly" ? packageInfo.monthly_price : packageType === "yearly" ? packageInfo.annual_price : packageInfo.lifetime_price}{" "}
                                        <span className="caption-text text-muted">
                                                    {" "}
                                            /{" "}
                                            {packageType === "monthly" ? t("month") : packageType === "yearly" ? t("year") : t("lifetime")}
                                                </span>
                                    </h3>
                                </div>
                                <ul className="step-list pricing-list">
                                    <li>
                                        <i className="fas fa-check-circle"></i>
                                        <span>
                                                    <strong>
                                                        {JSON.parse(packageInfo.ai_templates)?.length}
                                                    </strong>
                                                    <span className="mx-1">{t("ai_templates")}</span>
                                                </span>
                                    </li>
                                    <li>
                                        {packageInfo.words_per_month === 0 ? (<i
                                            className={`fas fa-times-circle ${packageInfo.words_per_month === 0 ? "text-danger" : "text-success"}`}
                                        ></i>) : (<i className="fas fa-check-circle"></i>)}

                                        <span>
                                                    {packageInfo.words_per_month === -1 ? (<>
                                                        <b> {t("unlimited")} </b>
                                                    </>) : packageInfo.words_per_month === 0 ? (<b>
                                                        <del>{t("words")}</del>
                                                    </b>) : (<>
                                                        <b> {packageInfo.words_per_month} </b>{" "}
                                                    </>)}{" "}
                                            {packageInfo.words_per_month === 0 ? "" : t("words") + " / " + t("month")}
                                                </span>
                                    </li>
                                    <li>
                                        {packageInfo.images_per_month === 0 ? (<i
                                            className={`fas fa-times-circle ${packageInfo.images_per_month === 0 ? "text-danger" : "text-success"}`}
                                        ></i>) : (<i className="fas fa-check-circle"></i>)}

                                        <span>
                                                    {packageInfo.images_per_month === -1 ? (<>
                                                        <b> {t("unlimited")} </b>
                                                    </>) : packageInfo.images_per_month === 0 ? (<b>
                                                        <del>{t("images")}</del>
                                                    </b>) : (<>
                                                        <b> {packageInfo.images_per_month} </b>{" "}
                                                    </>)}{" "}
                                            {packageInfo.images_per_month === 0 ? "" : t("images") + " / " + t("month")}
                                                </span>
                                    </li>
                                    <li>
                                        {packageInfo.ai_chat === 0 ? (<i
                                            className={`fas fa-times-circle ${packageInfo.ai_chat === 0 ? "text-danger" : "text-success"}`}
                                        ></i>) : (<i className="fas fa-check-circle"></i>)}
                                        <span>
                                                    {packageInfo.ai_chat === 1 ? (<>
                                                        <b> {t("chats")} </b>
                                                    </>) : (<b>
                                                        <del>{t("chats")}</del>
                                                    </b>)}
                                                </span>
                                    </li>
                                    <li>
                                        {packageInfo.ai_transcriptions === 0 ? (<i
                                            className={`fas fa-times-circle ${packageInfo.ai_transcriptions === 0 ? "text-danger" : "text-success"}`}
                                        ></i>) : (<i className="fas fa-check-circle"></i>)}

                                        <span>
                                                    {packageInfo.ai_transcriptions === 1 ? (<>
                                                        <b> {t("transcriptions")} </b>
                                                    </>) : (<b>
                                                        <del>{t("transcriptions")}</del>
                                                    </b>)}
                                                </span>
                                    </li>
                                    <li>
                                        {packageInfo.text_to_speech === 0 ? (<i
                                            className={`fas fa-times-circle ${packageInfo.text_to_speech === 0 ? "text-danger" : "text-success"}`}
                                        ></i>) : (<i className="fas fa-check-circle"></i>)}

                                        <span>
                                                    {packageInfo.text_to_speech === 1 ? (<>
                                                        <b> {t("text_to_speech")} </b>
                                                    </>) : (<b>
                                                        <del>{t("text_to_speech")}</del>
                                                    </b>)}
                                                </span>
                                    </li>

                                    <li>
                                        <i className="fas fa-check-circle"></i>

                                        <span>
                                                    {packageInfo.speech_file_size === -1 ? (<>
                                                        <b> {t("unlimited")} </b>
                                                    </>) : (<>
                                                        <b>
                                                            {" "}
                                                            {packageInfo.speech_file_size} {t("MB")}{" "}
                                                        </b>{" "}
                                                    </>)}{" "}
                                            {t("speech_file_size")}
                                                </span>
                                    </li>
                                    <li>
                                        <i className="fas fa-check-circle"></i>

                                        <span>
                                                    <b>24/7</b> {t("support")}
                                                </span>
                                    </li>
                                </ul>
                            </div>
                        </div>)}
                    </div>
                </div>
            </main>
        </div>
    </>);
}
