import React, { useEffect, useState } from 'react';
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
    CardHeader,

    TabContent,
    TabPane,
    Table
} from "reactstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import { API, DisplayDate } from "./config";

const api = new API();

import BreadCrumb from "./BreadCrumb";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export function DetailsTickets(props) {
    const { title, t, url, tabs, active, details, refetch, info, quickView } = props;
    const [activeTab, setActiveTab] = useState(active);
    const router = useRouter();
    const fieldName = details?.id[0];
    const fieldID = details?.id[1];
    const { params, type } = router.query || {};
    useEffect(() => {
        if (type) {
            setActiveTab(type);
        }
    }, [type]);


    const updateStatus = (status, mail) => {
        const input = {
            status
        }
        const result = SubmitForm(input, url, fieldID);
        if (result) {
            // f (result.affectedRows) {
            // reload page to update status withou refresh
            refetch();
            router.push(router.asPath);
            // }
        }
    };

    return (<React.Fragment>
        {quickView ? tabs.find(tab => tab.value === activeTab)?.children : <>
            <Head>
                <title>{title + '-' + t('details')}</title>
            </Head>
            <BreadCrumb title={t('tickets')}
                pageTitle={t("ticket_details")} />
            <Row>
                <Col lg={12}>
                    <Card className="mt-n4 mx-n4 mb-n5">
                        <div className="bg-soft-warning">
                            <CardBody className="pb-4 mb-5">
                                <Nav className="nav-tabs-custom border-bottom-0" role="tablist">
                                    {tabs.map((tab, index) => {
                                        return (<NavItem key={index}>
                                            {tab?.options ? <>
                                                <UncontrolledDropdown className={'nav-link '}>
                                                    <DropdownToggle tag="button"
                                                        className="btn py-0 text-body nav-link  btn-link"
                                                        id="dropdownMenuButton">
                                                        {tab.label} <i className="mdi mdi-chevron-down"></i>
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        {tab.options.map((option, index) => {
                                                            return (<Link
                                                                className={`dropdown-item ${activeTab === tab.value ? 'active' : ''}`}
                                                                key={`dropdownDetailsaction${index}`}
                                                                href={option?.url ? option.url : '#'}
                                                                as={option?.url ? option.url.replace(`?type=${option.value}`, '') : '#'}
                                                                passHref
                                                            >
                                                                {option.label}
                                                            </Link>)
                                                        })}
                                                    </DropdownMenu>
                                                </UncontrolledDropdown> </> : <>
                                                <Link className={`nav-link ${activeTab === tab.value ? 'active' : ''}`}
                                                    key={`Detailsaction${index}`}
                                                    href={tab?.url ? tab.url : '#'}
                                                    as={tab?.url ? tab.url.replace(`?type=${tab.value}`, '') : '#'}
                                                    passHref>
                                                    <i className={`tabIcon ${tab.icon} me-1`}> </i>
                                                    {tab.label}
                                                </Link>
                                            </>}

                                        </NavItem>)
                                    })}
                                </Nav>
                            </CardBody>
                        </div>
                    </Card>
                    <TabContent activeTab={activeTab} className="text-muted">
                        <TabPane tabId={activeTab}>
                            {tabs.find(tab => tab.value === activeTab)?.children}
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
        </>}

    </React.Fragment>);
};




export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});