import React, {useEffect, useRef, useState} from "react";
import MyTable, {DisplayImage, Pagination} from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {API, CustomTable} from "../../../components/config";

import Fb, {MyModal} from "../../../components/Fb";


let url = '/api/admin/chatbots'
export default function Chats() {
    const {t} = useTranslation();
    const [limit, setLimit] = useState(18);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState(null);
    const [modal, setModal] = useState(false);
    const [modalData, setModalData] = useState({});
    const [editModal, setEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState({});


    const {data: allChatbot, isLoading: botLoading, refetch: botRefetch} = CustomTable(url, {
        limit: limit, filter: filter, page
    });

    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "name", label: t("name"), type: "text", value: editModalData?.name, required: true,
        }, {
            name: "role", label: t("role"), type: "text", value: editModalData?.role, required: true,
        }, {
            name: "welcome_message",
            label: t("welcome_message"),
            type: "textarea",
            value: editModalData?.welcome_message,
            required: true,
        }],
    };
    if (!editModalData.chatbot_id || editModalData?.custom === "Yes") {
        meta.fields.push({
            name: "prompt", label: t("prompt"), type: "textarea", required: true,
        }, {
            name: "custom", type: "hidden", value: "Yes",
        });
    }
    meta.fields.push({
        name: "status",
        type: "checkbox",
        label: t("active") + "?",
        customClass: "form-switch mt-2",
        value: editModalData?.status,
    }, {
        type: "file", label: t("profile"), // required: true,
        name: "profile", value: editModalData?.profile,
    }, {
        col: 2, type: "submit", setModal, className: "text-end", label: t('update')
    });

    const createtChatbot = (<Fb
        meta={meta}
        form={true}
        url={url}
        id={editModalData?.chatbot_id}
        to={"/saas/chats"}
    />);
    const status = {
        'published': 'success', 'un_published': 'danger',
    };

    return (<div className="page-content"><Container fluid>
        <BreadCrumb pageTitle={t('chats')} title={t('chatbot')}/>
        <Card>
            <CardHeader
                className="bg-soft-secondary d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 flex-grow-1
                    ">{t('we_provide_a_team_of_skilled_AI_experts_who_are_prepared_to_assist_you_with_any_questions_you_may_have')} </h5>
                <div className="">
                    <div className="search-box">
                        <input
                            type="text"
                            className="form-control bg-light border-light"
                            placeholder={t('search_AI_experts') + '...'}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <i className="ri-search-2-line search-icon"></i>
                    </div>
                </div>

            </CardHeader>
            <CardBody>
                <div className="row">
                    {allChatbot && allChatbot?.results?.map((bot, index) => (
                        <Col xxl={2} lg={3} md={3} sm={4}
                             key={index}>
                            <div className="border  mb-3 rounded text-center p-0 rounded bg-light">
                                <div className="text-center card-body pb-1 ">
                                    <div className="position-relative d-inline-block">
                                        <div className="avatar-xl ">
                                            {bot?.profile ? <DisplayImage
                                                src={bot?.profile}
                                                alt=""
                                                className="avatar-lg rounded-circle img-thumbnail"/> : (<h1
                                                className="avatar-title bg-soft-primary text-primary rounded ">
                                                {bot?.name.split(" ").map((n) => n[0]).join("")}
                                            </h1>)}
                                        </div>
                                    </div>
                                    <h5 className="mt-2 mb-1 text-primary">
                                        {bot?.name}
                                    </h5><p className="text-muted mb-2 fs-12 text-truncate">{bot?.role}</p>
                                    <div className={'d-flex justify-content-between'}>
                                        <Button
                                            onClick={() => {
                                                setModalData(bot);
                                                setModal(true);

                                            }}
                                            className="btn mt-0 mb-1 btn-warning  btn-sm btn-block ">{t('details')}
                                            <i className="mdi mdi-arrow-right ml-1"></i></Button>

                                        <Button
                                            onClick={() => {
                                                setEditModalData(bot);
                                                setEditModal(true);
                                            }}
                                            className="btn mt-0 mb-1 btn-info  btn-sm btn-block ">{t('update')}
                                            <i className="mdi mdi-arrow-right ml-1"></i></Button>
                                    </div>
                                </div>
                            </div>
                        </Col>))}
                </div>
                <div className="text-center">
                    <Pagination data={allChatbot} setLimit={setLimit} limit={limit}
                                setPage={setPage} page={page}/>
                </div>

            </CardBody>
        </Card>
        {editModal && (<MyModal
            size={"xl"}
            title={editModalData?.chatbot_id ? t("update_chatbot") : t("create_chatbot")}
            modal={editModal}
            handleClose={() => {
                setEditModal(false);
                setEditModalData({});
            }}
            children={createtChatbot}
        />)}
        {modal && (<MyModal
            // size={"xl"}
            title={t("chatbot_details")}
            modal={modal}
            handleClose={() => {
                setModal(false);
                setModalData({});
            }}
            children={<div className="card-body">
                <div className="text-center">
                    <div className="position-relative d-inline-block">
                        <div className="avatar-xl ">
                            {modalData?.profile ? <DisplayImage
                                src={modalData?.profile}
                                alt=""
                                className="avatar-lg rounded-circle img-thumbnail"/> : (<h1
                                className="avatar-title bg-soft-primary text-primary rounded ">
                                {modalData?.name.split(" ").map((n) => n[0]).join("")}
                            </h1>)}
                        </div>
                    </div>
                    <h5 className="mt-3 mb-1 text-primary">
                        {modalData?.name}
                    </h5>
                    <p className="text-muted mb-2 fs-12 text-truncate">{modalData?.role}</p>
                </div>
                <div className="text-muted border-top ">
                    <h5 className="font-size-16 mb-3 mt-1">{modalData?.welcome_message}</h5>
                    <p>{modalData?.about_me}</p>
                </div>
            </div>}
        />)}
    </Container></div>)

}
export const getStaticProps = async ({
                                         locale
                                     }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
