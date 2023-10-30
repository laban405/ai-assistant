import {
    Card,
    CardBody,
    CardHeader,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown,
    UncontrolledTooltip,
} from "reactstrap";
import React, {useContext, useState} from "react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});
import "moment-timezone";
import {useRouter} from "next/router";
import Link from "next/link";
import {
    API, DisplayDate, DisplayDateTime, DisplayMoney, GetDefaultCurrency, GetRows, TotalRows, TotalSum,
} from "../../../components/config";
import BreadCrumb from "../../../components/BreadCrumb";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Mousewheel} from "swiper";
import {Context} from "../../_app";

const api = new API();

const Dashboard = () => {
    const {t} = useTranslation();
    const thisMonth = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const lastMonth = `${new Date().getMonth()}-${new Date().getFullYear()}`;
    const [usedType, setUsedType] = useState("words");
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
            where: {
                "img.date >=": thisStartDate, "img.date <=": thisEndDate,
            },
        };
        lastWhere = {
            where: {
                "img.date >=": lastStartDate, "img.date <=": lastEndDate,
            },
        };
    } else if (usedType === "transcripts") {
        url = "/api/admin/speech_to_text";
        where = {
            where: {
                "stt.date >=": thisStartDate, "stt.date <=": thisEndDate,
            },
        };
        lastWhere = {
            where: {
                "stt.date >=": lastStartDate, "stt.date <=": lastEndDate,
            },
        };
    } else if (usedType === "text_to_speech") {
        url = "/api/admin/text_to_speech";
        where = {
            where: {
                "stt.date >=": thisStartDate, "stt.date <=": thisEndDate,
            },
        };
        lastWhere = {
            where: {
                "stt.date >=": lastStartDate, "stt.date <=": lastEndDate,
            },
        };
    } else {
        url = "/api/admin/documents";
        where = {
            where: {
                "doc.date >=": thisStartDate, "doc.date <=": thisEndDate,
            },
        };
        lastWhere = {
            where: {
                "doc.date >=": lastStartDate, "doc.date <=": lastEndDate,
            },
        };
    }
    const {data: monthData, isLoading: thisMonthLoading} = GetRows(url, {
        where: where,
    }, {
        last_month: {
            url: url, where: lastWhere,
        }, recent_company: {
            url: "/api/admin/companies", limit: 8,
        },
    }, 'allMonthData');

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
                        return (value + " " + t(usedType === "images" ? "Images" : usedType === "transcripts" ? "transcripts" : usedType === "text_to_speech" ? "text_to_speech" : "documents"));
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
    // Total Words Used,Total Images Used,total Speech to Text ,Total Text to Speech,
    // Total Companies,Total Active Companies,Total Inactive Companies,Total Payments,Total Pending Payments,Total Paid Payments
    const uWhere = {
        where: {
            month: thisMonth,
        },
    };
    const ulWhere = {
        where: {
            month: lastMonth,
        },
    };

    const usedPost = {
        total_words: {
            field: "used_words",
        }, total_words_month: {
            field: "used_words", ...uWhere,
        }, total_words_last_month: {
            field: "used_words", ...ulWhere,
        }, total_images: {
            field: "used_images",
        }, total_images_month: {
            field: "used_images", ...uWhere,
        }, total_images_last_month: {
            field: "used_images", ...ulWhere,
        }, total_speech_to_text: {
            field: "used_speech_to_text",
        }, total_speech_to_text_month: {
            field: "used_speech_to_text", ...uWhere,
        }, total_speech_to_text_last_month: {
            field: "used_speech_to_text", ...ulWhere,
        }, total_text_to_speech: {
            field: "used_text_to_speech",
        }, total_text_to_speech_month: {
            field: "used_text_to_speech", ...uWhere,
        }, total_text_to_speech_last_month: {
            field: "used_text_to_speech", ...ulWhere,
        },
    };
    const {data, refetch, isLoading} = TotalSum("/api/admin/used_contents", usedPost);
    const paymentPost = {
        total_payment: {
            field: "total_amount",
        }, total_payment_month: {
            field: "total_amount", where: {
                where: {
                    "payment_date >=": thisStartDate, "payment_date <=": thisEndDate,
                },
            },
        }, total_pending_payment: {
            field: "total_amount", where: {
                payment_status: "pending",
            },
        }, total_pending_payment_month: {
            field: "total_amount", where: {
                payment_status: "pending", where: {
                    "payment_date >=": thisStartDate, "payment_date <=": thisEndDate,
                },
            },
        }, total_paid_payment: {
            field: "total_amount", where: {
                payment_status: "paid",
            },
        }, total_paid_payment_month: {
            field: "total_amount", where: {
                payment_status: "paid", where: {
                    "payment_date >=": thisStartDate, "payment_date <=": thisEndDate,
                },
            },
        }, total_cancelled_payment: {
            field: "total_amount", where: {
                payment_status: "cancelled",
            },
        }, total_cancelled_payment_month: {
            field: "total_amount", where: {
                payment_status: "cancelled", where: {
                    "payment_date >=": thisStartDate, "payment_date <=": thisEndDate,
                },
            },
        }, total_failed_payment: {
            field: "total_amount", where: {
                payment_status: "failed",
            },
        }, total_failed_payment_month: {
            field: "total_amount", where: {
                payment_status: "failed", where: {
                    "payment_date >=": thisStartDate, "payment_date <=": thisEndDate,
                },
            },
        },
    };
    const {
        data: paymentData, refetch: paymentRefetch, isLoading: paymentLoading,
    } = TotalSum("/api/admin/companiesPayments", paymentPost);

    const companyPost = {
        total_companies: {}, total_active_companies: {
            status: "running",
        }, total_active_companies_month: {
            status: "running", where: {
                "created_date >=": thisStartDate, "created_date <=": thisEndDate,
            },
        }, total_inactive_companies: {
            status: "pending",
        },
    };
    const {
        data: companyData, refetch: companyRefetch, isLoading: companyLoading,
    } = TotalRows("/api/admin/companies", companyPost);

    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

    const cryptoSlider = [{
        id: 1,
        label: t("total_words_used"),
        icon: "ri-stack-line",
        counter: data?.total_words || 0,
        badge: "ri-arrow-up-s-fill",
        badgeColor: "success",
    }, {
        id: 2,
        label: t("words_used_this_month"),
        icon: "ri-stack-line",
        counter: data?.total_words_month || 0,
        badge: "ri-arrow-up-s-fill",
        badgeColor: "success",
    }, {
        id: 3,
        label: t("total_images_used"),
        icon: "ri-image-line",
        badgeColor: "info",
        counter: data?.total_images || 0,
    }, {
        id: 4,
        label: t("images_used_this_month"),
        icon: "ri-image-line",
        badgeColor: "info",
        counter: data?.total_images_month || 0,
    }, {
        id: 5,
        label: t("total_speech_to_text"),
        icon: "ri-music-2-line",
        badgeColor: "warning",
        counter: data?.total_speech_to_text || 0,
    }, {
        id: 6,
        label: t("speech_to_text_this_month"),
        icon: "ri-music-2-line",
        badgeColor: "warning",
        counter: data?.total_speech_to_text_month || 0,
    }, {
        id: 7,
        label: t("total_text_to_speech"),
        icon: "ri-music-2-line",
        badgeColor: "warning",
        counter: data?.total_text_to_speech || 0,
    }, {
        id: 8,
        label: t("text_to_speech_this_month"),
        icon: "ri-music-2-line",
        badgeColor: "warning",
        counter: data?.total_text_to_speech_month || 0,
    }, {
        id: 9,
        label: t("total_companies"),
        icon: "bx bx-building-house",
        badgeColor: "warning",
        counter: companyData?.total_companies || 0,
    }, {
        id: 10,
        label: t("total_active_companies"),
        icon: "bx bx-building-house",
        badgeColor: "warning",
        counter: companyData?.total_active_companies || 0,
    }, {
        id: 11,
        label: t("total_inactive_companies"),
        icon: "bx bx-building-house",
        badgeColor: "warning",
        counter: companyData?.total_inactive_companies || 0,
    }, {
        id: 12,
        label: t("total_payments"),
        icon: "ri-currency-line",
        badgeColor: "warning",
        counter: DisplayMoney(paymentData?.total_payment || 0, currencyInfo),
    }, {
        id: 13,
        label: t("total_paid_payments"),
        icon: "ri-currency-line",
        badgeColor: "warning",
        counter: DisplayMoney(paymentData?.total_paid_payment || 0, currencyInfo),
    }, {
        id: 14,
        label: t("total_pending_payments"),
        icon: "ri-currency-line",
        badgeColor: "warning",
        counter: DisplayMoney(paymentData?.total_pending_payment || 0, currencyInfo),
    }, {
        id: 15,
        label: t("cancelled_payments"),
        icon: "ri-currency-line",
        badgeColor: "warning",
        counter: DisplayMoney(paymentData?.total_cancelled_payment || 0, currencyInfo),
    }, {
        id: 16,
        label: t("total_failed_payments"),
        icon: "ri-currency-line",
        badgeColor: "warning",
        counter: DisplayMoney(paymentData?.total_failed_payment || 0, currencyInfo),
    },];
    const cryptoWidgets = [{
        id: 1,
        label: t("active_company_this_month"),
        icon: "ri-currency-line",
        counter: companyData?.total_active_companies_month || 0,
        badge: "ri-arrow-up-s-fill",
        badgeColor: "success",
    }, {
        id: 2,
        label: t("paid_this_month"),
        icon: "ri-currency-line",
        counter: DisplayMoney(paymentData?.total_paid_payment_month || 0, currencyInfo),
        badge: "ri-arrow-up-s-fill",
        badgeColor: "success",
    }, {
        id: 3,
        label: t("pending_this_month"),
        icon: "ri-currency-line",
        counter: DisplayMoney(paymentData?.total_pending_payment_month || 0, currencyInfo),
        badge: "ri-arrow-up-s-fill",
        badgeColor: "success",
    },];
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb title={t("dashboard")} pageTitle={t("dashboard")}/>
                <Row>
                    <Col lg={12}>
                        <Swiper
                            slidesPerView={5}
                            breakpoints={{
                                320: {
                                    slidesPerView: 1,
                                }, 480: {
                                    slidesPerView: 2,
                                }, 640: {
                                    slidesPerView: 2,
                                }, 991: {
                                    slidesPerView: 3,
                                }, 1200: {
                                    slidesPerView: 4,
                                }, 1500: {
                                    slidesPerView: 5,
                                },
                            }}
                            spaceBetween={24}
                            mousewheel={true}
                            autoplay={{
                                delay: 2000, disableOnInteraction: false,
                            }}
                            modules={[Autoplay, Mousewheel]}
                            className="cryptoSlider"
                        >
                            {(cryptoSlider || []).map((item, key) => (<SwiperSlide key={key}>
                                <UncontrolledTooltip target={"crypto-" + item.id} placement="top">
                                    {item.label}
                                </UncontrolledTooltip>
                                <Card
                                    id={"crypto-" + item.id}
                                >
                                    <CardBody>
                                        <div className="d-flex align-items-center text-truncate">
                                            <div className="avatar-sm flex-shrink-0">
                                                        <span
                                                            className="avatar-title bg-light text-primary rounded-circle fs-3">
                                                            <i className={"align-middle " + item.icon}></i>
                                                        </span>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <p className="text-uppercase fw-semibold fs-12 text-muted mb-1 text-truncate">
                                                    {item.label}
                                                </p>
                                                <h4 className=" mb-0">{item.counter}</h4>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </SwiperSlide>))}
                        </Swiper>
                    </Col>
                </Row>
                <Row>
                    <div className="col-xxl-3 col-lg-4 col-md-12">
                        <div className="card card-height-100">
                            <div className="card-header border-0 align-items-center d-flex mb-0 pb-0">
                                <h4 className="card-title mb-0 flex-grow-1">
                                    {t("recent_companies")}
                                </h4>
                            </div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush border-dashed mb-0">
                                    {(monthData?.recent_company || []).map((item, key) => (
                                        <li className="list-group-item px-0" key={key}>
                                            <Link href={"/saas/companies/details/" + item.company_id} key={key}>
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0 avatar-xs">
                                                            <span className="avatar-title  p-1 rounded-circle">
                                                                <i
                                                                    className={"align-middle ri-building-4-line"}
                                                                ></i>
                                                            </span>
                                                    </div>
                                                    <div className="flex-grow-1 ms-2 text-truncate">
                                                        <h6 className="mb-1 ">{item.company_name}</h6>
                                                        <p className="fs-12 mb-0 text-muted">
                                                            <i className="mdi mdi-circle fs-10 align-middle text-primary me-1"></i>
                                                            {item.company_email}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-end">
                                                        <h6 className="mb-1">
                                                            {item.status === "running" ? (
                                                                <span className="badge bg-success">
                                                                        Running
                                                                    </span>) : (<span className="badge bg-danger">
                                                                        Pending{" "}
                                                                    </span>)}
                                                        </h6>
                                                        <p className="text-success fs-12 mb-0">
                                                            {DisplayDate(item.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <Col className="col-xxl-9 col-lg-8 mt-4 mt-lg-0 col-md-12">
                        <Row>
                            {(cryptoWidgets || []).map((item, key) => (<Col lg={4} md={6} key={key}>
                                <Card className="card-animate">
                                    <CardBody>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-sm flex-shrink-0">
                                                        <span
                                                            className="avatar-title bg-light text-primary rounded-circle fs-3">
                                                            <i className={"align-middle " + item.icon}></i>
                                                        </span>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <p className="text-uppercase fw-semibold fs-12 text-muted mb-1">
                                                    {item.label}
                                                </p>
                                                <h4 className=" mb-0">{item.counter}</h4>
                                            </div>
                                            <div className="flex-shrink-0 align-self-end">
                                                        <span
                                                            className={"badge badge-soft-" + item.badgeColor}
                                                        >
                                                            <i
                                                                className={"align-middle me-1 " + item.badge}
                                                            ></i>
                                                            {item.percentage} %<span></span>
                                                        </span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>))}
                        </Row>
                        <Row>
                            <Col xl={12}>
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
                                                            {t('sort_by')}:{" "}
                                                        </span>
                                                    <span className="text-muted">
                                                            {t(usedType)}
                                                        <i className="mdi mdi-chevron-down ms-1"></i>
                                                        </span>
                                                </DropdownToggle>
                                                <DropdownMenu className="dropdown-menu-end">
                                                    {["words", "images", "transcripts", "text_to_speech",].map((item, key) => (
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
                                                    {usedType === "words" ? data?.total_words_month || 0 : usedType === "images" ? data?.total_images_month || 0 : usedType === "transcripts" ? data?.total_speech_to_text_month || 0 : data?.total_text_to_speech_month || 0}
                                                    <span
                                                        className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                            {usedType === "words" ? t("words") : usedType === "images" ? t("Images") : usedType === "transcripts" ? t("Transcripts") : t("text_to_speech")}
                                                        </span>
                                                    <span
                                                        className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                            {t("in_this_month")}
                                                        </span>
                                                </h4>
                                            </li>
                                            <li className="list-inline-item chart-border-left me-0">
                                                <h4>
                                                    {usedType === "words" ? data?.total_words_last_month || 0 : usedType === "images" ? data?.total_images_last_month || 0 : usedType === "transcripts" ? data?.total_speech_to_text_last_month || 0 : data?.total_text_to_speech_last_month || 0}
                                                    <span
                                                        className="text-muted d-inline-block fs-13 align-middle ms-2">
                                                            {usedType === "words" ? t("Words") : usedType === "images" ? t("Images") : usedType === "transcripts" ? t("Transcripts") : t("text_to_speech")}
                                                        </span>
                                                    <span
                                                        className="text-muted d-inline-block fs-13 align-middle ms-2">
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
