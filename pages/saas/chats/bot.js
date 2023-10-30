import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, Container, UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    Info, getRow, GetResult, API, GetRows, DisplayTime, DisplayDateTime, getData, companyID,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";
import Link from "next/link";
import Fb, {MyModal} from "../../../components/Fb";
import Helper from "../../../lib/Helper";

const api = new API();
let url = "/api/admin/chatbots";

export default function AllChats() {
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState({});

    const deleteChat = async (id, refetch) => {
        await api
            .delete(`/api/admin/chats/`, {
                conversation_id: id,
            })
            .then(async (data) => {
                await api.delete(`/api/admin/conversations/`, id);
                await refetch();
            });
    };

    // ------- for table data start ------------
    const columns = [{
        label: t("title"), cell: (row) => {
            return (<div className="d-flex align-items-center p">
                <div className="avatar-sm ">
                    {row?.profile ? (<img
                        src="https://api-node.themesbrand.website/images/users/avatar-10.jpg"
                        alt=""
                        className="avatar-lg rounded-circle img-thumbnail"
                    />) : (<h3 className="avatar-title bg-soft-primary text-primary rounded text-truncate ">
                        {row?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </h3>)}
                </div>
                <div className="ms-2 d-block">
                    <h5 className="mt-2 mb-1 text-primary">{row?.name}</h5>
                    <p className="text-muted mb-2 fs-12 text-truncate">{row?.role}</p>
                </div>
            </div>);
        }, sortable: true, linkId: "chatbot_id",
    }, {
        label: t("welcome_message"), accessor: "welcome_message", sortable: true, length: 100,
    }, {
        label: t("status"),
        accessor: "status",
        update: true,
        number: true,
        type: "checkbox",
        sortable: true,
        linkId: "chatbot_id",
    }, {
        label: t("action"), linkId: "chatbot_id", btn: true, cell: (row, refetch) => {
            return (<div className="d-flex align-items-center p">
                <UncontrolledTooltip
                    placement="top"
                    target={`delete${row.chatbot_id}`}
                >
                    {t("delete")}
                </UncontrolledTooltip>
                <UncontrolledTooltip
                    placement="top"
                    target={"edit" + row?.chatbot_id}
                >
                    {t("edit")}
                </UncontrolledTooltip>
                <Button
                    id={"edit" + row?.chatbot_id}
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

                <Button
                    type="button"
                    id={`delete${row.chatbot_id}`}
                    className="btn btn-sm btn-danger text-decoration-none me-2"
                    onClick={async () => {
                        if (confirm(t("the_all_chat_and_conversation_will_be_deleted_permanently_are_you_sure?"))) {
                            await deleteChat(row.chatbot_id, refetch);
                        }
                    }}
                >
                    <i className="ri-delete-bin-line align-middle fs-12"/>
                </Button>
            </div>);
        },
    },];

    const actions = [{
        name: "btn", label: t("new_bot"), className: "btn-success", icon: "ri-add-line", modal: true, onClick: () => {
            setEditData({});
            setModal(!modal);
        }, setModal: setModal,
    },];

    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "name", label: t("name"), type: "text", value: editData?.name, required: true,
        }, {
            name: "role", label: t("role"), type: "text", value: editData?.role, required: true,
        }, {
            name: "welcome_message",
            label: t("welcome_message"),
            type: "textarea",
            value: editData?.welcome_message,
            required: true,
        }],
    };

    if (!editData.chatbot_id || editData?.custom === "Yes") {
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
        value: editData?.status,
    }, {
        type: "file", label: t("profile"), // required: true,
        name: "profile", value: editData?.profile,
    }, {
        col: 2, type: "submit", setModal, className: "text-end", label: t('update')
    });

    const createtChatbot = (<Fb
        meta={meta}
        form={true}
        url={url}
        id={editData?.chatbot_id}
        to={"/saas/chats/bot"}
    />);

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("chats")} pageTitle={t('all_content')}/>
                <Card>
                    <CardBody>
                        <MyTable columns={columns} url={url} actions={actions}/>
                    </CardBody>
                </Card>
            </Container>
            {modal && (<MyModal
                size={"xl"}
                title={editData?.chatbot_id ? t("update_chatbot") : t("create_chatbot")}
                modal={modal}
                handleClose={() => setModal(!modal)}
                children={createtChatbot}
            />)}
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
