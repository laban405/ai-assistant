import {
    Button, Card, CardBody, CardHeader, UncontrolledTooltip,
} from "reactstrap";
import React, {useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import "moment-timezone";
import {useRouter} from "next/router";
import Fb, {MyModal, notify} from "../../../components/Fb";
import {Tabs} from "../../../components/Tabs";
import BreadCrumb from "../../../components/BreadCrumb";
import {EmailSettings} from "../../../components/Settings";
import {API, Info} from "../../../components/config";
import Link from "next/link";
import Helper from "../../../lib/Helper";
import {Context} from "../../_app";
import moment from "moment";
import MyTable from "../../../components/MyTable";

let url = "/api/admin/settings";
const Settings = () => {
    const {t} = useTranslation();
    const [activeTab, setActiveTab] = useState("general");
    const {config, isLoading} = useContext(Context)
    const router = useRouter();
    const {type} = router.query || {};
    useEffect(() => {
        if (type) {
            setActiveTab(type);
        }
    }, [type]);

    const tabs = [{
        order: 1,
        url: url + "?type=general",
        value: "general",
        icon: "ri-settings-2-line",
        label: t("general"),
        children: <General
            config={config}
        />,
    }, {
        order: 4,
        url: url + "?type=email",
        value: "system",
        icon: "bx bx-cog",
        label: t("system_setting"),
        children: <SystemSettings
            config={config}
        />,
    }, {
        order: 4,
        url: url + "?type=email",
        value: "email",
        icon: "ri-mail-line",
        label: t("email_setting"),
        children: <EmailSettings
            config={config}
        />,
    }, {
        order: 6,
        url: url + "?type=theme",
        value: "theme",
        icon: "ri-paint-brush-line",
        label: t("theme_setting"),
        children: <ThemeSetting
            config={config}
        />,
    }, {
        order: 7,
        url: url + "?type=AI",
        value: "AI",
        icon: "ri-robot-line",
        label: t("Ai_setting"),
        children: <AISettings
            config={config}
        />,
    }, {
        order: 8,
        url: url + "?type=file-storage",
        value: "file-storage",
        icon: "ri-cloud-line",
        label: t("file_storage"),
        children: <FileStorage
            config={config}
        />,
    }, {
        order: 9,
        url: url + "?type=payment-gateway",
        value: "payment-gateway",
        icon: "bx bx-credit-card",
        label: t("payment_gateway"),
        children: <PaymentGateway
            config={config}
        />,
    }, {
        order: 11,
        url: url + "?type=currency",
        value: "currency",
        icon: "ri-money-dollar-circle-line",
        label: t("currency setting"),
        children: <Currency
            config={config}
        />,

    }

    ];

    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb pageTitle={t(activeTab)} title={t("settings")}/>
                {isLoading ? <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div> : <Tabs
                    tabs={tabs}
                    active={activeTab}
                    setTab={(tab) => {
                        setActiveTab(tab);
                    }}
                />}
            </div>
        </div>
    </React.Fragment>);
};
export default Settings;

