import React, {useContext, useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Container} from "reactstrap";
import {useRouter} from "next/router";
import {
    Info, MyID,
} from "../../../../components/config";
import Helper from "../../../../lib/Helper";
import {CRMDetails} from "../../../../components/CRMDetails";
import {Context} from "../../../_app";

let info = null;
let url = "/api/admin/tasks";
let newPages = "";
export default function TasksDetails({page, quickView}) {
    const {t} = useTranslation();
    const myId = MyID();
    const router = useRouter();
    const {id} = router.query || {};
    const include = {
        recentComment: {
            method: "getComment", where: {
                module: "tasks", module_id: id, type: "comment"
            }, url: "/api/admin/discussions", limit: 10,
        }
    };
    info = Info(url, id, include);

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
    const TStatus = Helper.TaskStatus(t, info?.data?.status);
    const TPriority = Helper.Priority(t, info?.data?.priority);
    const details = {
        id: ["task_id", info?.data?.task_id],
        title: info?.data?.task_name,
        fullname: info?.data?.createdByName,
        clientName: {
            label: t("updated_by"), value: info?.data?.updatedByName,
        },
        startDate: [t("start_date"), info?.data?.start_date],
        endDate: [t("due_date"), info?.data?.due_date],
        status: {
            title: t("status"), value: TStatus?.label, color: TStatus?.color, options: Helper.TaskStatus(t), mail: true,
        },
        priority: {
            title: t("priority"),
            value: TPriority?.label,
            color: TPriority?.color,
            options: Helper.Priority(t),
            mail: true,
        },
        refetch: info?.refetch,
    };


    info.data = {...info.data, ...details};
    const tabs = Helper.TasksTabs(t, info?.data, '/admin');
    newPages = (<CRMDetails
        active={"tasks"}
        tabs={tabs}
        isLoading={info?.isLoading}
        refetch={info?.refetch}
        title={info?.data.task_name}
        details={info.data}
        t={t}
        url={url}
    />);
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
