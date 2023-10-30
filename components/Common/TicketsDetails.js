import React, {useContext} from "react";
import {Card, CardBody, CardHeader, Col, Label, Row, Table} from "reactstrap";
import {useTranslation} from "next-i18next";
import {API, DisplayDate, DisplayPrefix, DisplayTime, GetRows, Info, TimeAgo} from "../config";
import {ModuleComments} from "./ModuleComments";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export function TicketsDetails({data, link}) {
    const {t} = useTranslation('common');
    const url = "/api/admin/tickets";

    const include = {
        recentComment: {
            method: "getComment", where: {
                module: "tickets", module_id: data?.tickets_id, type: "comment"
            }, url: "/api/admin/discussions", limit: 10,
        }
    };

    const {
        data: TicketDetail, isLoading: TicketsDetailsLoading, refetch
    } = Info(url, {tickets_id: data?.tickets_id}, include);

    return (<React.Fragment>
        <Row>
            {TicketsDetailsLoading ? <div>Loading...</div> : <>
                <Col xl={8} xxl={9}>
                    <Card>
                        <CardBody className="p-4">
                            <h6 className="fw-semibold text-uppercase mb-3">
                                {TicketDetail?.subject}
                            </h6>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: TicketDetail?.message,
                                }}
                            />
                        </CardBody>
                        <CardBody className="p-4">
                            <h5 className="card-title mb-4">{t("comments")}</h5>
                            <ModuleComments data={TicketDetail}
                                            refetch={refetch}
                                            link={link}
                                            module="tickets"
                                            module_id={TicketDetail?.tickets_id}
                            />
                        </CardBody>
                    </Card>
                </Col>
                <Col xl={4} xxl={3}>
                    <Card>
                        <CardHeader>
                            <h5 className="card-title mb-0">{t("ticket_details")}</h5>
                        </CardHeader>
                        <CardBody>
                            <div className="table-responsive table-card">
                                <Table className="table-borderless align-middle mb-0">
                                    <tbody>
                                    <tr>
                                        <td className="fw-medium">{t("ticket_no")}</td>
                                        <td>
                                            {DisplayPrefix(TicketDetail)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-medium">{t("reporter")}</td>
                                        <td id="t-client">{TicketDetail?.reporterName}</td>
                                    </tr>
                                    <tr>
                                        <td className="fw-medium">{t("priority")}</td>
                                        <td>
                                                <span className="badge bg-danger" id="t-priority">
                                                    {TicketDetail?.priority}
                                                </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-medium">{t("date")}</td>
                                        <td id="c-date">
                                            {DisplayDate(TicketDetail?.ticket_date)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="fw-medium">{t("last_updated")}</td>
                                        <td>
                                                <span className="badge bg-success" id="t-status">
                                                    {TimeAgo(TicketDetail?.updated_at)}
                                                </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="fw-medium">{t("tags")}</td>
                                        <td className="hstack text-wrap gap-1">
                                            {TicketDetail?.tags && JSON.parse(TicketDetail?.tags).map((tag, index) => {
                                                return (<>
                                                        <span
                                                            key={index}
                                                            className="badge bg-primary">
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
            </>}
        </Row>
    </React.Fragment>);
}


export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
