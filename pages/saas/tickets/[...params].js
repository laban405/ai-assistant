import React, {useContext, useEffect, useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Container} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    Info,
} from "../../../components/config";
import Fb from "../../../components/Fb";
import Helper from "../../../lib/Helper";
import {CRMDetails} from "../../../components/CRMDetails";
import {Context} from "../../_app";

let info = null;
let url = "/api/admin/tickets";
let page = "";
let newPages = "";
export default function TicketsDetails({id, page, quickView}) {
    const {t} = useTranslation();
    const {config} = useContext(Context);
    const router = useRouter();
    const {params} = router.query || {};
    if (params && params.length > 1) {
        const id = params[1];
        info = Info(url, id);
        if (params[0] === "edit") {
            page = "edit";
        } else if (params[0] === "details") {
            page = "details";
        }
    } else if (params[0] === "new") {
        info = "";
    }
    if (page === "details") {
        const TStatus = Helper.TicketsStatus(t, info?.data?.status);
        const TPriority = Helper.Priority(t, info?.data?.priority);
        const details = {
            id: ["tickets_id", info?.data?.tickets_id],
            title: info?.data?.subject,
            fullname: info.data?.createdByName,
            clientName: {
                label: t("reported_by"), value: info.data?.reporterName, // url: "/admin/clients/details/" + info.data?.client_id,
            },
            editUrl: "/saas/tickets/edit/" + info.data?.tickets_id,
            actions: [{
                title: t("edit"),
                link: "/saas/tickets/edit/" + info.data?.tickets_id,
                icon: "bx bx-edit",
                color: "warning",
            }, {
                title: t("delete"),
                link: "/saas/tickets/delete/" + info.data?.tickets_id,
                icon: "bx bx-trash",
                color: "danger",
            },],
            startDate: [t("ticket_date"), info.data?.ticket_date],
            endDate: [t("last_update"), info.data?.updated_at],
            status: {
                title: t("status"),
                value: TStatus?.label,
                color: TStatus?.color,
                options: Helper.TicketsStatus(t),
                mail: true,
            },
            priority: {
                title: t("priority"),
                value: TPriority?.label,
                color: TPriority?.color,
                options: Helper.Priority(t),
                mail: true,
            },
        };
        info.data = {...info.data, ...details};
        const tabs = Helper.TicketsTabs(t, info?.data);

        newPages = (<CRMDetails
            active={"tickets"}
            tabs={tabs}
            refetch={info?.refetch}
            title={info?.data.subject}
            details={info.data}
            t={t}
            url={url}
        />);
    } else {
        const meta = {
            columns: 2, flexible: true, formItemLayout: [4, 8], fields: [{
                type: "prefix",
                label: t("ticket_no"),
                name: "number",
                prefix: info?.data?.prefix || config?.NEXT_PUBLIC_TICKET_PREFIX,
                format: info?.data?.format || config?.NEXT_PUBLIC_TICKET_FORMAT,
                value: info.data?.number,
            }, {
                label: t("subject"),
                type: "text",
                name: "subject",
                required: true,
                value: info.data?.subject,
                unique: true,
            }, {
                name: "reporter", type: "select", label: t("reporter"), value: info.data?.reporter, getOptions: {
                    url: "/api/admin/users", where: {
                        role_id: 2,
                    },
                }, required: true,
            }, {
                name: "priority",
                type: "select",
                label: t("priority"),
                value: info.data?.priority,
                options: Helper.Priority(t),
                required: true,
            }, {
                name: "ticket_date",
                type: "date",
                label: t("date"),
                value: info.data?.ticket_date || new Date(),
                required: true,
            }, {
                name: "tags", type: "tags", label: t("tags"), value: info.data?.tags,
            }, {
                type: "file",
                label: t("resources"),
                name: "attachments",
                dropzone: true,
                value: info?.data?.attachments,
            }, {
                name: "status",
                type: "select",
                label: t("status"),
                value: info?.data?.status,
                options: Helper.TicketsStatus(t),
            }, {
                col: 12,
                labelCol: 2,
                inputCol: 10,
                name: "message",
                value: info.data?.message,
                type: "textarea",
                label: t("message"),
                editor: true,
            }, {
                col: 2, type: "submit", label: t("submit"), className: "text-end",
            },],
        };

        newPages = (<>
            <BreadCrumb
                title={t("ticket")}
                pageTitle={info.data?.tickets_id ? t("update_ticket") : t("create_ticket")}
            />
            <Fb
                meta={meta}
                form={true}
                isLoading={info?.isLoading}
                header={info.data?.tickets_id ? t("update_ticket") : t("create_ticket")}
                url="/api/admin/tickets"
                to={"/saas/tickets"}
                id={info?.data?.tickets_id}
            />
        </>);
    }
    return (<React.Fragment>
        {quickView ? (newPages) : (<>
            <div className="page-content">
                <Container fluid>{newPages}</Container>
            </div>
        </>)}
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
