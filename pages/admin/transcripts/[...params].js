import React, {useContext, useMemo, useRef, useState} from "react";

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

import {
    Info, getRow, GetResult, API, GetRows, companyID,
} from "../../../components/config";
import Fb, {notify} from "../../../components/Fb";
import NoData from "../../../components/NoData";
import MicRecorder from "mic-recorder-to-mp3";
import axios from "axios";
import Link from "next/link";
import Helper from "../../../lib/Helper";
import {Context} from "../../_app";

const api = new API();
let url = "/api/admin/speech_to_text";
export default function Transcripts() {
    const {config, session} = useContext(Context);

    const {t} = useTranslation();
    const [audio, setAudio] = useState();
    const [transcript, setTranscript] = useState();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [formData, setFormData] = useState();
    const [isRecording, setIsRecording] = useState(false);
    const [blobURL, setBlobURL] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);
    const [error, setError] = useState(false);
    const [language, setLanguage] = useState();
    const [title, setTitle] = useState("Audio Title");
    const company_id = session?.user?.company_id;
    const recorder = useMemo(() => new MicRecorder({bitRate: 128}), []);
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const {
        data: allRecent, isLoading, refetch,
    } = GetRows(url, {
        where: {
            "stt.company_id": company_id,
        }, limit: 10
    }, {}, 'AllRecentTranscripts');

    const {data: allFavorite, isLoading: favLoading, refetch: fRefecth} = GetRows(url, {
        where: {
            favorite: 'Yes', "stt.company_id": company_id,
        }, limit: 10,
    }, {}, 'AllFavoriteTranscripts');


    const startRecording = () => {
        if (isBlocked) {
            console.log("Permission Denied");
            setIsBlocked(true);
        } else {
            recorder
                .start()
                .then(() => {
                    setIsRecording(true);
                })
                .catch((e) => console.error(e));
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        recorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
                const file = new File(buffer, "audio.mp3", {
                    type: blob.type, lastModified: Date.now(),
                });
                setBlobURL(URL.createObjectURL(file));
                const data = new FormData();
                data.append("file", file);
                setFormData(data);
                setAudio(file);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsRecording(false);
        setActiveTab("new");
        if (language) {
            // check if language is already in the form data then update it else append it
            if (formData.has("language")) {
                formData.set("language", language);
            } else {
                formData.append("language", language);
            }
        }
        // check if title is already in the form data then update it else append it
        if (formData.has("title")) {
            formData.set("title", title);
        } else {
            formData.append("title", title);
        }
        if (!formData.has("model")) {
            formData.append("model", "whisper-1");
            formData.append("response_format", "text");
        }
        const result = await axios
            .post("https://api.openai.com/v1/audio/transcriptions", formData, {
                headers: {
                    Authorization: `Bearer ${config?.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
                },
            })
            .then(async (res) => {
                if (formData.has("file")) {
                    if (!formData.has("path")) {
                        formData.append("path", "audios");
                    }
                    const file = await api.uploadFiles(formData);
                    const data = {
                        title: title,
                        language: language,
                        file: JSON.stringify(file.fileData),
                        description: res,
                        favorite: "No",
                        type: "speech",
                    };
                    await axios
                        .post("/api/admin/generate", data)
                        .then((res) => {
                            if (res.result.speech_to_text_id) {
                                setShouldRefetch(true);
                                data.speech_to_text_id = res.result.speech_to_text_id;
                                notify("success", t("audio_uploaded_successfully"));
                                refetch();
                                fRefecth();
                                setTranscript([data]);
                            } else {
                                setError(res.error.message);
                            }
                        })
                        .catch((err) => {
                            setError(err);
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                setError(err);
            });
        setLoading(false);
    };


    const handleFile = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // check valid file type
            if (!file.type.match("audio.*")) {
                setError(t("please_select_a_valid_audio_file_Only_audio_files_are_allowed"));
                return;
            } else {
                setBlobURL(URL.createObjectURL(file));
                setAudio(file);
                const data = new FormData();
                data.append("file", file);
                setFormData(data);
            }
        }
    };

    const makeFavorite = (item, index) => {
        return async () => {
            const {speech_to_text_id} = item;
            const data = await getRow(url, speech_to_text_id);
            if (data) {
                const {favorite} = data;
                let message = "";
                let input = {
                    favorite: favorite === "Yes" ? t("no") : t("yes"),
                };
                message = favorite === "Yes" ? t("removed_from_favorite") : t("added_to_favorite");
                const result = await api.create(url, input, speech_to_text_id);
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
            {data.length ? (<div className="copy-list">
                <ul className={"ps-0"}>
                    {data?.map((item, index) => {
                        return (<li key={index}>
                            <div>
                                <p>{Helper.removeHtmlTags(item.description)}</p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div className="text-3 leading-5 text-gray-400">
                                    {item.description.split(" ").length + " " + t("words")}{" "}
                                    / {item.description.length} {t("characters")}
                                </div>
                                <div className="icons-here">
                                    <UncontrolledTooltip
                                        target={`copy-${item.speech_to_text_id}`}
                                    >
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`favorite-${item.speech_to_text_id}`}
                                    >
                                        {item?.favorite === "Yes" ? t("remove_from_favorite") : t("add_to_favorite")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`edit-${item.speech_to_text_id}`}
                                    >
                                        {t("edit_in_document_editor")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`delete-${item.speech_to_text_id}`}
                                    >
                                        {t("delete_this_result")}
                                    </UncontrolledTooltip>

                                    <span
                                        id={`copy-${item.speech_to_text_id}`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.description);
                                            notify("success", t("copied_to_clipboard_you_can_now_paste_it_anywhere"));
                                        }}
                                    >
                                                    <i className="ri-file-copy-line fs-20"/>
                                                </span>
                                    <span
                                        id={`favorite-${item.speech_to_text_id}`}
                                        onClick={makeFavorite(item)}
                                    >
                                                    <i
                                                        className={`ri-heart-line fs-20 ${item?.favorite === "Yes" ? "text-danger" : ""}`}
                                                    />
                                                </span>

                                    <span id={`edit-${item.speech_to_text_id}`}>
                                                    <Link
                                                        href={"/admin/documents/speech/" + item.speech_to_text_id}
                                                        className={"text-decoration-none text-muted"}
                                                    >
                                                        <i className=" ri-file-edit-line fs-20"/>
                                                    </Link>
                                                </span>
                                    <span
                                        id={`delete-${item.speech_to_text_id}`}
                                        onClick={async () => {
                                            if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                await api
                                                    .delete(url, item.speech_to_text_id)
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
                before={<>
                    <p className="text-muted mt-2">
                        {t("not_sure_how_this_works_get_an_example_by_clicking_on_the_button_below")}
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
                    {t("Save results by clicking on the star icon on the right of the result.\n")}
                </p>}
            />)}
        </>);
    };
    // make a tab array with count label will be New,Recent,Popular,Favorite
    const tabs = [{
        name: "new", label: t("new"), count: 0, children: <NewTab/>,
    }, {
        name: "recent", count: allRecent?.length || 0, label: t("recent"), children: <RecentTab/>,
    }, {
        name: "favorite", count: allFavorite?.length || 0, label: t("favorite"), children: <FavoriteTab/>,
    },];
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    const hiddenFileInput = useRef(null);
    const handleClick = (event) => {
        hiddenFileInput.current.click();
    };
    const meta = {
        // flexible: true,
        columns: 1, formItemLayout: [4, 8], fields: [{
            render: () => (<div className="mb-2">
                {isBlocked ? (<div className="alert alert-danger">
                                <span>
                                    <i className="bx bx-error"></i>
                                    {t("you_need_to_allow_access_to_your_microphone_to_use_this_feature")}
                                </span>
                </div>) : null}
                {error ? (<div className="alert alert-danger">
                    <i className="bx bx-error"></i>
                    <span>{error}</span>
                </div>) : null}

                <div className="d-flex justify-content-between">
                    <div className={"d-flex align-items-center"}>
                        {!isRecording ? (<button
                            type={"button"}
                            className="btn btn-primary"
                            onClick={startRecording}
                            disabled={isRecording}
                        >
                            <div className={"d-flex align-items-center"}>
                                <i className="bx bx-microphone"></i>
                                {t("record")}
                            </div>
                        </button>) : (<button
                            type={"button"}
                            className="btn btn-danger"
                            onClick={stopRecording}
                            disabled={!isRecording}
                        >
                            <div className={"d-flex align-items-center"}>
                                <i className="ri-record-circle-line"></i> {t("stop")}
                            </div>
                        </button>)}
                        <span className="m-1 bold fs-4">{t("or")}</span>
                        <Button onClick={handleClick}>
                            <i className="bx bx-upload"></i> {t("upload_audio")}
                        </Button>
                        <input
                            type="file"
                            accept="audio/*"
                            ref={hiddenFileInput}
                            onChange={handleFile}
                            style={{display: "none"}}
                        />
                    </div>
                </div>

                {audio ? (<div className="mt-3">
                    <h5 className="card-title">{t("audio_preview")}</h5>
                    <div className="text-center">
                        <div className="text-center">
                            <audio src={blobURL} controls="controls"/>
                        </div>
                    </div>
                </div>) : null}
            </div>),
        }, {
            type: "select",
            name: "language",
            label: t("language"),
            placeholder: t("auto_detect"),
            value: language,
            onChange: (value) => {
                setLanguage(value);
            },
            getOptions: {
                url: "/api/admin/languages", value: "code", where: {
                    active: 1,
                },
            },
        }, {
            type: "text", name: "title", label: t("title"), placeholder: t("title"), value: title, onChange: (e) => {
                setTitle(e.target.value);
            },
        },],
    };
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb
                    title={t("speech_to_text")}
                    pageTitle={t("generate_audio")}
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
                                <Fb meta={meta} layout={"vertical"} form={true}/>
                                <div className="">
                                    <button
                                        type={"submit"}
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={!audio}
                                    >
                                        <i className="bx bx-microphone"></i>{" "}
                                        {loading ? (<span>{t("generating...")}</span>) : (<span>
                                                    {transcript ? t("regenerate") : t("generate")}
                                                </span>)}
                                    </button>
                                </div>
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
