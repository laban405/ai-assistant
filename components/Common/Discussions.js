import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    Table,
    UncontrolledDropdown,
} from "reactstrap";
import Link from "next/link";

import { Info, MyID, TotalRows } from "../config";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import MyTable from "../MyTable";
import { Comments } from "./Comments";
import Fb, { BtnModal, MyModal } from "../Fb";

const url = "/api/admin/discussions";
let info = "";

export function Discussions(props) {
    const { moduleWhere } = props;
    const { t } = useTranslation();
    const router = useRouter();
    const [modal, setModal] = useState(false);
    const { discussion_id, details } = router.query || {};
    const myID = MyID();
    let updateInfo = Info(url, discussion_id);
    if (discussion_id) {
        info = updateInfo;
    } else {
        info = "";
    }
    if (info?.isLoading) {
        return <div>Loading...</div>;
    }
    if (details === "true") {
        return (
            <Comments
                moduleWhere={moduleWhere}
                where={{
                    module: "discussions",
                    module_id: discussion_id,
                    type: "comment",
                }}
                id={discussion_id}
                data={info.data}
            />
        );
    } else {
        // ------- for table data start ------------
        const columns = [
            {
                linkId: "discussion_id",
                accessor: "discussion_id",
                checkbox: true,
            },
            {
                label: t("subject"),
                accessor: "title",
                flex: 1,
                sortable: true,
                linkId: "discussion_id",
                actions: [
                    {
                        name: "editModal",
                        permission: {
                            user_id: myID,
                        },
                        link: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`,
                        asLink: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}?discussion_id=[discussion_id]`,
                        setModal: setModal,
                    },
                    {
                        name: "details",
                        link: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`,
                        asLink: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}?discussion_id=[discussion_id]&details=true`,
                    },
                    {
                        name: "delete",
                        link: url,
                        permission: {
                            user_id: myID,
                        },
                    },
                ],
            },
            {
                label: t("total_comments"),
                sortable: true,
                count: {
                    where: {
                        module: "discussions",
                        type: "comment",
                    },
                    tbl: "tbl_discussions",
                    module_id: "discussion_id",
                    field: {
                        module_id: "discussion_id",
                    },
                },
            },
            //     {
            //     label: t('Visible to customer'),
            //     accessor: "visible_to_customer",
            //     update: true,
            //     type: 'checkbox',
            //     linkId: 'discussion_id',
            //     sortable: true,
            //     sortbyOrder: "desc"
            // },
            {
                label: t("created_by"),
                accessor: "fullname",
                sortable: true,
            },
            {
                label: t("discussion_date"),
                accessor: "upload_time",
                dateTime: true,
                sortable: true,
            },
            {
                label: t("action"),
                btn: true,
                linkId: "discussion_id",
                actions: [
                    {
                        name: "editModal",
                        permission: {
                            user_id: myID,
                        },
                        setModal: setModal,
                        link: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`,
                        asLink: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}?discussion_id=[discussion_id]`,
                    },
                    {
                        name: "details",
                        link: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`,
                        asLink: `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}?discussion_id=[discussion_id]&details=true`,
                    },
                    {
                        name: "delete",
                        link: url,
                        permission: {
                            user_id: myID,
                        },
                    },
                ],
            },
        ];

        const actions = [
            {
                name: "btn",
                label: t("new_discussion"),
                className: "btn-success",
                icon: "ri-add-line",
                modal: true,
                size: "xl",
                setModal: setModal,
            },
        ];

        return (
            <React.Fragment>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
                            actions={actions}
                            where={moduleWhere}
                        />
                    </CardBody>
                </Card>
                {modal ? (
                    <>
                        {
                            <DiscussionModal
                                size={"lg"}
                                modal={modal}
                                loading={info?.isLoading}
                                data={info?.data}
                                setModal={setModal}
                                moduleWhere={moduleWhere}
                                handleClose={() => {
                                    router.push(
                                        `/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`
                                    );
                                    setModal(false);
                                }}
                            />
                        }
                    </>
                ) : null}
            </React.Fragment>
        );
    }
}

const DiscussionModal = ({
    data,
    modal,
    handleClose,
    setModal,
    loading,
    moduleWhere,
}) => {
    const { t } = useTranslation();
    const myID = MyID();

    const fields = [
        {
            name: "title",
            type: "text",
            value: data?.title,
            label: t("subject"),
            required: true, // col: 2,
        },
        {
            name: "description",
            type: "textarea",
            label: t("description"),
            value: data?.description, // col: 2,
        }, //     {
        //     name: "visible_to_customer",
        //     type: "checkbox",
        //     selectOne: true,
        //     label: t("Visible to customer"),
        //     value: data?.visible_to_customer || 'yes',
        //     customClass: "form-switch mt-2",
        //     options: [{value: 'yes', label: t('')},]
        // },
        {
            name: "module",
            type: "hidden",
            value: moduleWhere?.module,
        },
        {
            name: "module_id",
            type: "hidden",
            value: moduleWhere?.module_id,
        },
        {
            name: "type",
            type: "hidden",
            value: moduleWhere?.type,
        },
        {
            name: "user_id",
            type: "hidden",
            value: myID,
        },
    ];

    if (!data?.discussion_id) {
        // add new fields
        fields.push({
            name: "attachments",
            type: "file",
            dropzone: true,
            label: t("files"), // required: true,
            value: data?.attachments,
        });
    }
    fields.push({
        name: "submit",
        type: "submit",
        label: t("submit"),
        setModal: setModal,
    });
    const meta = {
        columns: 1,
        formItemLayout: [3, 8],
        fields,
    };
    const newFile = (
        <Fb
            meta={meta}
            form={true}
            url={url}
            id={data?.discussion_id}
            to={`/saas/${moduleWhere.module}/details/${moduleWhere.module_id}`}
        />
    );

    return (
        <MyModal
            size={"lg"}
            title={data?.discussion_id ? t("edit_discussion") : t("add_discussion")}
            modal={modal}
            handleClose={handleClose}
            loading={loading}
            children={newFile}
        />
    );
};

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
