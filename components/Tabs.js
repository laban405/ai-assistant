import React, {Suspense, useState} from "react";
import {
    Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane,
} from "reactstrap";

export const Tabs = ({tabs, active, setTab, col = [3, 9]}) => {
    const [activeTab, setActiveTab] = useState(active);

    return (<React.Fragment>
        <Row>
            <Col lg={col[0]}>
                <Card>
                    <>
                        <Nav pills vertical className="nav-pills-custom p-2">
                            {tabs.map((item, index) => {
                                return (<NavItem key={index}>
                                    <NavLink
                                        href={"#"}
                                        className={activeTab === item.value ? "active" : ""}
                                        onClick={() => {
                                            setActiveTab(item.value);
                                            if (setTab) setTab(item.value);
                                        }}
                                    >
                                        <i className={item.icon + " me-1"}/>
                                        {item.label}
                                    </NavLink>
                                </NavItem>);
                            })}
                        </Nav>
                    </>
                </Card>
            </Col>
            <Col lg={col[1]}>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={activeTab}>
                        <Suspense fallback={<div>Loading.. tabs.</div>}>
                            {tabs.find((tab) => tab.value === activeTab)?.children}
                        </Suspense>
                    </TabPane>
                </TabContent>
            </Col>
        </Row>
    </React.Fragment>);
};
