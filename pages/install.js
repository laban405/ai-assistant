import {useRouter} from "next/router";
import React, {useContext, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    FormFeedback,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    UncontrolledTooltip
} from "reactstrap";
import Image from "next/image";
import ParticlesAuth from "../components/ParticlesAuth";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Head from "next/head";
import {API, SiteLogo} from "../components/config";
import {Context} from "./_app";
import Fb from "../components/Fb";

const Install = () => {
    const api = new API();
    const {t} = useTranslation("common");
    const router = useRouter();
    const {config} = useContext(Context);
    const [error, setError] = useState({});
    const [activeTab, setActiveTab] = useState(1);
    const [install, setInstall] = useState({});
    useEffect(() => {
        const isInstalled = config?.NEXT_PUBLIC_INSTALLED;
        if (isInstalled === "true") {
            router.push("/auth/login");
        }
    }, []);

    const meta = {
        columns: 1, formItemLayout: [4, 7], fields: [{
            name: "purchase_code",
            type: "text",
            label: t("purchase_code"),
            placeholder: t("enter_your_purchase_code"),
            required: true,
            value: ''

        }, {
            name: "envato_username",
            type: "text",
            label: t("username"),
            placeholder: t("enter_your_username"),
            required: true,
            value: ''
        }, {
            name: "support_email",
            type: "text",
            label: t("support_email"),
            placeholder: t("enter_your_support_email"),
            required: true,
            value: ''
        }, {
            type: "submit",
            label: t("Verify"),
            icon: "ri-arrow-right-line label-icon align-middle fs-16 ms-2",
            submitText: t("please_wait"),
        }]
    };
    const dbmeta = {
        columns: 1, formItemLayout: [4, 7], fields: [{
            name: "db_host",
            type: "text",
            label: t("db_host"),
            placeholder: t("enter_your_db_host"),
            required: true,
            value: process.env.NEXT_PUBLIC_MYSQL_HOST
        }, {
            name: "db_port",
            type: "text",
            label: t("db_port"),
            placeholder: t("enter_your_db_port"),
            required: true,
            value: process.env.NEXT_PUBLIC_MYSQL_PORT
        }, {
            name: "db_name",
            type: "text",
            label: t("db_name"),
            placeholder: t("enter_your_db_name"),
            required: true,
            value: process.env.NEXT_PUBLIC_MYSQL_DB_NAME
        }, {
            name: "db_username",
            type: "text",
            label: t("db_username"),
            placeholder: t("enter_your_db_username"),
            required: true,
            value: process.env.NEXT_PUBLIC_MYSQL_USER

        }, {
            name: "db_password",
            type: "text",
            label: t("db_password"),
            placeholder: t("enter_your_db_password"),
            required: true,
            value: process.env.NEXT_PUBLIC_MYSQL_PASSWORD
        }, {
            type: "submit",
            label: t("Check Connection"),
            icon: "ri-arrow-right-line label-icon align-middle fs-16 ms-2",
            submitText: t("please_wait"),
        }]
    };

    const adminMeta = {
        columns: 1, formItemLayout: [4, 7], fields: [{
            name: "first_name",
            type: "text",
            label: t("first_name"),
            placeholder: t("enter_your_first_name"),
            required: true,
            value: ''
        }, {
            name: "last_name",
            type: "text",
            label: t("last_name"),
            placeholder: t("enter_your_last_name"),
            required: true,
            value: ''
        }, {
            name: "email",
            type: "text",
            label: t("email"),
            placeholder: t("enter_your_email"),
            required: true,
            value: ''
        }, {
            name: "username",
            type: "text",
            label: t("username"),
            placeholder: t("enter_your_username"),
            required: true,
            value: ''
        }, {
            name: "password",
            type: "password",
            label: t("password"),
            placeholder: t("enter_your_password"),
            required: true,
            value: ''
        }, {
            name: "password_confirmation",
            type: "password",
            label: t("password_confirmation"),
            placeholder: t("enter_your_password_confirmation"),
            required: true,
            value: ''
        }, {
            type: "text",
            name: "company_name",
            label: t("company_name"),
            placeholder: t("enter_your_company_name"),
            required: true,
            value: ''
        }, {
            type: "text",
            name: "company_email",
            label: t("company_email"),
            placeholder: t("enter_your_company_email"),
            required: true,
            value: ''
        }, {
            type: "submit",
            label: t("Complete Installation"),
            icon: "ri-arrow-right-line label-icon align-middle fs-16 ms-2",
            submitText: t("please_wait"),
        }]
    }
    return (<>
        <Head>
            <title>
                Install
            </title>
        </Head>
        <ParticlesAuth>
            <div className="auth-page-content">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 mb-4 text-white-50">
                                <div className="d-inline-block auth-logo">
                                    <Image src={SiteLogo()} alt={"NextAi logo"}
                                           height={40}
                                           width={200}
                                    />
                                </div>
                                <p className="mt-3 fs-15 fw-medium">
                                    NextAi
                                </p>
                            </div>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col xl={7}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">
                                        {t("Thanks for purchase NextAi")}
                                    </h4>
                                </CardHeader>
                                <CardBody className="form-steps">
                                    <div className="text-center mt-2">
                                        <p className="text-muted">
                                            {t("Please enter the details below to continue")}
                                        </p>
                                        {error?.type && <div className={`alert alert-${error.type} mb-4`}
                                                             role="alert">
                                            <div dangerouslySetInnerHTML={{__html: error.message}}/>
                                        </div>}
                                    </div>
                                    <div className="step-arrow-nav mb-4">
                                        <Nav
                                            className="nav-pills custom-nav nav-justified"
                                            role="tablist"
                                        >
                                            <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    className={activeTab === 1 ? "active" : ""}
                                                >
                                                    {t("Verify Purchase")}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    className={activeTab === 2 ? "active" : ""}
                                                >
                                                    {t("Database Setup")}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    className={activeTab === 3 ? "active" : ""}
                                                >
                                                    {t("Admin Setup")}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    className={activeTab === 4 ? "active" : ""}
                                                >
                                                    {t("Finish")}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </div>

                                    <TabContent activeTab={activeTab}>
                                        <TabPane id="steparrow-gen-info" tabId={1}>
                                            <Fb
                                                meta={meta}
                                                form={true}
                                                onSubmit={async (post) => {
                                                    post.check_purchase_code = true
                                                    const verify = await api.create('/api/hello', post)
                                                    if (verify.error === false) {
                                                        delete post.check_purchase_code
                                                        setError({
                                                            message: verify.message, type: 'success'
                                                        })
                                                        setInstall({
                                                            ...install, ...post
                                                        })
                                                        setActiveTab(2)
                                                    } else {
                                                        setError({
                                                            message: verify.message, type: 'danger'
                                                        })
                                                    }
                                                }}
                                            />
                                        </TabPane>

                                        <TabPane id="steparrow-description-info" tabId={2}>
                                            <Fb
                                                meta={dbmeta}
                                                form={true}
                                                onSubmit={async (values) => {
                                                    values.check_db_connection = true
                                                    const res = await api.create('/api/hello', values)
                                                    if (res.error === false) {
                                                        setError({
                                                            message: 'Database config updated successfully',
                                                            type: 'success'
                                                        })
                                                        delete values.check_db_connection
                                                        setInstall({
                                                            ...install, ...values
                                                        })
                                                        setActiveTab(3)
                                                    } else {
                                                        setError({
                                                            message: res.message, type: 'danger'
                                                        })
                                                    }
                                                }}
                                            />
                                            <div className="text-center ">
                                                <h5
                                                    className={'text-danger'}
                                                >if you change database config for successfully connection
                                                    then you have to change the database config in your
                                                    environment file too from your server or local</h5>
                                            </div>
                                        </TabPane>

                                        <TabPane id="pills-experience" tabId={3}>
                                            <Fb
                                                meta={adminMeta}
                                                form={true}
                                                onSubmit={async (values) => {
                                                    values.install = true
                                                    const data = {
                                                        ...install, ...values
                                                    }
                                                    const res = await api.create('/api/hello', data)
                                                    if (res.error === false) {
                                                        setActiveTab(4)
                                                        // call api to delete install folder after 3 seconds
                                                        setTimeout(async () => {
                                                            const del = await api.create('/api/hello', {
                                                                del: true
                                                            })
                                                            if (del.error === false) {
                                                                window.location.href = '/auth/login'
                                                            }
                                                        }, 1000)
                                                    }
                                                    setError({
                                                        message: res.message,
                                                        type: res.error === false ? 'success' : 'danger'
                                                    })

                                                }}
                                            />

                                        </TabPane>

                                        <TabPane id="pills-experience" tabId={4}>
                                            <div className="text-center">
                                                <div className="avatar-md mt-5 mb-4 mx-auto">
                                                    <div
                                                        className="avatar-title bg-light text-success display-4 rounded-circle">
                                                        <i className="ri-checkbox-circle-fill"></i>
                                                    </div>
                                                </div>
                                                <h5>
                                                    {t("Congratulations !")}
                                                </h5>
                                                <p className="text-muted mb-0">
                                                    {t("NextAi has been successfully installed")}
                                                </p>
                                                <p className="text-danger">
                                                    {t("the install folder will be deleted after 5 seconds automatically, if not please delete it manually. and redirect to login page.") + ' '}
                                                </p>
                                                <div className="mt-4">
                                                    <Button color="danger"
                                                            onClick={async () => {
                                                                const del = await api.create('/api/hello', {
                                                                    del: true
                                                                })
                                                                if (del.error === false) {
                                                                    window.location.href = '/auth/login'
                                                                }
                                                            }}
                                                    >
                                                        {t("Delete Install Folder and Login")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabPane>
                                    </TabContent>

                                </CardBody>
                            </Card>
                        </Col>

                    </Row>
                </Container>
            </div>
        </ParticlesAuth>
    </>);
};

export default Install;

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});