const General = ({config, isLoading}) => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_COMPANY_NAME",
            type: "text",
            label: t("site_title"),
            required: true,
            value: config?.NEXT_PUBLIC_COMPANY_NAME,
        }, {
            name: "NEXT_PUBLIC_COMPANY_EMAIL",
            type: "text",
            label: t("site_email"),
            required: true,
            value: config?.NEXT_PUBLIC_COMPANY_EMAIL,
        }, {
            name: "NEXT_PUBLIC_COMPANY_PHONE", type: "text", label: t("contact_phone"),

            value: config?.NEXT_PUBLIC_COMPANY_PHONE,
        }, {
            name: "NEXT_PUBLIC_COMPANY_ADDRESS",
            type: "text",
            label: t("contact_address"),
            value: config?.NEXT_PUBLIC_COMPANY_ADDRESS,
        }, {
            name: "NEXT_PUBLIC_SITE_URL", type: "text", label: t("site_URL"), value: config?.NEXT_PUBLIC_SITE_URL,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_CONTACT_EAMIL",
            type: "email",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("contact_email"),
            value: config?.NEXT_PUBLIC_SETTINGS_CONTACT_EAMIL,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_FACEBOOK_LINK",
            type: "text",
            label: t("fb_link"),
            value: config?.NEXT_PUBLIC_SETTINGS_FACEBOOK_LINK,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_TWITTER_LINK",
            type: "text",
            label: t("twitter_link"),
            value: config?.NEXT_PUBLIC_SETTINGS_TWITTER_LINK,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_INSTAGRAM_LINK",
            type: "text",
            label: t("instagram_link"),
            value: config?.NEXT_PUBLIC_SETTINGS_INSTAGRAM_LINK,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_LINKEDIN_LINK",
            type: "text",
            label: t("linkedIn_link"),
            value: config?.NEXT_PUBLIC_SETTINGS_LINKEDIN_LINK,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_YOUTUBE_LINK",
            type: "text",
            label: t("youtube_link"),
            value: config?.NEXT_PUBLIC_SETTINGS_YOUTUBE_LINK,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_COPYRIGHT_TEXT",
            type: "text",
            label: t("copyright_text"),
            value: config?.NEXT_PUBLIC_SETTINGS_COPYRIGHT_TEXT,
        }, {
            name: "NEXT_PUBLIC_COMPANY_META_KEYWORDS",
            type: "textarea",
            label: t("meta_keywords"),
            value: config?.NEXT_PUBLIC_SETTINGS_META_KEYWORDS,
            help: t("Separate with comma"),
            helpClass: "text-muted fs-11",
        }, {
            name: "NEXT_PUBLIC_COMPANY_META_DESCRIPTION",
            type: "textarea",
            label: t("meta_description"),
            value: config?.NEXT_PUBLIC_SETTINGS_META_DESCRIPTION,
        }, {
            col: 2, labelCol: 2, type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">
                    {t("general_settings")}
                </h5>
            </CardHeader>
            <CardBody>
                {isLoading ? <>Loagind</> : <Fb
                    meta={meta}
                    form={true}
                    // layout={"vertical"}
                    url={"/api/config"}
                    to={"/saas/settings"}
                />}
            </CardBody>
        </Card>
    </React.Fragment>);
};
const FileStorage = ({config}) => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_FILESYSTEM_DRIVER",
            type: "select",
            value: config?.NEXT_PUBLIC_FILESYSTEM_DRIVER,
            label: t("file_system_driver"),
            options: [//     {
                //     label: t("local"), value: "local",
                // },
                {
                    label: t("s3"), value: "s3",
                }, {
                    label: t("cloudinary"), value: "cloudinary",
                }],
        }, {
            name: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
            type: "text",
            label: t("cloudinary_cloud_name"),
            value: config?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        }, {
            name: "NEXT_PUBLIC_CLOUDINARY_API_KEY",
            type: "text",
            label: t("cloudinary_api_key"),
            value: config?.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        }, {
            name: "NEXT_PUBLIC_CLOUDINARY_API_SECRET",
            type: "text",
            label: t("cloudinary_api_secret"),
            value: config?.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
        }, {
            name: "NEXT_PUBLIC_AWS_ACCESS_KEY",
            type: "text",
            label: t("aws_access_key"),
            value: config?.NEXT_PUBLIC_AWS_ACCESS_KEY,
        }, {
            name: "NEXT_PUBLIC_AWS_SECRET_KEY",
            type: "text",
            label: t("aws_secret_key"),
            value: config?.NEXT_PUBLIC_AWS_SECRET_KEY,
        }, {
            name: "NEXT_PUBLIC_AWS_REGION",
            type: "text",
            label: t("aws_default_region"),
            value: config?.NEXT_PUBLIC_AWS_REGION,
        }, {
            name: "NEXT_PUBLIC_AWS_BUCKET_NAME",
            type: "text",
            label: t("aws_bucket"),
            value: config?.NEXT_PUBLIC_AWS_BUCKET_NAME,
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">{t("file_storage")}</h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={"/api/config"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};

const EmailSetting = () => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_ADMIN_EMAIL",
            type: "email",
            label: t("admin_email"),
            value: config?.NEXT_PUBLIC_ADMIN_EMAIL,
        }, {
            name: "NEXT_PUBLIC_ADMIN_EMAIL_METHOD", type: "select", label: t("method"), options: [{
                label: t("SMTP"), value: "smtp",
            }, {
                label: t("PHP_mail"), value: "mail",
            }, {
                label: t("amazon_SES"), value: "amazon",
            }, {
                label: t("mandrill"), value: "mandrill",
            }, {
                label: t("send_grid"), value: "sendgrid",
            },], value: config?.NEXT_PUBLIC_ADMIN_EMAIL_METHOD, help: t("e_mail_sending_method"),
        }, {
            name: "NEXT_PUBLIC_SMTP_HOST_EMAIL",
            type: "text",
            label: t("SMTP_Host"),
            value: config?.NEXT_PUBLIC_SMTP_HOST_EMAIL,
        }, {
            name: "NEXT_PUBLIC_SMTP_PORT_EMAIL",
            type: "text",
            label: t("SMTP_Port"),
            value: config?.NEXT_PUBLIC_SMTP_PORT_EMAIL,
        }, {
            name: "NEXT_PUBLIC_SMTP_EMAIL_USERNAME",
            type: "text",
            label: t("SMTP_Username"),
            value: config?.NEXT_PUBLIC_SMTP_EMAIL_USERNAME,
        }, {
            name: "NEXT_PUBLIC_SMTP_EMAIL_PASSWORD",
            type: "text",
            label: t("SMTP_Password"),
            value: config?.NEXT_PUBLIC_SMTP_EMAIL_PASSWORD,
        }, {
            name: "NEXT_PUBLIC_SMTP_EMAIL_ENCRYPTION", type: "select", label: t("SMTP_encryption"), options: [{
                label: t('off'), value: "off",
            }, {
                label: t("ssl"), value: "ssl",
            }, {
                label: t("tls"), value: "tls",
            },], value: config?.NEXT_PUBLIC_SMTP_EMAIL_ENCRYPTION,
        }, {
            name: "NEXT_PUBLIC_SMTP_EMAIL_AUTH",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("SMTP_Auth"),
            value: config?.NEXT_PUBLIC_SMTP_EMAIL_AUTH,
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">{t("email_settings")}</h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={"/api/config"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};

const Currency = ({config}) => {

    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const url = '/api/admin/currencies';
    const [editData, setEditData] = useState({});
    const columns = [{
        linkId: "currency_id", accessor: "currency_id", checkbox: true,
    }, {
        label: t('Name'), accessor: "currency_name", sortable: true, sortbyOrder: "desc",
    }, {
        label: t('Code'), accessor: "currency_code",
    }, {
        label: t('Symbol'), accessor: "symbol",
    }, {
        label: t("action"), linkId: "currency_id", btn: true, flex: "d-inline-flex", cell: (row, refetch) => {
            return (<>
                <Button
                    id={"edit" + row?.currency_id}
                    color="success"
                    size="sm"
                    className="btn-rounded waves-effect waves-light me-2"
                    onClick={() => {
                        row.refetch = refetch;
                        setEditData(row);
                        setModal(!modal);
                    }}
                >
                    <i className="mdi mdi-pencil-outline"/>
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target={"edit" + row?.currency_id}
                >
                    {t("edit")}
                </UncontrolledTooltip>
            </>);
        }, actions: [{
            name: "delete", link: url,
        },],
    },];

    const meta = {
        columns: 2, flexible: true, formItemLayout: [4, 8], fields: [{
            type: 'text',
            label: t('Currency Name'),
            placeholder: t('Currency Name'),
            value: editData?.currency_name,
            required: true,
            name: 'currency_name',
        }, {
            type: 'text',
            label: t('Currency Code'),
            placeholder: t('Currency Code'),
            value: editData?.currency_code,
            required: true,
            name: 'currency_code',
        }, {
            type: 'number',
            label: t('Currency Rate'),
            placeholder: t('Currency Rate'),
            required: true,
            value: editData?.exchange_rate,
            name: 'exchange_rate',
        }, {
            type: 'text',
            label: t('Currency Symbol'),
            placeholder: t('Currency Symbol'),
            required: true,
            value: editData?.symbol,
            name: 'symbol',
        }, {
            type: 'select',
            label: t('Precision'),
            placeholder: t('Precision'),
            required: true,
            options: [{value: 0, label: t('0')}, {value: 1, label: t('1')}, {value: 2, label: t('2')}, {
                value: 3, label: t('3')
            }, {value: 4, label: t('4')}, {value: 5, label: t('5')}],
            value: editData?.precision,
            name: 'precision',
        }, {
            type: 'select',
            label: t('Symbol Position'),
            placeholder: t('Symbol Position'),
            required: true,
            options: [{value: 'after', label: t('After Amount')}, {value: 'before', label: t('Before Amount')}],
            value: editData?.symbol_position,
            name: 'symbol_position',
        }, {
            type: 'submit', label: t('Update'), setModal: setModal,
        }],
    };

    const newCurrency = (<Fb meta={meta} form={true}
                             url={url}
                             layout={'vertical'}
                             id={editData?.currency_id}
                             to={'/saas/settings?type=currency'}/>);

    const actions = [{
        name: 'btn',
        label: t('new_currency'),
        className: 'btn-success',
        icon: 'ri-add-line',
        modal: true,
        setModal: setModal,
        onClick: () => {
            setEditData({});
        }
    }];

    return (<React.Fragment>
        <Card>
            <CardBody>
                <MyTable
                    actions={actions}
                    columns={columns}
                    url={"/api/admin/currencies"}
                />
            </CardBody>
        </Card>
        {modal ? <MyModal
            modal={modal}
            size={'lg'} title={t('New Currency')}
            handleClose={() => {
                setModal(false);
                setEditData({})

            }}>
            {newCurrency}
        </MyModal> : null}
    </React.Fragment>);
};

const SystemSettings = ({config}) => {
    const {t} = useTranslation();
    // get all timezones from moment-timezone
    const timezones = moment.tz.names();
    //write 7-8 date format here
    const dateFormats = [{label: "YYYY-MM-DD", value: "YYYY-MM-DD"}, {
        label: "DD-MM-YYYY", value: "DD-MM-YYYY"
    }, {label: "MM-DD-YYYY", value: "MM-DD-YYYY"}, {label: "YYYY/MM/DD", value: "YYYY/MM/DD"}, {
        label: "DD/MM/YYYY", value: "DD/MM/YYYY"
    }, {label: "MM/DD/YYYY", value: "MM/DD/YYYY"}, {label: "YYYY.MM.DD", value: "YYYY.MM.DD"}, {
        label: "DD.MM.YYYY", value: "DD.MM.YYYY"
    }, {label: "MM.DD.YYYY", value: "MM.DD.YYYY"},];
    //write 7-8 time format here
    const timeFormats = [{label: "HH:mm:ss", value: "HH:mm:ss"}, {
        label: "hh:mm:ss", value: "hh:mm:ss"
    }, {label: "HH:mm", value: "HH:mm"}, {label: "hh:mm", value: "hh:mm"},];


    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_TIMEZONE", type: "select", label: t("timezone"), options: timezones.map((timezone) => ({
                label: timezone, value: timezone,
            })), value: config?.NEXT_PUBLIC_TIMEZONE,
        }, {
            name: "NEXT_PUBLIC_DATE_FORMAT",
            type: "select",
            label: t("date_format"),
            options: dateFormats,
            value: config?.NEXT_PUBLIC_DATE_FORMAT,
        }, {
            name: "NEXT_PUBLIC_TIME_FORMAT",
            type: "select",
            label: t("time_format"),
            options: timeFormats,
            value: config?.NEXT_PUBLIC_TIME_FORMAT,
        }, {
            name: "NEXT_PUBLIC_DEFAULT_CURRENCY", type: "select", label: t("currency"), required: true, getOptions: {
                url: "/api/admin/currencies",
            }, value: Number(config?.NEXT_PUBLIC_DEFAULT_CURRENCY),
        }, {
            name: "NEXT_PUBLIC_DEFAULT_LANGUAGE",
            required: true,
            type: "select",
            label: t("default_language"),
            getOptions: {
                url: "/api/admin/languages", where: {active: 1},
            },
            value: config?.NEXT_PUBLIC_DEFAULT_LANGUAGE,
            help: "Allow User Language Selection",
            helpClass: "fs-11 text-muted",
        }, {
            name: "NEXT_PUBLIC_DEFAULT_PACKAGE",
            required: true,
            type: "select",
            label: t("default_package"),
            getOptions: {
                url: "/api/admin/packages", where: {status: 1},
            },
            value: Number(config?.NEXT_PUBLIC_DEFAULT_PACKAGE),
            help: "Default Membership Plan for New Users",
            helpClass: "fs-11 text-muted",
        }, {
            name: "NEXT_PUBLIC_NEED_EMAIL_VERIFICATION",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("unverified_user_can_login"),
            value: config?.NEXT_PUBLIC_NEED_EMAIL_VERIFICATION,
            help: t("allow_unverified_user_to_login"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "NEXT_PUBLIC_MAINTENANCE",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("maintenance"),
            value: config?.NEXT_PUBLIC_MAINTENANCE,
            help: t("site_maintenance_mode"),
            helpClass: "fs-11 text-muted",
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">
                    {t("system_settings")}
                </h5>
            </CardHeader>
            <CardBody>
                <Fb meta={meta} form={true} url={"/api/config"}/>
            </CardBody>
        </Card>
    </React.Fragment>);
};

