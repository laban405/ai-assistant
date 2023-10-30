import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
} from "reactstrap";
import React, { useContext, useEffect, useState } from "react";

import {
    AllDepartment,
    GetCurrencies,
    GetData,
    GetPaymentMethods,
    Info,
} from "../config";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import moment from "moment"; // for date
// moment time zone
import "moment-timezone";
import BreadCrumb from "../BreadCrumb";
import Helper from "../../lib/Helper";
import MyTable from "../MyTable";
import { useRouter } from "next/router";
import * as url from "url";
import Fb, { MyModal } from "../Fb";
import { Context } from "../../pages/_app";

export const CompanySettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("currencies");

    return (
        <Card>
            <Nav pills className="nav-pills-custom mt-2">
                <NavItem>
                    <NavLink
                        href="#"
                        className={activeTab === "default" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("default");
                        }}
                    >
                        <i className="bx bx-calendar me-1" />
                        {t("default")}
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        href="#"
                        className={activeTab === "categories" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("categories");
                        }}
                    >
                        <i className="bx bx-file me-1" />
                        {t("categories")}
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        href="#"
                        className={activeTab === "currencies" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("currencies");
                        }}
                    >
                        <i className="bx bx-dollar-circle me-1" />
                        {t("currencies")}
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId={activeTab}>
                    {activeTab === "default" && <DefaultTab />}
                    {activeTab === "categories" && <CategoriesTab />}
                    {activeTab === "currencies" && <CurrenciesTab />}
                </TabPane>
            </TabContent>
        </Card>
    );
};

