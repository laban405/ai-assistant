import React, {Suspense, useContext, useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Card, CardBody, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import Link from "next/link";
import {companyID, GetRows, Info} from "../../../components/config";
import {Context} from "../../_app";


export default function Libraries() {
    const {t} = useTranslation();
    const [activeTab, setActiveTab] = useState("all");
    const [allData, setAllData] = useState();
    const [search, setSearch] = useState();
    const url = '/api/admin/categories';
    const companyId = companyID();
    const {companyPackage} = useContext(Context);
    const {data: allTabs, isLoading, status} = GetRows(url, {
        where: {
            type: "document",
        }
    }, {}, 'allTabsForTemplate');

    const {data: allTemplate, isLoading: tLoading} = GetRows('/api/admin/templates', {
        where: {
            type: "document",
        }, whereIn: {
            company_id: [0, companyId],
        }, search_value: search,
    }, {}, 'allTemplateForTemplate');


    useEffect(() => {
        let companyTemplate = [];
        if (companyPackage && companyPackage.ai_templates) {
            companyTemplate = JSON.parse(companyPackage.ai_templates)
        }
        if (allTabs && allTabs.length > 0) {
            // push all template to all tab by category id
            const all = allTabs.map((tab) => {
                const templates = allTemplate?.filter((template) => {
                    return template.category_id === tab.category_id;
                    // return template.category_id === tab.category_id;
                }).map((template) => {
                    if (companyTemplate && companyTemplate.length > 0) {
                        const isCompanyTemplate = companyTemplate?.includes(template.template_id);
                        return {
                            ...template, isCompanyTemplate: isCompanyTemplate,
                        };
                    } else {
                        return {
                            ...template, isCompanyTemplate: false,
                        };
                    }
                });
                // , packageCapacity
                return {
                    ...tab, templates: templates,
                };
            });
            setAllData(all);
        }
    }, [allTabs, allTemplate, companyPackage]);


    return (<div className="page-content"><Container fluid>
        <BreadCrumb pageTitle={t('template') + " - " + t(activeTab)} title={t('new_chat')}/>
        <Row>
            <Col lg={12}>
                <Card>
                    <CardBody className="bg-soft-light">
                        <Row className="">
                            <Col xxl={12} md={12}>
                                <div className="search-box">
                                    <input
                                        type="text"
                                        className="form-control search bg-light border-light"
                                        id="searchJob"
                                        autoComplete="off"
                                        placeholder={t("search")}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setActiveTab("all");
                                        }}
                                    />
                                    <i className="ri-search-line search-icon"></i>
                                </div>
                            </Col>
                            <div className="mt-3 ms-0">
                                <Nav pills className="nav-pills-custom">
                                    {isLoading ? <>
                                        <div className="w-100">
                                            <div className={'d-flex justify-content-between'}>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                            </div>
                                            <div className={'d-flex justify-content-between'}>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton me-3" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                                <div className="skeleton" style={{
                                                    width: '100%', height: '2rem', marginBottom: '0.5rem'
                                                }}/>
                                            </div>
                                        </div>
                                    </> : <>
                                        <NavItem key={'all'}>
                                            <NavLink
                                                href={"#"}
                                                className={activeTab === 'all' ? "active" : ""}
                                                onClick={() => {
                                                    setActiveTab('all');
                                                }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <i className={'ri-folder-2-line me-1'}/>
                                                    {t('all')}
                                                    <span
                                                        className="badge bg-soft-success text-success ms-1">{allTemplate?.length || 0}</span>
                                                </div>
                                            </NavLink>
                                        </NavItem>
                                        {allData?.map((cate, index) => {
                                            return (<NavItem key={index}>
                                                <NavLink
                                                    href={"#"}
                                                    className={activeTab === cate.category_name ? "active" : ""}
                                                    onClick={() => {
                                                        setActiveTab(cate.category_name);
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <i className={cate.icon + " me-1"}/>
                                                        {t(cate.category_name)}
                                                        <span
                                                            className="badge bg-soft-success text-success ms-1">{cate.templates?.length}</span>
                                                    </div>
                                                </NavLink>
                                            </NavItem>);
                                        })}
                                    </>}
                                </Nav>

                            </div>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col lg={12}>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="all">
                        <Row className="row-cols-1">
                            {allData?.map((item, index) => {
                                return (<div className="col" key={index}>
                                    <div className="card bg-transparent">
                                        <div className="border-bottom-dashed  card-header  pb-2 ">
                                            <div className="d-flex align-items-center card-title mb-0 pointer"
                                                 onClick={() => {
                                                     setActiveTab(item.category_name);
                                                 }}
                                            >
                                                {item.icon && <i className={item.icon + " me-1"}/>}
                                                {t(item.category_name)}
                                                <span
                                                    className="badge bg-soft-success text-success ms-1 float-end">{item.total}</span>
                                            </div>
                                            <p className="text-muted mb-0">
                                                {item.descriptions}
                                            </p>
                                        </div>
                                        <div
                                            className="card-body row row-cols-xxl-4 row-cols-lg-3 row-cols-md-2 row-cols-3">
                                            {item.templates?.map((template, index) => {
                                                return (<div className="col" key={index}>
                                                    <div
                                                        className={"card " + (template.isCompanyTemplate ? ' ' : ' ribbon-box ribbon-fill right')}>
                                                        {!template.isCompanyTemplate && <div
                                                            className="ribbon shadow-none ribbon-danger">
                                                            <i className="ri-flashlight-fill me-1"></i>
                                                            {t('pro')}
                                                        </div>}
                                                        <Link
                                                            href={template.isCompanyTemplate ? `/admin/templates/${template.slug}` : `/admin/upgrades`}>
                                                            <div className="text-center py-4 card-body">
                                                                {template.icon && <div class="avatar-sm mx-auto mb-4">
                                                                    <div
                                                                        className={`avatar-title rounded-circle fs-24 ${template.isCompanyTemplate ? 'bg-soft-success text-success' : 'bg-soft-primary text-primary'}`}>
                                                                        <i className={template.icon}/>
                                                                    </div>
                                                                </div>}
                                                                <h5
                                                                    className="mt-4 text-truncate"> {template.name}</h5>

                                                                <p className="text-muted mb-0 text-truncate">
                                                                    {template.description}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>);
                                            })}
                                        </div>
                                    </div>
                                </div>);
                            })}
                        </Row>
                    </TabPane>

                    {allData?.map((item, index) => {
                        return (<TabPane tabId={item.category_name} key={index}>
                            <Row className="row-cols-xxl-4 row-cols-lg-3 row-cols-md-2 row-cols-3">
                                {item.templates?.map((template, index) => {
                                    return (<div className="col" key={index}>
                                        <div
                                            className={"card " + (template.isCompanyTemplate ? ' ' : ' ribbon-box ribbon-fill right')}>
                                            {!template.isCompanyTemplate && <div
                                                className="ribbon shadow-none ribbon-danger">
                                                <i className="ri-flashlight-fill me-1"></i>
                                                {t('pro')}
                                            </div>}
                                            <Link
                                                href={template.isCompanyTemplate ? `/admin/templates/${template.slug}` : `/admin/upgrades`}>
                                                <div className="text-center py-4 card-body">
                                                    {template.icon && <div class="avatar-sm mx-auto mb-4">
                                                        <div
                                                            className={`avatar-title rounded-circle fs-24 ${template.isCompanyTemplate ? 'bg-soft-success text-success' : 'bg-soft-primary text-primary'}`}>
                                                            <i className={template.icon}/>
                                                        </div>
                                                    </div>}
                                                    <h5
                                                        className="mt-4 text-truncate"> {template.name}</h5>

                                                    <p className="text-muted mb-0 text-truncate">
                                                        {template.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>);
                                })}
                            </Row>
                        </TabPane>);
                    })}
                </TabContent>
            </Col>
        </Row>
    </Container>
    </div>);


}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
