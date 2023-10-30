import React from "react";
import {
    Card, CardBody, CardHeader, Row,
} from "reactstrap";
import Link from "next/link";

import {
    Avatar, DisplayDateTime, DownloadFile, MyID, TotalRows,
} from "../config";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import Image from "next/image";
import {useQuery} from "react-query";
import axios from "axios";
import Fb from "../Fb";

const url = "/api/admin/discussions";
let info = "";

export function Comments(props) {
    const {moduleWhere, data, id, where, link} = props;
    const [commentId, setCommentId] = React.useState(0);
    const [commentReplyId, setCommentReplyId] = React.useState(0);
    const [commentReply, setCommentReply] = React.useState(0);
    const {data: totalComments, isLoading} = TotalRows(url, moduleWhere);
    const {t} = useTranslation();
    const myID = MyID();
    const input = {
        module: moduleWhere.module, module_id: moduleWhere.module_id, type: "comment", getComment: true,
    };
    // get all comments by useQuery
    const {
        data: comments, isLoading: loadingComments, refetch,
    } = useQuery(["AllComments", id], async () => {
        const result = await axios.post(url, input);
        return result;
    });

    const fields = [{
        name: "module", type: "hidden", value: moduleWhere.module,
    }, {
        name: "module_id", type: "hidden", value: moduleWhere.module_id,
    }, {
        name: "type", type: "hidden", value: "comment",
    }, {
        name: "user_id", type: "hidden", value: myID,
    }, {
        name: "description", type: "textarea", label: t("comment"), required: true, rows: 2,
    }, {
        name: "attachments", type: "file", dropzone: true, label: t("attachments"), // required: true,
    }, {
        name: "submit", type: "submit", label: t("submit"),
    },];

    const meta = {
        columns: 1, formItemLayout: [2, 5], fields,
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
        columns: 1, formItemLayout: [2, 4], fields: fieldsReply,
    };

    const replyForm = (<Fb
        meta={metaReply}
        url={url}
        refetch={refetch}
        to={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
        form={true}
    />);

    return (<React.Fragment>
        <Card>
            <CardHeader className="align-items-center d-flex">
                <div className="flex-grow-1">
                    <h4>
                        {data?.title}
                        <div className="flex-shrink-0 float-end">
                            <Link
                                className="btn btn-primary btn-sm"
                                href={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
                            >
                                <i className="mdi mdi-arrow-left"/> {t("back")}
                            </Link>
                        </div>
                    </h4>
                    <div className="hstack gap-3 flex-wrap">
                        <div className="text-muted">
                            {t("posted_by")} :{" "}
                            <span className="text-body fw-medium">{data?.fullname}</span>
                        </div>
                        <div className="vr"></div>
                        <div className="text-muted">
                            {t("posted_on")} :{" "}
                            <span className="text-body fw-medium">
                                    {DisplayDateTime(data?.upload_time)}
                                </span>
                        </div>
                        <div className="vr"></div>
                        <div className="text-muted">
                            {t("total_comments")} :{" "}
                            <span className="text-body fw-medium">
                                    {isLoading ? <div>{t("loading...")}</div> : totalComments.all}
                                </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardBody>
                <Fb
                    meta={meta}
                    form={true}
                    url={url}
                    refetch={refetch}
                    id={data?.discussion_id}
                    to={`${link}/${moduleWhere.module}/details/${moduleWhere.module_id}`}
                />
                <div className="mt-4 ms-4">
                    {comments?.map((comment, index) => {
                        let allFiles = [];
                        if (comment?.attachments) {
                            allFiles = JSON.parse(comment.attachments);
                        }
                        return (<div key={`comments${index}`} className="d-flex mb-4">
                            <div className="flex-shrink-0">
                                <Image
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
                                    <div className="d-flex gap-2 mb-2">
                                        {allFiles?.map((file, index) => {
                                            return (<div key={`files${index}`} className="">
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
                                                        <div
                                                            className="avatar-title bg-soft-info text-info fs-24 rounded">
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
                                            <Image
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
                                            <p className="text-muted mb-1">
                                                {reply?.description}
                                            </p>
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
                </div>
            </CardBody>
        </Card>
    </React.Fragment>);
}

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
