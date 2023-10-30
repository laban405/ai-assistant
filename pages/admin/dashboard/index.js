import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardImg,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    Table,
    UncontrolledDropdown,
    UncontrolledTooltip,
} from "reactstrap";
import React, {useState} from "react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});
import "moment-timezone";
import Helper from "../../../lib/Helper";
import {useRouter} from "next/router";
import Link from "next/link";
import {
    API, companyID, DisplayDateTime, DisplayTime, DownloadFile, GetRows, Info, TotalRows,
} from "../../../components/config";
import Image from "next/image";
import {notify} from "../../../components/Fb";
import BreadCrumb from "../../../components/BreadCrumb";

const api = new API();

const Dashboard = () => {
    const {t} = useTranslation();
    const company_id = companyID();
    const thisMonth = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const lastMonth = `${new Date().getMonth()}-${new Date().getFullYear()}`;
    const [usedType, setUsedType] = useState("words");


    const {data: usedData, isLoading: usedLoading} = Info("/api/admin/used_contents", {
        "usdContent.company_id": company_id,
    }, {
        latest_document: {
            url: "/api/admin/documents", where: {
                "doc.company_id": company_id,
            }, limit: 10,
        }, latest_image: {
            url: "/api/admin/images", where: {
                "img.company_id": company_id,
            }, limit: 12,
        }, latest_speech: {
            url: "/api/admin/speech_to_text", where: {
                "stt.company_id": company_id,
            }, limit: 10,
        }, latest_textToSpeech: {
            url: "/api/admin/text_to_speech", where: {
                "tts.company_id": company_id,
            }, limit: 10,
        }, last_month: {
            url: "/api/admin/used_contents", where: {
                "usdContent.company_id": company_id, month: lastMonth,
            }, row: true,
        }, this_month: {
            url: "/api/admin/used_contents", where: {
                "usdContent.company_id": company_id, month: thisMonth,
            }, row: true,
        },
    });

    const thisStartDate = DisplayDateTime(new Date(new Date().getFullYear(), new Date().getMonth(), 1), true);
    const thisEndDate = DisplayDateTime(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), true);

    const lastStartDate = DisplayDateTime(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), true);
    const lastEndDate = DisplayDateTime(new Date(new Date().getFullYear(), new Date().getMonth(), 0), true);
    let url = "/api/admin/documents";
    let where = {};
    let lastWhere = {};
    if (usedType === "images") {
        url = "/api/admin/images";
        where = {
            "img.company_id": company_id, where: {
                "img.date >=": thisStartDate, "img.date <=": thisEndDate,
            },
        };
        lastWhere = {
            "img.company_id": company_id, where: {
                "img.date >=": lastStartDate, "img.date <=": lastEndDate,
            },
        };
    } else if (usedType === "transcripts") {
        url = "/api/admin/speech_to_text";
        where = {
            "stt.company_id": company_id, where: {
                "stt.date >=": thisStartDate, "stt.date <=": thisEndDate,
            },
        };
        lastWhere = {
            "stt.company_id": company_id, where: {
                "stt.date >=": lastStartDate, "stt.date <=": lastEndDate,
            },
        };
    } else {
        url = "/api/admin/documents";
        where = {
            "doc.company_id": company_id, where: {
                "doc.date >=": thisStartDate, "doc.date <=": thisEndDate,
            },
        };
        lastWhere = {
            "doc.company_id": company_id, where: {
                "doc.date >=": lastStartDate, "doc.date <=": lastEndDate,
            },
        };
    }
    const {data: monthData, isLoading: thisMonthLoading} = GetRows(url, {
        where: where,
    }, {
        last_month: {
            url: url, where: lastWhere,
        },
    });

    const ecomWidgets = [{
        id: 1,
        label: t("words_used"),
        badgeClass: "success",
        counter: usedData?.used_words || 0,
        bgcolor: "success",
        icon: "ri-stack-line",
        decimals: 2,
        prefix: "",
        suffix: "k",
    }, {
        id: 2,
        label: t("images_used"),
        badgeClass: "info",
        counter: usedData?.used_images || 0,
        bgcolor: "info",
        icon: "ri-image-line",
    }, {
        id: 3,
        label: t("transcripts_generated"),
        badgeClass: "warning",
        counter: usedData?.used_speech_to_text || 0,
        bgcolor: "warning",
        icon: "ri-music-2-line",
    }, {
        id: 4,
        label: t("text_to_speech"),
        badgeClass: "danger",
        counter: usedData?.used_text_to_speech || 0,
        bgcolor: "danger",
        icon: "ri-file-list-3-line",
    }];
    const BalanceOverviewCharts = () => {
        const revenueExpensesChartsColors = ["#0ab39c", "#727cf5"];
        const currentMonthData = [];
        const lastMonthData = [];
        const dateNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,];

        monthData?.map((item) => {
            if (item?.date) {
                const date = Number(DisplayDateTime(item?.date, true).split(" ")[0].split("-")[2]);
                if (currentMonthData[date]) {
                    currentMonthData[date] = currentMonthData[date] + 1;
                } else {
                    currentMonthData[date] = 1;
                }
            }
        });
        monthData?.last_month?.map((item) => {
            if (item?.date) {
                const date = Number(DisplayDateTime(item?.date, true).split(" ")[0].split("-")[2]);
                if (lastMonthData[date]) {
                    lastMonthData[date] = lastMonthData[date] + 1;
                } else {
                    lastMonthData[date] = 1;
                }
            }
        });

        // add 0 to empty date
        dateNumber.map((item, index) => {
            if (!currentMonthData[index]) {
                currentMonthData[index] = 0;
            }
            if (!lastMonthData[index]) {
                lastMonthData[index] = 0;
            }
        });

        const series = [{
            name: t("last_month"), data: lastMonthData,
        }, {
            name: t("this_month"), data: currentMonthData,
        },];
        const options = {
            chart: {
                height: 290, type: "area", toolbar: "false",
            }, dataLabels: {
                enabled: false,
            }, stroke: {
                curve: "smooth", width: 2,
            }, xaxis: {
                categories: dateNumber,
            }, yaxis: {
                labels: {
                    formatter: function (value) {
                        return (value + " " + t(usedType === "images" ? t("images") : usedType === "transcripts" ? t("transcripts") : usedType === "text_to_speech" ? t("text_to_speech") : t("documents")));
                    },
                }, tickAmount: 5, min: 0, max: Math.max.apply(Math, currentMonthData.concat(lastMonthData)),
            }, colors: revenueExpensesChartsColors, fill: {
                opacity: 0.06, colors: revenueExpensesChartsColors, type: "solid",
            },
        };
        return (<React.Fragment>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height="290"
                className="apex-charts"
            />
        </React.Fragment>);
    };

    const router = useRouter();
    const {type} = router.query || {};
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb title={t("dashboard")} pageTitle={t("dashboard")}/>
                <Row>
                    {ecomWidgets.map((item, key) => (<Col xl={3} md={6} key={key}>
                        {usedLoading ? (<div
                            className="skeleton me-3"
                            style={{
                                width: "100%", height: "6rem", marginBottom: "0.5rem",
                            }}
                        />) : (<Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center justify-content-between ">
                                    <div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                                                {item.label}
                                            </p>
                                        </div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                                                        <span
                                                            className="counter-value"
                                                            data-target="559.25"
                                                        >
                                                            {item.counter}
                                                        </span>
                                        </h4>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                                    <span
                                                        className={"avatar-title rounded fs-3 bg-soft-" + item.bgcolor}
                                                    >
                                                        <i
                                                            className={`text-${item.bgcolor} ${item.icon}`}
                                                        ></i>
                                                    </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>)}
                    </Col>))}
                </Row>
                <Row>
                    <Col xl={12} md={6}>
                        <Card className="card-height-100">
                            <CardHeader className="align-items-center d-flex">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("used_contents")}
                                    <small className="text-muted fw-medium fs-10 d-block">
                                        {t("last_month_vs_this_month")}
                                    </small>
                                </h4>

                                <div className="flex-shrink-0">
                                    <UncontrolledDropdown className="card-header-dropdown">
                                        <DropdownToggle
                                            className="text-reset dropdown-btn"
                                            tag="a"
                                            role="button"
                                        >
                                                <span className="fw-semibold text-uppercase fs-12">
                                                    Sort by:{" "}
                                                </span>
                                            <span className="text-muted">
                                                    {t(usedType)}
                                                <i className="mdi mdi-chevron-down ms-1"></i>
                                                </span>
                                        </DropdownToggle>
                                        <DropdownMenu className="dropdown-menu-end">
                                            {["words", "images", "transcripts", 'text_to_speech'].map((item, key) => (
                                                <DropdownItem
                                                    key={key}
                                                    onClick={() => {
                                                        setUsedType(item.toLowerCase());
                                                    }}
                                                >
                                                    {t(item)}
                                                </DropdownItem>))}
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                            </CardHeader>
                            <CardBody className="px-0">
                                <ul className="list-inline main-chart text-center mb-0">
                                    <li className="list-inline-item chart-border-left me-0 border-0">
                                        <h4 className="text-primary">
                                            {usedType === "words" ? usedData?.this_month[0]?.used_words || 0 : usedType === "images" ? usedData?.this_month[0]?.used_images || 0 : usedType === 'transcripts' ? usedData?.this_month[0]?.used_speech_to_text || 0 : usedData?.this_month[0]?.used_text_to_speech || 0}
                                            <span className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                    {usedType === "words" ? t("Words") : usedType === "images" ? t("Images") : t("Transcripts")}
                                                </span>
                                            <span className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                    {t("in_this_month")}
                                                </span>
                                        </h4>
                                    </li>
                                    <li className="list-inline-item chart-border-left me-0">
                                        <h4>
                                            {usedType === "words" ? usedData?.last_month[0]?.used_words || 0 : usedType === "images" ? usedData?.last_month[0]?.used_images || 0 : usedType === 'transcripts' ? usedData?.last_month[0]?.used_speech_to_text || 0 : usedData?.last_month[0]?.used_text_to_speech || 0}
                                            <span className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                    {usedType === "words" ? t("Words") : usedType === "images" ? t("Images") : t("Transcripts")}
                                                </span>
                                            <span className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                    {t("in_last_month")}
                                                </span>
                                        </h4>
                                    </li>
                                </ul>

                                <div id="revenue-expenses-charts" dir="ltr">
                                    {thisMonthLoading ? (<div className="skeleton rounded-3 h-100"/>) : (
                                        <BalanceOverviewCharts/>)}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xl={6} md={6}>
                        {usedLoading ? (<>
                            <div className="skeleton rounded-3 h-100"/>
                        </>) : (<Card className="card-height-100">
                            <CardHeader className="align-items-center d-flex">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("latest_documents")}
                                </h4>
                                <Link
                                    href={"/admin/documents/new"}
                                    className="btn btn-sm btn-primary"
                                >
                                    <i className="mdi mdi-plus-circle me-1"></i>{" "}
                                    {t("new_document")}
                                </Link>
                            </CardHeader>
                            <CardBody className="px-0">
                                <div className="table-responsive">
                                    <Table className="table table-hover mb-0">
                                        <thead>
                                        <tr>
                                            <th scope="col">{t("title")}</th>
                                            <th scope="col">{t("template")}</th>
                                            <th scope="col">{t("created_at")}</th>
                                            <th scope="col" className="text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {usedData?.latest_document?.map((document, index) => (<tr key={index}>
                                            <td>{document.title}</td>
                                            <td>{document.name}</td>
                                            <td>{DisplayDateTime(document.created_at)}</td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/admin/documents/lib/${document.document_id}`}
                                                    className="btn btn-sm btn-primary me-2"
                                                >
                                                    <i className="mdi mdi-pencil"></i>
                                                </Link>
                                                <Link
                                                    href={`/admin/documents/details/${document.document_id}`}
                                                    className="btn btn-sm btn-warning"
                                                >
                                                    <i className="mdi mdi-eye"></i>
                                                </Link>
                                            </td>
                                        </tr>))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>)}
                    </Col>
                    <Col xl={6} md={6}>
                        {usedLoading ? (<>
                            <div className="skeleton rounded-3 h-100"/>
                        </>) : (<Card className="card-height-100">
                            <CardHeader className="align-items-center d-flex">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("latest_images")}
                                </h4>
                                <Link
                                    href={"/admin/images/new"}
                                    className="btn btn-sm btn-primary"
                                >
                                    <i className="mdi mdi-plus-circle me-1"></i>{" "}
                                    {t("new_image")}
                                </Link>
                            </CardHeader>
                            <div className="row">
                                {usedData?.latest_image?.map((image, index) => {
                                    const img = image?.url || image.image;
                                    const [width, height] = image?.image_size
                                        ?.split("x")
                                        .map((s) => parseInt(s, 10)) ?? [256, 256];
                                    return (<div key={index} className="col-xl-3 col-md-4 col-sm-6">
                                        <Card className="gallery-box">
                                            <div className="gallery-container">
                                                <Image
                                                    src={img}
                                                    alt={image.title || t("nextAi_Image")}
                                                    width={width || 256}
                                                    height={height || 256}
                                                    className="gallery-img img-fluid mx-auto"
                                                />
                                            </div>
                                            <div className="box-content">
                                                <div className="d-flex align-items-center mt-1">
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
                                    </div>);
                                })}
                            </div>
                        </Card>)}
                    </Col>
                    <Col xl={6} md={6}>
                        {usedLoading ? (<>
                            <div className="skeleton rounded-3 h-100"/>
                        </>) : (<Card className="card-height-100">
                            <CardHeader className="align-items-center d-flex">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("latest_transcripts")}
                                </h4>
                                <Link
                                    href={"/admin/transcripts/new"}
                                    className="btn btn-sm btn-primary"
                                >
                                    <i className="mdi mdi-plus-circle me-1"></i>{" "}
                                    {t("new_transcript")}
                                </Link>
                            </CardHeader>
                            <CardBody className="px-0">
                                <div className="table-responsive">
                                    <Table className="table table-hover mb-0">
                                        <thead>
                                        <tr>
                                            <th scope="col">{t("title")}</th>
                                            <th scope="col">{t("audio")}</th>
                                            <th scope="col">{t("created_at")}</th>
                                            <th scope="col" className="text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {usedData?.latest_speech?.map((speech, index) => (<tr key={index}>
                                            <td>{speech.title}</td>
                                            <td>
                                                {JSON.parse(speech?.file) ? (<audio controls>
                                                    <source
                                                        src={JSON.parse(speech?.file)[0].fileUrl}
                                                        type="audio/mpeg"
                                                    />
                                                </audio>) : (<span>Not found</span>)}
                                            </td>
                                            <td>{DisplayDateTime(speech.created_at)}</td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/admin/documents/speech/${speech.speech_to_text_id}`}
                                                    className="btn btn-sm btn-primary me-2"
                                                >
                                                    <i className="mdi mdi-pencil"></i>
                                                </Link>
                                            </td>
                                        </tr>))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>)}
                    </Col>
                    <Col xl={6} md={6}>
                        {usedLoading ? (<>
                            <div className="skeleton rounded-3 h-100"/>
                        </>) : (<Card className="card-height-100">
                            <CardHeader className="align-items-center d-flex">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("latest_text_to_speech")}
                                </h4>
                                <Link
                                    href={"/admin/text_to_speech/new"}
                                    className="btn btn-sm btn-primary"
                                >
                                    <i className="mdi mdi-plus-circle me-1"></i>{" "}
                                    {t("new_text_to_speech")}
                                </Link>
                            </CardHeader>
                            <CardBody className="px-0">
                                <div className="table-responsive">
                                    <Table className="table table-hover mb-0">
                                        <thead>
                                        <tr>
                                            <th scope="col">{t("title")}</th>
                                            <th scope="col">{t("audio")}</th>
                                            <th scope="col">{t("created_at")}</th>
                                            <th scope="col" className="text-end">
                                                {t("actions")}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {usedData?.latest_textToSpeech?.map((speech, index) => (<tr key={index}>
                                            <td>{speech.title}</td>
                                            <td>
                                                {JSON.parse(speech?.file) ? (<audio controls>
                                                    <source
                                                        src={JSON.parse(speech?.file).fileUrl}
                                                        type="audio/mpeg"
                                                    />
                                                </audio>) : (<span>Not found</span>)}
                                            </td>
                                            <td>{DisplayDateTime(speech.created_at)}</td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/admin/documents/toSpeech/${speech.text_to_speech_id}`}
                                                    className="btn btn-sm btn-primary me-2"
                                                >
                                                    <i className="mdi mdi-pencil"></i>
                                                </Link>
                                            </td>
                                        </tr>))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>)}
                    </Col>
                </Row>
            </div>
        </div>
    </React.Fragment>);
};
export default Dashboard;

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
