import React, {useState} from "react";
import {Button, Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import Fb, {MyModal} from "./Fb";
import MyTable from "./MyTable";
import PackageList from "./PackageList";
import {DisplayDate, companyID} from "./config";
import BreadCrumb from "./BreadCrumb";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function CompanyDetails(props) {
    const status = {
        running: "success", pending: "primary", expired: "danger", suspended: "warning",
    };
    const {t, url, info} = props;


    const Update = () => {
        const meta = {
            columns: 1, formItemLayout: [4, 8], fields: [{
                name: "status", type: "select", label: t("status"), value: info?.data?.status, options: [{
                    label: t("pending"), value: "pending",
                }, {
                    label: t("running"), value: "running",
                }, {
                    label: t("expired"), value: "expired",
                }, {
                    label: t("suspended"), value: "suspended",
                }, {
                    label: t("terminated"), value: "terminated",
                },],
            }, {
                name: "expired_date",
                value: info?.data?.expired_date,
                type: "date",
                label: t("validity"),
                required: true,
            }, {
                name: "remarks",
                value: info?.data?.remarks,
                type: "textarea",
                label: t("remarks"),
                rows: 2,
                required: true,
            }, {
                type: "submit", label: t("submit"), // setModal: setModal,
            }],
        };
        return (<React.Fragment>
            <Card>
                <CardHeader>
                    <h5 className="card-title mb-0 flex-grow-1">{t("update")}</h5>
                </CardHeader>
                <CardBody>
                    <Fb
                        meta={meta}
                        form={true}
                        layout={"vertical"}
                        url={url}
                        isLoading={info?.isLoading}
                        id={info?.data?.company_id}
                        refetch={info?.refetch}
                    />
                </CardBody>
            </Card>
        </React.Fragment>);
    };

    const SbsHistory = () => {
        const [packageModal, setPackageModal] = useState({});

        const columns = [{
            label: t("name"), sortable: true, cell: (row) => {
                return (<>
                    <Button
                        color="link"
                        className="p-0"
                        onClick={() => setPackageModal(row)}
                    >
                        {row.package_name}
                    </Button>
                </>);
            },
        },

            {
                label: t("amount"), accessor: "amount", sortable: true, money: true
            }, {
                label: t("created_date"), accessor: "created_date", sortable: true, date: true
            }, {
                label: t("validity"), accessor: "validity", sortable: true, date: true
            }, {
                label: t("method"), accessor: "payment_method", sortable: true,
            }, {
                label: t("status"), // accessor: "status", // ,
                linkId: "company_id", cell: (row, refetch) => {
                    return (<div className={`btn btn-sm btn-${status[row.status]}`}>
                        {row.status}
                    </div>);
                },
            },];
        return (<React.Fragment>
            <Card>
                <CardHeader>
                    <h5 className="card-title mb-0 flex-grow-1">
                        {t("subscriptions_history")}
                    </h5>
                </CardHeader>
                <CardBody>
                    {info?.isLoading ? <>
                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>
                    </> : <MyTable
                        columns={columns} where={{
                        "cmpnyDetail.company_id": info?.data?.company_id, // 'tmpl.template_status': 1,
                    }} url={'/api/admin/companiesHistories'}/>}
                    {packageModal?.package_name && (<MyModal
                        modal={packageModal}
                        handleClose={() => {
                            setPackageModal({});
                        }}
                        children={<PackageList
                            data={packageModal}
                            modal={packageModal}
                            details={true}
                        />}
                    />)}
                </CardBody>
            </Card>
        </React.Fragment>);
    };
    const PaymentHistory = () => {
        const [packageModal, setPackageModal] = useState({});

        const columns = [{
            label: t("company_name"), accessor: "company_name", sortable: true,
        }, {
            label: t("package_name"), sortable: true, cell: (row) => {
                return (<>
                    <Button
                        color="link"
                        className="p-0"
                        onClick={() => setPackageModal(row)}
                    >
                        {row.package_name}
                    </Button>
                </>);
            },
        }, {
            label: t("transaction_id"), accessor: "transaction_id", sortable: true,
        }, {
            label: t("amount"), accessor: "amount", sortable: true, money: true
        },

            {
                label: t("payment_date"), accessor: "payment_date", sortable: true, data: true
            },

            {
                label: t("method"), accessor: "payment_method", sortable: true,
            },];
        return (<React.Fragment>
            <Card>
                <CardHeader>
                    <h5 className="card-title mb-0 flex-grow-1">
                        {t("payment_history")}
                    </h5>
                </CardHeader>
                <CardBody>
                    {info?.isLoading ? <>
                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>

                        <div className="skeleton w-100"
                             style={{height: "30px"}}/>
                    </> : <MyTable columns={columns} url={'/api/admin/companiesPayments'}
                                   where={{
                                       "cmpnyPayment.company_id": info?.data?.company_id
                                   }}
                    />}
                    {packageModal?.package_name && (<MyModal
                        modal={packageModal}
                        handleClose={() => {
                            setPackageModal({});
                        }}
                        children={<PackageList
                            data={packageModal}
                            modal={packageModal}
                            details={true}
                        />}
                    />)}
                </CardBody>
            </Card>
        </React.Fragment>);
    };

    const SubsDetails = () => {
        const [packageModal, setPackageModal] = useState({});
        if (info?.isLoading) return (<>
            <div className="skeleton w-100"
                 style={{height: "30px"}}/>

            <div className="skeleton w-100"
                 style={{height: "30px"}}/>

            <div className="skeleton w-100"
                 style={{height: "30px"}}/>

            <div className="skeleton w-100"
                 style={{height: "30px"}}/>
        </>);
        return (<Card>
            <CardHeader>
                <h5 className="card-title mb-0 flex-grow-1">
                    {t("subscription_details")}
                </h5>
            </CardHeader>
            <CardBody>
                <div className="mb-3 border-bottom pb-3 d-flex align-items-center gap-3">
                    {status[info?.data?.status] === "danger" ? <div className="check-circle text-danger display-5">
                        <i className="fas fa-times-circle"></i>
                    </div> : status[info?.data?.status] === "warning" ?
                        <div className="check-circle text-warning display-5">
                            <i className="fas fa-exclamation-circle"></i>
                        </div> : status[info?.data?.status] === "success" ?
                            <div className="check-circle text-success display-5">
                                <i className="fas fa-check-circle"></i>
                            </div> : <div className="check-circle text-info display-5">
                                <i className="fas fa-info-circle"></i>
                            </div>}
                    <div>
                        <h3 className="mb-0">{t(info?.data?.status)}</h3>
                        <span>till {DisplayDate(info?.data?.expired_date)}</span>
                    </div>
                </div>
                <ul className="list-group list-group-flush mb-0">
                    <CardHeader className="list-group-item px-0 d-flex pt-1 justify-content-between">
                        <span>{t("name")}</span>
                        <span>{info?.data?.company_name}</span>
                    </CardHeader>
                    <CardHeader className="list-group-item px-0 d-flex pt-1 justify-content-between">
                        <span>{t("email")}</span>
                        <span>{info?.data?.company_email}</span>
                    </CardHeader>
                    <CardHeader className="list-group-item px-0 d-flex pt-1 justify-content-between">
                        <span>{t("package")}</span>
                        <span className="p-0 btn btn-link"
                              onClick={() => setPackageModal(info?.data)}>{info?.data?.package_name}</span>
                    </CardHeader>

                    <CardHeader className="list-group-item px-0 d-flex pt-1 justify-content-between">
                        <span>{t("expire_date")}</span>
                        <span>{DisplayDate(info?.data?.expired_date)}</span>
                    </CardHeader>

                    <CardHeader className="list-group-item px-0 d-flex pt-1 justify-content-between border-0">
                        <span>{t("create_date")}</span>
                        <span>{DisplayDate(info?.data?.created_date)}</span>
                    </CardHeader>
                </ul>
                {packageModal?.package_name && (<MyModal
                    modal={packageModal}
                    handleClose={() => {
                        setPackageModal({});
                    }}
                    children={<PackageList
                        data={packageModal}
                        modal={packageModal}
                        details={true}
                    />}
                />)}
            </CardBody>
        </Card>);
    };

    return (<>
        <BreadCrumb title={t("company_details")} pageTitle={""}/>
        <Row>
            <Col sm={4}>
                <SubsDetails/>
                <Update/>
            </Col>
            <Col sm={8}>
                <SbsHistory/>
                <PaymentHistory/>
            </Col>
        </Row>
    </>);
}


export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});