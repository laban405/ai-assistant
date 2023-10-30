import Seo from "../components/frontend/Seo";
import HeroArea from "../components/frontend/Home/HeroArea";
import BrandArea from "../components/frontend/Home/BrandArea";
import ServicesArea from "../components/frontend/Home/ServicesArea";
import ContentStepsArea from "../components/frontend/Home/ContentStepsArea";
import UseCases from "../components/frontend/Home/UseCases";
import PricingArea from "../components/frontend/Home/PricingArea";
import FaqArea from "../components/frontend/Home/FaqArea";
import FooterCta from "../components/frontend/Home/FooterCta";
import Header from "../components/frontend/common/Header";
import Footer from "../components/frontend/common/Footer";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import {GetRows} from "../components/config";
import {useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export default function Home({config}) {
    const {t} = useTranslation();
    const [brandData, setBrandData] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [contentStepsData, setContentStepsData] = useState([]);
    const [useCasesData, setUseCasesData] = useState([]);
    const [faqData, setFaqData] = useState([]);
    const [footerCtaData, setFooterCtaData] = useState([]);
    const [sliderData, setSliderData] = useState([]);

    const router = useRouter();
    const {ref} = router.query || {};
    if (ref) {
        localStorage.setItem("referrer", ref);
    }
    const url = "/api/admin/sections";
    const {data: allData, isLoading} = GetRows(url, {
        where: {'status': 'published'}, // where: {type: "footerCta"},
    });
    useEffect(() => {
        if (allData) {
            const brandData = allData.filter(item => item.type === "brand");
            const servicesData = allData.filter(item => item.type === "service");
            const contentStepsData = allData.filter(item => item.type === "steps");
            const useCasesData = allData.filter(item => item.type === "usecase");
            const faqData = allData.filter(item => item.type === "faq");
            const footerCtaData = allData.filter(item => item.type === "footerCta");
            const sliderData = allData.filter(item => item.type === "slider");
            setBrandData(brandData);
            setServicesData(servicesData);
            setContentStepsData(contentStepsData);
            setUseCasesData(useCasesData);
            setFaqData(faqData);
            setFooterCtaData(footerCtaData);
            setSliderData(sliderData);
        }
    }, [allData]);

    return (<div className="app-root bg-darker">
        <Header/>
        <Seo/>
        <HeroArea data={sliderData} isLoading={isLoading}/>
        <main>
            <BrandArea
                data={brandData} isLoading={isLoading}
            />
            <ServicesArea
                data={servicesData} isLoading={isLoading}
            />
            <ContentStepsArea
                data={contentStepsData} isLoading={isLoading}
            />
            <UseCases
                data={useCasesData} isLoading={isLoading}
            />
            <PricingArea
            />
            <FaqArea
                data={faqData} isLoading={isLoading}/>
            <FooterCta
                data={footerCtaData} isLoading={isLoading}
            />
        </main>
        <Footer/>
    </div>)
}

export async function getServerSideProps({locale}) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}
