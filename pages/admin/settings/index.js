import React, {useContext, useEffect, useRef, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container, Input, Row, UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {Tabs} from "../../../components/Tabs";
import {
    API,
    Info,
    MyDetails,
    companyID,
    isAdmin,
    isCompany,
    DisplayDate,
    DisplayMoney,
    DownloadFile,
    AllCountry,
    MyID,
    GetDefaultCurrency,
} from "../../../components/config";
import Fb, {MyModal, notify} from "../../../components/Fb";
import Helper from "../../../lib/Helper";
import Link from "next/link";
import {useRouter} from "next/router";
import MyTable from "../../../components/MyTable";
import PackageList from "../../../components/PackageList";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});
import {Context} from "../../_app";
import dynamic from "next/dynamic";

let url = "/api/admin/settings";
const api = new API();

export default function Settings() {
    const {config, companyPackage, session} = useContext(Context);
    const {t} = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");
    const myDetails = MyDetails();
    const [edit, setEdit] = useState(false);
    const {
        data: userInfo, isLoading, refetch,
    } = Info("/api/admin/users", {user_id: myDetails?.user_id}, {
        allUsedContent: {
            url: "/api/admin/used_contents", where: {
                "usdContent.company_id": myDetails?.company_id,
            },
        },
    });
    const profileMeta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "first_name", label: t("first_name"), type: "text", required: true, value: userInfo?.first_name,
        }, {
            name: "last_name", label: t("last_name"), type: "text", value: userInfo?.last_name,
        },

            {
                name: "mobile", type: "text", label: t("phone"), value: userInfo?.mobile,
            },

            {
                name: "language", label: t("language"), type: "select", value: userInfo?.language, getOptions: {
                    url: "/api/admin/languages", where: {
                        active: 1,
                    },
                },
            }, {
                label: t("country"),
                name: "country",
                type: "select",
                value: Number(userInfo?.country),
                function: AllCountry,
            }, {
                type: "file", label: t("profile_photo"), // required: true,
                name: "avatar", // dropzone: true
                value: userInfo?.avatar,
            }, {
                type: "submit", label: t("update_profile"), // setModal: setModal,
            },],
    };

    const GeneralSettings = () => {
        return (<Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">{t("general_settings")}</h5>
            </CardHeader>
            <CardBody>
                <Fb
                    meta={profileMeta}
                    form={true}
                    id={userInfo?.user_id}
                    refetch={refetch}
                    url={"/api/admin/users"}
                />
            </CardBody>
        </Card>);
    };
    const BillingSettings = () => {
        const [packageModal, setPackageModal] = useState({});
        const [modal, setModal] = useState({});
        const [modalData, setModalData] = useState({});
        const url = "/api/admin/companiesPayments";
        const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

        const meta = {
            columns: 1, flexible: true, formItemLayout: [4, 7], fields: [{
                name: "payment_date",
                label: t("deposit_date"),
                type: "date",
                required: true,
                value: modal?.payment_date,
            }, {
                name: "transaction_id",
                label: t("transaction_id"),
                type: "text",
                required: true,
                value: modal?.transaction_id,
            }, {
                name: "notes", label: t("notes"), type: "textarea", required: true, value: modal?.notes,
            }, {
                name: "deposit_slip",
                label: t("deposit_slip"),
                type: "file",
                required: true,
                value: modal?.deposit_slip,
            }, {
                type: "submit", label: t("submit"),
            },],
        };

        const columns = [{
            label: t("package_name"), cell: (row) => {
                return (<>
                    <Button
                        color="link"
                        className="p-0"
                        onClick={() => setPackageModal(row)}
                    >
                        {row.package_name}
                    </Button>
                </>);
            },
        }, {
            label: t("payment_date"), accessor: "payment_date", date: true,
        }, {
            label: t("payment_method"), accessor: "payment_method", lang: true,
        }, {
            label: t("amount"), accessor: "amount", money: true,
        }, {
            label: t("status"), cell: (row) => {
                return (<span
                    className={`badge p-2 bg-${row.payment_status === "pending" ? "warning" : "success"}`}
                >
                            {t(row.payment_status)}
                        </span>);
            },
        }, {
            label: t("action"), className: "text-center", linkId: "document_id", btn: true, cell: (row, refetch) => {
                return (<div className="d-flex justify-content-center">
                    <Button
                        className="btn btn-sm btn-warning text-decoration-none me-2"
                        onClick={() => setModalData(row)}
                    >
                        <i className="ri-eye-line"/>
                    </Button>
                    {row.payment_status === "pending" && (<>
                        <Button
                            className="btn-rounded waves-effect waves-light me-2 btn btn-success btn-sm"
                            onClick={() => {
                                row.refresh = refetch;
                                setModal(row);
                            }}
                        >
                            <i className="mdi mdi-pencil-outline"/>
                        </Button>
                        <Button
                            color={"danger"}
                            className="btn btn-sm btn-danger text-decoration-none"
                            onClick={() => {
                                const confirm = window.confirm(t("are_you_sure?"));
                                if (confirm) {
                                    api
                                        .delete(`${url}`, row?.company_payment_id)
                                        .then((res) => {
                                            notify("success", t("deleted_successfully"));
                                            refetch();
                                        })
                                        .catch((err) => {
                                            notify("warning", err);
                                        });
                                }
                            }}
                        >
                            <i className="ri-delete-bin-line"/>
                        </Button>
                    </>)}
                </div>);
            },
        },];

        const PaymentDetails = ({data}) => {
            const downloadReceiptPdf = () => {
                // download the html page as pdf using jsPDF and html2canvas
                const element = document.getElementById("payment-details");
                // remove button from the pdf to avoid printing it
                element.querySelector(".heading").remove();

                html2canvas(document.querySelector("#payment-details")).then((canvas) => {
                    // add h2 to the top of the pdf
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF();
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                    pdf.save("Payment-Receipt.pdf");
                    // hide modal
                    setModalData({});
                });
            };

            return (<div className="row">
                <Card id={"payment-details"}>
                    <CardHeader className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">{t("payment_details")}</h5>
                        <div className="d-flex align-items-center heading">
                            <Button
                                color={"danger"}
                                className="btn btn-sm btn-danger text-decoration-none"
                                onClick={downloadReceiptPdf}
                            >
                                <i className="ri-download-2-line"/> {t("download_receipt")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive table-card">
                            <table id={"payment-details-table"} className="table mb-0">
                                <tbody>
                                <tr>
                                    <td className="fw-medium">{t("package_name")}</td>
                                    <td>{data?.package_name}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("payment_date")}</td>
                                    <td>{DisplayDate(data?.payment_date)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("payment_method")}</td>
                                    <td>{data?.payment_method}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("amount")}</td>
                                    <td>{DisplayMoney(data?.amount, currencyInfo)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-medium">{t("status")}</td>
                                    <td>
                                        {data?.payment_status === "pending" ? (<span className="badge p-2 bg-warning">
                                                        {t(data?.payment_status)}
                                                    </span>) : (<span className="badge p-2 bg-success">
                                                        {t(data?.payment_status)}
                                                    </span>)}
                                    </td>
                                </tr>
                                {data?.deposit_slip && (<tr>
                                    <td className="fw-medium">{t("deposit_slip")}</td>
                                    <td>
                                        <Button
                                            color={"link"}
                                            className="btn btn-sm btn-danger text-decoration-none me-2"
                                            onClick={async () => {
                                                const files = JSON.parse(data?.deposit_slip);
                                                await DownloadFile(files[0]);
                                            }}
                                        >
                                            <i className="ri-download-2-line me-1"/>{" "}
                                            {t("download")}
                                        </Button>
                                    </td>
                                </tr>)}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </div>);
        };

        const EditPayment = async (values) => {
            if (values.deposit_slip && values.deposit_slip.length > 0) {
                const formData = new FormData();
                let files = values.deposit_slip;
                const oldFiles = [];
                const isJson = typeof files === "string" && files.startsWith("[");
                if (isJson) {
                    files = JSON.parse(files);
                }
                if (Array.isArray(files)) {
                    files.forEach((file) => {
                        if (!file.newFilename) {
                            formData.append("file", file);
                        } else {
                            oldFiles.push(file);
                        }
                    });
                }
                if (formData.has("file")) {
                    const result = await api.uploadFiles(formData);
                    if (result.fileData) {
                        result.fileData.forEach((file) => {
                            oldFiles.push(file);
                        });
                        values.deposit_slip = JSON.stringify(oldFiles);
                    }
                } else {
                    values.deposit_slip = JSON.stringify(oldFiles);
                }
            }
            await api
                .create(`${url}`, values, modal?.company_payment_id)
                .then((res) => {
                    notify("success", t("successfully_updated"));
                    modal.refresh();
                    setModal({});
                })
                .catch((err) => {
                    notify("warning", t("an_error_occurred"));
                    console.log(err);
                });
        };
        return (<div>
            <Card>
                <CardHeader className="d-flex align-items-center justify-content-between">
                    <h4 className="card-title mb-0 flex-grow-1">
                        <div className="">
                            <span className="me-1">{t("billing")}</span>
                            <span className="text-muted">
                                    {t("your_current_plan_is")}

                                <span className="text-warning ms-2">
                                        {companyPackage?.package_name}
                                    </span>
                                </span>
                        </div>
                        <div className="card-text fs-11 mt-2 badge bg-soft-danger text-danger mb-0 me-1">
                            {t("you_have")}
                            <span className="text-success ms-2">
                                    {companyPackage?.words_per_month === -1 ? t("unlimited") : companyPackage?.words_per_month ? companyPackage?.words_per_month - (companyPackage?.usedContent[0]?.used_words || 0) : 0}{" "}
                                {t("words")}{" "}
                                </span>
                            {t("and")}
                            <span className="text-success ms-2">
                                    {companyPackage?.images_per_month === -1 ? t("unlimited") : companyPackage?.images_per_month ? companyPackage?.images_per_month - (companyPackage?.usedContent[0]?.used_images || 0) : 0}{" "}
                                {t("images")}{" "}
                                </span>
                            {t("left") + "."}
                        </div>
                    </h4>

                    <div className="flex-shrink-1">
                        <Link className="btn btn-danger " href="/admin/upgrades">
                            {t("upgrade")}
                        </Link>
                    </div>
                </CardHeader>

                <CardBody>
                    <MyTable
                        columns={columns}
                        where={{"cmpnyPayment.company_id": myDetails?.company_id}}
                        url={url}
                    />
                </CardBody>

                {modalData && modalData?.package_name && (<MyModal
                    modal={modalData}
                    size={"md"}
                    handleClose={() => {
                        setModalData({});
                    }}
                    children={<PaymentDetails
                        data={modalData}
                        refetch={refetch}
                        handleClose={() => {
                            setModalData({});
                        }}
                    />}
                />)}

                {packageModal?.package_name && (<MyModal
                    modal={packageModal}
                    handleClose={() => {
                        setPackageModal({});
                    }}
                    children={<PackageList
                        data={packageModal}
                        modal={packageModal}
                        details={true}
                    />}
                />)}

                {modal.package_name && (<MyModal
                    modal={modal}
                    handleClose={() => {
                        setModal({});
                    }}
                    children={<Fb
                        meta={meta}
                        form={true}
                        onSubmit={async (values) => {
                            await EditPayment(values);
                            await refetch();
                        }}
                    />}
                />)}
            </Card>
        </div>);
    };
    const AffiliateProgram = () => {
        return (<React.Fragment>
            <Card>
                <CardHeader>
                    <h4 className="card-title mb-0 flex-grow-1">
                        {t("affiliate_program")}
                        <span className="text-success fs-14 ms-2">
                                {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE}{" "}
                            {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE === "percentage" ? "%" : t("credits")}
                            </span>
                    </h4>
                </CardHeader>
                <CardBody>
                    {userInfo?.isAffiliate === 1 ? (<>
                        <p className="card-text fs-15">{t("you_are_an_affiliate")}</p>

                        <div className="card-text fs-15">
                            {t("your_affiliate_link_is")}
                            <div className="input-group">
                                {edit ? (<>
                                    <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        {config?.NEXT_PUBLIC_BASE_URL + "/?ref="}
                                                    </span>
                                    </div>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        id={"referral_link"}
                                        defaultValue={userInfo?.referral_link}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                        onClick={async () => {
                                            const affiliateLink = document.getElementById("referral_link").value;
                                            const input = {
                                                referral_link: affiliateLink,
                                            };
                                            const res = await api.create("/api/admin/users", input, myDetails?.user_id);
                                            if (res.affectedRows > 0) {
                                                notify("success", "updated");
                                                await refetch();
                                                setEdit(false);
                                            }
                                        }}
                                    >
                                        {t("update")}
                                    </button>
                                    <button
                                        className="btn btn-info"
                                        type="button"
                                        onClick={() => setEdit(false)}
                                    >
                                        {t("cancel")}
                                    </button>
                                </>) : (<>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={config?.NEXT_PUBLIC_BASE_URL + "/?ref=" + userInfo?.referral_link}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(config?.NEXT_PUBLIC_BASE_URL + "/?ref=" + userInfo?.referral_link);
                                            notify("success", t("copied"));
                                        }}
                                    >
                                        {t("Copy")}
                                    </button>
                                    <button
                                        className="btn btn-info"
                                        type="button"
                                        onClick={() => setEdit(true)}
                                    >
                                        {t("edit")}
                                    </button>
                                </>)}
                            </div>
                        </div>
                        <p className="card-text fs-15">
                            {t("you_can_share_this_link_with_your_friends_and_earn_commission")}
                        </p>
                        <p className="card-text fs-15">
                            We are happy to announce our affiliate program. You can earn{" "}
                            <span className="text-success fs-14">
                                        {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE}{" "}
                                {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE === "percentage" ? "%" : t("credits")}{" "}
                                    </span>{" "}
                            {t("for")}
                            {config?.NEXT_PUBLIC_AFFILIATE_RULE === "only_first_subscription" ? " " + t("first_subscription") : " " + t("each_subscriptions")}{" "}
                            {t("of_your_referrals")}
                            <br/>
                            <br/>
                        </p>
                        <p className="card-text fs-15">
                            {t("if_you_do_not_want_to_be_an_affiliate_anymore_click_on_the_button_below")}
                        </p>
                        <Button
                            color="primary"
                            onClick={async () => {
                                if (confirm(t("are_you_sure_you_want_to_stop_affiliate"))) {
                                    const input = {
                                        isAffiliate: 0,
                                    };
                                    const res = await api.create("/api/admin/users", input, myDetails?.user_id);
                                    if (res.affectedRows > 0) {
                                        notify("success", t("you_are_no_longer_an_affiliate"));
                                        await refetch();
                                        // reload page
                                        router.reload();
                                    }
                                }
                            }}
                        >
                            Stop Affiliate
                        </Button>
                    </>) : (<>
                        <p className="card-text fs-15">
                            We are happy to announce our affiliate program. You can earn{" "}
                            <span className="text-success fs-14">
                                        {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_VALUE}{" "}
                                {config?.NEXT_PUBLIC_AFFILIATE_COMMISSION_TYPE === "percentage" ? "%" : t("credits")}{" "}
                                    </span>{" "}
                            {t("for")}
                            {config?.NEXT_PUBLIC_AFFILIATE_RULE === "only_first_subscription" ? " " + t("first_subscription") : " " + t("each_subscriptions")}{" "}
                            {t("of_your_referrals")}
                            <br/>
                            <br/>
                            {t("if_you_want_to_know_more_about_our_affiliate_program_click_on_the_button_below")}
                        </p>
                        <Button
                            color="primary"
                            onClick={async () => {
                                if (confirm(t("are_you_sure_you_want_to_become_an_affiliate"))) {
                                    const input = {
                                        isAffiliate: 1,
                                        referral_link: Helper.slugify(userInfo?.first_name + " " + userInfo?.last_name + " " + myDetails?.user_id),
                                    };
                                    const res = await api.create("/api/admin/users", input, myDetails?.user_id);
                                    if (res.affectedRows > 0) {
                                        notify("success", t("you_are_now_an_affiliate"));
                                        // reload page after 1 second
                                        await refetch();
                                        setTimeout(() => {
                                            router.reload();
                                        }, 1000);
                                    }
                                }
                            }}
                        >
                            {t("become_an_affiliate")}
                        </Button>
                    </>)}
                </CardBody>
            </Card>
        </React.Fragment>);
    };
    const UsageSettings = () => {
        let allWord = 0;
        let allImage = 0;
        let allSpeechToText = 0;
        let allTextToSpeech = 0;
        const allUsedContent = userInfo?.allUsedContent;
        allUsedContent?.map((used, key) => {
            allWord += used.used_words;
            allImage += used.used_images;
            allSpeechToText += used.used_speech_to_text;
            allTextToSpeech += used.used_text_to_speech;
        });

        const wordLeft = companyPackage?.words_per_month ? companyPackage?.words_per_month - (companyPackage?.usedContent[0]?.used_words || 0) : 0;
        const imageLeft = companyPackage?.images_per_month ? companyPackage?.images_per_month - (companyPackage?.usedContent[0]?.used_images || 0) : 0;

        const leftWidgets = [{
            id: 1, lable: t("words_left"), jobs: wordLeft, series: [// percentage of words used and left
                Math.round((companyPackage?.usedContent[0]?.used_words || 0) / (companyPackage?.words_per_month || 1) * 100)], // color based on percentage of words used and left below 50% red, above 50% yellow, above 75% green and above 90% blue
            color: wordLeft < (companyPackage?.words_per_month || 1) * 0.5 ? "#ff0000" : wordLeft < (companyPackage?.words_per_month || 1) * 0.75 ? "#ff8c00" : wordLeft < (companyPackage?.words_per_month || 1) * 0.9 ? "#09b39b" : "#0000ff",
        }, {
            id: 2,
            lable: t("images_left"),
            jobs: imageLeft,
            series: [Math.round((companyPackage?.usedContent[0]?.used_images || 0) / (companyPackage?.images_per_month || 1) * 100)],
            color: imageLeft < (companyPackage?.images_per_month || 1) * 0.5 ? "#ff0000" : imageLeft < (companyPackage?.images_per_month || 1) * 0.75 ? "#ff8c00" : imageLeft < (companyPackage?.images_per_month || 1) * 0.9 ? "#09b39b" : "#0000ff",
        }];

        const LeftCharts = ({seriesData, colors}) => {
            const series = [seriesData];
            const options = {
                chart: {
                    type: "radialBar", width: 105, sparkline: {
                        enabled: true,
                    },
                }, dataLabels: {
                    enabled: false,
                }, plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0, size: "70%",
                        }, track: {
                            margin: 1,
                        }, dataLabels: {
                            show: true, name: {
                                show: false,
                            }, value: {
                                show: true, fontSize: "16px", fontWeight: 600, offsetY: 8,
                            },
                        },
                    },
                }, colors: [colors],
            };
            return (<React.Fragment>
                <ReactApexChart dir="ltr"
                                options={options}
                                series={[...series]}
                                type="radialBar"
                                id="total_jobs"
                                width="105"
                                className="apex-charts"
                />
            </React.Fragment>);
        };


        const useWidgets = [{
            id: 1, lable: t("words_generated"), jobs: allWord, icon: "bx bx-file", color: "#0ab39c"
        }, {id: 2, lable: t("images_generated"), jobs: allImage, icon: "bx bx-image", color: "#ff8c00"}, {
            id: 3,
            lable: t("speech_to_text_generated"),
            jobs: allSpeechToText,
            icon: "bx bx-microphone",
            color: "#ff0000"
        }, {
            id: 4,
            lable: t("text_to_speech_generated"),
            jobs: allTextToSpeech,
            icon: "bx bx-microphone",
            color: "#0000ff"
        },];


        return (<React.Fragment>
            <div>
                <CardBody>
                    <div className="mb-4">
                        <h4 className="mb-4">{t("available_words")}</h4>
                        <Row className="">
                            {leftWidgets.map((widget, key) => (<Col xl={6} md={6} key={key}>
                                <Card className="card-animate overflow-hidden">
                                    <div
                                        className="position-absolute start-0"
                                        style={{zIndex: "0"}}
                                    >
                                        <svg
                                            version="1.2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 200 120"
                                            width="200"
                                            height="120"
                                        >
                                            <path
                                                id="Shape 8"
                                                style={{opacity: ".05", fill: "#0ab39c"}}
                                                d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z"
                                            />
                                        </svg>
                                    </div>
                                    <CardBody style={{zIndex: "1"}}>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                                                    {" "}
                                                    {widget.lable}
                                                </p>
                                                <h4 className="f-32 fw-bold ff-secondary mb-0">
                          <span className="counter-value" data-target="100">
                            {widget.jobs}
                          </span>
                                                </h4>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <LeftCharts
                                                    seriesData={widget.series}
                                                    colors={widget.color}
                                                />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>))}
                        </Row>
                    </div>
                    <div className="">
                        <h4 className="mb-4">{t("Total Usage")}</h4>
                        <Row className="">
                            {useWidgets.map((widget, key) => (<Col xl={3} md={6} key={key}>
                                <Card className="card-animate overflow-hidden">
                                    <div className={"card-body"}>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                                                    {" "}
                                                    {widget.lable}
                                                </p>
                                                <h4 className="f-32 fw-bold ff-secondary mb-0">
                                                    {widget.jobs}
                                                </h4>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <div className="flex-shrink-0 avatar-sm">
                                                    <div
                                                        className="avatar-title bg-soft-success text-success fs-24 rounded">
                                                        <i className={widget.icon}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>))}
                        </Row>
                    </div>
                </CardBody>
            </div>
        </React.Fragment>);
    };
    const TeamSettings = () => {
        const myId = MyID();
        const [editData, setEditData] = useState({});
        const [password, setPassword] = useState("");
        const [confirmPass, setConfirmPass] = useState("");
        const router = useRouter();
        let url = "/api/admin/users";
        const [modal, setModal] = useState(false);

        const columns = [{
            linkId: "user_id", accessor: "user_id", checkbox: true,
        }, {
            label: t("name"), accessor: "fullname", sortable: true, linkId: "user_id",
        }, {
            label: t("image"), accessor: "avatar", image: true, download: false, linkId: "user_id",
        }, {
            label: t("email"), accessor: "email", sortable: true,
        },];

        if (isAdmin() || isCompany()) {
            columns.push({
                label: t("action"), linkId: "user_id", btn: true, flex: "d-inline-flex", cell: (row, refetch) => {
                    return (<>
                        <Button
                            id={"edit" + row?.user_id}
                            color="success"
                            size="sm"
                            className="btn-rounded waves-effect waves-light me-2"
                            onClick={() => {
                                row.refetch = refetch;
                                setEditData(row);
                                setModal(!modal);
                            }}
                        >
                            <i className="mdi mdi-pencil-outline"/>
                        </Button>
                        <UncontrolledTooltip
                            placement="top"
                            target={"edit" + row?.user_id}
                        >
                            {t("edit")}
                        </UncontrolledTooltip>

                        {myId !== row.user_id && (<>
                            <Button
                                id={`delete-${row.user_id}`}
                                color={"danger"}
                                className="btn btn-sm btn-danger text-decoration-none"
                                onClick={() => {
                                    const confirm = window.confirm(t("are_you_sure?"));
                                    if (confirm) {
                                        api
                                            .delete(`${url}`, row?.user_id)
                                            .then((res) => {
                                                notify("success", t("deleted_successfully"));
                                                refetch();
                                            })
                                            .catch((err) => {
                                                notify("warning", err);
                                            });
                                    }
                                }}
                            >
                                <i className="ri-delete-bin-line"/>
                            </Button>
                            <UncontrolledTooltip target={`delete-${row.user_id}`}>
                                {t("delete")}
                            </UncontrolledTooltip>
                        </>)}
                    </>);
                },
            });
        }

        const actions = [{
            name: "btn",
            label: t("new_user"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            onClick: () => {
                setEditData({});
            },
            setModal: setModal,
        },];

        const meta = {
            columns: 1, flexible: true, formItemLayout: [3, 8], fields: [{
                name: "first_name",
                label: t("first_name"),
                value: editData?.first_name,
                type: "text",
                required: true,
                placeholder: t("First name"),
            }, {
                name: "last_name",
                label: t("last_name"),
                value: editData?.last_name,
                type: "text",
                placeholder: t("Last name"),
            }, {
                name: "username",
                label: t("username"),
                value: editData?.username,
                type: "text",
                required: true,
                placeholder: t("Username"),
            }, {
                name: "email",
                label: t("email"),
                value: editData?.email,
                type: "email",
                required: true,
                placeholder: t("Email"), // unique: true
            }, {
                name: "avatar", label: t("profile_photo"), type: "file", // required: true,
                value: editData?.avatar,
            }, {
                type: "submit", label: t("submit"),
            },],
        };

        if (!editData?.user_id) {
            meta.fields.splice(3, 0, {
                name: "password", label: t("password"),

                type: "password", required: true, placeholder: t("password"), onChange: (e) => {
                    setPassword(e.target.value);
                },
            }, {
                name: "password_confirmation",
                label: t("password_confirmation"),
                type: "password",
                required: true,
                placeholder: t("password_confirmation"),
                onChange: (e) => {
                    setConfirmPass(e.target.value);
                },
                help: password !== confirmPass && t("confirm_password_doesn_t_match"),
            });
        }

        let deletedFiles = [];
        let allFiles = {};

        const saveUser = async (values) => {
            if (values.password !== values.password_confirmation) {
                notify("warning", t("confirm_password_doesn_t_match"));
                return true;
            }

            if (values.username) {
                const userNameExits = await api.post("/api/admin/users", {
                    id: {username: values.username}, getInfo: true,
                });
                if (userNameExits.username) {
                    if (editData?.user_id !== userNameExits?.user_id) {
                        notify("warning", t("username_already_exist"));
                        return true;
                    }
                }
            }

            if (values.email) {
                const userEmailExits = await api.post("/api/admin/users", {
                    id: {email: values.email}, getInfo: true,
                });

                if (userEmailExits.email) {
                    if (editData?.user_id !== userEmailExits?.user_id) {
                        notify("warning", t("Email_already_exist"));
                        return true;
                    }
                }
            }

            allFiles["avatar"] = true;
            if (deletedFiles.length > 0) {
                for (const file of deletedFiles) {
                    await api.deleteFiles(file);
                }
                deletedFiles = [];
            }
            for (const key of Object.keys(allFiles)) {
                if (!values[key]) {
                } else if (values[key].length > 0) {
                    let files = values[key];
                    const oldFiles = [];
                    // remove value from values object
                    if (files.length > 0) {
                        const formData = new FormData();
                        // check its json or array
                        const isJson = typeof files === "string" && files.startsWith("[");
                        if (isJson) {
                            files = JSON.parse(files);
                        }
                        if (Array.isArray(files)) {
                            files.forEach((file) => {
                                if (!file.newFilename) {
                                    formData.append("file", file);
                                } else {
                                    oldFiles.push(file);
                                }
                            });
                        }
                        if (formData.has("file")) {
                            const result = await api.uploadFiles(formData);
                            if (result.fileData) {
                                result.fileData.forEach((file) => {
                                    oldFiles.push(file);
                                });
                                // add new files to values object
                                values[key] = JSON.stringify(oldFiles);
                            }
                        } else {
                            values[key] = JSON.stringify(oldFiles);
                        }
                    }
                }
            }
            const companyUsersData = {
                company_id: session?.user?.company_id,
                username: values.username,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                password: values.password,
                avatar: values.avatar,
                role_id: 2,
                activated: 1,
                banned: 0,
                is_verified: 1,
            };
            if (editData?.user_id) {
                const userData = await api.update("/api/admin/users", companyUsersData, editData?.user_id);
                if (userData) {
                    await editData.refetch();
                    notify("success", t("account_update_successfully"));
                    setModal(false);
                }
            } else {
                const userData = await api.create("/api/admin/users", companyUsersData);
                if (userData.insertId) {
                    router.push("/admin/settings");
                    notify("success", t("account_created_successfully"));
                    setModal(false);
                } else {
                    notify("danger", userData);
                }
            }
        };

        const createUser = (<Fb
            meta={meta}
            form={true}
            url={url}
            id={editData?.user_id}
            // to={"/admin/settings"}
            onSubmit={saveUser}
        />);
        return (<>
            <Card>
                <CardBody>
                    <MyTable
                        columns={columns}
                        url={url}
                        actions={actions}
                        where={{
                            "usr.company_id": companyID(), // 'tmpl.template_status': 1,
                        }}
                    />
                </CardBody>
            </Card>
            {modal && (<MyModal
                size={"lg"}
                title={editData?.user_id ? t("update_user") : t("create_user")}
                modal={modal}
                handleClose={() => setModal(!modal)}
                // loading={loading}
                children={createUser}
            />)}
        </>);
    };

    const tabs = [{
        order: 1,
        url: url + "?type=general",
        value: "general",
        icon: "bx bx-cog",
        label: t("General"),
        children: <GeneralSettings/>,
    }, {
        order: 2,
        url: url + "?type=billing",
        value: "billing",
        icon: "bx bx-credit-card",
        label: t("Billing"),
        children: <BillingSettings/>,
    }, {
        order: 3,
        url: url + "?type=affiliate",
        value: "affiliate-program",
        icon: "ri-hand-heart-line",
        label: t("Affiliate Program"),
        children: <AffiliateProgram/>,
    }, {
        order: 4,
        url: url + "?type=usage",
        value: "usage",
        icon: "ri-history-line",
        label: t("Usage"),
        children: <UsageSettings/>,
    }, {
        order: 5,
        url: url + "?type=team",
        value: "team",
        icon: "ri-group-line",
        label: t("Team"),
        children: <TeamSettings/>,
    },];

    return (<div className="page-content">
        <Container fluid>
            <BreadCrumb
                pageTitle={tabs.find((tab) => tab.value === activeTab).label}
                title={t("settings")}
            />
            <Tabs
                tabs={tabs}
                active={activeTab}
                setTab={(tab) => {
                    setActiveTab(tab);
                }}
            />
        </Container>
    </div>);
}
export const getServerSideProps = async ({
                                             locale
                                         }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
