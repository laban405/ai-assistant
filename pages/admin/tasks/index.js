import React, {useState} from "react";
import MyTable from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Button, Card, CardBody, UncontrolledTooltip} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Helper from "../../../lib/Helper";
import {companyID, MyID} from "../../../components/config";
import Fb, {MyModal} from "../../../components/Fb";

let info = "";
let url = "/api/admin/tasks";
export default function Tasks({moduleWhere}) {
    const company_id = companyID();
    const myId = MyID();
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState({});
    const columns = [{
        linkId: "task_id", accessor: "task_id", checkbox: true,
    }, {
        label: t("task_name"),
        quickView: "task_id",
        accessor: "task_name",
        sortable: true,
        flex: 1,
        linkId: "task_id",
        actions: [{name: "details", link: "/admin/tasks/details/"}, {
            name: "delete", link: url,
        },],
    }, {
        label: t("due_date"), accessor: "due_date", sortable: true, date: true,
    }, {
        label: t("status"), accessor: "status", update: Helper.TaskStatus(t), linkId: "task_id",
    }, {
        label: t("assign_to"), accessor: "permission", sortable: true, linkId: "task_id", link: "/admin/tasks/",
    }, {
        label: t("action"),
        accessor: "action",
        flex: "d-inline-flex",
        className: "text-center",
        linkId: "task_id",
        btn: true,
        cell: (row, refetch) => {
            // if created by me or status is not_started or waiting_for_someone then show edit button
            if (row?.created_by === myId || row?.status === "not_started" || row?.status === "waiting_for_someone") return (<>
                <Button
                    id={"edit" + row?.task_id}
                    color="success"
                    size="sm"
                    className="btn-rounded waves-effect waves-light me-2"
                    onClick={() => {
                        row.refetch = refetch;
                        setEditData(row);
                        setModal(!modal);
                    }}
                >
                    <i className="mdi mdi-pencil-outline"/>
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target={"edit" + row?.task_id}
                >
                    {t("edit")}
                </UncontrolledTooltip>
            </>);

        },
        actions: [{
            name: "editModal", modal: true, setEditData: setEditData, setModal: setModal, permission: {
                status: "open",
            },
        }, {
            name: "details", link: "/admin/tasks/details/"
        }, {name: "delete", link: url}],
    },];
    const actions = [{
        name: "btn", label: t("new_task"), className: "btn-success", icon: "ri-add-line", modal: true, onClick: () => {
            setEditData({});
        }, setModal: setModal,
    }];

    const meta = {
        columns: 1, flexible: true, formItemLayout: [3, 8], fields: [{
            name: "task_name",
            label: t("task_name"),
            value: editData?.task_name,
            type: "text",
            required: true,
            placeholder: t("task_name"),
        }, {
            name: "start_date",
            label: t("start_date"),
            value: editData?.start_date,
            type: "date",
            max: "due_date",
            required: true,
            placeholder: t("start_date"),
        }, {
            name: "due_date",
            label: t("due_date"),
            value: editData?.due_date,
            type: "date",
            min: "start_date",
            required: true,
            placeholder: t("due_date"),
        }, {
            name: "status",
            label: t("status"),
            value: editData?.status,
            type: "select",
            required: true,
            placeholder: t("status"),
            options: Helper.TaskStatus(t),
        }, {
            name: "tags", type: "tags", label: t("tags"), value: editData?.tags, placeholder: t("tags"),
        }, {
            name: "company_id", type: "hidden", value: company_id,
        }, {
            name: "priority",
            type: "select",
            label: t("priority"),
            value: editData?.priority,
            options: Helper.Priority(t),
            required: true,
        }, {
            name: "permission",
            label: t("assign_to"),
            value: editData?.permission,
            type: "select",
            isMulti: true,
            required: true,
            placeholder: t("assign_to"),
            getOptions: {
                url: "/api/admin/users", where: {
                    "company_id": company_id,
                }
            },
        }, {
            name: "description",
            label: t("description"),
            value: editData?.description,
            type: "textarea",
            editor: true,
            height: '150px',
            required: true,
            placeholder: t("description"),
        }],
    };
    if (!editData?.task_id) {
        meta.fields.push({
            name: "created_by", type: "hidden", value: myId,
        });
    } else {
        meta.fields.push({
            name: "updated_by", type: "hidden", value: myId,
        });
    }
    meta.fields.push({
        type: "submit", label: t("submit"), setModal: setModal,
    });
    const createTask = (<Fb
        meta={meta}
        form={true}
        url={url}
        id={editData?.task_id}
    />);

    return (<React.Fragment>
        <div className={`${moduleWhere ? "" : "page-content"}`}>
            <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                {!moduleWhere && (<BreadCrumb title={t("tasks")} pageTitle={t("tasks_list")}/>)}
                <Card className={"row"}>
                    <CardBody>
                        <MyTable
                            where={{
                                "tbl_tasks.company_id": company_id,
                            }}
                            columns={columns}
                            url={url}
                            actions={actions}
                        />
                    </CardBody>
                </Card>
                {modal && (<MyModal
                    size={"lg"}
                    title={editData?.task_id ? t("update_task") : t("create_task")}
                    modal={modal}
                    handleClose={() => setModal(!modal)}
                    children={createTask}
                />)}
            </div>
        </div>
    </React.Fragment>);
}
export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
