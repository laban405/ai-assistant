import {useTranslation} from 'next-i18next';
import React from 'react';

const SinglePrice = ({pricing, packages, setModal, setPackageId}) => {
    const {t} = useTranslation();


    return (<div className={pricing?.recommended ? "pricing pricing-featured bg-gradient-primary" : "pricing mt-75"}>
        <div className="pricing-body">
            <div className="text-center">
                {pricing?.recommended ? <div className="badge mb-25 popular bg-opacity-20">
                    {t("most_popular")}
                </div> : ''}

                <h3 className="mb-4">{pricing?.package_name}</h3>
                <h3 className="mb-4 price">
                    ${packages === "monthly" ? pricing?.monthly_price : packages === "yearly" ? pricing?.annual_price : pricing?.lifetime_price}
                    <span
                        className="caption-text text-muted"> / {packages === "monthly" ? t('month') : packages === "yearly" ? t("year") : t("lifetime")}</span>
                </h3>


                <div className="px-4 mb-25">
                    <button onClick={() => {
                        setModal(true);
                        setPackageId(pricing?.package_id);
                    }} className={`font-btn ${pricing?.recommended ? "gts-btn" : "sc-btn pricing-btn"}`}>
                        {t("choose_plan")}
                    </button>
                </div>
            </div>
            <ul className="step-list pricing-list">
                <li>
                    <i className="fas fa-check-circle"></i>
                    <span>
                            <strong>{JSON.parse(pricing?.ai_templates)?.length}</strong>
                            <span className="mx-1">{t("ai_templates")}</span>
                        </span>
                </li>
                <li>
                    {pricing?.words_per_month === 0 ?
                        <i className={`fas fa-times-circle ${pricing?.words_per_month === 0 ? "text-danger" : "text-success"}`}></i> :
                        <i className="fas fa-check-circle"></i>}

                    <span>
                            {pricing?.words_per_month === -1 ? <>
                                <b> {t('unlimited')} </b></> : pricing?.words_per_month === 0 ? <b>
                                <del>{t('words')}</del>
                            </b> : <>
                                <b> {pricing?.words_per_month} </b>  </>}
                        {" "}
                        {pricing?.words_per_month === 0 ? "" : t('words') + " / " + t('month')}

                        </span>
                </li>
                <li>
                    {pricing?.images_per_month === 0 ?
                        <i className={`fas fa-times-circle ${pricing?.images_per_month === 0 ? "text-danger" : "text-success"}`}></i> :
                        <i className="fas fa-check-circle"></i>}

                    <span>
                            {pricing?.images_per_month === -1 ? <>
                                <b> {t('unlimited')} </b></> : pricing?.images_per_month === 0 ? <b>
                                <del>{t('images')}</del>
                            </b> : <>
                                <b> {pricing?.images_per_month} </b>  </>}
                        {" "}
                        {pricing?.images_per_month === 0 ? "" : t('images') + " / " + t('month')}

                        </span>
                </li>
                <li>
                    {pricing?.ai_chat === 0 ?
                        <i className={`fas fa-times-circle ${pricing?.ai_chat === 0 ? "text-danger" : "text-success"}`}></i> :
                        <i className="fas fa-check-circle"></i>}

                    <span>
                            {pricing?.ai_chat === 1 ? <>
                                <b> {t('chats')} </b></> : <b>
                                <del>{t('chats')}</del>
                            </b>}

                        </span>
                </li>
                <li>
                    {pricing?.ai_transcriptions === 0 ?
                        <i className={`fas fa-times-circle ${pricing?.ai_transcriptions === 0 ? "text-danger" : "text-success"}`}></i> :
                        <i className="fas fa-check-circle"></i>}

                    <span>
                            {pricing?.ai_transcriptions === 1 ? <>
                                <b> {t('transcriptions')} </b></> : <b>
                                <del>{t('transcriptions')}</del>
                            </b>}

                        </span>
                </li>
                <li>
                    {pricing?.text_to_speech === 0 ?
                        <i className={`fas fa-times-circle ${pricing?.text_to_speech === 0 ? "text-danger" : "text-success"}`}></i> :
                        <i className="fas fa-check-circle"></i>}

                    <span>
                            {pricing?.text_to_speech === 1 ? <>
                                <b> {t('text_to_speech')} </b></> : <b>
                                <del>{t('text_to_speech')}</del>
                            </b>}

                        </span>
                </li>

                <li>

                    <i className="fas fa-check-circle"></i>

                    <span>
                            {pricing?.speech_file_size === -1 ? <>
                                <b> {t('unlimited')} </b></> : <>
                                <b> {pricing?.speech_file_size} {t('MB')} </b>  </>}
                        {" "}
                        {t('speech_file_size')}

                        </span>
                </li>
                <li>

                    <i className="fas fa-check-circle"></i>

                    <span>
                            <b>24/7</b> {t("support")}

                        </span>
                </li>


            </ul>
        </div>
    </div>);
};

export default SinglePrice;