const ThemeSetting = ({config}) => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_COMPANY_FAVICON",
            type: "file",
            label: t("favicon"),
            value: config?.NEXT_PUBLIC_COMPANY_FAVICON,
            help: "Size 16x16 PX",
        }, {
            name: "NEXT_PUBLIC_COMPANY_LOGO",
            type: "file",
            label: t("logo"),
            value: config?.NEXT_PUBLIC_COMPANY_LOGO,
            help: "Size 170x60 PX",
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };
    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">{t("theme_setting")}</h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={"/api/config"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};
const AISettings = ({config}) => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 7], fields: [{
            col: 2,
            labelCol: 2,
            inputCol: 7,
            name: "NEXT_PUBLIC_BAD_WORDS",
            type: "textarea",
            label: t("bad_words"),
            value: config?.NEXT_PUBLIC_BAD_WORDS,
            help: t("Comma Separated Bad Words"),
            helpClass: "text-muted fs-11",
        }, {
            col: 2,
            labelCol: 2,
            inputCol: 7,
            name: "NEXT_PUBLIC_OPENAI_API_KEY",
            type: "text",
            label: t("OpenAI_API_Key"),
            required: true,
            value: config?.NEXT_PUBLIC_OPENAI_API_KEY,
        }, {
            col: 2,
            labelCol: 2,
            inputCol: 7,
            name: "NEXT_PUBLIC_STABILITY_API_KEY",
            type: "text",
            label: t("stability_API_key"),
            value: config?.NEXT_PUBLIC_STABILITY_API_KEY,
        }, {
            required: true, name: "NEXT_PUBLIC_IMAGE_MODEL", type: "select", label: t("image_model"), options: [{
                label: "openAI", value: "DALL-E",
            }, {
                label: "stable_diffusion", value: "stable-diffusion",
            },], value: config?.NEXT_PUBLIC_IMAGE_MODEL,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_AI_DOCUMENTS",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("ai_documents"),
            value: config?.NEXT_PUBLIC_SETTINGS_AI_DOCUMENTS,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_AI_IMAGES",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("ai_image"),
            value: config?.NEXT_PUBLIC_SETTINGS_AI_IMAGES,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_AI_IMAGES_SPEECH_TO_TEXT",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("speech_to_text"),
            value: config?.NEXT_PUBLIC_SETTINGS_AI_IMAGES_SPEECH_TO_TEXT,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_AI_CODES",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("AI_chats"),
            value: config?.NEXT_PUBLIC_SETTINGS_AI_CODES,
        }, {
            col: 2, labelCol: 2, inputCol: 10, type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">{t("Ai_setting")}</h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={"/api/config"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};

const BillingDetails = ({config}) => {
    const {t} = useTranslation();
    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "NEXT_PUBLIC_SETTINGS_INVOICE_NUMBER_PREFIX",
            type: "text",
            label: t("invoice_prefix"),
            value: config?.NEXT_PUBLIC_SETTINGS_INVOICE_NUMBER_PREFIX,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_NAME",
            type: "text",
            label: t("name"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_NAME,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_EMAIL",
            type: "email",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("email"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_EMAIL,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_PHONE",
            type: "text",
            label: t("phone"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_PHONE,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_ADDRESS",
            type: "text",
            label: t("address"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_ADDRESS,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_CITY",
            type: "text",
            label: t("city"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_CITY,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_ZIP_CODE",
            type: "text",
            label: t("zip_code"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_ZIP_CODE,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_COUNTRY",
            type: "text",
            label: t("country"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_COUNTRY,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_TAX_TYPE",
            type: "text",
            label: t("tax_type"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_TAX_TYPE,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_BILLING_TAX_ID",
            type: "text",
            label: t("tax_id"),
            value: config?.NEXT_PUBLIC_SETTINGS_BILLING_TAX_ID,
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">
                    {t("billing_details")}
                </h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    // layout={"vertical"}
                    url={"/api/config"}
                    // to={"/admin/settings"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};

const GooglereCAPTCHA = () => {
    const {t} = useTranslation();
    const meta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "NEXT_PUBLIC_SETTINGS_GOOGLE_PUBLIC_KEY",
            type: "text",
            label: t("public_key"),
            value: config?.NEXT_PUBLIC_SETTINGS_GOOGLE_PUBLIC_KEY,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_GOOGLE_PRIVATE_KEY",
            type: "text",
            label: t("private_key"),
            value: config?.NEXT_PUBLIC_SETTINGS_GOOGLE_PRIVATE_KEY,
        }, {
            name: "NEXT_PUBLIC_SETTINGS_GOOGLE_RECAPTCHA",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 d-flex",
            label: t("google_reCAPTCHA"),
            value: config?.NEXT_PUBLIC_SETTINGS_GOOGLE_RECAPTCHA,
        }, {
            render() {
            },
        }, {
            type: "submit", label: t("submit"), // setModal: setModal,
        },],
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">
                    {t("google_reCAPTCHA")}
                </h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={"/api/config"}
                />
            </CardBody>
        </Card>
    </React.Fragment>);
};

const PaymentGateway = ({config}) => {
    let info = "";
    const api = new API();
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [updatePaymentData, setUpdatePaymentData] = useState({});
    const [paymentDetailsData, setPaymentDetailsData] = useState({});
    const router = useRouter();

    // ------- for modal data end ------------
    const allMethods = Helper.paymentMethods();
    const updatePaymentMethod = (item) => {
        setUpdatePaymentData(item);
        setNewModal(!newModal);
    };
    const paymentDetails = (item) => {
        setPaymentDetailsData(item);
        setModal(!newModal);
    };
    const activeStatus = async (even, data) => {
        const checked = even.target.checked;
        const name = data.status.name;
        const input = {
            [name]: checked,
        };
        const res = await api.create("/api/config", input);
        if (res.affectedRows > 0) {
            notify("success", t("status_updated_successfully"));
            router.push("/saas/settings");
        }
    };

    return (<React.Fragment>
        <Card>
            <CardBody className="pb-0">
                <div className="table-responsive table-card  mb-0">
                    <table className="table align-middle pb-0 mb-0" id="customerTable">
                        <thead className="table-light">
                        <tr>
                            <th>{t("payment_method")}</th>
                            <th>{t("client_id")}</th>
                            <th>{t("client_secret")}</th>
                            <th>{t("status")}</th>
                            <th>{t("action")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {allMethods.map((item, index) => {
                            return (<tr key={index}>
                                <td>{item?.name}</td>
                                <td>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() => {
                                            // copy to clipboard
                                            navigator.clipboard.writeText(item?.client_id?.value);
                                            notify("success", t("copied_to_clipboard"));
                                        }}
                                    >
                                        <i className="ri-file-copy-line"></i>{" "}
                                        {t("copy_client_id")}
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        color="warning"
                                        size="sm"
                                        onClick={() => {
                                            // copy to clipboard
                                            navigator.clipboard.writeText(item?.client_secret?.value);
                                            notify("success", t("copied_to_clipboard"));
                                        }}
                                    >
                                        <i className="ri-file-copy-line"></i>{" "}
                                        {t("copy_client_secret")}
                                    </Button>
                                </td>
                                <td>
                                    <div className="form-check form-switch form-check-inline mt-2 ">
                                        <input
                                            type="checkbox"
                                            name={item?.status?.name}
                                            className={`form-check-input select_one `}
                                            value={item?.status?.value}
                                            defaultChecked={item?.status?.value == "1" ? "checked" : ""}
                                            onClick={(e) => activeStatus(e, item)}
                                        />
                                    </div>
                                </td>

                                <td>
                                    <div className="flex-shrink-0 ">
                                        <ul className="list-inline hstack gap-2 mb-0">
                                            <li className="list-inline-item me-0">
                                                <Link
                                                    className="btn btn-sm btn-success text-decoration-none"
                                                    href=""
                                                    onClick={() => updatePaymentMethod(item)}
                                                >
                                                    <i className="ri-pencil-line"></i>
                                                </Link>
                                            </li>
                                            <li className="list-inline-item me-0">
                                                <Link
                                                    className="btn btn-sm btn-warning text-decoration-none"
                                                    href=""
                                                    onClick={() => paymentDetails(item)}
                                                >
                                                    <i className="ri-eye-line"></i>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>);
                        })}
                        </tbody>
                    </table>
                </div>
            </CardBody>
        </Card>
        {newModal ? (<MyModal
            size={"md"}
            modal={newModal}
            title={t("update_payment_methods")}
            handleClose={() => {
                router.push(`/saas/settings`);
                setNewModal(false);
            }}
            children={<NewPackage setModal={setNewModal} data={updatePaymentData}/>}
        />) : null}

        {modal ? (<MyModal
            size={"md"}
            modal={modal}
            title={t("payment_payment_methods")}
            handleClose={() => {
                router.push(`/saas/settings`);
                setModal(false);
            }}
            children={<PaymentMethodList data={paymentDetailsData}/>}
        />) : null}
    </React.Fragment>);
};
export const NewPackage = ({data, setModal}) => {
    const {t} = useTranslation();
    const url = "/api/config";
    const meta = {
        fields: [{
            name: "NEXT_PUBLIC_PAYMENT_METHODS_NAME", type: "text", label: t("method_name"), value: data?.name,
        }, {
            name: data?.client_id?.name, type: "text", label: t("client_id"), value: data?.client_id?.value,
        }, {
            name: data?.client_secret?.name, type: "text", label: t("client_secret"), value: data?.client_secret?.value,
        }, {
            label: t("status"),
            selectOne: true,
            type: "checkbox",
            name: data?.status?.name,
            customClass: "form-switch form-check-inline mt-2 ",
            value: data?.status?.value,
        },],
    };

    meta.fields.push({
        type: "submit", label: t("submit"), setModal: setModal, // resetData: setPaymentGateway,
    });

    // ------- for modal data end ------------
    return (<React.Fragment>
        <CardBody>
            <Fb meta={meta} form={true} url={url} to={"/saas/settings"}/>
        </CardBody>
    </React.Fragment>);
};
export const PaymentMethodList = ({data, setModal}) => {
    const {t} = useTranslation();

    // ------- for modal data end ------------
    return (<div className="row">
        <div className="table-responsive ">
            <table id={"payment-details-table"} className="table mb-0">
                <tbody>
                <tr>
                    <div className="row">
                        <div className="col-4">
                            <td className="fw-medium">{t("method_name")}</td>
                        </div>
                        <div className="col-8">
                            <td>{data?.name}</td>
                        </div>
                    </div>
                </tr>
                <tr>
                    <div className="row">
                        <div className="col-4">
                            <td className="fw-medium">{t("client_id")}</td>
                        </div>
                        <div className="col-8">
                            <td style={{wordBreak: "break-all"}}>
                                {data?.client_id?.value} &nbsp; &nbsp;
                                <i
                                    className="fas fa-copy"
                                    style={{color: "#405189", fontSize: "16px"}}
                                ></i>
                            </td>
                        </div>
                    </div>
                </tr>
                <tr>
                    <div className="row">
                        <div className="col-4">
                            <td className="fw-medium">{t("client_secret")}</td>
                        </div>
                        <div className="col-8">
                            <td style={{wordBreak: "break-all"}}>
                                {data?.client_secret?.value} &nbsp; &nbsp;
                                <i
                                    className="fas fa-copy"
                                    style={{color: "#405189", fontSize: "16px"}}
                                ></i>
                            </td>
                        </div>
                    </div>
                </tr>
                <tr>
                    <div className="row">
                        <div className="col-4">
                            <td className="fw-medium">{t("status")}</td>
                        </div>
                        <div className="col-8">
                            <td>
                                {data?.status?.value === "1" ? (
                                    <span className="badge bg-soft-primary badge bg-primary">
                                                {t("active")}
                                            </span>) : (<span className="badge bg-soft-primary badge bg-primary">
                                                {t("inactive")}
                                            </span>)}
                            </td>
                        </div>
                    </div>
                </tr>
                </tbody>
            </table>
        </div>
    </div>);
};

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