const CurrenciesTab = () => {
    const { t } = useTranslation();
    const [modal, setModal] = useState(false);
    const url = "/api/admin/currencies";
    let info = "";
    const router = useRouter();
    const { currency_id } = router.query || {};
    let updateInfo = Info(url, currency_id);
    if (currency_id) {
        info = updateInfo;
    } else {
        info = "";
    }
    if (info?.isLoading) {
        return <div>Loading...</div>;
    }

    const columns = [
        {
            linkId: "currency_id",
            accessor: "currency_id",
            checkbox: true,
        },
        {
            label: t("name"),
            accessor: "currency_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "currency_id",
            actions: [
                {
                    name: "editModal",
                    id: "currency_id",
                    link: "/admin/settings",
                    setModal: setModal, // id: 'category_id' // linkId is optional
                },
                { name: "details", link: "/api/admin/details/" },
                { name: "delete", link: url },
            ],
        },
        {
            label: t("code"),
            accessor: "currency_code",
        },
        {
            label: t("symbol"),
            accessor: "symbol",
        },
        {
            label: t("rate"),
            accessor: "exchange_rate",
        },
        {
            label: t("default"),
            accessor: "is_default",
            update: true,
            type: "checkbox",
            onlyOne: true,
            dependency: "yes", // yes is the field value . first get id where is_default = yes and check the id is exist or not into dependency table if exist then don't update  else update
            linkId: "currency_id",
            sortable: true,
            sortbyOrder: "desc",
        },
    ];

    const meta = {
        columns: 2,
        flexible: true,
        formItemLayout: [4, 8],
        fields: [
            {
                type: "text",
                label: t("currency_name"),
                placeholder: t("currency_name"),
                value: info?.data?.currency_name,
                required: true,
                name: "currency_name",
            },
            {
                type: "text",
                label: t("currency_code"),
                placeholder: t("currency_code"),
                value: info?.data?.currency_code,
                required: true,
                name: "currency_code",
            },
            {
                type: "number",
                label: t("currency_rate"),
                placeholder: t("currency_rate"),
                required: true,
                value: info?.data?.exchange_rate,
                name: "exchange_rate",
            },
            {
                type: "text",
                label: t("currency_symbol"),
                placeholder: t("currency_symbol"),
                required: true,
                value: info?.data?.symbol,
                name: "symbol",
            },
            {
                type: "select",
                label: t("precision"),
                placeholder: t("precision"),
                required: true,
                options: [
                    { value: 0, label: t("0") },
                    { value: 1, label: t("1") },
                    { value: 2, label: t("2") },
                    {
                        value: 3,
                        label: t("3"),
                    },
                    { value: 4, label: t("4") },
                    { value: 5, label: t("5") },
                ],
                value: info?.data?.precision,
                name: "precision",
            },
            {
                type: "select",
                label: t("symbol_position"),
                placeholder: t("symbol_position"),
                required: true,
                options: [
                    { value: "after", label: t("after_amount") },
                    { value: "before", label: t("before_amount") },
                ],
                value: info?.data?.symbol_position,
                name: "symbol_position",
            },
            {
                type: "select",
                label: t("decimal_separator"),
                placeholder: t("decimal_separator"),
                required: true,
                options: [
                    { value: ".", label: t("dot") },
                    { value: ",", label: t("comma") },
                    {
                        value: " ",
                        label: t("space"),
                    },
                    { value: "'", label: t("single_quote") },
                    { value: '"', label: t('double_quote') },
                ],
                value: info?.data?.decimal_separator,
                name: "decimal_separator",
            },
            {
                type: "select",
                label: t("thousand_separator"),
                options: [
                    { value: ".", label: t("dot") },
                    { value: ",", label: t("comma") },
                    {
                        value: " ",
                        label: t("Space( )"),
                    },
                    { value: "'", label: t("single_quote") },
                    { value: '"', label: t('double_quote') },
                ],
                value: info?.data?.thousand_separator,
                name: "thousand_separator",
            },
            {
                type: "checkbox",
                label: t("default_currency"),
                customClass: "form-switch form-check-inline mt-2 ",
                selectOne: true,
                options: [{ value: "yes", label: t("yes") }],
                value: info?.data?.is_default,
                name: "is_default",
            },
            {
                type: "submit",
                label: t("update"),
                className: "text-end ",
                setModal: setModal,
            },
        ],
    };

    const newCurrency = (
        <Fb
            meta={meta}
            form={true}
            url={url}
            id={info?.data?.currency_id}
            to={"/admin/settings"}
        />
    );

    const actions = [
        {
            name: "btn",
            label: t("new_currency"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            setModal: setModal,
        },
    ];

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <MyTable
                        actions={actions}
                        columns={columns}
                        url={"/api/admin/currencies"}
                    // where={{type: "productAttribute"}}
                    // actions={actions}
                    />
                </CardBody>
            </Card>
            {modal ? (
                <MyModal
                    modal={modal}
                    size={"xl"}
                    show={!!currency_id}
                    title={t("new_currency")}
                    handleClose={() => {
                        // reset router query params
                        setModal(false);
                    }}
                >
                    {newCurrency}
                </MyModal>
            ) : null}
        </React.Fragment>
    );
};
const CategoriesTab = () => {
    const { t } = useTranslation();
    const url = "/api/admin/categories";
    const [modal, setModal] = useState(false);
    let info = "";
    const router = useRouter();
    const { category_id } = router.query || {};
    let updateInfo = Info(url, category_id);
    if (category_id) {
        info = updateInfo;
    } else {
        info = "";
    }
    if (info?.isLoading) {
        return <div>Loading...</div>;
    }

    const columns = [
        {
            linkId: "category_id",
            accessor: "category_id",
            checkbox: true,
        },
        {
            label: t("category_name"),
            accessor: "category_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "category_id",
            actions: [
                {
                    name: "editModal",
                    id: "category_id",
                    link: "/admin/settings",
                    setModal: setModal,

                    // id: 'category_id' // linkId is optional
                },
                { name: "details", link: "/api/admin/details/" },
                { name: "delete", link: url },
            ],
        },
        {
            label: t("category_for"),
            accessor: "type",
            sortable: true,
            sortbyOrder: "desc",
            lang: true,
        },
        {
            label: t("description"),
            accessor: "descriptions",
        },
        {
            label: t("status"),
            accessor: "status",
            update: true,
            type: "checkbox",
            number: true,
            linkId: "category_id",
            sortable: true,
            sortbyOrder: "desc",
        },
    ];
    const formData = {
        type: {
            type: "select",
            label: t("category_for"),
            placeholder: t("category_for"),
            required: true,
            value: info?.data?.type,
            options: [
                { value: "expense", label: t("expense") },
                { value: "income", label: t("income") },
                {
                    value: "asset",
                    label: t("asset"),
                },
                { value: "liability", label: t("liability") },
                { value: "equity", label: t("equity") },
            ],
        },
        category_name: {
            type: "text",
            label: t("category_name"),
            placeholder: t("category_name"),
            required: true,
            value: info?.data?.category_name,
        },
        descriptions: {
            type: "text",
            label: t("category_description"),
            placeholder: t("category_description"),
            value: info?.data?.descriptions,
        },
        status: {
            type: "checkbox",
            label: t("status"),
            className: "form-check-inline",
            customClass: "form-switch mt-2",
            value: info?.data?.status || "0",
            options: [{ value: 1, label: t("active") }],
        },
        submit: {
            type: "submit",
            label: t("save"),
            className: "text-end",
            setModal: setModal,
        },
    };
    const newCategory = (
        <Form
            data={formData}
            cClass={{
                wrapperClass: "row mb-3",
                labelClass: "",
                inputClass: "",
            }}
            url={url}
            id={info?.data?.category_id}
        />
    );

    const actions = [
        {
            name: "btn",
            label: t("new_category"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            size: "md",
            children: newCategory,
        },
    ];

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    {modal ? (
                        <MyModal
                            modal={modal}
                            title={t("edit_category")}
                            handleClose={() => {
                                // reset router query params
                                setModal(false);
                            }}
                        >
                            {newCategory}
                        </MyModal>
                    ) : null}

                    <MyTable
                        actions={actions}
                        columns={columns}
                        url={"/api/admin/categories"}
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    );
};
const DefaultTab = () => {
    const value = useContext(Context);
    const { t } = useTranslation();
    const formData = {
        NEXT_PUBLIC_DEFAULT_ACCOUNT: {
            type: "select",
            label: t("default_account"),
            placeholder: t("default_account"),
            required: true,
            value: Number(value?.config.NEXT_PUBLIC_DEFAULT_ACCOUNT),
            getOptions: {
                url: "/api/admin/accounts",
                label: "account_name",
                value: "account_id",
            },
        },
        NEXT_PUBLIC_DEFAULT_TIMEZONE: {
            type: "select",
            label: t("default_timezone"),
            placeholder: t("default_timezone"),
            required: true,
            value: value?.config.NEXT_PUBLIC_DEFAULT_TIMEZONE, // get all timezones from moment
            options: moment.tz.names().map((tz) => ({ value: tz, label: tz })),
        },
        NEXT_PUBLIC_DATE_FORMAT: {
            type: "select",
            label: t("default_date_format"),
            placeholder: t("default_date_format"),
            required: true,
            value: value?.config.NEXT_PUBLIC_DATE_FORMAT,
            options: [
                { value: "DD-MM-YYYY", label: moment().format("DD-MM-YYYY") },
                {
                    value: "MM-DD-YYYY",
                    label: moment().format("MM-DD-YYYY"),
                },
                { value: "YYYY-MM-DD", label: moment().format("YYYY-MM-DD") },
                {
                    value: "DD/MM/YYYY",
                    label: moment().format("DD/MM/YYYY"),
                },
                { value: "MM/DD/YYYY", label: moment().format("MM/DD/YYYY") },
                {
                    value: "YYYY/MM/DD",
                    label: moment().format("YYYY/MM/DD"),
                },
                { value: "DD.MM.YYYY", label: moment().format("DD.MM.YYYY") },
                {
                    value: "MM.DD.YYYY",
                    label: moment().format("MM.DD.YYYY"),
                },
                { value: "YYYY.MM.DD", label: moment().format("YYYY.MM.DD") },
                {
                    value: "DD,MM,YYYY",
                    label: moment().format("DD,MM,YYYY"),
                },
                { value: "MM,DD,YYYY", label: moment().format("MM,DD,YYYY") },
                {
                    value: "YYYY,MM,DD",
                    label: moment().format("YYYY,MM,DD"),
                },
                { value: "DD MM YYYY", label: moment().format("DD MM YYYY") },
                {
                    value: "MM DD YYYY",
                    label: moment().format("MM DD YYYY"),
                },
                { value: "YYYY MM DD", label: moment().format("YYYY MM DD") },
                {
                    value: "DD MM YY",
                    label: moment().format("DD MM YY"),
                },
                { value: "MM DD YY", label: moment().format("MM DD YY") },
                {
                    value: "YY MM DD",
                    label: moment().format("YY MM DD"),
                },
                { value: "DD,MM,YY", label: moment().format("DD,MM,YY") },
                {
                    value: "MM,DD,YY",
                    label: moment().format("MM,DD,YY"),
                },
                { value: "YY,MM,DD", label: moment().format("YY,MM,DD") },
                {
                    value: "DD-MM-YY",
                    label: moment().format("DD-MM-YY"),
                },
                { value: "MM-DD-YY", label: moment().format("MM-DD-YY") },
                {
                    value: "YY-MM-DD",
                    label: moment().format("YY-MM-DD"),
                },
                { value: "DD/MM/YY", label: moment().format("DD/MM/YY") },
                {
                    value: "MM/DD/YY",
                    label: moment().format("MM/DD/YY"),
                },
                { value: "YY/MM/DD", label: moment().format("YY/MM/DD") },
                {
                    value: "DD.MM.YY",
                    label: moment().format("DD.MM.YY"),
                },
                { value: "MM.DD.YY", label: moment().format("MM.DD.YY") },
                {
                    value: "YY.MM.DD",
                    label: moment().format("YY.MM.DD"),
                },
            ],
        },
        NEXT_PUBLIC_TIME_FORMAT: {
            type: "select",
            label: t("default_time_format"),
            placeholder: t("default_time_format"),
            required: true,
            value: value?.config.NEXT_PUBLIC_TIME_FORMAT,
            options: [
                // will be with AM/PM
                { value: "hh:mm A", label: moment().format("hh:mm A") },
                {
                    value: "hh:mm a",
                    label: moment().format("hh:mm a"),
                },
                { value: "hh:mm", label: moment().format("hh:mm") },
                {
                    value: "hh:mm:ss A",
                    label: moment().format("hh:mm:ss A"),
                },
                { value: "hh:mm:ss a", label: moment().format("hh:mm:ss a") },
                {
                    value: "hh:mm:ss",
                    label: moment().format("hh:mm:ss"),
                },
            ],
        },
        NEXT_PUBLIC_MONEY_FORMAT: {
            type: "select",
            label: t("default_money_format"),
            placeholder: t("default_money_format"),
            required: true,
            value: value?.config.NEXT_PUBLIC_MONEY_FORMAT,
            options: [
                { value: "0,0.00", label: "1,000.00" },
                { value: "0,0", label: "1,000" },
                {
                    value: "0.0",
                    label: "1000.0",
                },
                { value: "0.00", label: "1000.00" },
                { value: "0,0.0000", label: "1,000.0000" },
                {
                    value: "0,0.000000",
                    label: "1,000.000000",
                },
                { value: "0,0.00000000", label: "1,000.00000000" },
                { value: "0,0.0000000000", label: "1,000.0000000000" },
                {
                    value: "0,0.000000000000",
                    label: "1,000.000000000000",
                },
            ],
        },
        NEXT_PUBLIC_DEFAULT_TAX: {
            type: "select",
            label: t("default_tax"),
            placeholder: t("default_tax"),
            isMulti: true,
            value: value?.config.NEXT_PUBLIC_DEFAULT_TAX,
            getOptions: {
                url: "/api/admin/taxes",
                value: "tax_id",
            },
        },
        NEXT_PUBLIC_DEFAULT_LANGUAGE: {
            type: "select",
            label: t("default_language"),
            placeholder: t("default_language"),
            required: true,
            value: value?.config.NEXT_PUBLIC_DEFAULT_LANGUAGE,
            getOptions: {
                url: "/api/admin/languages",
                value: "code",
                where: {
                    active: 1,
                },
            },
        },
        NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD: {
            type: "select",
            label: t("default_payment_method"),
            placeholder: t("default_payment_method"),
            required: true,
            value: value?.config.NEXT_PUBLIC_DEFAULT_PAYMENT_METHOD,
            function: GetPaymentMethods,
        }, // NEXT_PUBLIC_DEFAULT_PAYMENT_TERMS: {
        //     type: 'select',
        //     label: t('Default Payment Terms'),
        //     placeholder: t('Default Payment Terms'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_DEFAULT_PAYMENT_TERMS,
        // }, NEXT_PUBLIC_DEFAULT_INCOME_CATEGORY: {
        //     type: 'select',
        //     label: t('Default Income Category'),
        //     placeholder: t('Default Income Category'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_DEFAULT_INCOME_CATEGORY,
        // }, NEXT_PUBLIC_DEFAULT_EXPENSE_CATEGORY: {
        //     type: 'select',
        //     label: t('Default Expense Category'),
        //     placeholder: t('Default Expense Category'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_DEFAULT_EXPENSE_CATEGORY,
        // }, NEXT_PUBLIC_DEFAULT_SALE_VIEW: {
        //     type: 'select',
        //     label: t('Default Invoice Template'),
        //     placeholder: t('Default Invoice Template'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_DEFAULT_INVOICE_TEMPLATE,
        // }, NEXT_PUBLIC_DATE_FORMAT: {
        //     type: 'select',
        //     label: t('Date Format'),
        //     placeholder: t('Date Format'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_DATE_FORMAT,
        // }, NEXT_PUBLIC_TIME_FORMAT: {
        //     type: 'select',
        //     label: t('Time Format'),
        //     placeholder: t('Time Format'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_TIME_FORMAT,
        // }, NEXT_PUBLIC_CURRENCY_SYMBOL: {
        //     type: 'select',
        //     label: t('Currency Symbol'),
        //     placeholder: t('Currency Symbol'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_SYMBOL,
        // }, NEXT_PUBLIC_CURRENCY_SYMBOL_POSITION: {
        //     type: 'select',
        //     label: t('Currency Symbol Position'),
        //     placeholder: t('Currency Symbol Position'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_SYMBOL_POSITION,
        // }, NEXT_PUBLIC_CURRENCY_DECIMAL: {
        //     type: 'select',
        //     label: t('Currency Decimal'),
        //     placeholder: t('Currency Decimal'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_DECIMAL,
        // }, NEXT_PUBLIC_CURRENCY_DECIMAL_SEPARATOR: {
        //     type: 'select',
        //     label: t('Currency Decimal Separator'),
        //     placeholder: t('Currency Decimal Separator'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_DECIMAL_SEPARATOR,
        // }, NEXT_PUBLIC_CURRENCY_THOUSAND_SEPARATOR: {
        //     type: 'select',
        //     label: t('Currency Thousand Separator'),
        //     placeholder: t('Currency Thousand Separator'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_THOUSAND_SEPARATOR,
        // }, NEXT_PUBLIC_CURRENCY_DECIMAL_PLACES: {
        //     type: 'select',
        //     label: t('Currency Decimal Places'),
        //     placeholder: t('Currency Decimal Places'),
        //     required: true,
        //     value: value?.config.NEXT_PUBLIC_CURRENCY_DECIMAL_PLACES,
        //
        //
        // }

        submit: {
            type: "submit",
            label: t("update"),
            className: "text-end",
        },
    };
    /// card with custom button right side and calendar
    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <Form
                        data={formData}
                        url={"/api/config"}
                        cClass={{
                            wrapperClass: "row mb-3",
                            labelClass: "col-md-3 col-form-label text-end",
                            inputClass: "col-md-7",
                        }}
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    );
};





export const getServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale, ["common"])) },
  });
  