import React, {useContext, useEffect, useState} from "react";

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
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    Info, getRow, API, companyID,
} from "../../../components/config";
import Helper from "../../../lib/Helper";
import Fb, {notify} from "../../../components/Fb";
import NoData from "../../../components/NoData";
import Link from "next/link";
import {Context} from "../../_app";

const api = new API();
let info = null;
let url = "/api/admin/templates";
let newPages = "";
export default function Index() {
    const {t} = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [countNew, setCountNew] = useState(0);
    const [errorMsg, setErrorMsg] = useState();
    const [data, setData] = useState();
    const [regenerate, setRegenerate] = useState("");
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const companyId = companyID();
    const {companyPackage} = useContext(Context);
    const {params} = router.query || {};
    if (params && params.length > 0) {
        const slug = params[0];
        const include = {
            recent: {
                url: "/api/admin/documents", field: {
                    "doc.template_id": "template_id", // key of template_id in foreign table (documents) = value of template_id in main table (libraries)
                }, where: {
                    "doc.company_id": companyId,
                }, limit: 10, order_by: true, group_by: true,
            }, favorites: {
                where: {
                    favorite: "Yes", "doc.company_id": companyId,
                }, url: "/api/admin/documents", field: {
                    "doc.template_id": "template_id", // key of template_id in foreign table (documents) = value of template_id in main table (libraries)
                }, limit: 10, order_by: true, group_by: true,
            }
        };
        info = Info(url, {slug}, include);
    }
    if (companyPackage && companyPackage?.length > 0) {
        const companyPackage = JSON.parse(companyPackage?.ai_templates);
        // check if info?.data?.template_id is in companyPackage or not if not then redirect to upgrades
        if (info?.data?.template_id && !companyPackage.includes(info?.data?.template_id)) {
            router.push("/admin/upgrades");
        }
    }

    const fieldFor = info?.data?.slug?.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
    // url is admin/templates/blog-outline
    // if url last param is match to blog, then show blog intro
    const lastParam = params[params.length - 1];
    // get first string of last param (blog-outline) = blog
    const DefaultName = lastParam.substring(0, lastParam.indexOf("-")) + "Default";
    const DefaultForm = "DefaultForm";
    const fields = Helper[fieldFor] ? Helper[fieldFor](t, info?.data, regenerate, errorMsg) : Helper[DefaultName] ? Helper[DefaultName](t, info?.data, regenerate, errorMsg) : Helper[DefaultForm](t, info?.data, regenerate, errorMsg);
    const meta = {
        flexible: true, columns: 2, formItemLayout: [4, 8], fields: [...fields],
    };
    const onSubmit = async (data) => {
        data.type = "text";
        setActiveTab("new");
        setLoading(true);
        let result = await api.post("/api/admin/generate", data);
        if (result.result && result.result.length > 0) {
            setData(result.result);
            setCountNew(result.result.length);
            setLoading(false);
        } else if (result.error) {
            setErrorMsg(result.error.message);
            setLoading(false);
        }
    };
    newPages = (<>
        <Fb
            meta={meta}
            isLoading={info?.isLoading}
            layout={"vertical"}
            onSubmit={onSubmit}
            form={true}
            header={info.data?.template_id ? info.data?.name : t("new_template")}
        />
    </>);

    const makeFavorite = (item, index) => {
        return async () => {
            const {document_id, text, word, character} = item;
            const data = await getRow("/api/admin/documents", document_id);
            if (data) {
                const {favorite} = data;
                let message = "";
                let input = {
                    favorite: favorite === "Yes" ? t("no") : t("yes"),
                };
                message = favorite === "Yes" ? t("removed_from_favorite") : t("added_to_favorite");
                const result = await api.create("/api/admin/documents", input, document_id);
                if (result) {
                    notify("success", message);
                    info.refetch();
                }
            }
        };
    };
    const DocumentContent = ({data}) => {
        return (<>
            {data?.length ? (<div className="copy-list">
                <ul className={"ps-0"}>
                    {data?.map((item, index) => {
                        return (<li key={index}>
                            <div>
                                <p>{item.content}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div className="text-3 leading-5 text-gray-400">
                                    {item.content.split(" ").length + " " + t("Words")} /{" "}
                                    {item.content.length} {t("characters")}
                                </div>
                                <div className="icons-here">
                                    <UncontrolledTooltip
                                        target={`copy-${item.document_id}`}
                                    >
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`favorite-${item.document_id}`}
                                    >
                                        {item?.favorite === "Yes" ? t("remove_from_favorite") : t("add_to_favorite")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`prompt-${item.document_id}`}
                                    >
                                        {t("use_this_same_prompt_to_generate_more_content")}
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
                                    <span
                                        id={`favorite-${item.document_id}`}
                                        onClick={makeFavorite(item)}
                                    >
                          <i
                              className={`ri-heart-line fs-20 ${item?.favorite === "Yes" ? "text-danger" : ""}`}
                          />
                        </span>
                                    <span
                                        onClick={() => {
                                            setRegenerate(item);
                                        }}
                                        id={`prompt-${item.document_id}`}
                                    >
                          <i className="ri-add-box-line fs-20"/>
                        </span>
                                    <span id={`edit-${item.document_id}`}>
                          <Link
                              href={"/admin/documents/lib/" + item.document_id}
                              className={"text-decoration-none text-muted"}
                          >
                            <i className=" ri-file-edit-line fs-20"/>
                          </Link>
                        </span>
                                    <span
                                        id={`delete-${item.document_id}`}
                                        onClick={async () => {
                                            if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                await api
                                                    .delete("/api/admin/documents", item.document_id)
                                                    .then((result) => {
                                                        if (result) {
                                                            notify("success", t("deleted_successfully"));
                                                            info.refetch();
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
                after={<p className="text-muted mt-2">
                    {t("generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate")}
                </p>}
                before={<>
                    <p className="text-muted mt-2">
                        {t("not_sure_how_this_works?_Get_an_example_by_clicking_on_the_button_below")}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setActiveTab("recent");
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-center">
                            <i className="bx bx-left-arrow-alt"></i>
                            {t("no_data_found")}
                        </div>
                    </button>
                </>}
            />)}
        </>);
    };

    const NewTab = () => {
        return (<>
            {loading ? (<>
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
                            width: "100%", height: "2rem", marginBottom: "0.5rem",
                        }}
                    />
                    <div
                        className="skeleton"
                        style={{
                            width: "100%", height: "2rem", marginBottom: "0.5rem",
                        }}
                    />
                </div>
            </>) : data ? (<DocumentContent data={data}/>) : (<div className="text-center">
                <NoData
                    after={<p className="text-muted mt-2">
                        {t("generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate")}
                    </p>}
                />
            </div>)}
        </>);
    };
    // make a tab array with count label will be New,Recent,Popular,Favorite
    const tabs = [{name: "new", label: t("new"), count: countNew, children: <NewTab/>}, {
        name: "recent",
        count: info && info?.data?.recent ? info?.data?.recent.length : 0,
        label: t("recent"),
        children: <DocumentContent data={info?.data?.recent}/>,
    }, {
        name: "favorite",
        count: info && info?.data?.favorites ? info?.data?.favorites.length : 0,
        label: t("favorite"),
        children: <DocumentContent data={info?.data?.favorites}/>,
    },];
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb
                    title={t("template")}
                    type="words_per_month"
                    shouldRefetch={shouldRefetch}
                    setShouldRefetch={setShouldRefetch}
                    pageTitle={params && t(params[0])}
                />
                <Row>
                    <Col lg={4}>{newPages}</Col>
                    <Col lg={8}>
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
                                                <div className="d-flex align-items-center">
                                                    {tab.label}
                                                    {tab.count > 0 && (<span
                                                        className="badge bg-soft-success text-success ms-1 float-end">
                                  {tab.count}
                                </span>)}
                                                </div>
                                            </NavLink>
                                        </NavItem>);
                                    })}
                                </Nav>
                            </div>
                        </Card>

                        <Card>
                            <CardBody>
                                <TabContent activeTab={activeTab}>
                                    {tabs.map((tab, index) => {
                                        return (<TabPane tabId={tab.name} key={index}>
                                            {tab.children}
                                        </TabPane>);
                                    })}
                                </TabContent>
                            </CardBody>
                        </Card>
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
