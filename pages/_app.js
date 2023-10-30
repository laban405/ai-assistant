import {appWithTranslation} from "next-i18next";
import "../styles/scss/themes.scss";
import "../styles/globals.css";
import {SessionProvider, useSession} from "next-auth/react";
import React, {createContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {QueryClient, QueryClientProvider} from "react-query";
import Header from "../components/Header";
import "swiper/css/bundle";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import NextNProgress from "nextjs-progressbar";
import {GetConfig, Info} from "../components/config";
import {notify} from "../components/Fb";
import Head from "next/head";

export const Context = createContext();

function MyApp({Component, pageProps}) {


    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnmount: false,
                refetchOnReconnect: false,
                retry: false,
                staleTime: 5 * 1000,
            },
        },
    });

    return (<QueryClientProvider client={queryClient}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
            <AuthLayout>
                <NextNProgress
                    color="#29D"
                    startPosition={0.3}
                    stopDelayMs={200}
                    height={3}
                />
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
                </Head>
                <Component {...pageProps} />
            </AuthLayout>
        </SessionProvider>
    </QueryClientProvider>);
}

export default appWithTranslation(MyApp);

const onChangeLayoutMode = (value) => {
    if (changeLayoutMode) {
        // dispatch(changeLayoutMode(value));
    }
};

function AuthLayout({children}) {
    const [cPackage, setCPackage] = useState();
    const [headerClass, setHeaderClass] = useState("");
    const layoutModeType = "dark";
    const layoutType = "vertical";
    const router = useRouter();
    const {data: session, status, token} = useSession();
    const isUser = !!session?.user;
    const adminPaths = ["/admin"];
    const saasPaths = ["/saas"];
    const matchPath = adminPaths.some((path) => router.pathname.startsWith(path));
    const matchPathSaas = saasPaths.some((path) => router.pathname.startsWith(path));
    const company_id = session?.user?.company_id;
    const {data: config, isLoading, refetch} = GetConfig();

    const {
        data: companyPackage, refetch: companyRefetch, isLoading: companyLoading
    } = Info("/api/admin/companiesHistories", {
        "cmpny.company_id": company_id, "cmpnyDetail.active": 1,
    }, {
        usedContent: {
            url: "/api/admin/used_contents", where: {
                "usdContent.company_id": company_id, month: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
            },
        },
    }, !!company_id);

    useEffect(() => {
        if (status === "loading") return; // Do nothing while loading
        if (isLoading) return; // Do nothing while loading
        if (company_id && config?.NEXT_PUBLIC_MAINTENANCE === "1") {
            router.push("/maintenance");
        }
        const role_id = session?.user?.role_id; // 1 = saas, 2 = admin
        const isSaas = role_id === 1;
        const isAdmin = role_id === 2;

        if (isAdmin && companyLoading) return;

        if ((!isUser && matchPath) || (!isUser && matchPathSaas)) {
            router.push("/auth/login");
        } else if (isUser && router.pathname === "/auth/login") {
            if (isSaas) {
                router.push("/saas/dashboard");
            } else if (isAdmin) {
                router.push("/admin/dashboard");
            }
        }
        if (isAdmin && matchPathSaas) {
            router.push("/admin/dashboard");
        }
        if (isAdmin && matchPath && companyPackage) {
            if (companyPackage?.ai_chat !== 1 && router.pathname.match(/\/admin\/chat\/?/)) {
                notify("warning", "You are not allowed to access this page");
                router.push("/admin/dashboard");
            }
            if (companyPackage.ai_transcriptions !== 1 && router.pathname.match(/\/admin\/transcripts\/?/)) {
                notify("warning", "You are not allowed to access this page");
                router.push("/admin/dashboard");
            }
            if (companyPackage.text_to_speech !== 1 && router.pathname.match(/\/admin\/text_to_speech\/?/)) {
                notify("warning", "You are not allowed to access this page");
                router.push("/admin/dashboard");
            }
            if (companyPackage.images_per_month === 0 && router.pathname.match(/\/admin\/images\/?/)) {
                notify("warning", "You are not allowed to access this page");
                router.push("/admin/dashboard");
            }
            if ((companyPackage.words_per_month === 0 && router.pathname.match(/\/admin\/documents\/?/)) || (companyPackage.words_per_month === 0 && router.pathname.match(/\/admin\/templates\/?/))) {
                notify("warning", "You are not allowed to access this page");
                router.push("/admin/dashboard");
            }
        }
    }, [isUser, status, companyPackage, config]);
    if ((isUser && matchPathSaas) || (isUser && matchPath)) {
        return (<Context.Provider
            value={{
                config, companyPackage: companyPackage, companyRefetch, companyLoading, session, isLoading, refetch
            }}>
            <div id="layout-wrapper">
                <Header
                    headerClass={headerClass}
                    layoutModeType={layoutModeType}
                    onChangeLayoutMode={onChangeLayoutMode}
                />
                <Sidebar layoutType={layoutType}/>
                <div className="main-content">
                    {children}
                    <Footer/>
                </div>
            </div>
        </Context.Provider>);
    } else {
        return <Context.Provider value={{config, session, status}}>{children}</Context.Provider>;
    }
}
