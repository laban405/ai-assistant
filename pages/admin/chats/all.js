import React, {useContext, useState} from "react";

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
import {Context} from "../../_app";

const api = new API();
let url = "/api/admin/conversations";
let where = {};

export default function AllChats() {
    const {t} = useTranslation();
    const {config} = useContext(Context);
    const company_id = companyID();
    where = {
        "cnvrsn.company_id": company_id,
    };
    const exportChats = async (row) => {
        const chat = await getData(`/api/admin/chats/`, {
            where: {
                "cnvrsn.chatbot_id": row.chatbot_id, "cnvrsn.company_id": company_id,
            },
        });
        // export chat to .txt file
        let text = "";
        chat?.map((item) => {
            text += `${DisplayDateTime(item?.date, null, config)} ${item?.fullname} : ${item?.prompt_message}\n`;
            text += `${DisplayDateTime(item?.date, null, config)}  ${item?.name} : ${item?.content}\n`;
        });
        const element = document.createElement("a");
        const file = new Blob([text], {type: "text/plain"});
        element.href = URL.createObjectURL(file);
        element.download = `conversation with ${chat[0]?.name}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };
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
                    <h5 className="mt-2 mb-1 text-primary">
                        <Link href={`/admin/chats/${row.chatbot_id}`}>{row?.name}</Link>
                    </h5>
                    <p className="text-muted mb-2 fs-12 text-truncate">{row?.role}</p>
                </div>
            </div>);
        }, sortable: true, linkId: "conversation_id",
    }, {
        label: t("last_message"), accessor: "last_message", sortable: true, length: 150,
    }, {
        label: t("last_action_at"),
        accessor: "updated_at",
        sortable: true,
        date: true,
        cell: (row) => (<div className="d-flex align-items-center p">
            <strong>{t("at") + " " + DisplayTime(row.updated_at)}</strong>
        </div>),
    }, {
        label: t("action"), linkId: "conversation_id", btn: true, cell: (row, refetch) => {
            return (<div className="d-flex align-items-center p">
                <UncontrolledTooltip
                    placement="top"
                    target={`export${row.conversation_id}`}
                >
                    {t("export_Chat")}
                </UncontrolledTooltip>
                <UncontrolledTooltip
                    placement="top"
                    target={`delete${row.conversation_id}`}
                >
                    {t("delete")}
                </UncontrolledTooltip>
                <UncontrolledTooltip
                    placement="top"
                    target={`view${row.conversation_id}`}
                >
                    {t("view_conversation")}
                </UncontrolledTooltip>
                <Button
                    type="button"
                    id={`export${row.conversation_id}`}
                    className="btn btn-sm btn-primary text-decoration-none ms-2 me-2"
                    onClick={async () => {
                        await exportChats(row);
                    }}
                >
                    <i className="ri-download-2-line align-middle fs-12"/>
                </Button>
                <Button
                    type="button"
                    id={`delete${row.conversation_id}`}
                    className="btn btn-sm btn-danger text-decoration-none me-2"
                    onClick={async () => {
                        if (confirm(t("the_all_chat_and_conversation_will_be_deleted_permanently_are_you_sure?"))) {
                            await deleteChat(row.conversation_id, refetch);
                        }
                    }}
                >
                    <i className="ri-delete-bin-line align-middle fs-12"/>
                </Button>
                <Link
                    href={`/admin/chats/${row.chatbot_id}`}
                    id={`view${row.conversation_id}`}
                    className="btn btn-primary btn-sm btn-rounded waves-effect waves-light"
                >
                    <i className="ri-chat-3-line  align-middle"/>
                </Link>
            </div>);
        },
    },];

    const actions = [{
        name: "btn", label: t("new_chat"), className: "btn-success", icon: "ri-add-line", link: "/admin/chats",
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("chats")} pageTitle={"AllContent"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
                            actions={actions}
                            where={where}
                        />
                    </CardBody>
                </Card>
            </Container>
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
