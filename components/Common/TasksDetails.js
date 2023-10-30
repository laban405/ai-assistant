import React, {useContext} from "react";
import {Card, CardBody, CardHeader, Col, Label, Row, Table} from "reactstrap";
import {useTranslation} from "next-i18next";
import {API, DisplayDate, DisplayTime, GetRows, TimeAgo} from "../config";
import {ModuleComments} from "./ModuleComments";

export function TasksDetails({data}) {
    const {t} = useTranslation();
    return (<React.Fragment>
        <Row>
            <Col xl={8} xxl={9}>
                <Card>
                    <CardBody className="p-4">
                        <h6 className="fw-semibold text-uppercase mb-3">
                            {data?.title}
                        </h6>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: data?.description,
                            }}
                        />
                    </CardBody>
                    <CardBody className="p-4">
                        <h5 className="card-title mb-4">{t("comments")}</h5>
                        <ModuleComments data={data}
                                        module="tasks"
                                        module_id={data?.task_id}
                                        link={'/admin'}
                                        refetch={data?.refetch}
                        />
                    </CardBody>
                </Card>
            </Col>
            <Col xl={4} xxl={3}>
                <Card>
                    <CardBody>
                        <div className="table-responsive table-card">
                            <Table className="table mb-0">
                                <tbody>
                                <tr>
                                    <td className="fw-medium">{t("task_name")}</td>
                                    <td id="t-client">{data?.task_name}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("status")}</td>
                                    <td><span className={`badge rounded-pill bg-${data?.status.color} fs-11`}>
                                        {data?.status.value}
                                    </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("priority")}</td>
                                    <td><span className={`badge rounded-pill bg-${data?.priority.color} fs-11`}>
                                        {data?.priority.value}
                                    </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("start_date")}</td>
                                    <td id="t-client">{DisplayDate(data?.start_date)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("end_date")}</td>
                                    <td id="t-client">{DisplayDate(data?.end_date)}</td>
                                </tr>
                                {data?.fullname && <tr>
                                    <td className="fw-medium">{t("created_by")}</td>
                                    <td id="t-client">{data?.fullname}</td>
                                </tr>}
                                {data?.clientName?.value && <tr>
                                    <td className="fw-medium">{t("updated_by")}</td>
                                    <td id="t-client">{data?.clientName.value}</td>
                                </tr>}
                                <tr>
                                    <td className="fw-medium">{t("tags")}</td>
                                    <td className="text-wrap gap-1">
                                        {data?.tags && JSON.parse(data?.tags).map((tag, index) => {
                                            return (<>
                                                    <span key={index} className="badge rounded-pill bg-secondary fs-11">
                                                    {tag}
                                                    </span>
                                            </>);
                                        })}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </React.Fragment>);
}
