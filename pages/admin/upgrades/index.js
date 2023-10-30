import React, {useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    API, companyID, getRow, Info,
} from "../../../components/config";
import PackageList from "../../../components/PackageList";
import Fb, {notify} from "../../../components/Fb";
import Paypal from "../../../components/PaymentGateway/Paypal";
import Stripe from "../../../components/PaymentGateway/Stripe";
import RazorpayPayment from "../../../components/PaymentGateway/Razorpay";
import BankTransfer from "../../../components/PaymentGateway/BankTransfer";

export default function Index() {
    const {t} = useTranslation();
    let url = "/api/admin/packages";
    const [packageInfo, setPackageInfo] = useState({});
    const [paymentStatus, setPaymentStatus] = useState("");
    const router = useRouter();
    useEffect(() => {
        // if packageInfo is not empty then set the package info into local storage
        if (Object.keys(packageInfo).length > 0) {
            localStorage.setItem("packageData", JSON.stringify(packageInfo));
        }
    }, [packageInfo]);
    useEffect(() => {
        if (paymentStatus === "success") {
            // redirect to the dashboard after 2 seconds
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 2000);
        }
    }, [paymentStatus]);

    const companyId = companyID();
    const {
        data: currentPackage, isLoading, refetch,
    } = Info("/api/admin/companiesHistories", {
        "cmpny.company_id": companyId, "cmpnyDetail.active": 1,
    }, {
        allPackage: {
            url: "/api/admin/packages", where: {
                status: 1,
            },
        },
    });
    const meta = {
        columns: 1, flexible: true, formItemLayout: [4, 7], fields: [{
            name: "package_id", label: t("package"), type: "select", required: true, getOptions: {
                url: "/api/admin/packages",
            }, value: packageInfo?.package_id, onChange: async (package_id) => {
                const data = await getRow("/api/admin/packages", package_id);
                data.frequency = packageInfo?.frequency;
                setPackageInfo(data);
            },
        }, {
            name: "frequency", label: t("frequency"), type: "select", required: true, options: [{
                label: t("monthly"), value: "monthly",
            }, {
                label: t("yearly"), value: "annual",
            }, {
                label: t("lifetime"), value: "lifetime",
            },], value: packageInfo?.frequency, onChange: (frequency) => {
                const data = {...packageInfo, frequency};
                setPackageInfo(data);
            },
        },],
    };

    return (<div className="page-content">
        <Container fluid>
            <BreadCrumb title={t("upgrades")}/>
            <Card>
                <CardHeader>
                    <h4 className="card-title mb-0 flex-grow-1">
                        {t("upgrade_your_plan")}
                    </h4>
                </CardHeader>
                <CardBody>
                    {packageInfo?.package_id ? (<Row>
                        <Col md={7}>
                            <Fb meta={meta} form={true}/>
                            <div className="row mt-5">
                                <div className="col-xl-4"></div>
                                <div className="col-xl-7">
                                    <div className="row">
                                        <div className="col-xl-6">
                                            <Paypal
                                                data={packageInfo}
                                                setPaymentStatus={setPaymentStatus}
                                            />
                                        </div>
                                        <div className="col-xl-6">
                                            <Stripe data={packageInfo} setPaymentStatus={setPaymentStatus}/>
                                        </div>
                                        <div className="col-xl-6">
                                            <RazorpayPayment data={packageInfo}
                                                             setPaymentStatus={setPaymentStatus}/>
                                        </div>
                                        <div className="col-xl-6">
                                            <BankTransfer data={packageInfo}
                                                          setPaymentStatus={setPaymentStatus}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={5}>
                            <div className="pricing-box">
                                <div className="card-body bg-light m-2 p-4">
                                    <div className="d-flex align-items-center mb-3">

                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-semibold">
                                                {packageInfo?.package_name}
                                            </h5>
                                        </div>
                                        <div className="ms-auto">
                                            {<h2 className="month mb-0 d-block">
                                                ${packageInfo.frequency === "monthly" ? packageInfo.monthly_price : packageInfo.frequency === "annual" ? packageInfo.annual_price : packageInfo.lifetime_price}{" "}

                                                <small
                                                    className="fs-13 text-muted">/{packageInfo.frequency === "monthly" ? t("month") : packageInfo.frequency === "annual" ? t("year") : t("lifetime")}</small>
                                            </h2>}


                                        </div>
                                    </div>
                                    <p className="text-muted">
                                        {packageInfo?.package_description}
                                    </p>
                                    <ul className="list-unstyled vstack gap-3">
                                        <li>
                                            <div className="d-flex">
                                                <div className="flex-shrink-0 text-success me-1">
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <b>{JSON.parse(packageInfo?.ai_templates)?.length}</b>{" "}
                                                    {t("ai_templates")}
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="d-flex">
                                                <div
                                                    className={`flex-shrink-0 me-1 ${packageInfo?.words_per_month === 0 ? "text-danger" : "text-success"}`}>

                                                    {packageInfo?.words_per_month === 0 ?
                                                        <i className="ri-close-circle-fill fs-15 align-middle"></i> :
                                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>}
                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.words_per_month === -1 ? <>
                                                        <b> {t('unlimited')} </b></> : packageInfo?.words_per_month === 0 ?
                                                        <b>
                                                            <del>{t('words')}</del>
                                                        </b> : <>
                                                            <b> {packageInfo?.words_per_month} </b>  </>}
                                                    {" "}
                                                    {packageInfo?.words_per_month === 0 ? "" : t('words') + " / " + t('month')}
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="d-flex">
                                                <div
                                                    className={`flex-shrink-0 me-1 ${packageInfo?.images_per_month === 0 ? "text-danger" : "text-success"}`}>
                                                    {packageInfo?.images_per_month === 0 ?
                                                        <i className="ri-close-circle-fill fs-15 align-middle"></i> :
                                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>}
                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.images_per_month === -1 ? <>
                                                        <b> {t('unlimited')} </b></> : packageInfo?.images_per_month === 0 ?
                                                        <b>
                                                            <del>{t('images')}</del>
                                                        </b> : <>
                                                            <b> {packageInfo?.images_per_month} </b>  </>}
                                                    {" "}
                                                    {packageInfo?.images_per_month === 0 ? "" : t('images') + " / " + t('month')}
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div className="d-flex">
                                                <div
                                                    className={`flex-shrink-0 me-1 ${packageInfo?.ai_chat === 0 ? "text-danger" : "text-success"}`}>
                                                    {packageInfo?.ai_chat === 0 ?
                                                        <i className="ri-close-circle-fill fs-15 align-middle"></i> :
                                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>}

                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.ai_chat === 1 ? <>
                                                        <b> {t('chats')} </b></> : <b>
                                                        <del>{t('chats')}</del>
                                                    </b>}
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="d-flex">
                                                <div
                                                    className={`flex-shrink-0 me-1 ${packageInfo?.ai_transcriptions === 0 ? "text-danger" : "text-success"}`}>
                                                    {packageInfo?.ai_transcriptions === 0 ?
                                                        <i className="ri-close-circle-fill fs-15 align-middle"></i> :
                                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>}

                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.ai_transcriptions === 1 ? <>
                                                        <b> {t('transcriptions')} </b></> : <b>
                                                        <del>{t('transcriptions')}</del>
                                                    </b>}
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="d-flex">
                                                <div
                                                    className={`flex-shrink-0 me-1 ${packageInfo?.text_to_speech === 0 ? "text-danger" : "text-success"}`}>
                                                    {packageInfo?.text_to_speech === 0 ?
                                                        <i className="ri-close-circle-fill fs-15 align-middle"></i> :
                                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>}

                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.text_to_speech === 1 ? <>
                                                        <b> {t('text_to_speech')} </b></> : <b>
                                                        <del>{t('text_to_speech')}</del>
                                                    </b>}
                                                </div>
                                            </div>
                                        </li>

                                        <li>
                                            <div className="d-flex">
                                                <div className="flex-shrink-0 text-success me-1">
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    {packageInfo?.speech_file_size === -1 ? <>
                                                        <b> {t('unlimited')} </b></> : <>
                                                        <b> {packageInfo?.speech_file_size} {t('MB')} </b>  </>}
                                                    {" "}
                                                    {t('speech_file_size')}
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="d-flex">
                                                <div className="flex-shrink-0 text-success me-1">
                                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <b>24/7</b> {t("support")}
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>) : (<>
                        {isLoading ? (<div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>) : (<Row>
                            {currentPackage?.allPackage?.map((item, index) => {
                                return (<PackageList

                                    setSelected={(data) => {
                                        data.frequency = "monthly";
                                        setPackageInfo(data);
                                    }}
                                    selected={currentPackage?.package_id === item?.package_id}
                                    key={index}
                                    data={item}
                                />);
                            })}
                        </Row>)}
                    </>)}
                </CardBody>
            </Card>
        </Container>
    </div>);
}


export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});