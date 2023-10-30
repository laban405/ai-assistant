import React, {useContext} from "react";
import {Button, Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function PackageList({
                                        data,
                                        selected,
                                        modal,
                                        details,
                                        handleClose,
                                        setModal,
                                        setSelected,
                                        loading,
                                        id,
                                        frequency,
                                    }) {
    const {t} = useTranslation('common');


    return (<React.Fragment>
        {data && (<Col md={modal ? 12 : 4}>
            <div className={`pricing-box`}>
                <div
                    className={`card-body bg-light m-2 p-4 ${selected ? "ribbon-box ribbon-fill right" : ""}`}
                >
                    {selected && (<div className="ribbon ribbon-bookmark ribbon-danger">
                        <i className="mdi mdi-bookmark"></i>
                    </div>)}
                    <div className="d-flex align-items-center mb-3 justify-content-between">
                        <div className="flex-grow-1">
                            <h2 className="mb-0 fw-semibold text-truncate">
                                {data?.package_name}
                            </h2>
                        </div>

                        <div className="ms-auto">
                            {data?.monthly_price && (<h5 className="month mb-0 d-block">
                                <sup>
                                    <small>$ </small>
                                </sup>{" "}
                                {data?.monthly_price}{" "}
                                <small className="fs-13 text-muted">/{t("month")}</small>
                            </h5>)}
                            {data?.annual_price && (<h5 className="month mb-0 d-block">
                                <sup>
                                    <small>$ </small>
                                </sup>{" "}
                                {data?.annual_price}{" "}
                                <small className="fs-13 text-muted">/{t("year")}</small>
                            </h5>)}
                            {data?.lifetime_price && (<h5 className="month mb-0 d-block">
                                <sup>
                                    <small>$ </small>
                                </sup>{" "}
                                {data?.lifetime_price}{" "}
                                <small className="fs-13 text-muted">
                                    {" "}
                                    {t("lifetime")}
                                </small>
                            </h5>)}
                        </div>
                    </div>
                    <p className="text-muted">{data?.package_description}</p>
                    <ul className="list-unstyled vstack gap-3">
                        <li>
                            <div className="d-flex">
                                <div className="flex-shrink-0 text-success me-1">
                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <b>{JSON.parse(data?.ai_templates)?.length}</b> AI
                                    Templates
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="d-flex">
                                <div
                                    className={`flex-shrink-0 me-1 ${data?.words_per_month === 0 ? "text-danger" : "text-success"}`}
                                >
                                    {data?.words_per_month === 0 ? (
                                        <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                </div>
                                <div className="flex-grow-1">
                                    {data?.words_per_month === -1 ? (<>
                                        <b> {t("unlimited")} </b>
                                    </>) : data?.words_per_month === 0 ? (<b>
                                        <del>{t("words")}</del>
                                    </b>) : (<>
                                        <b> {data?.words_per_month} </b>{" "}
                                    </>)}{" "}
                                    {data?.words_per_month === 0 ? "" : t("words") + " / " + t("month")}
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="d-flex">
                                <div
                                    className={`flex-shrink-0 me-1 ${data?.images_per_month === 0 ? "text-danger" : "text-success"}`}
                                >
                                    {data?.images_per_month === 0 ? (
                                        <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                </div>
                                <div className="flex-grow-1">
                                    {data?.images_per_month === -1 ? (<>
                                        <b> {t("unlimited")} </b>
                                    </>) : data?.images_per_month === 0 ? (<b>
                                        <del>{t("images")}</del>
                                    </b>) : (<>
                                        <b> {data?.images_per_month} </b>{" "}
                                    </>)}{" "}
                                    {data?.images_per_month === 0 ? "" : t("images") + " / " + t("month")}
                                </div>
                            </div>
                        </li>

                        <li>
                            <div className="d-flex">
                                <div
                                    className={`flex-shrink-0 me-1 ${data?.ai_chat === 0 ? "text-danger" : "text-success"}`}
                                >
                                    {data?.ai_chat === 0 ? (
                                        <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                </div>
                                <div className="flex-grow-1">
                                    {data?.ai_chat === 1 ? (<>
                                        <b> {t("chats")} </b>
                                    </>) : (<b>
                                        <del>{t("chats")}</del>
                                    </b>)}
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="d-flex">
                                <div
                                    className={`flex-shrink-0 me-1 ${data?.ai_transcriptions === 0 ? "text-danger" : "text-success"}`}
                                >
                                    {data?.ai_transcriptions === 0 ? (
                                        <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                </div>
                                <div className="flex-grow-1">
                                    {data?.ai_transcriptions === 1 ? (<>
                                        <b> {t("transcriptions")} </b>
                                    </>) : (<b>
                                        <del>{t("transcriptions")}</del>
                                    </b>)}
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="d-flex">
                                <div
                                    className={`flex-shrink-0 me-1 ${data?.text_to_speech === 0 ? "text-danger" : "text-success"}`}
                                >
                                    {data?.text_to_speech === 0 ? (
                                        <i className="ri-close-circle-fill fs-15 align-middle"></i>) : (
                                        <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>)}
                                </div>
                                <div className="flex-grow-1">
                                    {data?.text_to_speech === 1 ? (<>
                                        <b> {t("text_to_speech")} </b>
                                    </>) : (<b>
                                        <del>{t("text_to_speech")}</del>
                                    </b>)}
                                </div>
                            </div>
                        </li>

                        <li>
                            <div className="d-flex">
                                <div className="flex-shrink-0 text-success me-1">
                                    <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                </div>
                                <div className="flex-grow-1">
                                    {data?.speech_file_size === -1 ? (<>
                                        <b> {t("unlimited")} </b>
                                    </>) : (<>
                                        <b>
                                            {" "}
                                            {data?.speech_file_size} {t("MB")}{" "}
                                        </b>{" "}
                                    </>)}{" "}
                                    {t("speech_file_size")}
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
                    {!details && (<>
                        {selected ? (<div className="mt-3 pt-2">
                            <Button className="btn btn-info w-100">
                                {t("change_plan")}
                            </Button>
                        </div>) : (<div className="mt-3 pt-2">
                            <Button
                                className="btn btn-info w-100"
                                onClick={() => {
                                    setSelected(data);
                                    // setModalShow(true)
                                }}
                            >
                                {t("select_plan")}
                            </Button>
                        </div>)}
                    </>)}
                </div>
            </div>
        </Col>)}
    </React.Fragment>);
}


export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});