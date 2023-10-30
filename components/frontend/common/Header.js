import useSticky from "../../../hooks/useSticky";
import Link from "next/link";
import React, {useState} from "react";
import {GetRows, SiteLogo} from "../../config";
import Loading from "../../Loading";
import Image from "next/image";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";

export default function Header() {
    const {headerSticky} = useSticky();
    const [show, setShow] = useState(false);
    const {t} = useTranslation();
    const handleShow = () => setShow(!show);
    const handleClose = () => setShow(false);

    return (<div className={`${show ? "menu-active" : ""}`}>
        <header className={headerSticky ? "header-area active" : "header-area"}>
            <div className="header__quest d-lg-none f-right" onClick={handleShow}>
                <button type="button" className="toggle-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <div className="header-menu-overlay" onClick={handleClose}></div>
            <div className="container">
                <div className="row">
                    <div className="col-xl-3 col-lg-3 d-flex align-items-center">
                        <Image
                            src={SiteLogo()}
                            width={150}
                            alt="" height={40}/>
                    </div>
                    <div className="col-xl-6 col-lg-6">
                        <ul className={`main-menu mobile-menu m-0`}>
                            <li>
                                <Link
                                    href={"#home"}>
                                    {t("Home")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={"#services"}>
                                    {t("Services")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={"#features"}>
                                    {t("Features")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={"#pricing"}>
                                    {t("Pricing")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={"#use-cases"}>
                                    {t("Use Cases")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={"#contact"}>
                                    {t("Contact")}
                                </Link>
                            </li>

                            <div className="d-block d-md-none mx-3 pt-4">
                                <div className="d-flex align-items-center gap-5">
                                    <div>
                                        <Link href={"#pricing"} className="font-btn sc-btn">
                                            {t("Get_Started")}
                                        </Link>
                                    </div>
                                    <div>
                                        <Link href={"/auth/login"} className="text-light">
                                            {t("Sign_in")}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </ul>
                    </div>
                    <div
                        className="col-xl-3 col-lg-3 d-none d-log-block d-lg-flex align-items-center justify-content-end">
                        <div className="d-flex align-items-center gap-5">
                            <div>
                                <Link href={"/auth/login"} className="text-light">
                                    {t("Sign_in")}
                                </Link>
                            </div>
                            <div>
                                <Link href={"#pricing"} className="font-btn sc-btn">
                                    {t("Get_Started")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    </div>);
}

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
