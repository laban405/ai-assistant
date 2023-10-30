import React, {useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Input,
    InputGroup,
    Label,
    Nav,
    NavItem,
    NavLink,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row,
    Spinner,
    TabContent,
    TabPane,
    UncontrolledPopover,
    UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    Info, getRow, GetResult, API, GetRows, companyID,
} from "../../../components/config";

import Helper from "../../../lib/Helper";

import Fb, {notify} from "../../../components/Fb";
import Loading from "../../../components/Loading";
import NoData from "../../../components/NoData";
import Link from "next/link";

const api = new API();
let info = null;
let url = "/api/admin/document_editor";
let redirect = "/admin/documents";
let where = {};
let id = 0;
let newPages = "";
export default function Index() {
    const {t} = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Documents");
    const [countNew, setCountNew] = useState(0);
    const [data, setData] = useState();
    const [search, setSearch] = useState();
    const [conentSearch, setContentSearch] = useState();
    const [input, setInput] = useState();
    const [result, setResult] = useState();
    const {params} = router.query || {};
    const company_id = companyID();
    if (params && params.length > 0) {
        if (params[0] === "lib" && params[1]) {
            url = "/api/admin/documents";
            redirect = `/admin/templates/${info?.data?.slug}/recent`;
            where = {
                "doc.company_id": company_id, document_id: params[1],
            };
        }
        if (params[0] === "details" && params[1]) {
            url = "/api/admin/documents";
            redirect = `/admin/templates/${info?.data?.slug}/recent`;
            where = {
                "doc.company_id": company_id, document_id: params[1],
            };
        } else if (params[0] === "speech" && params[1]) {
            url = "/api/admin/speech_to_text";
            redirect = "/admin/transcripts";
            where = {
                "stt.company_id": company_id, speech_to_text_id: params[1],
            };
        } else if (params[0] === "toSpeech" && params[1]) {
            url = "/api/admin/text_to_speech";
            redirect = "/admin/text_to_speech";
            where = {
                "tts.company_id": company_id, text_to_speech_id: params[1],
            };
        } else if (params[0] === "chat" && params[1]) {
            url = "/api/admin/chats";
            redirect = "/admin/chats";
            where = {chat_id: params[1]};
        } else if (params[0] === "edit" && params[1]) {
            url = "/api/admin/document_editor";
            redirect = "/admin/documents/editor";
            where = {
                "tbl_document_editor.company_id": company_id, document_editor_id: params[1],
            };
        } else if (params[0] === "editedDetails" && params[1]) {
            url = "/api/admin/document_editor";
            redirect = "/admin/documents/editor";
            where = {
                "tbl_document_editor.company_id": company_id, document_editor_id: params[1],
            };
        }
        if (params[0] === "new") {
            info = "";
            redirect = "/admin/documents/editor";
        } else {
            info = Info(url, where);
        }
    }
    const {
        data: allEditedDocument, isLoading, refetch,
    } = GetRows("/api/admin/document_editor", {
        where: {
            "tbl_document_editor.company_id": company_id,
        }, search_value: search, limit: 10,
    }, {}, 'allEditedDocument');

    const {
        data: allDocument, isLoading: contentLoading, refetch: dRefecth,
    } = GetRows("/api/admin/documents", {
        where: {
            "doc.company_id": company_id,
        }, search_value: conentSearch, limit: 10,
    }, {}, 'allDocument');

    let fieldName = {
        name: "title", label: t("title"), type: "text", value: info?.data?.title,
    };
    if (params[0] === "chat") {
        fieldName = {
            render: () => {
            },
        };
    }
    if (params[0] === "details" || params[0] === "editedDetails") {
        newPages = (<>
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center bg-white">
                    <h3 className="mb-0">
                        {info?.data?.title ? info?.data?.title : t("details")}
                    </h3>
                    <div className="hstack gap-2">
                        <Link
                            className="btn btn-secondary btn-sm mr-2"
                            href={redirect}
                        >
                            <i className="ri ri-arrow-left-line"></i> {t("back")}
                        </Link>
                        <Link
                            className="btn btn-primary btn-sm"
                            href={(params[0] === "details") ? `/admin/documents/lib/${info?.data?.document_id}` : `/admin/documents/edit/${info?.data?.document_editor_id}`}
                        >
                            <i className="ri ri-pencil-line"></i> {t("edit")}
                        </Link>
                    </div>
                </CardHeader>
                <CardBody>
                    {info?.data?.content ? (<div dangerouslySetInnerHTML={{__html: info?.data?.content}}/>) : (<div
                        dangerouslySetInnerHTML={{__html: info?.data?.description}}
                    />)}
                </CardBody>
            </Card>
        </>);
    } else {
        const meta = {
            flexible: true, formItemLayout: [4, 8], fields: [{
                ...fieldName,
            }, {
                name: info?.data?.content ? t("content") : t("description"),
                label: (<div className={"d-flex justify-content-between"}>
                    <label className={"form-label"}>{t("description")}</label>
                    <UncontrolledPopover
                        placement="left"
                        trigger="legacy"
                        className="popover-container"
                        target="PopoverLeft"
                    >
                        <PopoverBody className="w-100">
                            <div className="input-group ">
                                <input
                                    type="text"
                                    className="form-control"
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                    }}
                                    placeholder={t("write_a_blog_about...?")}
                                />
                                <span className="input-group-btn">
                                            {loading ? ( // spinner button with icon spinner will be shown when loading is true
                                                <button className="btn btn-secondary " type="button">
                                                    <Spinner
                                                        className={"spinner-border spinner-border-sm"}
                                                        color="light"
                                                    />
                                                </button>) : (<button
                                                className="btn btn-secondary"
                                                type="button"
                                                onClick={async () => {
                                                    if (input) {
                                                        setLoading(true);
                                                        const res = await api.post("/api/admin/generate", {
                                                            title: input, type: "text",
                                                        });
                                                        if (res.result) {
                                                            setLoading(false);
                                                            setResult(res.result[0].content);
                                                            setData(res.result[0].content);
                                                        } else if (res.error) {
                                                            setLoading(false);
                                                            setResult(res.error);
                                                            setData(res.error);
                                                        }
                                                    }
                                                }}
                                            >
                                                <i className="ri ri-search-line"></i>
                                            </button>)}
                                        </span>
                            </div>
                        </PopoverBody>
                    </UncontrolledPopover>
                    <Button
                        type={"button"}
                        color="light"
                        className={"text-gray-400"}
                        id="PopoverLeft"
                    >
                        <i className="ri ri-robot-fill"></i>
                        {t("write_with_ai")}
                    </Button>
                </div>),
                type: "textarea",
                value: info?.data?.content || info?.data?.description || info?.data?.text || data || result,
                editor: true,
            }, {
                col: 2,
                type: "submit",
                label: params && params.length > 0 ? t("update") : t("create"),
                submitText: params && params.length > 0 ? t("updating...") : t("creating..."),
            },],
        };
        if (params[0] === "new") {
            // add new input field for company_id
            meta.fields.push({
                name: "company_id", label: t("company_id"), type: "hidden", value: company_id,
            });
        }
        newPages = (<>
            <Fb
                meta={meta}
                isLoading={info?.isLoading}
                layout={"vertical"}
                to={params && params[0] === "lib" ? `/admin/templates/${info?.data?.slug}/recent` : redirect || "/admin/documents"}
                form={true}
                url={url}
                id={params && params.length > 0 ? params[1] : null}
                header={"Document editor"}
                refetch={params && params.length > 0 ? params[0] === "lib" ? dRefecth : refetch : null}
            />
        </>);
    }

    const DocumentTab = (tab) => {
        return (<>
            {isLoading ? (<>
                <div
                    className="skeleton"
                    style={{
                        width: "100%", height: "15rem", marginBottom: "0.5rem",
                    }}
                />
                <div className={"d-flex justify-content-between"}>
                    <div
                        className="skeleton me-3"
                        style={{
                            width: "80%", height: "2rem", marginBottom: "0.5rem",
                        }}
                    />
                </div>
            </>) : allEditedDocument.length ? (<div className="copy-list">
                <ul className={"ps-0"}>
                    {allEditedDocument.map((item, index) => {
                        const description = Helper.removeHtmlTags(item.description);
                        const length = 250;
                        return (<li
                            key={index}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <h5 className="">{item.title}</h5>
                                <p>
                                    {description.length > length ? description.substring(0, length) + "..." : description}
                                </p>
                                <div className="d-flex justify-content-between">
                                    <div className="icons-here">
                                        <UncontrolledTooltip
                                            target={`document-copy-${item.document_editor_id}`}
                                        >
                                            {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                        </UncontrolledTooltip>
                                        <UncontrolledTooltip
                                            target={`document-edit-${item.document_editor_id}`}
                                        >
                                            {t("edit_in_document_editor")}
                                        </UncontrolledTooltip>
                                        <UncontrolledTooltip
                                            target={`document-detail-${item.document_editor_id}`}
                                        >
                                            {t("view_details")}
                                        </UncontrolledTooltip>
                                        <UncontrolledTooltip
                                            target={`document-delete-${item.document_editor_id}`}
                                        >
                                            {t("delete_this_result")}
                                        </UncontrolledTooltip>

                                        <span
                                            id={`document-copy-${item.document_editor_id}`}
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.description);
                                                notify("success", t("copied_to_clipboard_you_can_now_paste_it_anywhere"));
                                            }}
                                        >
                                                        <i className="ri-file-copy-line fs-20"/>
                                                    </span>
                                        <span
                                            id={`document-detail-${item.document_editor_id}`}
                                        >
                                                        <Link
                                                            href={`/admin/documents/editedDetails/${item.document_editor_id}`}
                                                            className={"text-decoration-none text-muted"}
                                                        >
                                                            <i className=" ri-file-list-3-line fs-20"/>
                                                        </Link>
                                                    </span>
                                        <span id={`document-edit-${item.document_editor_id}`}>
                                                        <Link
                                                            href={`/admin/documents/edit/${item.document_editor_id}`}
                                                            className={"text-decoration-none text-muted"}
                                                        >
                                                            <i className=" ri-file-edit-line fs-20"/>
                                                        </Link>
                                                    </span>
                                        <span
                                            id={`document-delete-${item.document_editor_id}`}
                                            onClick={async () => {
                                                if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                    await api
                                                        .delete(`/api/admin/document_editor/`, item.document_editor_id)
                                                        .then((result) => {
                                                            if (result) {
                                                                notify("success", t("deleted_successfully"));
                                                                refetch();
                                                            }
                                                        });
                                                }
                                            }}
                                        >
                                                        <i className="ri-delete-bin-line fs-20"/>
                                                    </span>
                                    </div>
                                </div>
                            </div>
                        </li>);
                    })}
                </ul>
            </div>) : (<div className="text-center">
                <NoData
                    image={false}
                    after={<p className="text-muted mt-2">
                        {t('no_data_found')}
                    </p>}
                />
            </div>)}
        </>);
    };

    const ContentTab = () => {
        return (<>
            {isLoading ? (<Loading/>) : allDocument?.length ? (<div className="copy-list">
                <ul className={"ps-0"}>
                    {allDocument.map((item, index) => {
                        const description = Helper.removeHtmlTags(item.content);
                        const length = 290;
                        return (<li key={`recent-${index}`}>
                            <div>
                                <p>
                                    {description.length > length ? description.substring(0, length) + "..." : description}
                                </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div className="icons-here">
                                    <UncontrolledTooltip
                                        target={`copy-${item.document_id}`}
                                    >
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`edit-${item.document_id}`}
                                    >
                                        {t("edit_in_document_editor")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`delete-${item.document_id}`}
                                    >
                                        {t("delete_this_result")}
                                    </UncontrolledTooltip>

                                    <span
                                        id={`copy-${item.document_id}`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.content);
                                            notify("success", t("copied_to_clipboard_you_can_now_paste_it_anywhere"));
                                        }}
                                    >
                                                    <i className="ri-file-copy-line fs-20"/>
                                                </span>
                                    <span id={`edit-${item.document_id}`}>
                                                    <Link
                                                        href={`/admin/documents/lib/${item.document_id}`}
                                                        className={"text-decoration-none no-color"}
                                                    >
                                                        <i className=" ri-file-edit-line fs-20"/>
                                                    </Link>
                                                </span>
                                    <span
                                        id={`delete-${item.document_id}`}
                                        onClick={async () => {
                                            if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                await api
                                                    .delete(`/api/admin/documents/`, item.document_id)
                                                    .then((result) => {
                                                        if (result) {
                                                            notify("success", t("deleted_successfully"));
                                                            dRefecth();
                                                        }
                                                    });
                                            }
                                        }}
                                    >
                                                    <i className="ri-delete-bin-line fs-20"/>
                                                </span>
                                </div>
                            </div>
                        </li>);
                    })}
                </ul>
            </div>) : (<NoData
                image={false}
                after={<p className="text-muted mt-2">
                    {t('no_data_found')}
                </p>}
            />)}
        </>);
    };
    // make a tab array with count label will be New,Recent,Popular,Favorite

    const tabs = [{
        name: "Documents", label: t("documents"), count: countNew, children: <DocumentTab/>,
    }, {
        name: "Content", count: 0, label: t("template_content"), children: <ContentTab/>,
    },];
    const toggleTab = (tab) => {
        activeTab === "Content" ? setSearch("") : setContentSearch("");
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("documents")} pageTitle={t("documents_Editor")}/>
                <Row>
                    <Col lg={9}>{newPages}</Col>
                    <Col lg={3}>
                        <Card>
                            <div className="m-3">
                                <Nav pills className="nav-pills-custom">
                                    {tabs.map((tab, index) => {
                                        return (<NavItem key={index}>
                                            <NavLink
                                                className={activeTab === tab.name ? "active" : ""}
                                                onClick={() => {
                                                    toggleTab(tab.name);
                                                }}
                                            >
                                                {tab.label}
                                                {tab.count > 0 && (
                                                    <span className="badge badge-soft-primary badge-pill ml-1">
                                                                {tab.count}
                                                            </span>)}
                                            </NavLink>
                                        </NavItem>);
                                    })}
                                </Nav>
                            </div>
                        </Card>
                        <InputGroup>
                            <Input
                                type="text"
                                className="form-control"
                                onChange={(e) => {
                                    activeTab === "Content" ? setContentSearch(e.target.value) : setSearch(e.target.value);
                                }}
                                placeholder={t("search") + "..."}
                            />
                            <Button
                                type="button"
                                color="primary"
                                className="btn btn-primary"
                            >
                                <i className="ri ri-search-line"></i>
                            </Button>
                        </InputGroup>

                        <TabContent activeTab={activeTab}>
                            <div className="mb-3"></div>
                            {tabs.map((tab, index) => {
                                return (<TabPane tabId={tab.name} key={index}>
                                    <Card>
                                        <CardBody>{tab.children}</CardBody>
                                    </Card>
                                </TabPane>);
                            })}
                        </TabContent>
                    </Col>
                </Row>
            </Container>
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
