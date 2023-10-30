import React, { useContext, useEffect, useState } from "react";
import MyTable from "../MyTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Row,
} from "reactstrap";
import BreadCrumb from "../BreadCrumb";

import { useRouter } from "next/router";
import {
    DisplayMoney,
    GetDefaultCurrency,
    GetPaymentMethods,
    Info,
} from "../config";
import Fb, { MyModal } from "../Fb";
import { Context } from "../../pages/_app";

let info = "";
let url = "/api/admin/payments";

export function Payments({ moduleWhere, moduleInfo }) {
    const value = useContext(Context);
    const [modal, setModal] = useState(false);
    const [dueAmount, setDueAmount] = useState(moduleInfo?.due_amount || 0);
    const [amount, setAmount] = useState(dueAmount);
    const [rate, setRate] = useState(moduleInfo?.conversion_rate);
    const { t } = useTranslation();
    const router = useRouter();
    const { payment_id } = router.query || {};
    let updateInfo = Info(url, payment_id);
    if (payment_id) {
        info = updateInfo;
    } else {
        info = "";
    }
    const { data: currencyInfo, isLoading } = GetDefaultCurrency();

    useEffect(() => {
        if (info?.data?.amount) {
            setDueAmount((moduleInfo?.due_amount || 0) + (info?.data?.amount || 0));
            setAmount(info?.data?.amount);
            setRate(info?.data?.conversion_rate);
        }
    }, [info?.data]);

    // ------- for table data start ------------
    const columns = [
        {
            linkId: "category_id",
            accessor: "payment_id",
            checkbox: true,
        },
        {
            label: "Payment No",
            accessor: "prefix",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "payment_id",
            actions: [
                {
                    name: "editModal",
                    id: "payment_id",
                    link: `/admin/invoices/details/${moduleWhere.module_id}`,
                    setModal: setModal, // id: 'category_id' // linkId is optional
                },
                { name: "details", link: "/api/admin/details/" },
                { name: "delete", link: url },
            ],
        },
        {
            label: t("amount"),
            accessor: "amount",
            money: true,
            sortable: true,
            sortbyOrder: "desc",
        },
        {
            label: t("payment_date"),
            accessor: "payment_date",
            date: true,
            sortable: true,
            sortbyOrder: "desc",
        },
        {
            label: t("payment_method"),
            accessor: "payment_method",
            sortable: true,
            sortbyOrder: "desc",
        },
    ];

    const isDisabled = currencyInfo?.currency_code === moduleInfo?.currency_code;
    let rateLabel =
        t("Rate") +
        ` 1 ${moduleInfo?.currency_code} = ? ${currencyInfo?.currency_code}`;
    if (isDisabled) {
        rateLabel = t("Rate") + " (Disabled)";
    }
    const initialValues = {
        prefix: info?.data?.prefix || value?.config.NEXT_PUBLIC_PAYMENT_PREFIX,
        number: info?.data?.number,
        format: info?.data?.format || value?.config.NEXT_PUBLIC_PAYMENT_FORMAT,
        module: info?.data?.module || moduleWhere.module,
        module_id: info?.data?.module_id || moduleWhere.module_id,
        paid_by: info?.data?.paid_by || moduleInfo?.client_id,
        currency_id:
            info?.data?.currency_id ||
            moduleInfo?.currency_id ||
            currencyInfo?.currency_id,
        payment_date: info?.data?.payment_date,
        amount: info?.data?.amount || dueAmount,
        conversion_rate: info?.data?.conversion_rate || rate,
        payment_method: info?.data?.payment_method,
        notes: info?.data?.notes,
        transaction_number: info?.data?.transaction_number,
        transaction_prefix: info?.data?.transaction_prefix,
        transaction_format: info?.data?.transaction_format,
    };

    const meta = {
        columns: 2,
        formItemLayout: [4, 8],
        fields: [
            {
                label: t("payment_no"),
                type: "prefix",
                prefix: value?.config.NEXT_PUBLIC_PAYMENT_PREFIX,
                format: value?.config.NEXT_PUBLIC_PAYMENT_FORMAT,
                name: "number",
            },
            {
                type: "hidden",
                value: moduleWhere.module,
                name: "module",
            },
            {
                type: "hidden",
                value: moduleWhere.module_id,
                name: "module_id",
            },
            {
                type: "hidden",
                value: info.data?.paid_by || moduleInfo?.client_id,
                name: "paid_by",
            },
            {
                type: "hidden",
                value:
                    info.data?.currency_id ||
                    moduleInfo?.currency_id ||
                    currencyInfo?.currency_id,
                name: "currency_id",
            },
            {
                type: "date",
                label: t("payment_date"),
                name: "payment_date",
                value: new Date().toISOString().slice(0, 10),
            },
            {
                type: "number",
                label: t("amount_received") + ` (${moduleInfo?.symbol})`,
                value: amount,
                name: "amount",
                required: true,
                addonAfter: `Due = ${DisplayMoney(dueAmount, moduleInfo)}`,
                onChange: (value) => {
                    if (value > dueAmount) {
                        alert(t("amount_should_be_less_than_or_equal_to_due_amount"));
                        setAmount(dueAmount);
                        return false;
                    } else {
                        setAmount(value);
                    }
                },
            },
            {
                type: "number",
                label: rateLabel,
                value: rate,
                name: "conversion_rate",
                disabled: isDisabled,
                onChange: (value) => {
                    setRate(value);
                },
                addonAfter: `Total = ${DisplayMoney(amount * rate, currencyInfo)}`,
            },
            {
                type: "select",
                label: t("payment_method"),
                value: info.data?.payment_method,
                function: GetPaymentMethods,
                name: "payment_method",
            },
            {
                type: "text",
                label: t("transaction_id"),
                value: info.data?.trans_id,
                name: "trans_id",
            },
            {
                type: "prefix",
                label: t("transaction_no"),
                prefix: value?.config.NEXT_PUBLIC_TRANSACTION_PREFIX,
                format: value?.config.NEXT_PUBLIC_TRANSACTION_FORMAT,
                url: "/api/admin/transactions",
                prefixStart: "transaction",
                name: "transaction_number",
                value: info?.data,
            },
            {
                type: "select",
                name: "account_id",
                label: t("account"),
                value: info.data?.account_id,
                getOptions: {
                    url: "/api/admin/accounts",
                },
            },
            {
                type: "textarea",
                label: t("notes"),
                value: info.data?.notes,
                name: "notes",
            },
            {
                customClass: "form-switch mt-2",
                type: "checkbox",
                label: t("send_mail"),
                value: info.data?.status,
                name: "send_mail",
                options: [
                    {
                        label: t(""),
                        value: 1,
                    },
                ],
            },
            {
                type: "submit",
                label: t("submit"),
                setModal: setModal,
            },
        ],
    };
    const newPayment = (
        <Fb
            meta={meta}
            form={true}
            url={url}
            to={"/admin/invoices/details/" + moduleWhere.module_id}
            initialValues={info.data?.payment_id ? initialValues : null}
            id={info.data?.payment_id}
        // viewMode
        />
    );
    const actions = [
        {
            name: "btn",
            label: t("new_payment"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            size: "xl",
            children: newPayment,
        },
    ];
    // ------- for modal data end ------------
    return (
        <React.Fragment>
            <div className={`${moduleWhere ? "" : "page-content"}`}>
                <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                    {!moduleWhere && (
                        <BreadCrumb title={t("payment")} pageTitle={t("payment_list")} />
                    )}
                    <Card>
                        <CardBody>
                            {/*{newPayment}*/}
                            {modal && payment_id ? (
                                <MyModal
                                    loading={info?.isLoading}
                                    size={"xl"}
                                    modal={modal}
                                    title={t("Edit Payment")}
                                    handleClose={() => {
                                        router.push(
                                            `/admin/invoices/details/${moduleWhere.module_id}`
                                        );
                                        setModal(false);
                                    }}
                                >
                                    {newPayment}
                                </MyModal>
                            ) : null}
                            <MyTable
                                columns={columns}
                                url={url}
                                where={{
                                    "tbl_payments.module": moduleWhere.module,
                                    "tbl_payments.module_id": moduleWhere.module_id,
                                }}
                                actions={actions}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </React.Fragment>
    );
}
