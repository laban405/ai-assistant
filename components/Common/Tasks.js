import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container, Input, Label, Row,
} from "reactstrap";

import {Info, TotalRows} from "../config";
import CountUp from "react-countup";
import MyTable from "../MyTable";
import BreadCrumb from "../BreadCrumb";
import Helper from "../../lib/Helper";

let info = "";
let url = "/api/admin/tasks";

export function Tasks({moduleWhere}) {
    const {t} = useTranslation();
    const [where, setWhere] = useState(moduleWhere);
    const [whereValue, setWhereValue] = useState(["not_started", "in_progress", "testing", "waiting_for_someone",]);
    const [whereIn, setWhereIn] = useState({"tbl_tasks.status": whereValue});
    const TaskStatus = Helper.TaskStatus(t);
    const columns = [{
        linkId: "task_id", accessor: "task_id", checkbox: true,
    }, {
        label: t("task_no"), link: "/admin/tasks/details/", linkId: "task_id", accessor: "prefix", sortable: true,
    }, {
        label: t("task_name"), accessor: "task_name", sortable: true, linkId: "task_id", actions: [{
            name: "edit", link: "/admin/tasks/edit/",
        }, {name: "details", link: "/admin/tasks/details/"}, {
            name: "delete", link: url,
        },],
    }, {
        label: t("category"), accessor: "category_name", sortable: true, sortbyOrder: "desc",
    }, {
        label: t("due_date"), accessor: "due_date", date: true,
    }, {
        label: t("status"), accessor: "status", update: TaskStatus, linkId: "task_id",
    }, {
        label: t("tags"), accessor: "tags", sortable: true,
    }, {
        label: t("priority"), accessor: "priority", update: Helper.Priority(t), linkId: "task_id",
    }, {
        label: t("permission"),
        accessor: "permission",
        menu_id: 57,
        modal: true,
        linkId: "task_id",
        link: "/admin/tasks/",
    },];

    const post = {
        all: moduleWhere ? moduleWhere : null,
    };
    const StatusFilter = [{
        label: t("all"), onClick: () => {
            setWhere(moduleWhere);
            setWhereIn(null);
            setWhereValue([]);
        },
    }, {
        label: t("my_tasks"), onClick: () => {
            setWhere({permission: "my"});
        },
    },];
    TaskStatus.map((item, index) => {
        post[item.value] = {
            "tbl_tasks.status": item.value, ...moduleWhere,
        };
        StatusFilter.push({
            label: item.label, onClick: () => {
                // check if item.value is in whereValue array then remove it else add it to array and set whereValue to new array and set whereIn to new array of objects
                if (whereValue && whereValue.includes(item.value)) {
                    const index = whereValue.indexOf(item.value);
                    if (index > -1) {
                        whereValue.splice(index, 1);
                    }
                    setWhereValue(whereValue);
                    setWhereIn({"tbl_tasks.status": whereValue});
                } else {
                    whereValue.push(item.value);
                    setWhereValue(whereValue);
                    setWhereIn({"tbl_tasks.status": whereValue});
                }
            }, // add active class as per the whereIn
            className: whereIn && whereIn["tbl_tasks.status"].includes(item.value) ? "active" : "",
        });
    });
    const {data} = TotalRows(url, post);
    if (data?.isLoading) {
        return <div>Loading...</div>;
    }

    const actions = [{
        name: "btn", label: t("new_task"), className: "btn-success", link: "/admin/tasks/new/", icon: "ri-add-line",
    }, {
        name: "dropdown", label: t("filter"), icon: "ri-filter-3-line", className: "btn-info", items: StatusFilter,
    },];
    return (<React.Fragment>
        <div className={`${moduleWhere ? "" : "page-content"}`}>
            <div className={`${moduleWhere ? "" : "container-fluid"}`}>
                {!moduleWhere && (<BreadCrumb title={t("tasks")} pageTitle={t("tasks_list")}/>)}
                <Card>
                    <CardHeader className="p-0 border-0 bg-soft-light">
                        <Row className="g-0 text-center">
                            <Col xs={6} sm={2}>
                                <div className="p-3 border border-dashed border-start-0">
                                    <h5 className="mb-1">
                      <span className="counter-value">
                        <CountUp
                            start={0}
                            end={data?.all}
                            separator={","}
                            duration={2}
                        />
                      </span>
                                    </h5>
                                    <Button
                                        color="btn-ghost-primary"
                                        onClick={() => {
                                            setWhere(moduleWhere);
                                            setWhereIn(null);
                                        }}
                                        className="text-muted p-0"
                                    >
                                        {t("all")}
                                    </Button>
                                </div>
                            </Col>
                            {TaskStatus.map((status, index) => {
                                return (<Col xs={6} sm={2} key={index}>
                                    <div className="p-3 border border-dashed border-start-0">
                                        <h5 className="mb-1">
                          <span className="counter-value">
                            <CountUp
                                start={0}
                                end={data?.[status.value]}
                                separator={","}
                                duration={2}
                            />
                          </span>
                                        </h5>
                                        <Button
                                            color={`btn-ghost-${status.color}`}
                                            onClick={() => {
                                                setWhere(post[status.value]);
                                            }}
                                            className={`mb-0  p-0 text-${status.color}`}
                                        >
                                            {status.label}
                                        </Button>
                                    </div>
                                </Col>);
                            })}
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <MyTable
                            where={where}
                            whereIn={whereIn}
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

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
