import React, {useContext, useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import Fb, {notify} from "../../../../components/Fb";
import {useRouter} from "next/router";
import {
    API, GetPaymentMethods, GetRows, Info, getRow,
} from "../../../../components/config";
import CompanyDetails from "../../../../components/CompanyDetails";

const api = new API();
let info = "";
let url = "/api/admin/companies";
let page = "";
export default function Companies() {
    const {t} = useTranslation();
    const router = useRouter();
    const {id} = router.query || {};
    info = Info(url, id);
    page = "details";
    useEffect(() => {
        if (info.isLoading === false && info?.data?.company_id === undefined) {
            notify('warning', t('no_data'));
            router.push('/saas/companies');
        }
    }, [info.data]);
    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid"><CompanyDetails info={info} t={t} url={url}/></div>
        </div>
    </React.Fragment>);
}
export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
