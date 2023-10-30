import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {API, DisplayMoney, GetDefaultCurrency, Info} from "../../../components/config";
import {
    Card, CardBody, CardHeader, Col, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown, UncontrolledTooltip,
} from "reactstrap";
import MyTable from "../../../components/MyTable";
import BreadCrumb from "../../../components/BreadCrumb";
import Link from "next/link";
import {notify} from "../../../components/Fb";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

let url = "/api/admin/affiliateUsers";
const api = new API();
export default function AffiliateUsers() {
    const {t} = useTranslation();
    const [affiliateDetails, setAffiliateDetails] = useState(null);
    const router = useRouter();
    const {details} = router.query || {};
    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

    const stopAffiliate = async (user_id, refetch) => {
        const data = {
            isAffiliate: 0,
        };
        const res = await api.create(`/api/admin/users/`, data, user_id);
        if (res) {
            notify("success", t("affiliate_stopped_successfully"));
            refetch();
        }
    };

    // ------- for table data start ------------
    const columns = [{
        label: t("#"), accessor: "user_id", checkbox: true, sortable: true,
    }, {
        flex: 1, label: t("name"), sortable: true, cell: (row) => {
            return (<Link href={`/saas/affiliate/users/?details=${row.user_id}`}>
                {row.first_name} {row.last_name}
            </Link>);
        },
    }, {
        label: t("email"), accessor: "email", sortable: true,
    }, {
        label: t("total_referral"), accessor: "total_referral", sortable: true,
    }, {
        label: t("total_earning"), accessor: "total_balance", sortable: true, money: true,
    }, {
        label: t("withdrawal_amount"), accessor: "withdrawal_amount", sortable: true, money: true,
    }, {
        label: t("remaining_balance"), sortable: true, cell: (row) => {
            const balance = row.total_balance - row.withdrawal_amount;
            return <span>{DisplayMoney(balance, currencyInfo)}</span>;
        },
    }, {
        label: t("action"), cell: (row, refetch) => {
            return (<div className="d-flex gap-3">
                <Link
                    className="btn btn-primary btn-sm"
                    onClick={() => setAffiliateDetails(row)}
                    href={`/saas/affiliate/users/?details=${row.user_id}`}
                >
                    {t("view")}
                </Link>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                        await stopAffiliate(row.user_id, refetch);
                    }}
                >
                    {t("stop_affiliate")}
                </button>
            </div>);
        },
    },];

    const AffiliateDetails = () => {
        const {
            data, isLoading: commissionLoading, refetch: commissionRefetch,
        } = Info(url, {"usr.user_id": details});
        const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

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

        const referralUserColumns = [{
            flex: 1, label: t("name"), sortable: true, accessor: "fullname",
        }, {
            label: t("email"), accessor: "email", sortable: true,
        }, {
            label: t("date"), accessor: "created_at", sortable: true, dateTime: true,
        },];

        const updateWithdrawalStatus = async (affiliate_payout_id, status, refetch) => {
            if (!affiliate_payout_id) return notify("warning", t("something_went_wrong_please_try_again_later"));
            if (status === "rejected") {
                const reason = prompt(t("please_enter_reason_for_rejection"));
                if (!reason) return notify("warning", t("please_enter_reason_for_rejection"));
                const data = {
                    status: status, comments: reason,
                };
                const res = await api.create(`/api/admin/affiliatePayouts/`, data, affiliate_payout_id);
                if (res) {
                    notify("success", t("status_updated_successfully"));
                    await refetch();
                    await commissionRefetch();
                }
            } else {
                const data = {
                    status: status,
                };
                const res = await api.create(`/api/admin/affiliatePayouts/`, data, affiliate_payout_id);
                if (res) {
                    notify("success", t("status_updated_successfully"));
                    await refetch();
                    await commissionRefetch();
                }
            }
        };

        const withdrawalHistoryColumns = [{
            label: t("amount"), accessor: "amount", sortable: true, money: true,
        }, {
            label: t("status"), sortable: true, cell: (row, refetch) => {
                // show status with dropdown badge to update status
                return (<>
                    <UncontrolledTooltip target={`status-${row.affiliate_payout_id}`}>
                        {row.comments}
                    </UncontrolledTooltip>
                    <UncontrolledDropdown className={"nav-link "}>
                        <DropdownToggle
                            tag="button"
                            className="btn py-0 text-body nav-link  btn-link"
                            id="dropdownMenuButton"
                        >
                                    <span
                                        id={`status-${row.affiliate_payout_id}`}
                                        className={`badge bg-${row.status === "pending" ? "warning" : row.status === "approved" ? "success" : "danger"}`}
                                    >
                                        {t(row.status)}
                                    </span>
                            <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                            {["pending", "approved", "rejected"].map((status, index) => {
                                // remove current status from dropdown
                                if (status !== row.status) {
                                    return (<Link
                                        className="dropdown-item"
                                        href="#"
                                        onClick={() => updateWithdrawalStatus(row.affiliate_payout_id, status, refetch)}
                                    >
                                        {status}
                                    </Link>);
                                }
                            })}
                        </DropdownMenu>
                    </UncontrolledDropdown>{" "}
                </>);
            },
        }, {
            label: t("date"), accessor: "created_at", sortable: true, dateTime: true,
        }, {
            label: t("action"), cell: (row, refetch) => {
                if (row.status === "pending") {
                    return (<button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateWithdrawalStatus(row.affiliate_payout_id, "rejected", refetch)}
                    >
                        {t("reject")}
                    </button>);
                } else if (row.status === "rejected") {
                    return (<button
                        className="btn btn-success btn-sm"
                        onClick={() => updateWithdrawalStatus(row.affiliate_payout_id, "approved", refetch)}
                    >
                        {t("approve")}
                    </button>);
                } else {
                    return (<button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateWithdrawalStatus(row.affiliate_payout_id, "rejected", refetch)}
                    >
                        {t("reject")}
                    </button>);
                }
            },
        },];
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
        return (<>
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
                <Col xl={6}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">{t("commission_history")}</h4>
                        </CardHeader>
                        <CardBody>
                            <MyTable
                                columns={commissionColumns}
                                url={"/api/admin/affiliates"}
                                where={{referral_by: details}}
                            />
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={6}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">{t("referral_users")}</h4>
                        </CardHeader>
                        <CardBody>
                            <MyTable
                                columns={referralUserColumns}
                                url={"/api/admin/users"}
                                where={{"usr.referral_by": details}}
                            />
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={6}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">{t("payout_history")}</h4>
                        </CardHeader>
                        <CardBody>
                            <MyTable
                                columns={withdrawalHistoryColumns}
                                url={"/api/admin/affiliatePayouts"}
                                where={{"payout.user_id": details}}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>);
    };

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb
                    title={t("affiliate")}
                    pageTitle={t("affiliate_users")}
                />
                {details ? (<AffiliateDetails data={affiliateDetails}/>) : (<Card>
                    <CardHeader>
                        <h4 className="card-title mb-0 flex-grow-1">
                            {t("affiliate_users")}
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
                            where={{"usr.isAffiliate": 1}}
                        />
                    </CardBody>
                </Card>)}
            </div>
        </div>
    </React.Fragment>);
}

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
