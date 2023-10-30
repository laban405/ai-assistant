import React, {useState} from "react";
import MyTable from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import TicketsDetails from "../tickets/[...params]";
import Helper from "../../../lib/Helper";

let info = "";
let url = "/api/admin/tickets";
export default function Tickets({moduleWhere}) {
    const {t} = useTranslation();
    const [where, setWhere] = useState(moduleWhere);
    const columns = [{
        linkId: "tickets_id", accessor: "tickets_id", checkbox: true,
    }, {
        label: t("tickets_no"),
        link: "/saas/tickets/details/",
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
            name: "edit", link: "/saas/tickets/edit/",
        }, {name: "details", link: "/saas/tickets/details/"}, {
            name: "delete", link: url,
        },],
    }, {
        label: t("date"), accessor: "ticket_date", sortable: true, date: true,
    }, {
        label: t("status"), accessor: "status", update: Helper.TicketsStatus(t), linkId: "tickets_id",
    }, {
        label: t("tags"), accessor: "tags", sortable: true,
    }, {
        label: t("action"), className: "text-center", linkId: "tickets_id", btn: true, flexClass: "me-2", actions: [{
            name: "edit", link: "/saas/tickets/edit/",
        }, {name: "details", link: "/saas/tickets/details/"}, {
            name: "delete", link: url,
        },],
    },];
    const actions = [{
        name: "btn", label: t("new_ticket"), className: "btn-success", link: "/saas/tickets/new/", icon: "ri-add-line",
    },];

    return (<React.Fragment>
        <div className={`${moduleWhere ? "" : "page-content"}`}>
            <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                {!moduleWhere && (<BreadCrumb title={t("tickets")} pageTitle={t("tickets_list")}/>)}
                <Card className={"row"}>
                    <CardBody>
                        <MyTable
                            quickView={TicketsDetails}
                            where={where}
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
