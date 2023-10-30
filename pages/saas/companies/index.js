import React, { useState } from "react";
import MyTable from "../../../components/MyTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { Button, Card, CardBody, UncontrolledTooltip } from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Helper from "../../../lib/Helper";
import { TicketsDetails } from "../../../components/Common/TicketsDetails";
import Link from "next/link";
import { API } from "../../../components/config";
import { MyModal } from "../../../components/Fb";
import PackageList from "../../../components/PackageList";
// import TicketsDetails from "../tickets/...params";
const api = new API();

let info = "";
let url = "/api/admin/companies";
export default function Companies({ moduleWhere }) {
    const { t } = useTranslation();
    const [where, setWhere] = useState(moduleWhere);
    const [packageModal, setPackageModal] = useState({});

    const status = {
        running: "success",
        pending: "primary",
        expired: "danger",
        suspended: "warning",
    };

    const deleteHandler = async (id, refetch) => {
        await api.delete(`/api/admin/companiesHistories/`, {
            company_id: id,
        });
        await api.delete(`/api/admin/companies/`, {
            company_id: id,
        });
        await api.delete(`/api/admin/companiesPayments/`, {
            company_id: id,
        });
        await api.delete(`/api/admin/users/`, {
            company_id: id,
        });
        await refetch();
    };

    const columns = [
        {
            linkId: "company_id",
            accessor: "company_id",
            checkbox: true,
        },
        {
            label: t("company_name"),
            link: "/saas/companies/details/",
            linkId: "company_id",
            accessor: "company_name",
            sortable: true,
        },
        {
            label: t("company_email"),
            accessor: "company_email",
            sortable: true,
        },
        {
            label: t("package"),
            sortable: true,
            cell: (row) => {
                return (
                    <>
                        <Button
                            color="link"
                            className="p-0"
                            onClick={() => setPackageModal(row)}
                        >
                            {row.package_name}
                        </Button>
                    </>
                );
            },
        },
        {
            label: t("trial_period"),
            accessor: "trial_period",
            sortable: true,

        },
        {
            label: t("amount"),
            accessor: "amount",
            sortable: true,
            money: true,
        },
        {
            label: t("status"), // accessor: "status", // ,
            linkId: "company_id",
            cell: (row, refetch) => {
                return (
                    <div className={`btn btn-sm btn-${status[row.status]}`}>
                        {row.status}
                    </div>
                );
            },
        },
        {
            label: t("action"),
            linkId: "company_id",
            btn: true,

            cell: (row, refetch) => {
                return (
                    <div className="d-flex align-items-center p">

                        <UncontrolledTooltip
                            placement="top"
                            target={`details${row.company_id}`}
                        >
                            {t("company_details")}
                        </UncontrolledTooltip>

                        <Link
                            href={`/saas/companies/details/${row.company_id}`}
                            id={`details${row.company_id}`}
                            className="btn btn-sm btn-warning me-2"
                        >
                            <i className="ri-eye-line align-middle" />
                        </Link>
                        <UncontrolledTooltip target={`edit-${row.company_id}`}>
                            {t("edit")}
                        </UncontrolledTooltip>

                        <button
                            className="btn btn-sm btn-success me-2"
                            id={`edit-${row.company_id}`}
                        >
                            <Link
                                className="text-light"
                                href={`/saas/companies/edit/${row.company_id}`}
                            >
                                <i className="ri-pencil-line"></i>
                            </Link>
                        </button>

                        <UncontrolledTooltip
                            placement="top"
                            target={`delete${row.company_id}`}
                        >
                            {t("delete")}
                        </UncontrolledTooltip>

                        <Button
                            type="button"
                            id={`delete${row.company_id}`}
                            className="btn btn-sm btn-danger text-decoration-none me-2"
                            onClick={async () => {
                                if (
                                    confirm(
                                        t(
                                            "the_all_chat_and_conversation_will_be_deleted_permanently_are_you_sure?"
                                        )
                                    )
                                ) {
                                    await deleteHandler(row.company_id, refetch);
                                }
                            }}
                        >
                            <i className="ri-delete-bin-line align-middle fs-12" />
                        </Button>


                    </div>
                );
            },
            // actions: [

            //     { name: "details", link: "/saas/tickets/details/" },
            // ],
        },
    ];
    const actions = [
        {
            name: "btn",
            label: t("new_company"),
            className: "btn-success",
            link: "/saas/companies/new/",
            icon: "ri-add-line",
        },
    ];

    return (
        <React.Fragment>
            <div className={`${moduleWhere ? "" : "page-content"}`}>
                <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                    {!moduleWhere && (
                        <BreadCrumb title={t("companies")} pageTitle={t("company_list")} />
                    )}
                    <Card className={"row"}>
                        <CardBody>
                            <MyTable
                                where={where}
                                columns={columns}
                                url={url}
                                actions={actions}
                            />
                            {packageModal?.package_name && (
                                <MyModal
                                    modal={packageModal}
                                    handleClose={() => {
                                        setPackageModal({});
                                    }}
                                    children={
                                        <PackageList
                                            data={packageModal}
                                            modal={packageModal}
                                            details={true}
                                        />
                                    }
                                />
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </React.Fragment>
    );
}
export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
