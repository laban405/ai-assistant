import React, {useEffect, useState} from "react";
import Head from "next/head";
import {
    Card,
    Col,
    Row,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    TabContent,
    TabPane,
} from "reactstrap";
import Link from "next/link";
import {useRouter} from "next/router";
import {API, DisplayDate} from "./config";

const api = new API();
import {PermissionData, SubmitForm} from "./MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export function CRMDetails(props) {
    const {title, t, url, tabs, active, details, refetch, isLoading} = props;
    const [activeTab, setActiveTab] = useState(active);
    const router = useRouter();
    const fieldName = details?.id[0];
    const fieldID = details?.id[1];
    const {params, type} = router.query || {};
    useEffect(() => {
        if (type) {
            setActiveTab(type);
        }
    }, [type]);

    const updateStatus = (input, mail) => {
        const result = SubmitForm(input, url, fieldID);
        if (result) {
            refetch();
            router.push(router.asPath);
        }

    };

    return (<React.Fragment>
        <Head>
            <title>{title + "-" + t("details")}</title>
        </Head>
        <Row>
            <Col lg={12}>
                <Card className="mt-n4 mx-n4 ">
                    <div className="bg-soft-primary ">
                        <CardBody className="pb-0 px-4">
                            <Row className="mb-3">
                                <div className="col-md">
                                    <Row className="align-items-center g-3">
                                        <div className="col-md">
                                            <div>
                                                <h4 className="fw-bold">{title}</h4>
                                                <div className="hstack gap-3 flex-wrap">
                                                    {details?.clientName && (<>
                                                        <div>
                                                            <i className="ri-building-line align-bottom me-1"></i>
                                                            {details?.clientName.url ? (<Link
                                                                href={details ? details?.clientName.url : ""}
                                                            >
                                                                {details?.clientName.value}
                                                            </Link>) : (details?.clientName.value)}
                                                        </div>
                                                        <div className="vr"></div>
                                                    </>)}
                                                    <div>
                                                        {details?.startDate ? (<React.Fragment>
                                                            {details?.startDate[0]} :{" "}
                                                            <span className="fw-medium">
                                                                {DisplayDate(details?.startDate[1])}
                                                            </span>
                                                        </React.Fragment>) : ("-")}
                                                    </div>
                                                    <div className="vr"></div>
                                                    <div>
                                                        {details?.endDate ? (<React.Fragment>
                                                            {details?.endDate[0]} :{" "}
                                                            <span className="fw-medium">
                                                                {DisplayDate(details?.endDate[1])}
                                                            </span>
                                                        </React.Fragment>) : ("-")}
                                                    </div>
                                                    {details?.status ? (<React.Fragment>
                                                        <div className="vr"></div>
                                                        {details?.status.title} :{" "}

                                                        <div
                                                            className={"d-flex gap-1 align-items-center"}
                                                        >
                                                            <span
                                                                className={`badge rounded-pill fs-12 ${details.status?.color ? 'bg-' + details.status?.color : "bg-danger"}`}
                                                            >
                                                                {t(details?.status.value)}
                                                            </span>

                                                            {details?.status?.options ? (<UncontrolledDropdown>
                                                                <DropdownToggle
                                                                    className="btn btn-link text-decoration-none text-reset p-0"
                                                                    color="link"
                                                                    size="sm"
                                                                >
                                                                    <i className="ri-more-2-fill"></i>
                                                                </DropdownToggle>
                                                                <DropdownMenu end>
                                                                    {details?.status?.options.map((option, index) => {
                                                                        return (<DropdownItem
                                                                            key={index}
                                                                            onClick={(e) => updateStatus({status: option.value}, details?.status?.mail)}
                                                                        >
                                                                            {t(option.label)}
                                                                        </DropdownItem>);
                                                                    })}
                                                                </DropdownMenu>
                                                            </UncontrolledDropdown>) : null}
                                                        </div>
                                                    </React.Fragment>) : null}

                                                    {details?.priority ? (<React.Fragment>
                                                        <div className="vr"></div>
                                                        {details?.priority.title} :{" "}
                                                        <div
                                                            className={"d-flex gap-1 align-items-center"}
                                                        >
                                                            <span
                                                                className={`badge rounded-pill fs-12 ${details.priority?.color ? 'bg-' + details.priority?.color : "bg-danger"}`}
                                                            >
                                                                {t(details?.priority.value)}
                                                            </span>

                                                            {details?.priority?.options ? (<UncontrolledDropdown>
                                                                <DropdownToggle
                                                                    className="btn btn-link text-decoration-none text-reset p-0"
                                                                    color="link"
                                                                    size="sm"
                                                                >
                                                                    <i className="ri-more-2-fill"></i>
                                                                </DropdownToggle>
                                                                <DropdownMenu end>
                                                                    {details?.priority?.options.map((option, index) => {
                                                                        return (<DropdownItem
                                                                            key={index}
                                                                            onClick={(e) => updateStatus({priority: option.value}, details?.priority?.mail)}
                                                                        >
                                                                            {t(option.label)}
                                                                        </DropdownItem>);
                                                                    })}
                                                                </DropdownMenu>
                                                            </UncontrolledDropdown>) : null}
                                                        </div>
                                                    </React.Fragment>) : null}
                                                    {details?.permission ? (<PermissionData
                                                        href={router.asPath + "?" + fieldName + "=" + fieldID}
                                                        asLink={router.asPath}
                                                        linkId={fieldName}
                                                        data={details}
                                                        url={url}
                                                        avatar={"xs"}
                                                        id={fieldID}
                                                        refetch={refetch}
                                                    />) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
                                <div className="col-md-auto">
                                    <div className="hstack gap-1 flex-wrap">
                                        {details?.editUrl && (<>
                                            <Link
                                                href={details?.editUrl}
                                                className={"btn py-0 text-body"}
                                            >
                                                <i className="ri-pencil-line"></i>
                                            </Link>
                                        </>)}
                                    </div>
                                </div>
                            </Row>
                            <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                                {tabs.map((tab, index) => {
                                    return (<NavItem key={index}>
                                        {tab?.options ? (<>
                                            <UncontrolledDropdown className={"nav-link "}>
                                                <DropdownToggle
                                                    tag="button"
                                                    className="btn py-0 text-body nav-link  btn-link"
                                                    id="dropdownMenuButton"
                                                >
                                                    {tab.label}{" "}
                                                    <i className="mdi mdi-chevron-down"></i>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {tab.options.map((option, index) => {
                                                        return (<Link
                                                            className={`dropdown-item ${activeTab === tab.value ? "active" : ""}`}
                                                            key={`dropdownDetailsaction${index}`}
                                                            href={option?.url ? option.url : "#"}
                                                            as={option?.url ? option.url.replace(`?type=${option.value}`, "") : "#"}
                                                            passHref
                                                        >
                                                            {option.label}
                                                        </Link>);
                                                    })}
                                                </DropdownMenu>
                                            </UncontrolledDropdown>{" "}
                                        </>) : (<>
                                            <Link
                                                className={`nav-link ${activeTab === tab.value ? "active" : ""}`}
                                                key={`Detailsaction${index}`}
                                                href={tab?.url ? tab.url : "#"}
                                                as={tab?.url ? tab.url.replace(`?type=${tab.value}`, "") : "#"}
                                                passHref
                                            >
                                                <i className={`tabIcon ${tab.icon} me-1`}> </i>
                                                {tab.label}
                                            </Link>
                                        </>)}
                                    </NavItem>);
                                })}
                            </Nav>
                        </CardBody>
                    </div>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col lg={12}>
                <TabContent activeTab={activeTab} className="text-muted">
                    <TabPane tabId={activeTab}>
                        {tabs.find((tab) => tab.value === activeTab)?.children}
                    </TabPane>
                </TabContent>
            </Col>
        </Row>
    </React.Fragment>);
}


export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});