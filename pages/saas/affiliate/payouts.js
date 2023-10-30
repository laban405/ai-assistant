import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {Info} from "../../../components/config";
import {Card, CardBody, CardHeader} from "reactstrap";
import MyTable from "../../../components/MyTable";
import BreadCrumb from "../../../components/BreadCrumb";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function Payouts() {
    let info = "";
    let url = "/api/admin/affiliate_users";
    const {t} = useTranslation();
    // ------- for table data start ------------
    const columns = [{
        label: t("#"), accessor: "type", sortable: true,
    }, {
        label: t("name"), accessor: "fullname", sortable: true, linkId: "affiliate_payout_id", actions: [{
            name: "editModal", link: "/admin/affiliate",
        }, {
            name: "delete", link: url,
        },],
    }, {
        label: t("available_amount"), accessor: "available_amount", sortable: true,
    }, {
        label: t("requested_amount"), accessor: "amount", sortable: true,
    }, {
        label: t("submission_date"), accessor: "created_at", sortable: true,
    }, {
        label: t("status"), accessor: "status", sortable: true,
    },];

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb
                    title={t("affiliate")}
                    pageTitle={t("affiliate_payouts")}
                />
                <Card>
                    <CardHeader>
                        <h4 className="card-title mb-0 flex-grow-1">
                            {t("affiliate_payouts")}
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <MyTable columns={columns} url={"/api/admin/affiliatePayouts"}/>
                    </CardBody>
                </Card>
            </div>
        </div>
    </React.Fragment>);
}
export const getServerSideProps = async ({locale}) => ({props: {...(await serverSideTranslations(locale, ["common"])),},});