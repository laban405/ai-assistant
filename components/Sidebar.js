import React, {useState, useEffect} from "react";
import SimpleBar from "simplebar-react";
import {Button, Collapse, Container, UncontrolledCollapse} from "reactstrap";
import Image from "next/image";
import Link from "next/link";
import {useTranslation} from "next-i18next";

import {API, SiteLogo} from "./config";
import {useQuery} from "react-query";
import {useSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

const Sidebar = (props) => {
    const {layoutType} = props;
    const {t} = useTranslation();
    const [collapse, setCollapse] = useState([]);
    const api = new API();
    const {data: session, status, token} = useSession();
    const userId = session?.user?.user_id;

    const {data: navItems, isLoading, error, refetch} = useQuery("navItems", async () => {
        const input = {
            userId, menu: true
        }
        const result = await api.create("/api/admin/common", input);
        return result;
    }, {
        keepPreviousData: true, refetchOnMount: false, refetchOnWindowFocus: false,
    });

    useEffect(() => {
        var verticalOverlay = document.getElementsByClassName("vertical-overlay");
        if (verticalOverlay.length > 0) {
            verticalOverlay[0].addEventListener("click", function () {
                document.body.classList.remove("vertical-sidebar-enable");
            });
        }
    });


    const toggleCollapse = (index) => {
        let collapseCopy = [...collapse];
        collapseCopy[index] = !collapseCopy[index];
        setCollapse(collapseCopy);
    }
    const addEventListenerOnSmHoverMenu = () => {
        // add listener Sidebar Hover icon on change layout from setting
        if (document.documentElement.getAttribute("data-sidebar-size") === "sm-hover") {
            document.documentElement.setAttribute("data-sidebar-size", "sm-hover-active");
        } else if (document.documentElement.getAttribute("data-sidebar-size") === "sm-hover-active") {
            document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
        } else {
            document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
        }
    };

    return (<React.Fragment>
        <div className="app-menu navbar-menu">
            <div className="navbar-brand-box">
                <div className="logo logo-dark">
                    <span className="logo-sm">
                        <Image src={SiteLogo()} alt=""
                               width={22}
                               height="22"/>
                    </span>
                    <span className="logo-lg">
                        <Image
                            width={40}
                            src={SiteLogo()} alt="" height="40"/>
                    </span>
                </div>
                <div className="logo logo-light">
                    <span className="logo-sm">
                        <Image
                            src={SiteLogo()}
                            width={70}
                            alt="" height="22"/>
                    </span>
                    <span className="logo-lg">
                        <Image
                            src={SiteLogo()}
                            width={170}
                            alt="" height="40"/>
                    </span>
                </div>
                <button
                    onClick={addEventListenerOnSmHoverMenu}
                    type="button"
                    className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
                    id="vertical-hover"
                >
                    <i className="ri-record-circle-line"></i>
                </button>
            </div>
            {layoutType === "horizontal" ? (<div id="scrollbar">
                <Container fluid>
                    <div id="two-column-menu"></div>
                    <ul className="navbar-nav" id="navbar-nav">
                        <HorizontalLayout/>
                    </ul>
                </Container>
            </div>) : layoutType === "twocolumn" ? (<TwoColumnLayout layoutType={layoutType}/>) : (
                <SimpleBar id="scrollbar" className="h-100">
                    <Container fluid>
                        <div id="two-column-menu"></div>
                        <ul className="navbar-nav" id="navbar-nav">
                            {isLoading ?
                                <div>{t("loading_menu") + "..."}</div> : Array.isArray(navItems) && navItems.map((item, key) => {
                                return (<React.Fragment key={key}>
                                    {/* Main Header */}
                                    {item['isHeader'] ?
                                        <li className="menu-title"><span data-key="t-menu">{t(item.label)} </span>
                                        </li> : ((item.subItems.length ? (<li className="nav-item">
                                            <div
                                                className="nav-link menu-link"

                                                onClick={() => toggleCollapse(key)}
                                                id={`submenu_${item.menu_id}`}
                                                // href={item.link ? item.link : "/#"}
                                                data-bs-toggle="collapse"
                                                // data-bs-target={`submenu_${item.id}`}
                                                aria-expanded={collapse[key]}
                                            >
                                                <i className={item.icon}></i>
                                                <span data-key="t-apps">{t(item.label)}</span>
                                                {item.badgeName ?
                                                    <span className={"badge badge-pill bg-" + item.badgeColor}
                                                          data-key="t-new">{item.badgeName}</span> : null}
                                            </div>
                                            <UncontrolledCollapse toggler={`submenu_${item.menu_id}`}
                                                                  className="menu-dropdown"
                                            >
                                                <ul className="nav nav-sm flex-column test">
                                                    {/* subItms  */}
                                                    {item.subItems && ((item.subItems || []).map((subItem, key) => (
                                                        <React.Fragment key={key}>
                                                            {!subItem.subItems.length ? (<li className="nav-item">
                                                                <Link
                                                                    href={subItem.link ? subItem.link : "/#"}
                                                                    passHref={true}
                                                                    className="nav-link"
                                                                >
                                                                    {t(subItem.label)}
                                                                </Link>
                                                            </li>) : (<li className="nav-item">
                                                                <div
                                                                    // onClick={subItem.click}
                                                                    onClick={() => toggleCollapse(key)}
                                                                    id={`subItems_submenu_${subItem.menu_id}`}
                                                                    className="nav-link"
                                                                    href="/#"
                                                                    // passHref={true}
                                                                    data-bs-toggle="collapse"
                                                                    aria-expanded={collapse[key]}
                                                                ><a>{t(subItem.label)}</a>
                                                                </div>
                                                                <UncontrolledCollapse className="menu-dropdown"
                                                                                      toggler={`subItems_submenu_${subItem.menu_id}`}

                                                                >
                                                                    <ul className="nav nav-sm flex-column">
                                                                        {/* child subItms  */}
                                                                        {subItem.subItems && ((subItem.subItems || []).map((childItem, key) => (
                                                                            <li className="nav-item" key={key}>
                                                                                <Link
                                                                                    href={childItem.link ? childItem.link : "/#"}
                                                                                    className="nav-link">
                                                                                    {t(childItem.label)}
                                                                                </Link>
                                                                            </li>)))}
                                                                    </ul>
                                                                </UncontrolledCollapse>
                                                            </li>)}
                                                        </React.Fragment>)))}
                                                </ul>
                                            </UncontrolledCollapse>
                                        </li>) : (<li className="nav-item">
                                            <div
                                                className="menu-link">
                                                <Link className='nav-link'
                                                      passHref={true}
                                                      href={item.link ? item.link : "/#"}>
                                                    <i className={item.icon}></i>
                                                    <span>{t(item.label)}</span>
                                                    {item.badgeName ?
                                                        <span className={"badge badge-pill bg-" + item.badgeColor}
                                                              data-key="t-new">{item.badgeName}</span> : null}

                                                </Link>
                                            </div>
                                        </li>)))}
                                </React.Fragment>);
                            })}
                        </ul>
                    </Container>
                </SimpleBar>)}
        </div>
        <div className="vertical-overlay"></div>
    </React.Fragment>);
};

export default Sidebar;
// export default withTranslation()(Sidebar);


export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});

