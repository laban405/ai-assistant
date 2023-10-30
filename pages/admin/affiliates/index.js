import React, {useContext, useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    API, DisplayMoney, GetDefaultCurrency, GetPaymentMethods, Info, MyID,
} from "../../../components/config";
import MyTable from "../../../components/MyTable";
import Fb, {MyModal, notify} from "../../../components/Fb";
import {Context} from "../../_app";

let url = "/api/admin/affiliateUsers";
const api = new API();
export default function Affiliates() {
    const {config} = useContext(Context);

    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

    const {t} = useTranslation();
    const myId = MyID();
    const [modal, setModal] = useState(false);
    const {
        data, isLoading: commissionLoading, refetch: commissionRefetch,
    } = Info(url, {"usr.user_id": myId});

    const remainingBalance = data?.total_balance - data?.withdrawal_amount || 0;

    const affiliateWidgets = [{
        id: 1,
        icon: "ri-user-2-line",
        label: t("total_referral"),
        counter: data?.total_referral || 0,
        badgeClass: "bg-primary",
    }, {
        id: 2,
        badgeClass: "bg-success",
        icon: "ri-money-dollar-circle-line",
        label: t("total_earning"),
        counter: DisplayMoney(data?.total_balance || 0, currencyInfo),
    }, {
        id: 3,
        badgeClass: "bg-warning",
        icon: "ri-money-dollar-circle-line",
        label: t("withdrawal_amount"),
        counter: DisplayMoney(data?.withdrawal_amount || 0, currencyInfo),
    }, {
        id: 4,
        badgeClass: "bg-danger",
        icon: "ri-money-dollar-circle-line",
        label: t("remaining_balance"),
        counter: DisplayMoney(remainingBalance, currencyInfo),
    },];
    const commissionColumns = [{
        label: t("total_amount"), accessor: "amount_was", sortable: true, money: true,
    }, {
        label: t("commission_amount"), accessor: "get_amount", sortable: true, money: true,
    }, {
        label: t("commission_type"), sortable: true, cell: (row) => {
            return (<span className={"ms-1"}>
            {row.commission_type === "percentage" ? row.commission_value + "%" : DisplayMoney(row.commission_value, currencyInfo)}
          </span>);
        },
    }, {
        label: t("date"), accessor: "date", sortable: true, dateTime: true,
    },];

    const withdrawalHistoryColumns = [{
        label: t("amount"), accessor: "amount", sortable: true, money: true,
    }, {
        label: t("status"), accessor: "status", sortable: true, lang: true,
    }, {
        label: t("date"), accessor: "created_at", sortable: true, dateTime: true,
    }, {
        label: t("action"), cell: (row, refetch) => {
            if (row.status === "pending" || row.status === "rejected") {
                return (<Button
                    color="danger"
                    size="sm"
                    onClick={async () => {
                        try {
                            if (confirm(t("are_you_sure?"))) {
                                await api.delete("/api/admin/affiliatePayouts", row.affiliate_payout_id);
                                await commissionRefetch();
                                await refetch();
                                notify("success", t("deleted_successfully"));
                            }
                        } catch (error) {
                            notify("warning", error.message);
                        }
                    }}
                >
                    {t("cancel")}
                </Button>);
            } else {
                // disabled button
                return (<Button color="danger" size="sm" disabled>
                    {t("cancel")}
                </Button>);
            }
        },
    },];

    const {
        data: allPaymentMethods, isLoading: paymentMethodsLoading, refetch: paymentMethodsRefetch,
    } = GetPaymentMethods();
    if (paymentMethodsLoading) {
        return (<div className="page-content">
            <Container fluid>
                <BreadCrumb pageTitle={t("all")} title={t("affiliates")}/>
                <Row>
                    {affiliateWidgets.map((widget) => (<Col xl={3} md={6} key={widget.id}>
                        <div
                            className="skeleton me-3"
                            style={{
                                width: "100%", height: "6rem", marginBottom: "0.5rem",
                            }}
                        />
                    </Col>))}
                </Row>
                <Row>
                    <Col xs={12}>
                        <div
                            className="skeleton me-3"
                            style={{
                                width: "100%", height: "6rem", marginBottom: "0.5rem",
                            }}
                        />
                    </Col>
                </Row>
            </Container>
        </div>);
    }
    const paymentMethods = JSON.parse(config?.NEXT_PUBLIC_WITHDRAWAL_PAYMENT_METHODS || "[]");

    const minimumWithdrawalAmount = parseFloat(config?.NEXT_PUBLIC_MINIMUM_PAYOUT_AMOUNT || 0);
    // return the payment methods options where id in paymentMethods array
    const paymentMethodsOptions = paymentMethods.map((methodId) => {
        // get payment method name by id
        return allPaymentMethods?.find((method) => method.value === methodId);
    });
    const meta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "amount",
            label: t("amount"),
            type: "number",
            required: true,
            value: remainingBalance,
            max: remainingBalance,
            min: remainingBalance > minimumWithdrawalAmount ?? minimumWithdrawalAmount,
        }, {
            name: "payment_method", label: t("method"), type: "select", required: true, options: paymentMethodsOptions,
        }, {
            name: "notes", label: t("details"), type: "textarea", required: true,
        }, {
            type: "submit", label: t("submit"), setModal,
        },],
    };

    const createPayout = (<Fb
        meta={meta}
        onSubmit={async (values) => {
            if (values.amount > remainingBalance) {
                notify("warning", t("you_can_not_withdraw_more_than_your_available_balance"));
                return;
            } else if (values.amount < minimumWithdrawalAmount) {
                notify("warning", t("you_can_not_withdraw_less_than_minimum_withdrawal_amount"));
                return;
            } else {
                values.status = "pending";
                values.user_id = myId;
                values.available_amount = remainingBalance;
                const res = await api.create("/api/admin/affiliatePayouts", values);
                if (res.insertId) {
                    notify("success", t("payout_request_created_successfully"));
                    await commissionRefetch();
                    setModal(false);
                    // redirect to the payout page
                    router.push("/admin/affiliates");
                }
            }
        }}
        // layout={'vertical'}
        form={true}
    />);

    return (<div className="page-content">
        <Container fluid>
            <BreadCrumb pageTitle={t("all")} title={t("affiliates")}/>
            <Row>
                {affiliateWidgets.map((widget) => (<Col xl={3} md={6} key={widget.id}>
                    {commissionLoading ? (<div
                        className="skeleton me-3"
                        style={{
                            width: "100%", height: "6rem", marginBottom: "0.5rem",
                        }}
                    />) : (<Card className="mini-stats-wid">
                        <CardBody>
                            <div className="d-flex">
                                <div className="flex-grow-1">
                                    <p className="text-muted fw-medium">{widget.label}</p>
                                    <h4 className="mb-0">{widget.counter}</h4>
                                </div>
                                <div className={`avatar-sm  align-self-center ms-3`}>
                        <span
                            className={`avatar-title ${widget.badgeClass} rounded-circle`}
                        >
                          <i className={widget.icon + " fs-24"}></i>
                        </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>)}
                </Col>))}
            </Row>
            <Row>
                <Col xl={6} md={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">{t("commission_history")}</h4>
                        </CardHeader>
                        <CardBody>
                            <MyTable
                                columns={commissionColumns}
                                url={"/api/admin/affiliates"}
                                where={{referral_by: myId}}
                            />
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={6} md={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">
                                {t("payout_history")}
                                {remainingBalance >= minimumWithdrawalAmount ? (<Button
                                    className={"float-end"}
                                    color={"success"}
                                    onClick={() => setModal(!modal)}
                                >
                                    <i className={"uil uil-plus me-1"}></i>{" "}
                                    {t("request_payout")}
                                </Button>) : (<>
                                    <div
                                        className="badge bg-success ms-2 float-end fs-10"
                                    >
                                        {t("available_balance")}:{" "}
                                        {DisplayMoney(remainingBalance, currencyInfo)}
                                    </div>
                                    <div
                                        className="badge bg-danger ms-2 float-end fs-10"
                                    >
                                        {t("Minimum_Payout_Amount")}:{" "}
                                        {DisplayMoney(minimumWithdrawalAmount, currencyInfo)}
                                    </div>
                                </>)}
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <MyTable
                                columns={withdrawalHistoryColumns}
                                url={"/api/admin/affiliatePayouts"}
                                where={{"payout.user_id": myId}}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
        {modal && (<MyModal
            title={t("payout_request")}
            modal={modal}
            handleClose={() => setModal(!modal)}
            // loading={loading}
            children={createPayout}
        />)}
    </div>);
}

export async function getServerSideProps({locale}) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}
