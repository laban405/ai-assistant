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
let newPages = "";
export default function TicketsDetails({id, page, quickView}) {
    const {t} = useTranslation();
    const {config, session} = useContext(Context);
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

        if (info?.isLoading) {
            return <>
                <div
                    className="skeleton rounded mb-2 w-100"
                    style={{height: "120px"}}
                />
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex justify-content-between align-items-center w-25">
                        <div
                            className="skeleton rounded w-100 me-3"
                            style={{height: "30px"}}
                        />
                        <div
                            className="skeleton rounded w-100 "
                            style={{height: "30px"}}
                        />
                    </div>
                    <div className="skeleton rounded w-25" style={{height: "30px"}}/>
                </div>
            </>
        }
        const TStatus = Helper.TicketsStatus(t, info?.data?.status);
        const TPriority = Helper.Priority(t, info?.data?.priority);
        const details = {
            id: ["tickets_id", info?.data?.tickets_id],
            title: info?.data?.subject,
            fullname: info?.data?.createdByName,
            clientName: {
                label: t("reported_by"), value: info?.data?.reporterName,
            },
            startDate: [t("ticket_date"), info?.data?.ticket_date],
            endDate: [t("last_update"), info?.data?.updated_at],
            status: {
                title: t("status"), value: TStatus?.label, color: TStatus?.color,
            },
            priority: {
                title: t("priority"), value: TPriority?.label, color: TPriority?.color,
            },
        };
        info.data = {...info.data, ...details};
        const tabs = Helper.TicketsTabs(t, info?.data, '/admin');
        newPages = (<CRMDetails
            active={"tickets"}
            tabs={tabs}
            isLoading={info?.isLoading}
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
                name: "reporter", type: "hidden", value: session?.user?.user_id,
            }, , {
                name: "company_id", type: "hidden", value: session?.user?.company_id,
            }, {
                name: "priority",
                type: "select",
                label: t("priority"),
                value: info.data?.priority,
                options: Helper.Priority(t),
                required: true,
            }, {
                name: "ticket_date", type: "date", label: t("date"), value: info.data?.ticket_date || new Date(),
                required: true,
            }, {
                type: "file",
                label: t("resources"),
                name: "attachments",
                value: info?.data?.attachments,
                dropzone: true,
            }, {
                name: "status", type: "hidden", label: t("status"), value: 'open',
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
                isLoading={info.isLoading}
                header={info.data?.tickets_id ? t("update_ticket") : t("create_ticket")}
                url="/api/admin/tickets"
                to={"/admin/tickets"}
                id={info.data?.tickets_id}
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
