import React, {useEffect, useState} from "react";

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
    Info, getRow, GetResult, API, GetRows, DownloadFile, CustomTable, DisplayDate, DisplayDateTime, companyID,
} from "../../../components/config";

import Helper from "../../../lib/Helper";

import Fb, {notify} from "../../../components/Fb";
import Loading from "../../../components/Loading";
import NoData, {InsufficientData} from "../../../components/NoData";
import Image from "next/image";
import Link from "next/link";
import MyTable, {DisplayImage, Pagination} from "../../../components/MyTable";

const api = new API();
let info = null;
let url = "/api/admin/images";
let page = "";
let newPages = "";
export default function Images() {
    const {t} = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [countNew, setCountNew] = useState(0);
    const [AllImages, setAllImages] = useState([]);
    const [example, setExample] = useState();
    const [error, setError] = useState();
    const {params} = router.query || {};
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [regenerate, setRegenerate] = useState("");
    const company_id = companyID();

    const {
        data: recentImage, isLoading, refetch,
    } = GetRows("/api/admin/images", {
        where: {
            "img.company_id": company_id,
        }, // search_value: search,
        limit: 13,
    }, {}, 'recentImage');


    const {
        data: favoriteImage, isLoading: favLoading, refetch: favRefetch,
    } = GetRows("/api/admin/images", {
        where: {
            favorite: "Yes", "img.company_id": company_id,
        }, limit: 13,
    }, {}, 'favoriteImage');

    const examples = ["teddy bears shopping for groceries, one-line drawing", "an oil pastel drawing of an annoyed cat in a spaceship", "3D render of a small pink balloon dog in a light pink room", "a macro 35mm photograph of two mice in Hawaii, they're each wearing tiny swimsuits and are carrying tiny surf boards, digital art", "an expressive oil painting of a basketball player dunking, depicted as an explosion of a nebula", "synthwave sports car", "a pencil and watercolor drawing of a bright city in the future with flying cars", "a stained glass window depicting a robot and a human holding hands", "teddy bears shopping for groceries in Japan, ukiyo-e", "an astronaut lounging in a tropical resort in space, vaporwave", "a cat submarine chimera, digital art", `a sea otter with a pearl earring" by Johannes Vermeer`, `crayon drawing of several cute colorful monsters with ice cream cone bodies on dark blue paper`, `A mermaid swimming among the wreckage of a sunken ship. Extremely detailed, 4k`, `A unicorn grazing in a sunflower field. Extremely detailed, 4k`,];

    const fields = [{
        col: 2,
        name: "description",
        label: t("description"),
        type: "textarea",
        value: regenerate?.description || example,
        required: true,
        runOnChange: true,
        helperText: (<div className={"d-flex justify-content-between"}>
            <Button
                onClick={() => {
                    const text = examples[Math.floor(Math.random() * examples.length)];
                    setExample(text);
                }}
                className={"btn btn-warning btn-sm mt-2 text-decoration-none"}
            >
                {t("suggest_me_an_example")}
            </Button>
            <Button
                onClick={() => {
                    // toggle change this button text to "Less"
                    const btn = document.querySelector("#more");
                    btn.innerText = btn.innerText === t("more_options") ? t("less_options") : t("more_options");

                    // toggle change this button color to "danger"
                    btn.classList.toggle("btn-info");
                    btn.classList.toggle("btn-danger");
                    // toogle hide/show this div with animation effect in reactstrap
                    // toggle all d-none class from .common_field class with animation effect
                    const commonFields = document.querySelectorAll(".common_field");
                    commonFields.forEach((field) => {
                        // field.classList.toggle("animate__animated");
                        field.classList.toggle("d-none");
                        // field.classList.toggle("animate__fadeIn");
                    });
                }}
                id={"more"}
                className={"btn btn-primary btn-sm float-end mt-2 text-decoration-none"}
            >
                {t("more_options")}
            </Button>
        </div>),
    }, {
        fieldClass: "common_field d-none mt-2",
        name: "title",
        label: t("image_title"),
        type: "text",
        value: regenerate?.title || t("nextAi_New_Image"),
        col: 2,
    }, {
        fieldClass: "common_field d-none",
        label: t("art_style"),
        type: "select",
        name: "art_style",
        options: Helper.ArtStyle(t),
        value: regenerate?.art_style,
    }, {
        fieldClass: "common_field d-none",
        label: t("lighting_style"),
        type: "select",
        name: "lighting_style",
        options: Helper.LightingStyle(t),
        value: regenerate?.lighting_style,
    }, {
        fieldClass: "common_field d-none",
        label: t("mood"),
        type: "select",
        name: "mood",
        options: Helper.AiMode(t),
        value: regenerate?.mood,
    }, {
        fieldClass: "common_field d-none",
        label: t("type_of_image"),
        type: "select",
        name: "image_type",
        options: Helper.ArtType(t),
        value: regenerate?.image_type,
    }, {
        fieldClass: "common_field d-none",
        label: t("image_size"),
        type: "select",
        name: "image_size",
        options: [{label: "Small (256x256)", value: "256x256"}, {
            label: "Medium (512x512)", value: "512x512",
        }, {label: "Large (1024x1024)", value: "1024x1024"},],
        value: regenerate?.image_size || "512x512",
    }, {
        fieldClass: "common_field d-none",
        label: t("aspect_ratio"),
        type: "select",
        name: "aspect_ratio",
        options: [{label: "Square (1:1)", value: "1:1"}, {
            label: "Portrait (3:4)", value: "3:4",
        }, {label: "Landscape (4:3)", value: "4:3"}, {label: "Wide (16:9)", value: "16:9"},],
        value: regenerate?.aspect_ratio,
    }, {
        fieldClass: "common_field d-none",
        label: t("keep_images_private"),
        type: "checkbox",
        customClass: "form-switch fs-23",
        name: "private_image",
        value: regenerate?.private,
    }, {
        fieldClass: "common_field d-none",
        label: t("number_of_images"),
        type: "number",
        name: "number_of_images",
        value: regenerate?.number_of_images || 1,
    }, {
        type: "submit", col: 2, label: t("draw_it"), submitText: t("drawing..."),
    },];
    const meta = {
        flexible: true, columns: 2, formItemLayout: [4, 8], fields: [...fields],
    };
    const onSubmit = async (data) => {
        setLoading(true);
        setActiveTab("new");
        const result = await api.post("/api/admin/generateImage", data);
        if (result) {
            if (result?.result?.length > 0) {
                setShouldRefetch(true);
                setAllImages(result?.result);
                refetch();
                setCountNew(result?.result?.length);
            } else {
                setAllImages([]);
                refetch();
                setCountNew(0);
                setError(result?.error || t("something_went_wrong"));
            }
            setLoading(false);
        }
    };
    newPages = (<>
        <Fb
            meta={meta}
            layout={"vertical"}
            onSubmit={onSubmit}
            form={true}
            header={t("generate_images")}
        />
    </>);

    const ImagesTab = ({images, ...params}) => {
        return images ? (<div className="row gallery-wrapper">
            {images?.map((image, index) => {
                const img = image?.url || image.image;
                const imageUrl = encodeURIComponent(img);
                const [width, height] = image?.image_size
                    ?.split("x")
                    .map((s) => parseInt(s, 10)) ?? [256, 256];
                return (<Col
                    xxl={params?.col || 3}
                    xl={4}
                    sm={6}
                    className="element-item project designing development"
                    key={index}
                >
                    <Card className="gallery-box">
                        <div className="gallery-container">
                            <DisplayImage
                                src={img}
                                alt={image.title || t("generate_images")}
                                width={width}
                                height={height}
                                className="gallery-img img-fluid mx-auto"
                            />
                            <div className="gallery-overlay flex-column">
                                <p className="overlay-caption fs-13 my-auto w-100 ">
                                    {image.description}
                                </p>
                                <div className="d-flex justify-content-between">
                                    <UncontrolledTooltip target={`copy-${image.image_id}`}>
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`favorite-${image.image_id}`}
                                    >
                                        {image?.favorite === "Yes" ? t("remove_from_favorite") : t("add_to_favorite")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`prompt-${image.image_id}`}>
                                        {t("use_this_same_prompt_to_generate_more_images")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip
                                        target={`download-${image.image_id}`}
                                    >
                                        {t("download_this_image")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`delete-${image.image_id}`}>
                                        {t("delete_this_image")}
                                    </UncontrolledTooltip>
                                    <div className="me-2">
                                        <i
                                            id={`favorite-${image.image_id}`}
                                            onClick={async () => {
                                                let message = "";
                                                let input = {
                                                    favorite: image?.favorite === "Yes" ? t("no") : t("yes"),
                                                };
                                                message = image?.favorite === "Yes" ? t("removed_from_favorite") : t("added_to_favorite");
                                                const result = await api.create("/api/admin/images", input, image.image_id);
                                                if (result) {
                                                    notify("success", message);
                                                    await refetch();
                                                    await favRefetch()
                                                }
                                            }}
                                            className={`bx ${image?.favorite === "Yes" ? "bxs-heart text-danger" : "bx-heart text-white"}  fs-20 me-2 pointer`}
                                        />

                                        <i
                                            id={`prompt-${image.image_id}`}
                                            onClick={() => {
                                                setRegenerate(image);
                                                // setExample(image.description)
                                            }}
                                            className="bx bx-add-to-queue text-white fs-20 me-2 pointer"
                                        />
                                    </div>
                                    <div className="me-2">
                                        <i
                                            id={`copy-${image.image_id}`}
                                            onClick={async () => {
                                                try {
                                                    const blob = await fetch(img).then((r) => r.blob());
                                                    await navigator.clipboard.write([new ClipboardItem({
                                                        [blob.type]: blob,
                                                    }),]);
                                                    notify("success", t("copied_to_clipboard"));
                                                } catch (err) {
                                                    notify("warning", t("failed_to_copy_to_clipboard"));
                                                }
                                            }}
                                            className={`bx bx-copy text-white fs-20 me-2 pointer`}
                                        />
                                        <i
                                            id={`download-${image.image_id}`}
                                            onClick={async () => {
                                                // download image file
                                                await DownloadFile({
                                                    fileUrl: img, originalFilename: image.title + ".png",
                                                });
                                            }}
                                            className={`bx bx-download text-white fs-20 me-2 pointer`}
                                        />
                                        <i
                                            id={`delete-${image.image_id}`}
                                            onClick={async () => {
                                                if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                    await api
                                                        .delete("/api/admin/images", image.image_id)
                                                        .then(async (result) => {
                                                            if (result) {
                                                                notify("success", t("deleted_successfully"));
                                                                await refetch();
                                                                await favRefetch()
                                                            }
                                                        });
                                                }
                                            }}
                                            className={`bx bx-trash text-white fs-20 me-2 pointer`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box-content">
                            <div className="d-flex align-items-center mt-1">
                                <div className="flex-grow-1 text-muted">
                                    {t("by")}{" "}
                                    <Link
                                        href="#"
                                        className="text-body text-truncate"
                                    >
                                        {image?.fullname || t("me")}
                                    </Link>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="d-flex gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm fs-12 btn-link text-body text-decoration-none px-0"
                                        >
                                            <i className="ri-time-line text-muted align-bottom me-1"></i>{" "}
                                            {DisplayDateTime(image?.created_at)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>);
            })}
        </div>) : (<div className="text-center">
            <h3 className="text-center">{t("no_images_found")}</h3>
        </div>);
    };

    const NewTab = (params) => {
        return (<>
            {loading ? (<>
                <Col
                    xxl={params?.col || 3}
                    xl={4}
                    sm={6}
                    className="element-item project designing development"
                >
                    <div className="skeleton w-100 " style={{height: "200px"}}/>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <div
                            className="skeleton w-50 me-5"
                            style={{height: "25px"}}
                        />
                        <div className="skeleton w-50 " style={{height: "25px"}}/>
                    </div>
                </Col>
            </>) : AllImages.length > 0 ? (<ImagesTab images={AllImages} {...params} />) : (
                <div className="text-center">
                    <NoData
                        after={<p className="text-muted mt-2">
                            {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate")}
                        </p>}
                        before={<>
                            <p className="text-muted mt-2">
                                {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("not_sure_how_this_works_get_an_example_by_clicking_on_the_button_below")}
                            </p>
                            <button
                                type={error ? "submit" : "button"}
                                className="btn btn-primary"
                                onClick={() => {
                                    const text = examples[Math.floor(Math.random() * examples.length)];
                                    setExample(text);
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <i className="bx bx-left-arrow-alt"></i>
                                    {error ? t("try_again_latter") : t("suggest_me_an_example")}
                                </div>
                            </button>
                        </>}
                    />
                </div>)}
        </>);
    };
    const RecentTab = () => {
        return (<>
            {isLoading ? (<Loading/>) : recentImage.length ? (<ImagesTab images={recentImage}/>) : (
                <div className="text-center">
                    <NoData
                        after={<p className="text-muted mt-2">
                            {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate")}
                        </p>}
                        before={<>
                            <p className="text-muted mt-2">
                                {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("not_sure_how_this_works_get_an_example_by_clicking_on_the_button_below")}
                            </p>
                            <button
                                type={error ? "submit" : "button"}
                                className="btn btn-primary"
                                onClick={() => {
                                    const text = examples[Math.floor(Math.random() * examples.length)];
                                    setExample(text);
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <i className="bx bx-left-arrow-alt"></i>
                                    {error ? t("try_again_latter") : t("suggest_me_an_example")}
                                </div>
                            </button>
                        </>}
                    />
                </div>)}
        </>);
    };
    const FavoriteTab = () => {
        return (<>
            {isLoading ? (<Loading/>) : favoriteImage?.length ? (<ImagesTab images={favoriteImage}/>) : (
                <div className="text-center">
                    <NoData
                        after={<p className="text-muted mt-2">
                            {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("generate_results_by_filling_up_the_form_on_the_left_and_clicking_on_generate")}
                        </p>}
                        before={<>
                            <p className="text-muted mt-2">
                                {error ? t("an_error_occurred_while_loading_the_data_please_try_again_later") : t("not_sure_how_this_works_get_an_example_by_clicking_on_the_button_below")}
                            </p>
                            <button
                                type={error ? "submit" : "button"}
                                className="btn btn-primary"
                                onClick={() => {
                                    const text = examples[Math.floor(Math.random() * examples.length)];
                                    setExample(text);
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <i className="bx bx-left-arrow-alt"></i>
                                    {error ? t("try_again_latter") : t("suggest_me_an_example")}
                                </div>
                            </button>
                        </>}
                    />
                </div>)}
        </>);
    };
    // make a tab array with count label will be New,Recent,Popular,Favorite
    const tabs = [{
        name: "new", label: t("new"), count: countNew, children: <NewTab/>,
    }, {
        name: "recent", count: recentImage?.length || 0, label: t("recent_generations"), children: <RecentTab/>,
    }, {
        name: "favorite", count: favoriteImage?.length || 0, label: t("favorite"), children: <FavoriteTab/>,
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
                    type="images_per_month"
                    shouldRefetch={shouldRefetch}
                    setShouldRefetch={setShouldRefetch}
                    title={t("generate_image")}
                    pageTitle={t("generate_image")}
                />
                <>
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
                                {activeTab === "all" && (<NavItem>
                                    <div className="d-flex align-items-center ms-2">
                                        <div className="search-box ms-2">
                                            <div className="position-relative">
                                                <input
                                                    type="text"
                                                    onChange={(e) => {
                                                        setFilter(e.target.value);
                                                    }}
                                                    className="form-control bg-light border-light rounded"
                                                    placeholder={t("search")}
                                                />
                                                <i className="bx bx-search-alt search-icon"/>
                                            </div>
                                        </div>
                                    </div>
                                </NavItem>)}
                            </Nav>
                        </div>
                    </Card>

                    {activeTab === "new" ? (<Row>
                        {" "}
                        <Col lg={4}>{newPages}</Col>
                        <Col lg={8}>
                            <Card>
                                <CardBody>
                                    <NewTab col={5}/>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>) : (<Col lg={12}>
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
                    </Col>)}
                </>
            </Container>
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
