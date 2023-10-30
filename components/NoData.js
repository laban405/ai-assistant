// create a Loading component using reactstrap
import React from 'react';
import Image from "next/image";
import NoImage from "/styles/images/NextAiNoData.svg";
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';


export default function NoData({after, before, image}) {
    // show a spinner into center of the page
    return (<div className={'text-center'}>
        {after && <div className={'text-center'}>{after}</div>}
        {image !== false && <Image src={NoImage} alt={'No Data'} width={300} height={300}/>}
        {before && <div className={'text-center'}>{before}</div>}
    </div>);
}
export const InsufficientData = ({after, before}) => {
    const {t} = useTranslation('common');


    // show a spinner into center of the page
    return (<div className={'text-center'}>
        <div className={'text-center'} style={{fontSize: '2rem', color: 'red'}}>
            <span role={'img'} aria-label={'sad'}>😢</span> {t("insufficient_data")}
        </div>
        {after && <div className={'text-center'}>{after}</div>}
        {before && <div className={'text-center'}>{before}</div>}
    </div>);
}


export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});