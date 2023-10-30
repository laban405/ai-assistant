import {useRouter} from "next/router";
import React, {useContext, useState} from "react";
import {Button, Card, CardBody, Col, Container, FormFeedback, Input, Label, Row, UncontrolledTooltip} from "reactstrap";
import Image from "next/image";
import ParticlesAuth from "../components/ParticlesAuth";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Head from "next/head";
import {SiteLogo} from "../components/config";

import maintenanceImg from "../public/assets/img/maintenance.png";
import {Context} from "./_app";

const Maintenance = () => {
    const {t} = useTranslation("common");
    const router = useRouter();
    const {config, session, status} = useContext(Context);
    if (status === "authenticated") {
        const role_id = session?.user?.role_id;
        if (role_id === 1) router.push("/saas/dashboard");
        if (role_id === 2) router.push("/admin/dashboard");
    }
    return (<>
        <Head>
            <title>
                {config?.NEXT_PUBLIC_COMPANY_NAME + " | " + t("Maintenance")}
            </title>
        </Head>
        <ParticlesAuth>
            <div className="auth-page-content">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 pt-4">
                                <div className="mb-5 text-white-50">
                                    <h1 className="display-5 coming-soon-text">
                                        {t('site_is_under_maintenance')}
                                    </h1>
                                    <p className="fs-14">
                                        {t('please_check_back_in_sometime')}
                                    </p>
                                    <div className="mt-4 pt-2">
                                        <Link href="/" className="btn btn-success"><i
                                            className="mdi mdi-home me-1"></i>
                                            {t('back_to_home')}
                                        </Link>
                                    </div>
                                </div>
                                <Row className="justify-content-center mb-5">
                                    <Col xl={4} lg={8}>
                                        <div>
                                            <Image
                                                width={600}
                                                height={600}
                                                src={maintenanceImg} alt={'maintenance'} className="img-fluid"/>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </ParticlesAuth>
    </>);
};

export default Maintenance;

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});