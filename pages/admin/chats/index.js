import React, {useEffect, useRef, useState} from "react";
import MyTable, {Pagination} from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    API, companyID, CustomTable,
} from "../../../components/config";
import Link from "next/link";


export default function Chats() {
    const {t} = useTranslation();
    const [limit, setLimit] = useState(18);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState(null);
    const {
        data: allChatbot, isLoading: botLoading, refetch: botRefetch,
    } = CustomTable("/api/admin/chatbots", {
        limit: limit, filter: filter, page,
    });

    return (<div className="page-content">
        <Container fluid>
            <BreadCrumb pageTitle={t("chats")} title={t("new_chat")}/>
            <Card>
                <CardHeader className="bg-soft-secondary d-flex justify-content-between align-items-center">
                    <h5
                        className="card-title mb-0 flex-grow-1"
                    >
                        {t("we_provide_a_team_of_skilled_AI_experts_who_are_prepared_to_assist_you_with_any_questions_you_may_have")}{" "}
                    </h5>
                    <div className="">
                        <div className="search-box">
                            <input
                                type="text"
                                className="form-control bg-light border-light"
                                placeholder={t("search_AI_experts") + "..."}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <i className="ri-search-2-line search-icon"></i>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="row">
                        {allChatbot && allChatbot?.results?.map((bot, index) => (
                            <Col xxl={2} lg={3} md={3} sm={4} key={index}>
                                <div className="border  mb-3 rounded text-center p-0 rounded bg-light">
                                    <Link
                                        href={`/admin/chats/${bot?.chatbot_id}`}
                                        key={`chatbot-${bot?.chatbot_id}`}
                                    >
                                        <div className="text-center card-body pb-1 ">
                                            <div className="position-relative d-inline-block">
                                                <div className="avatar-xl ">
                                                    {bot?.profile ? (<img
                                                        src="https://api-node.themesbrand.website/images/users/avatar-10.jpg"
                                                        alt=""
                                                        className="avatar-lg rounded-circle img-thumbnail"
                                                    />) : (
                                                        <h1 className="avatar-title bg-soft-primary text-primary rounded ">
                                                            {bot?.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </h1>)}
                                                </div>
                                            </div>
                                            <h5 className="mt-2 mb-1 text-primary">
                                                {bot?.name}
                                            </h5>
                                            <p className="text-muted mb-2 fs-12 text-truncate">
                                                {bot?.role}
                                            </p>
                                            <Button className="btn mt-0 mb-1 btn-primary  btn-sm btn-block">
                                                {t("start_chat")}
                                                <i className="mdi mdi-arrow-right ml-1"></i>
                                            </Button>
                                        </div>
                                    </Link>
                                </div>
                            </Col>))}
                        <Pagination
                            data={allChatbot}
                            setLimit={setLimit}
                            limit={limit}
                            setPage={setPage}
                            page={page}
                        />
                    </div>
                </CardBody>
            </Card>
        </Container>
    </div>);
}
export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
