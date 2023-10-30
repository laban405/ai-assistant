import React from "react";
import {Col, Form, Label, Row} from "reactstrap";
import Link from "next/link";

import {
    Avatar, DisplayDateTime, DownloadFile, MyID, TotalRows,
} from "../config";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {useQuery} from "react-query";
import axios from "axios";
import SimpleBar from "simplebar-react";
import Fb from "../Fb";
import Image from "next/image";
import {DisplayImage} from "../MyTable";

const url = "/api/admin/discussions";
let info = "";

export function ModuleComments({data, module, module_id, refetch, link}) {
    const {t} = useTranslation('common');
    const moduleWhere = {
        module, module_id, type: "comment", getComment: true,
    };
    const [commentId, setCommentId] = React.useState(0);
    const [commentReplyId, setCommentReplyId] = React.useState(0);
    const [commentReply, setCommentReply] = React.useState(0);

    const myID = MyID();
    const fields = [{
        name: "module", type: "hidden", value: module,
    }, {
        name: "module_id", type: "hidden", value: module_id,
    }, {
        name: "type", type: "hidden", value: "comment",
    }, {
        name: "user_id", type: "hidden", value: myID,
    }, {
        name: "description",
        type: "textarea",
        label: t("comment"),
        required: true,
        customClass: "bg-light border-light",
        rows: 3,
    }, {
        name: "attachments", type: "file", dropzone: true, label: t("attachments"), // required: true,
    }, {
        name: "submit", type: "submit", label: t("submit"),
    },];
    const meta = {
        columns: 2, formItemLayout: [3, 4], fields,
    };
    const fieldsReply = [{
        name: "module", type: "hidden", value: "comments",
    }, {
        name: "module_id", type: "hidden", value: commentId > 0 ? commentId : commentReply,
    }, {
        name: "type", type: "hidden", value: "reply",
    }, {
        name: "user_id", type: "hidden", value: myID,
    }, {
        name: "description", type: "text", label: t("comment"), value: info.data?.description, required: true,
    }, {
        name: "submit", type: "submit", label: t("submit"),
    },];
    const metaReply = {
        columns: 1, formItemLayout: [3, 4], fields: fieldsReply,
    };

    const replyForm = (<Fb
        meta={metaReply}
        url={url}
        refetch={refetch}
        to={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
        form={true}
    />);

    return (<React.Fragment>
        <SimpleBar style={{height: "300px"}} className="px-3 mx-n3">
            {data.recentComment?.map((comment, index) => {
                let allFiles = [];
                if (comment?.attachments) {
                    allFiles = JSON.parse(comment.attachments);
                }
                return (<div key={`comments${index}`} className="d-flex mb-4">
                    <div className="flex-shrink-0">
                        <DisplayImage
                            src={Avatar(comment?.avatar)}
                            className="avatar-sm rounded-circle me-2"
                            width={40}
                            height={40}
                            alt="user"
                        />
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <h5 className="fs-13">
                            {comment?.fullname}{" "}
                            <small className="text-muted ms-2">
                                {DisplayDateTime(comment?.upload_time)}
                            </small>
                        </h5>
                        <p className="text-muted mb-1">{comment?.description}</p>
                        <Row className="">
                            <div className="d-flex mb-2">
                                {allFiles.length > 0 && allFiles?.map((file, index) => {
                                    return (<div key={`files${index}`} className="me-2">
                                        <Link
                                            href={"#"}
                                            passHref={true}
                                            onClick={async () => {
                                                await DownloadFile(file);
                                            }}
                                        >
                                            {file?.mimetype?.includes("image") ? (<Image
                                                src={file.fileUrl}
                                                alt="image"
                                                width={50}
                                                height={50}
                                                className="img-fluid rounded"
                                            />) : (<div className="flex-shrink-0 avatar-sm">
                                                <div className="avatar-title bg-soft-info text-info fs-24 rounded">
                                                    <i className="bx bx-file"></i>
                                                </div>
                                            </div>)}
                                        </Link>
                                    </div>);
                                })}
                            </div>
                        </Row>

                        <div
                            className="badge text-muted bg-light pointer"
                            onClick={() => {
                                setCommentId(comment?.discussion_id);
                            }}
                        >
                            <i className="mdi mdi-reply"></i> {t("reply")}
                        </div>
                        {commentId === comment?.discussion_id ? replyForm : ""}

                        {comment?.replies?.map((reply, index) => {
                            return (<div key={`reply${index}`} className="d-flex mt-4">
                                <div className="flex-shrink-0">
                                    <DisplayImage
                                        src={Avatar(reply?.avatar)}
                                        className="avatar-sm rounded-circle me-2"
                                        width={40}
                                        height={40}
                                        alt="user"
                                    />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h5 className="fs-13">
                                        {reply?.fullname}{" "}
                                        <small className="text-muted ms-2">
                                            {DisplayDateTime(reply?.upload_time)}
                                        </small>
                                    </h5>
                                    <p className="text-muted mb-1">{reply?.description}</p>
                                    <div
                                        className="badge text-muted bg-light pointer"
                                        onClick={() => {
                                            setCommentReply(comment?.discussion_id);
                                            setCommentReplyId(reply?.discussion_id);
                                        }}
                                    >
                                        <i className="mdi mdi-reply"></i> {t("reply")}
                                    </div>
                                    {commentReplyId === reply?.discussion_id ? replyForm : ""}
                                </div>
                            </div>);
                        })}
                    </div>
                </div>);
            })}
        </SimpleBar>
        <Fb
            meta={meta}
            url={url}
            layout={"vertical"}
            refetch={refetch}
            to={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
            form={true}
        />
    </React.Fragment>);
}

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
