import React, {useEffect, useState} from "react";
import {
    Card, CardBody, Col, Row,
} from "reactstrap";
import Link from "next/link";

import {
    API, DisplayDateTime, DownloadFile, DownloadZip, Info, MyID,
} from "../config";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import MyTable from "../MyTable";
import Fb, {BtnModal, MyModal, notify} from "../Fb";
import Image from "next/image";

const url = "/api/admin/discussions";
let info = "";
const api = new API();

export function Files(props) {

    const mode = "list";
    const [limit, setLimit] = useState(10);
    const [isMode, setIsMode] = useState(mode);
    const [grid, setGrid] = useState(true);
    const [modal, setModal] = useState(false);
    const {moduleWhere, link} = props;
    const {t} = useTranslation();
    const router = useRouter();
    const {discussion_id} = router.query || {};
    const myID = MyID();
    let updateInfo = Info(url, discussion_id);
    if (discussion_id) {
        info = updateInfo;
    } else {
        info = "";
    }
    // ------- for table data start ------------
    const columns = [{
        linkId: "discussion_id", accessor: "discussion_id", checkbox: true,
    }, {
        label: t("files"),
        link: `${link}/files/details/`,
        linkId: "discussion_id",
        accessor: "attachments",
        image: true,
        download: false,
    }, {
        label: t("file_title"), accessor: "title", sortable: true, linkId: "discussion_id", flex: 1, actions: [{
            name: "editModal", permission: {
                user_id: myID,
            }, link: `${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`, setModal: setModal,
        }, {name: "details", link: `${link}/files/details/`}, {
            name: "delete", link: url, permission: {
                user_id: myID,
            },
        },],
    }, {
        label: t("description"), accessor: "description", sortable: true,
    }, {
        label: t("upload_by"), accessor: "fullname", sortable: true,
    }, {
        label: t("upload_time"), accessor: "upload_time", dateTime: true, sortable: true,
    }, {
        label: t("action"), linkId: "discussion_id", btn: true, actions: [{
            name: "editModal", permission: {
                user_id: myID,
            }, link: `${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`, setModal: setModal,
        }, {name: "details", link: "/api/admin/details/"}, {
            name: "delete", permission: {
                user_id: myID,
            }, link: url,
        },],
    },];
    let gridActions = {
        name: "btn", label: t("grid_view"), className: "btn-success", icon: "ri-grid-line",
    };
    if (grid) {
        gridActions = {
            name: "btn", label: t("list_view"), className: "btn-success", icon: "ri-list-check",
        };
    }
    // ------- for table data start ------------
    const actions = [{
        name: "btn",
        label: t("new_file"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        size: "xl",
        setModal: setModal,
    }, {
        ...gridActions, onClick: () => {
            setGrid(!grid);
        },
    },];

    const ImagesTab = ({images, refetch}) => {
        return (<Row>
            {images.map((image, index) => {
                const attachments = JSON.parse(image.attachments) || [];
                return (<Col lg={4}>
                    <div className="box-shadow">
                        <p className="bb">
                            <Row>
                                <Col lg={8}>
                                    <Link href="#">
                                        <small className="text-gray-dark">
                                            <b className="text-black">{image.fullname}</b>{" "}
                                            {t("uploaded")} {attachments.length || 0}{" "}
                                            {attachments.length > 1 ? t("attachments") : t("attachments")}
                                            <br/> - {image.title}
                                        </small>
                                    </Link>
                                </Col>
                                <Col lg={4} className="text-end">
                                    <div>
                                        <Link
                                            href="#"
                                            onClick={async () => {
                                                await DownloadZip(url, {
                                                    discussion_id: image.discussion_id,
                                                });
                                            }}
                                        >
                                            <i className="ri-download-cloud-2-fill"></i>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            href="#"
                                            onClick={async () => {
                                                if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                    await api
                                                        .delete(url, image.discussion_id)
                                                        .then(async (result) => {
                                                            if (result) {
                                                                notify("success", t("deleted_successfully"));
                                                                await refetch();
                                                            }
                                                        });
                                                }
                                            }}
                                        >
                                            <i className="ri-delete-bin-5-line"></i>
                                        </Link>
                                    </div>
                                </Col>
                            </Row>
                        </p>

                        <Row>
                            {attachments.map((attachment, index) => {
                                return (<Col lg={6} className={"mb-3"}>
                                    <div className="hovereffect">
                                        {attachment?.mimetype?.includes("image") ? (<Image
                                            src={attachment.fileUrl}
                                            alt="image"
                                            width={250}
                                            height={250}
                                            className="img-fluid rounded"
                                        />) : (<span className="icon">
                                                            <i className="bx bxs-file-pdf"></i>
                                                        </span>)}
                                        <div className="overlay">
                                            <Link href="#" className="name">
                                                <i className="bx bx-paperclip"></i>
                                                {attachment.originalFilename}
                                            </Link>
                                            <p className="time m-0 p-0">
                                                {DisplayDateTime(attachment.upload_time)}
                                            </p>
                                            <span className="size d-flex justify-content-between">
                                                            {attachment.size} KB{" "}
                                                <Link
                                                    href={"#"}
                                                    onClick={async () => {
                                                        await DownloadFile(attachment);
                                                    }}
                                                >
                                                                <i className="ri-download-cloud-2-fill"></i>
                                                            </Link>
                                                        </span>
                                        </div>
                                    </div>
                                </Col>);
                            })}
                        </Row>
                    </div>
                </Col>);
            })}
        </Row>);
    };
    return (<React.Fragment>
        <Card>
            <CardBody>
                <MyTable
                    grid={{
                        isGrid: grid,
                        type: "image",
                        limit: limit,
                        children: (data, refetch) => (<ImagesTab images={data} refetch={refetch}/>),
                    }}
                    columns={columns}
                    url={url}
                    where={moduleWhere}
                    actions={actions}
                />

                {modal ? (<>
                    {<FileModal
                        size={"lg"}
                        link={link}
                        modal={modal}
                        loading={info?.isLoading}
                        data={info?.data}
                        setModal={setModal}
                        moduleWhere={moduleWhere}
                        handleClose={() => {
                            router.push(`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`);
                            setModal(false);
                        }}
                    />}
                </>) : null}
            </CardBody>
        </Card>
    </React.Fragment>);
}

const FileModal = ({
                       data, modal, handleClose, setModal, loading, moduleWhere, link,
                   }) => {
    const {t} = useTranslation();
    const myID = MyID();
    const meta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "title", type: "text", value: data?.title, label: t("file_title"), required: true, // col: 2,
        }, {
            name: "description", type: "textarea", label: t("description"), value: data?.description, // col: 2,
        }, {
            name: "attachments", type: "file", dropzone: true, label: t("files"), // required: true,
            value: data?.attachments,
        }, {
            name: "module", type: "hidden", value: moduleWhere?.module,
        }, {
            name: "module_id", type: "hidden", value: moduleWhere?.module_id,
        }, {
            name: "type", type: "hidden", value: "file",
        }, {
            name: "user_id", type: "hidden", value: myID,
        }, {
            name: "submit", type: "submit", label: t("submit"), setModal: setModal,
        },],
    };
    const newFile = (<Fb
        meta={meta}
        form={true}
        url={url}
        id={data?.discussion_id}
        to={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.discussion_id ? t("edit_file") : t("new_file")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newFile}
    />);
};

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
