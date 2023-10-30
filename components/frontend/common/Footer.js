import Link from "next/link";
import React, {useContext} from "react";
import FooterCta from "../Home/FooterCta";
import Image from "next/image";
import {SiteLogo} from "../../config";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Context} from "../../../pages/_app";

export default function Footer() {
    const {t} = useTranslation();

    const {config} = useContext(Context);

    return (<>
        {/* <FooterCta /> */}
        <footer className="ai-footer bg-darker">

            <div className="container">
                <div className="row">
                    <div className="col-xl-4 col-lg-3 mb-30">
                        <div className="block-text">
                            <Link href={"/"}>
                                <div className="logo-wrap mb-25">
                                    <Image src={SiteLogo()} alt={'logo'} width={150} height={50}
                                    />
                                </div>
                            </Link>
                            <ul className="social-icon">
                                <li>
                                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                                </li>
                                <li>
                                    <a href="#"><i className="fab fa-github"></i></a>
                                </li>
                                <li>
                                    <a href="#"><i className="fab fa-linkedin"></i></a>
                                </li>
                                <li>
                                    <a href="#"><i className="fab fa-youtube"></i></a>
                                </li>
                                <li>
                                    <a href="#"><i className="fab fa-twitter"></i></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-2 col-md-3 col-6 mb-30">
                        <h6 className="wgs-title mb-10">{t("tools")}</h6>
                        <ul className="wgs-list">
                            <li>
                                <a href="#">Article Generator</a>
                            </li>
                            <li>
                                <a href="#">Blog Ideas</a>
                            </li>
                            <li>
                                <a href="#">Blog Intros</a>
                            </li>
                            <li>
                                <a href="#">Blog Outlines</a>
                            </li>
                            <li>
                                <a href="#">Product Description</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-2 col-lg-2 col-md-3 col-6 mb-30">
                        <h6 className="wgs-title mb-10">Resources</h6>
                        <ul className="wgs-list">
                            <li>
                                <a href="#">Facebook Group</a>
                            </li>
                            <li>
                                <a href="#">Discord Community</a>
                            </li>
                            <li>
                                <a href="#">Guide and Tutorials</a>
                            </li>
                            <li>
                                <a href="#">Request API access</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-2 col-lg-2 col-md-3 col-6 mb-30">
                        <h6 className="wgs-title mb-10">Company</h6>
                        <ul className="wgs-list">
                            <li>
                                <a href="#">About us</a>
                            </li>
                            <li>
                                <a href="#">Careers</a>
                            </li>
                            <li>
                                <a href="#">Pricing</a>
                            </li>
                            <li>
                                <a href="#">Contact Us</a>
                            </li>
                            <li>
                                <a href="#">Wall of Love</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-xl-2 col-lg-3 col-md-3 col-6 mb-30">
                        <h6 className="wgs-title mb-10">Use Case</h6>
                        <ul className="wgs-list">
                            <li>
                                <a href="#">AI Writer</a>
                            </li>
                            <li>
                                <a href="#">AI Articel Writer</a>
                            </li>
                            <li>
                                <a href="#">Content Generator</a>
                            </li>
                            <li>
                                <a href="#">AI Content Writing</a>
                            </li>
                            <li>
                                <a href="#">Content Rewriter</a>
                            </li>
                            <li>
                                <a href="#">Blog Post Writer</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr/>
                <div className="footer-bottom pt-15 pb-10">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="text-light">©
                                <Link
                                    target={"_blank"}
                                    href={"https://nextai.site"}
                                    className={"link-primary"}> {config?.NEXT_PUBLIC_COMPANY_NAME}</Link> {" "}
                                {new Date().getFullYear()}
                                . All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </>);
}


export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
