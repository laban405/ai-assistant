import React, {Suspense, useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane, UncontrolledDropdown,
} from "reactstrap";
import Link from "next/link";
import Loading from "../../../components/Loading";
import {GetRows} from "../../../components/config";


export default function ChatTemplate({setMessageText, setToggleModal}) {
    const {t} = useTranslation();
    const [activeTab, setActiveTab] = useState("all");
    const [allData, setAllData] = useState();
    const [search, setSearch] = useState();
    const url = '/api/admin/categories';
    const {data: allTabs, isLoading, status} = GetRows(url, {
        where: {
            type: "chat",
        }
    }, {}, 'AllTabsForChatTemplate');
    const {data: allTemplate, isLoading: tLoading} = GetRows('/api/admin/templates', {
        where: {
            type: "chat",
        }, search_value: search,
    }, {}, 'AllTemplateForChatTemplate');

    useEffect(() => {
        if (allTabs && allTabs.length > 0) {
            // push all template to all tab by category id
            const all = allTabs.map((tab) => {
                const templates = allTemplate?.filter((template) => {
                    return template.category_id === tab.category_id;
                });
                return {
                    ...tab, templates: templates,
                };
            });
            setAllData(all);
        }
    }, [allTabs, allTemplate]);

    return (<div className="">
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
                                    {isLoading && <Loading/>}
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
                                                {t('all_templates')}
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
                                </Nav>

                            </div>
                        </Row>
                    </CardBody>
                </Card>
            </Col>

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
                                            className="card-body row row-cols-xxl-3 row-cols-lg-3 row-cols-md-2 row-cols-3">
                                            {item.templates?.map((template, index) => {
                                                return (<div className="col pointer"

                                                             onClick={() => {
                                                                 // setMessageText(template.prompt);
                                                                 // highlight the div when click
                                                                 const div = document.getElementById(`template-${template.template_id}`);
                                                                 // remove all chatTemplate bg-soft-secondary
                                                                 const all = document.querySelectorAll('.chatTemplate');
                                                                 all.forEach((item) => {
                                                                     item.classList.remove('bg-soft-secondary');
                                                                     // remove all button
                                                                     const buttons = item.querySelectorAll('button');
                                                                     buttons.forEach((button) => {
                                                                         button.remove();
                                                                     });
                                                                 });
                                                                 div.classList.toggle('bg-soft-secondary');
                                                                 // add button into the div name is use this template
                                                                 const button = document.createElement('button');
                                                                 button.classList.add('btn', 'btn-sm', 'btn-primary', 'mt-2');
                                                                 button.innerText = 'Use this template';
                                                                 button.addEventListener('click', () => {
                                                                     setMessageText(template.prompt);
                                                                     // hide the modal
                                                                     setToggleModal(false);

                                                                 });
                                                                 div.appendChild(button);

                                                             }}
                                                             key={index}>
                                                    <div className="card chatTemplate"
                                                         id={`template-${template.template_id}`}>
                                                        <div className="text-center py-4 card-body">
                                                            {template.icon && <div class="avatar-sm mx-auto mb-4">
                                                                <div
                                                                    className={`avatar-title rounded-circle fs-24 bg-soft-success text-success`}>
                                                                    <i className={template.icon}/>
                                                                </div>
                                                            </div>}
                                                            <h5
                                                                className="mt-4 text-truncate"> {template.name}</h5>

                                                            <p className="text-muted mb-0 text-truncate">
                                                                {template.description}
                                                            </p>
                                                        </div>
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
                                    className="card-body ">
                                    <Row className="row-cols-xxl-3 row-cols-lg-3 row-cols-md-2 row-cols-3">
                                        {item.templates?.map((template, index) => {
                                            return (<div className="col pointer"
                                                         onClick={() => {
                                                             // setMessageText(template.prompt);
                                                             // highlight the div when click
                                                             const div = document.getElementById(`listTemplate-${template.template_id}`);
                                                             // remove all chatTemplate bg-soft-secondary
                                                             const all = document.querySelectorAll('.chatTemplate');
                                                             all.forEach((item) => {
                                                                 item.classList.remove('bg-soft-secondary');
                                                                 // remove all button
                                                                 const buttons = item.querySelectorAll('button');
                                                                 buttons.forEach((button) => {
                                                                     button.remove();
                                                                 });
                                                             });
                                                             div.classList.toggle('bg-soft-secondary');
                                                             // add button into the div name is use this template
                                                             const button = document.createElement('button');
                                                             button.classList.add('btn', 'btn-sm', 'btn-primary', 'mt-2');
                                                             button.innerText = 'Use this template';
                                                             button.addEventListener('click', () => {
                                                                 setMessageText(template.prompt);
                                                                 // hide the modal
                                                                 setToggleModal(false);

                                                             });
                                                             div.appendChild(button);

                                                         }}
                                                         key={index}>
                                                <div className="card chatTemplate"
                                                     id={`listTemplate-${template.template_id}`}>

                                                    <div className="text-center py-4 card-body">
                                                        {template.icon && <div class="avatar-sm mx-auto mb-4">
                                                            <div
                                                                className={`avatar-title rounded-circle fs-24 bg-soft-success text-success`}>
                                                                <i className={template.icon}/>
                                                            </div>
                                                        </div>}
                                                        <h5
                                                            className="mt-4 text-truncate"> {template.name}</h5>

                                                        <p className="text-muted mb-0 text-truncate">
                                                            {template.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>);
                                        })}
                                    </Row>
                                </div>
                            </div>

                        </TabPane>);
                    })}
                </TabContent>
            </Col>
        </Row>
    </div>);


}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
