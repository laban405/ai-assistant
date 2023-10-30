import {
    getCsrfToken, getProviders, signIn, useSession,
} from "next-auth/react";
import {useRouter} from "next/router";
import React, {useContext, useState} from "react";
import {Button, Card, CardBody, Col, Container, FormFeedback, Input, Label, Row, UncontrolledTooltip} from "reactstrap";
import Image from "next/image";
import ParticlesAuth from "../../components/ParticlesAuth";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Fb, {MyModal} from "../../components/Fb";
import Register from "../register";
import Head from "next/head";
import {SiteLogo} from "../../components/config";
import {Context} from "../_app";

const Login = ({csrfToken, providers}) => {
    const {t} = useTranslation("common");
    const router = useRouter();
    const {error} = useRouter().query;
    const [LoginError, setError] = useState(false);
    const [modal, setModal] = useState(false);
    const {config, session, status} = useContext(Context);
    if (status === "authenticated") {
        const role_id = session?.user?.role_id;
        if (role_id === 1) router.push("/saas/dashboard");
        if (role_id === 2) router.push("/admin/dashboard");
    }

    const meta = {
        columns: 1, formItemLayout: [4, 8], fields: [{
            name: "username", type: "text", label: t("username"), placeholder: t("enter_your_username"), required: true,
        }, {
            name: "password",
            type: "password",
            label: t("password"),
            placeholder: t("enter_your_password"),
            required: true,
        }, {
            type: "submit",
            label: t("Sign In"),
            btnClass: "btn btn-success w-100 btn btn-success",
            submitText: t("please_wait"),
        }]
    };
    return (<>
        <Head>
            <title>
                {config?.NEXT_PUBLIC_COMPANY_NAME + " | " + t("login")}
            </title>
        </Head>
        {status === "unauthenticated" && (<ParticlesAuth>
            <div className="auth-page-content">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 mb-4 text-white-50">
                                <div href="/" className="d-inline-block auth-logo">
                                    <Image src={SiteLogo()} alt={config?.NEXT_PUBLIC_COMPANY_NAME + " logo"}
                                           height={40}
                                           width={200}
                                    />
                                </div>
                                <p className="mt-3 fs-15 fw-medium">
                                    {config?.NEXT_PUBLIC_COMPANY_NAME}
                                </p>
                            </div>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={7} lg={5} xl={4}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">{t("welcome_back")}</h5>
                                        <p className="text-muted">
                                            {t("sign_in_to_continue")}
                                        </p>
                                    </div>
                                    <div className="p-2 mt-4">
                                        <div className="text-danger text-center">
                                            {LoginError}
                                            {error && <SignInError error={error}/>}
                                        </div>
                                        <Fb
                                            meta={meta}
                                            form={true}
                                            layout={"vertical"}
                                            onSubmit={async (values) => {
                                                const res = await signIn("credentials", {
                                                    redirect: false,
                                                    username: values.username,
                                                    password: values.password,
                                                    callbackUrl: `${window.location.origin}`,
                                                });
                                                if (res?.error) {
                                                    // res.error = "Username or password is incorrect";
                                                    setError(res.error);
                                                } else {
                                                    setError(null);
                                                }
                                                if (res.url) router.push(res.url);
                                            }}
                                        />


                                        <div className="mt-4 text-center">
                                            <div className="signin-other-title">
                                                <h5 className="fs-13 mb-4 title">
                                                    {t("or_sign_in_with")}
                                                </h5>
                                            </div>
                                            <div>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="facebook"
                                                >
                                                    {t("sign_in_with_facebook")}
                                                </UncontrolledTooltip>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="google"
                                                >
                                                    {t("sign_in_with_google")}
                                                </UncontrolledTooltip>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="twitter"
                                                >
                                                    {t("sign_in_with_twitter")}
                                                </UncontrolledTooltip>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="github"
                                                >
                                                    {t("sign_in_with_github")}
                                                </UncontrolledTooltip>
                                                <UncontrolledTooltip
                                                    placement="top"
                                                    target="linkedin"
                                                >
                                                    {t("sign_in_with_linkedin")}
                                                </UncontrolledTooltip>
                                                {Object.values(providers).map((provider) => provider.id !== "credentials" && (
                                                    <div key={provider.name} className="d-inline-block me-1">
                                                        <Button
                                                            id={provider.id}
                                                            key={provider.name}
                                                            color={'none'}
                                                            className={`btn btn-social-login me-1 btn-${provider.id} align-items-center justify-content-center`}
                                                            type="button"
                                                            onClick={() => signIn(provider.id, {
                                                                redirect: false,
                                                                callbackUrl: `${window.location.origin}`, // callbackUrl: `${window.location.origin}`,
                                                            })}
                                                        >
                                                            <i
                                                                className={`                                                           
                                                            ri-${provider.id}-fill text-${provider.name} align-middle fs-16 `}
                                                            />{" "}
                                                        </Button>
                                                    </div>))}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    {t("dont_have_an_account")}{" "}

                                    <Link
                                        onClick={() => {
                                            setModal(true);
                                            // setPackageId(1);
                                        }}
                                        className="fw-medium text-primary"
                                        href="#">
                                        {t("sign_up")}
                                    </Link>
                                </p>
                            </div>
                        </Col>
                    </Row>
                    {modal ? (<MyModal
                        size={"xl"}
                        modal={modal}
                        title={t("Signup")}
                        handleClose={() => {
                            setModal(false);
                        }}
                        children={<Register setModal={setModal}
                                            id={config?.NEXT_PUBLIC_DEFAULT_PACKAGE ? parseInt(config?.NEXT_PUBLIC_DEFAULT_PACKAGE) : 1}
                        />}
                    />) : null}
                </Container>
            </div>
        </ParticlesAuth>)}
    </>);
};

export default Login;

export const getServerSideProps = async ({locale}) => ({
    props: {
        csrfToken: await getCsrfToken() || null,
        providers: await getProviders() || null, ...(await serverSideTranslations(locale, ["common"])),
    },
});
const errors = {
    Signin: "Try signing with a different account.",
    OAuthSignin: "Try signing with a different account.",
    OAuthCallback: "Try signing with a different account.",
    OAuthCreateAccount: "Try signing with a different account.",
    EmailCreateAccount: "Try signing with a different account.",
    Callback: "Try signing with a different account.",
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "Check your email address.",
    CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
    default: "Unable to sign in.",
};
const SignInError = ({error}) => {
    const errorMessage = error && (errors[error] ?? errors.default);
    return <div>{errorMessage}</div>;
};