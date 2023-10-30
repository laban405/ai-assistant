import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import React, { useEffect, useState } from "react";

import { AllDepartment, GetCurrencies, GetData, Info } from "../config";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import moment from "moment";
import BreadCrumb from "../BreadCrumb";
import Helper from "../../lib/Helper";
import Fb from "../Fb";
import MyTable from "../MyTable";

import { useRouter } from "next/router";

export const LeaveSettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("leavePolicy");

    return (
        <Card>
            <CardBody>
                <Nav pills className="nav-pills-custom">
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "holiday" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("holiday");
                            }}
                        >
                            <i className="bx bx-calendar me-1" />
                            {t("holidays")}
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "leavePolicy" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("leavePolicy");
                            }}
                        >
                            <i className="bx bx-file me-1" />
                            {t("policy")}
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("settings");
                            }}
                        >
                            <i className="bx bx-cog me-1" />
                            {t("approval_chain")}
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={activeTab}>
                        {activeTab === "holiday" && <HolidayTab />}
                        {activeTab === "leavePolicy" && <LeavePolicyTab />}
                        {activeTab === "settings" && <EmailSettingsTab />}
                    </TabPane>
                </TabContent>
            </CardBody>
        </Card>
    );
};

const HolidayTab = () => {
    const { t } = useTranslation();
    /// card with custom button right side and calendar
    return (
        <React.Fragment>
            <Card className={"row"}>
                <CardHeader>
                    <div className="float-end">
                        <ButtonGroup className="me-2">
                            <Button
                                color="primary"
                                size="sm"
                                className="btn-rounded waves-effect waves-light"
                            >
                                <i className="bx bx-left-arrow-alt me-1" />
                            </Button>
                            <span className="btn btn-primary btn-rounded btn-sm">
                                <i className="bx bx-calendar me-1" />
                                {moment().format("MMMM YYYY")}
                            </span>
                            <Button
                                color="primary"
                                size="sm"
                                className="btn-rounded waves-effect waves-light"
                            >
                                <i className="bx bx-right-arrow-alt me-1" />
                            </Button>
                        </ButtonGroup>

                        <Button
                            color="primary"
                            size="sm"
                            className="btn-rounded waves-effect waves-light"
                        >
                            <i className="bx bx-plus me-1" /> {t("add_holiday")}
                        </Button>
                    </div>
                    <span className="card-title mb-0">{t("holiday_list")}</span>
                </CardHeader>
                <CardBody>
                    <div id="calendar"></div>
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

const LeavePolicyTab = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const url = "/api/admin/leavePolicies";
    let info = "";
    const { leave_policy_id } = router.query || {};
    let updateInfo = Info(url, leave_policy_id);
    if (leave_policy_id) {
        info = updateInfo;
    } else {
        info = "";
    }

    const [modal, setModal] = useState(false);

    const columns = [
        {
            linkId: "leave_policy_id",
            accessor: "leave_policy_id",
            checkbox: true,
        },
        {
            label: t("name"),
            link: "/admin/accounts/details/",
            linkId: "leave_policy_id",
            accessor: "policy_name",
            sortable: true,
        },
        {
            label: t("leave_quota_days"),
            accessor: "leave_quota",
            sortable: true,
            sortbyOrder: "desc",
        },
        {
            label: t("accrual"),
            accessor: "accrual",
            sortable: true,
            lang: true,
        },
        {
            label: t("status"),
            accessor: "status",
            linkId: "leave_policy_id",
            update: [
                {
                    value: 1,
                    label: t("active"),
                    color: "success",
                },
                {
                    value: 0,
                    label: t("inactive"),
                    color: "danger",
                },
            ],
            className: "text-center",
            sortable: true,
            sortbyOrder: "desc",
        },
        {
            label: t("action"),
            accessor: "action",
            className: "text-center",
            linkId: "leave_policy_id",
            btn: true,
            actions: [
                {
                    name: "editModal",
                    link: "/admin/settings/",
                    setModal: setModal,
                },
                { name: "delete", link: url },
            ],
        },
    ];
    const actions = [
        {
            name: "btn",
            label: t("new_policy"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            size: "xl",
            setModal: setModal,
        },
    ];
    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <MyTable columns={columns} url={url} actions={actions} />
                </CardBody>
            </Card>
            {modal ? (
                <>
                    {
                        <PolicyModal
                            size={"xl"}
                            url={url}
                            modal={modal}
                            loading={info?.isLoading}
                            data={info?.data}
                            setModal={setModal}
                            handleClose={() => {
                                router.push(`/admin/settings/`);
                                setModal(false);
                            }}
                        />
                    }
                </>
            ) : null}
        </React.Fragment>
    );
};

const PolicyModal = ({ url, data, modal, handleClose, setModal, loading }) => {
    const { t } = useTranslation();
    const meta = {
        columns: 1, // formItemLayout: [6, 6],
        fields: [
            {
                name: "policy_name",
                type: "text",
                label: t("name"),
                placeholder: t("e_g_annual_leave"),
                required: true,
                value: data?.policy_name,
            },
            {
                name: "policy_description",
                type: "textarea",
                label: t("description"),
                placeholder: t("e_g_annual_leave_is_paid_time_off_work"),
                small: true,
                value: data?.policy_description,
            },
            {
                name: "leave_quota",
                type: "number",
                label: t("leave_quota_days"),
                placeholder: t("leave_quota"),
                required: true,
                value: data?.leave_quota,
            },
            {
                name: "accrual",
                type: "select",
                label: t("accrual"),
                placeholder: t("accrual"),
                required: true,
                options: [
                    { value: "no", label: t("n_a") },
                    { value: "monthly", label: t("monthly") },
                    {
                        value: "quarterly",
                        label: t("quarterly"),
                    },
                    { value: "half_yearly", label: t("half_yearly") },
                    { value: "yearly", label: t("yearly") },
                ],
                value: data?.accrual,
            },
            {
                name: "eligible_designations",
                label: t("eligible_designations"),
                required: true,
                type: "select",
                function: AllDepartment,
                isMulti: true,
                value: data?.eligible_designations,
            },
            {
                name: "eligible_gender",
                label: t("eligible_gender"),
                type: "select",
                options: Helper.Gender(t),
                value: data?.eligible_gender,
            },
            {
                name: "accrues_from_employee_start_date",
                type: "checkbox",
                label: t("accrues_from_employee_start_date"),
                customClass: "form-switch mt-2",
                value: data?.accrues_from_employee_start_date,
            },
            {
                name: "accrues_reset_every_cycle",
                type: "checkbox",
                label: t("accrues_resets_every_cycle"),
                customClass: "form-switch mt-2",
                onClick: (e) => {
                    if (e.target.checked) {
                        document.querySelectorAll(".accrue_start_month").forEach((el) => {
                            el.classList.remove("d-none");
                        });
                    } else {
                        document.querySelectorAll(".accrue_start_month").forEach((el) => {
                            el.classList.add("d-none");
                        });
                    }
                },
                value: data?.accrues_reset_every_cycle,
            },
            {
                name: "accrue_start_month",
                type: "select",
                label: t("accrue_start_month"),
                options: Helper.months(t),
                fieldClass: `accrue_start_month ${data?.accrues_reset_every_cycle ? "" : "d-none"
                    }`,
                value: data?.accrue_start_month,
            },
            {
                name: "paid_leave",
                type: "checkbox",
                label: t("paid_leave"),
                customClass: "form-switch mt-2",
                value: data?.paid_leave,
            },
            {
                name: "weekend_count_as_leave",
                type: "checkbox",
                label: t("weekend_count_as_leave"),
                customClass: "form-switch mt-2",
                value: data?.weekend_count_as_leave,
            },
            {
                name: "holidays_count_as_leave",
                type: "checkbox",
                label: t("holidays_count_as_leave"),
                customClass: "form-switch mt-2",
                value: data?.holidays_count_as_leave,
            },
            {
                name: "status",
                type: "checkbox",
                label: t("active") + "?",
                customClass: "form-switch mt-2",
                value: data?.status,
            },
            {
                type: "submit",
                label: t("save"),
                setModal: setModal,
            },
        ],
    };
    const newPolicy = (
        <>
            <Fb
                meta={meta}
                form={true}
                to={"/admin/settings/"}
                url={url}
                id={data?.leave_policy_id}
            />
        </>
    );
    return (
        <MyModal
            size={"lg"}
            title={data?.leave_policy_id ? t("edit_policy") : t("add_policy")}
            modal={modal}
            handleClose={handleClose}
            loading={loading}
            children={newPolicy}
        />
    );
};
const EmailSettingsTab = () => {
    const url = "/api/settings/email";
    const formData = {
        email: {
            type: "email",
            label: "Email",
            placeholder: "Enter email",
            value: "",
            required: true,
        },
    };
    return (
        <React.Fragment>
            <Form
                url={url}
                to={"/admin/settings/email"}
                data={formData}
                cClass={{
                    inputClass: "col-lg-7",
                    wrapperClass: "row col-lg-12",
                    formClass: "row",
                }}
            />
        </React.Fragment>
    );
};



export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});