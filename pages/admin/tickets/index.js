import React, {useState} from "react";
import MyTable from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Helper from "../../../lib/Helper";
import {companyID} from "../../../components/config";

let info = "";
let url = "/api/admin/tickets";
export default function Tickets({moduleWhere}) {
    const company_id = companyID();
    const {t} = useTranslation();
    const [where, setWhere] = useState(moduleWhere);
    const columns = [{
        linkId: "tickets_id", accessor: "tickets_id", checkbox: true,
    }, {
        label: t("tickets_no"),
        link: "/admin/tickets/details/",
        linkId: "tickets_id",
        accessor: "prefix",
        sortable: true,
    }, {
        label: t("subject"),
        quickView: "tickets_id",
        accessor: "subject",
        sortable: true,
        flex: 1,
        linkId: "tickets_id",
        actions: [{
            name: "edit", link: "/admin/tickets/edit/",
        }, {name: "details", link: "/admin/tickets/details/"}, {
            name: "delete", link: url,
        },],
    }, {
        label: t("date"), accessor: "ticket_date", sortable: true, date: true,
    }, {
        label: t("status"),
        cell: (row) => <div
            className={`btn btn-sm bg-${Helper.TicketsStatus(t, row.status).color}`}>{Helper.TicketsStatus(t, row.status).label}</div>,
        sortable: true,
    }, {
        label: t("tags"), accessor: "tags", sortable: true,
    }, {
        label: t("action"), accessor: "action", className: "text-center", linkId: "tickets_id", btn: true, actions: [{
            name: "edit", link: "/admin/tickets/edit/", permission: {
                status: "open",
            },
        }, {
            name: "details", link: "/admin/tickets/details/"
        }, {name: "delete", link: url}],
    },];
    const actions = [{
        name: "btn", label: t("new_ticket"), className: "btn-success", link: "/admin/tickets/new/", icon: "ri-add-line",
    },];

    return (<React.Fragment>
        <div className={`${moduleWhere ? "" : "page-content"}`}>
            <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                {!moduleWhere && (<BreadCrumb title={t("tickets")} pageTitle={t("tickets_list")}/>)}
                <Card className={"row"}>
                    <CardBody>
                        <MyTable
                            where={{
                                "tbl_tickets.company_id": company_id,
                            }}
                            columns={columns}
                            url={url}
                            actions={actions}
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    </React.Fragment>);
}
export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
