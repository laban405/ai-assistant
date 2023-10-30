import React, {useState} from "react";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane, UncontrolledTooltip,
} from "reactstrap";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import Fb, {notify} from "../../../components/Fb";
import NoData from "../../../components/NoData";
import axios from "axios";
import Helper from "../../../lib/Helper";
import {API, GetRows, companyID, getRow} from "../../../components/config";

let url = "/api/admin/text_to_speech";
const api = new API();

export default function TextToSpeech() {
    const [activeTab, setActiveTab] = useState("new");
    const [regenerate, setRegenerate] = useState("");
    const [language, setLanguage] = useState("en-US");
    const company_id = companyID();
    const [shouldRefetch, setShouldRefetch] = useState(false);

    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();
    const [transcript, setTranscript] = useState();

    const {
        data: allRecent, isLoading, refetch,
    } = GetRows(url, {
        where: {
            "tts.company_id": company_id,
        }, limit: 10,
    }, {}, 'allRecentTextToSpeech');

    const {
        data: allFavorite, isLoading: favLoading, refetch: fRefecth,
    } = GetRows(url, {
        limit: 10, where: {
            favorite: "Yes", "tts.company_id": company_id,
        },
    }, {}, 'allFavoriteTextToSpeech');

    const handleGenerateSpeech = async (data) => {
        setLoading(true);
        const inputData = {
            text: data?.text, voice: data.voice, title: data.title, language: data.language,
        };
        await axios
            .post(`/api/admin/polly`, inputData)
            .then(async (res) => {
                setShouldRefetch(true);
                await refetch();
                await fRefecth();
                if (res?.success === true) {
                    notify("success", t("speech_create_successfully"));
                    setTranscript([res]);
                } else {
                    notify("warning", res?.error?.message || t("speech_create_failed"));
                }
            })
            .catch((err) => {
                console.log(err);
            });
        setLoading(false);
    };

    const fields = [{
        col: 2,
        name: "text",
        label: t("text"),
        type: "textarea",
        required: true,
        value: regenerate?.text || "",
        runOnChange: true,
        rows: 2,
    }, {
        col: 2,
        name: "title",
        label: t("title"),
        type: "text",
        value: regenerate?.title || t('new_audio'),
        runOnChange: true,
        required: true,
    }, {
        col: 2,
        type: "select",
        name: "language",
        label: t("language"),
        required: true,
        value: "en-US",
        options: Helper.aws_language(t),
        onChange: (value) => {
            setLanguage(value);
        }
    }, {
        runOnChange: true,
        col: 2,
        type: "select",
        name: "voice",
        label: t("voice"),
        required: true,
        value: 'Ivy',
        options: Helper.aws_voice(t, language)
    }, {
        type: "submit", col: 2, label: t("generate_Speech"), submitText: t("generating"),
    },];

    const meta = {
        flexible: true, columns: 2, formItemLayout: [4, 8], fields: [...fields],
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const NewTab = () => {
        return (<>
            {loading ? (<Skeleton/>) : transcript ? (<DocumentContent data={transcript}/>) : (
                <div className="text-center">
                    <NoData
                        after={<p className="text-muted mt-2">
                            {t('generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate')}
                        </p>}
                    />
                </div>)}
        </>);
    };

    const makeFavorite = (item, index) => {
        return async () => {
            const {text_to_speech_id} = item;
            const data = await getRow(url, text_to_speech_id);
            if (data) {
                const {favorite} = data;
                let message = "";
                let input = {
                    favorite: favorite === "Yes" ? "No" : "Yes",
                };
                message = favorite === "Yes" ? t("removed_from_favorite") : t("added_to_favorite");
                const result = await api.create(url, input, text_to_speech_id);
                if (result) {
                    notify("success", message);
                    await refetch();
                    await fRefecth();
                }
            }
        };
    };

    const DocumentContent = ({data}) => {
        return (<>
            {data?.length ? (<div className="copy-list">
                <ul className={"ps-0"}>
                    {data.map((item, index) => {
                        const audio = item?.file && JSON.parse(item.file);
                        const audioUrl = audio ? audio.fileUrl : item.dataURL;
                        return (<li key={index}>
                            <div>
                                <p>{Helper.removeHtmlTags(item.text)}</p>
                            </div>
                            <audio
                                controls
                                src={audioUrl}
                            />
                            <div className="d-flex justify-content-between">
                                <div className="text-3 leading-5 text-gray-400">
                                    {item.text.split(" ").length + " " + t("words")} /{" "}
                                    {item.text.length} {t("characters")}
                                </div>
                                <div className="icons-here">
                                    <UncontrolledTooltip target={`copy-${item.text_to_speech_id}`}>
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`prompt-${item.text_to_speech_id}`}>
                                        {t("use_this_same_prompt_to_generate_more_results")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`favorite-${item.text_to_speech_id}`}
                                    >
                                        {item?.favorite === "Yes" ? t("remove_from_favorite") : t("add_to_favorite")}
                                    </UncontrolledTooltip>

                                    <span id={`favorite-${item.text_to_speech_id}`} onClick={makeFavorite(item)}>
                                        <i className={`ri-heart-line fs-20 pointer ${item?.favorite === "Yes" ? "text-danger" : ""}`}/>
                                    </span>

                                    <UncontrolledTooltip
                                        target={`delete-${item.text_to_speech_id}`}
                                    >
                                        {t("delete_this_result")}
                                    </UncontrolledTooltip>
                                    <span id={`prompt-${item.text_to_speech_id}`}>
                                    <i

                                        onClick={() => {
                                            setRegenerate(item);
                                            // setExample(image.description)
                                        }}
                                        className="bx bx-add-to-queue fs-20  pointer"
                                    />
                                        </span>
                                    <span
                                        id={`copy-${item.text_to_speech_id}`}>
                                    <i
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(item.text);
                                                notify("success", t("copied_to_clipboard"));
                                            } catch (err) {
                                                notify("warning", t("failed_to_copy_to_clipboard"));
                                            }
                                        }}
                                        className={`bx bx-copy fs-20 pointer`}
                                    />
                                        </span>

                                    <span
                                        id={`delete-${item.text_to_speech_id}`}
                                        onClick={async () => {
                                            if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                await api
                                                    .delete(url, item.text_to_speech_id)
                                                    .then((result) => {
                                                        if (result) {
                                                            notify("success", t("deleted_successfully"));
                                                            refetch();
                                                            fRefecth();
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
                    {t('generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate')}
                </p>}
            />)}
        </>);
    };

    const Skeleton = () => {
        return (<>
            <div
                className="skeleton rounded mb-2 w-100"
                style={{height: "120px"}}
            />

            <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex justify-content-between align-items-center w-25">
                    <div
                        className="skeleton rounded w-100 me-3"
                        style={{height: "30px"}}
                    />
                    <div
                        className="skeleton rounded w-100 "
                        style={{height: "30px"}}
                    />
                </div>
                <div className="skeleton rounded w-25" style={{height: "30px"}}/>
            </div>
        </>);
    };

    const RecentTab = () => {
        return (<>
            {isLoading ? (<Skeleton/>) : allRecent ? (<DocumentContent data={allRecent}/>) : (<NoData
                after={<p className="text-muted mt-2">
                    {t('generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate')}
                </p>}
            />)}
        </>);
    };

    const FavoriteTab = () => {
        return (<>
            {favLoading ? (<Skeleton/>) : allFavorite ? (<DocumentContent data={allFavorite}/>) : (<NoData
                after={<p className="text-muted mt-2">
                    {t("save_results_by_clicking_on_the_star_icon_on_the_right_of_the_result")}
                </p>}
            />)}
        </>);
    };

    const tabs = [{
        name: "new", label: t("new"), // count: 0,
        children: <NewTab/>,
    }, {
        name: "recent", count: allRecent?.length || 0, label: t("recent"), children: <RecentTab/>,
    }, {
        name: "favorite", count: allFavorite?.length || 0, label: t("favorite"), children: <FavoriteTab/>,
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb
                    title={t("text_to_speech")}
                    type="words_per_month"
                    shouldRefetch={shouldRefetch}
                    setShouldRefetch={setShouldRefetch}
                />
                <Row>
                    <Col lg={12}>
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
                    </Col>
                </Row>
                <Row>
                    <Col lg={4}>
                        <Card>
                            <CardHeader>
                                <h4 className="card-title">{t("generate_audio")}</h4>
                            </CardHeader>
                            <CardBody>
                                <Fb
                                    meta={meta}
                                    layout={"vertical"}
                                    onSubmit={handleGenerateSpeech}
                                    form={true}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                    <Col lg={8}>
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
