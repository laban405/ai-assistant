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
    Container,
} from "reactstrap";
import React, { useEffect, useState } from "react";
import { GetData, Info } from "../config";
import BreadCrumb from "../BreadCrumb";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import MyTable from "../MyTable";
import { useRouter } from "next/router";
import { MyModal } from "../Fb";

export const GeneralSettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("expense");
    return (
        <Card>
            <CardBody>
                <Nav pills className="nav-pills-custom">
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "expense" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("expense");
                            }}
                        >
                            {/* <i className="bx bx-cog me-1" /> */}
                            Expense
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "income" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("income");
                            }}
                        >
                            {/* <i className="bx bx-file me-1" /> */}
                            Income
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            href="#"
                            className={activeTab === "approvalChain" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("approvalChain");
                            }}
                        >
                            {/* <i className="bx bx-file me-1" /> */}
                            {t("approval_chain")}
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={activeTab}>
                        {activeTab === "expense" && <ExpenseList />}
                        {activeTab === "income" && <IncomeList />}
                        {activeTab === "approvalChain" && <ApprovalChain />}
                    </TabPane>
                </TabContent>
            </CardBody>
        </Card>
    );
};

const ExpenseList = () => {
    let info = "";
    let url = "/api/admin/categories"; // this is DB url
    const [modal, setModal] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const { category_id, permission } = router.query || {};
    let updateInfo = Info(url, category_id);
    if (category_id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }
    if (info?.isLoading) {
        return <div>Loading...</div>;
    }

    const columns = [
        {
            linkId: "category_id",
            accessor: "category_id",
            checkbox: true,
        },

        {
            label: t("category_name"),
            accessor: "category_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "category_id",
            actions: [
                {
                    name: "editModal",
                    id: "category_id",
                    link: "/admin/settings", // id: 'category_id' // linkId is optional
                    setModal: setModal,
                },
                { name: "details", link: "/api/admin/details/" },
                { name: "delete", link: "/api/admin/categories/" },
            ],
        },
        {
            label: "descriptions",
            accessor: "descriptions",
            sortable: true,
        },

        {
            label: t("status"),
            accessor: "status",
            update: true,
            type: "checkbox",
            number: true,
            linkId: "category_id",
            sortable: true,
            sortbyOrder: "desc",
        },
    ];
    const formData = {
        category_name: {
            type: "text",
            value: info.data?.category_name,
            label: t("expense_name"),
            required: true, // unique: 'tbl_accounts',
        },

        type: {
            type: "hidden",
            value: "expense",
        },

        descriptions: {
            type: "textarea",
            label: t("descriptions"),
            value: info.data?.descriptions,
        },
        status: {
            type: "checkbox",
            label: t("status"), // required: true,
            value: info.data?.status,
            customClass: "form-switch",
            wrapperClass: "row col-lg-5 ",
            inputClass: "col-lg-7",
            options: [
                {
                    label: t(""),
                    value: 1,
                },
            ],
        },
        submit: {
            type: "submit",
            label: t("submit"),
            className: "modal-footer",
            setModal: setModal,
        },
    };

    const newExpense = (
        <Form
            data={formData}
            cClass={{
                // wrapperClass: "row mb-3",
                wrapperClass: "form-floating mb-3",
                labelClass: "col-lg-3",
                inputClass: "col-lg-9",
            }}
            url={url}
            to={"/admin/settings"}
            id={info.data?.category_id}
        />
    );

    return (
        <React.Fragment>
            <CardHeader>
                <h4 className="card-title mb-0 flex-grow-1">
                    {t("expense_list")}
                    <BtnModal
                        loading={info?.isLoading}
                        // size="lg"
                        title={t("new_expense")}
                        className={"btn btn-success btn-sm float-end"}
                    >
                        {newExpense}
                    </BtnModal>
                </h4>
            </CardHeader>
            <CardBody>
                {modal && category_id ? (
                    <MyModal
                        loading={info?.isLoading}
                        // size={permission ? "" : "lg"}
                        modal={modal}
                        title={t("edit_expense")}
                        handleClose={() => {
                            setModal(false);
                        }}
                    >
                        {newExpense}
                    </MyModal>
                ) : null}
                <MyTable
                    columns={columns}
                    url={"/api/admin/categories"}
                    where={{ type: "expense" }}
                    // actions={actions}
                    setModal={setModal}
                ></MyTable>
            </CardBody>
        </React.Fragment>
    );
};

const IncomeList = () => {
    let info = "";
    let url = "/api/admin/categories";
    const [modal, setModal] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const { category_id, permission } = router.query || {};
    let updateInfo = Info(url, category_id);
    if (category_id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }

    const columns = [
        {
            linkId: "category_id",
            accessor: "category_id",
            checkbox: true,
        },

        {
            label: t("edit_expense"),
            accessor: "category_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "category_id",
            actions: [
                {
                    name: "editModal",
                    id: "category_id",
                    link: "/admin/settings", // id: 'category_id' // linkId is optional
                    setModal: setModal,
                },
                { name: "details", link: "/api/admin/details/" },
                { name: "delete", link: "/api/admin/categories/" },
            ],
        },
        {
            label: t("descriptions"),
            accessor: "descriptions",
            sortable: true,
        },

        {
            label: t("status"),
            accessor: "status",
            update: true,
            type: "checkbox",
            number: true,
            linkId: "category_id",
            sortable: true,
            sortbyOrder: "desc",
        },
    ];
    const formData = {
        category_name: {
            type: "text",
            value: info.data?.category_name,
            label: t("income_name"),
            required: true, // unique: 'tbl_accounts',
        },

        type: {
            type: "hidden",
            value: "income",
        },

        descriptions: {
            type: "textarea",
            label: t("descriptions"),
            value: info.data?.descriptions,
        },
        status: {
            type: "checkbox",
            label: t("status"), // required: true,
            value: info.data?.status,
            customClass: "form-switch",
            wrapperClass: "row col-lg-5 ",
            inputClass: "col-lg-7",
            options: [
                {
                    label: t(""),
                    value: 1,
                },
            ],
        },
        submit: {
            type: "submit",
            label: t("submit"),
            className: "modal-footer",
            setModal: setModal,
        },
    };

    const newIncome = (
        <Form
            data={formData}
            cClass={{
                // wrapperClass: "row mb-3",
                wrapperClass: "form-floating mb-3",
                labelClass: "col-lg-3",
                inputClass: "col-lg-9",
            }}
            url={url}
            to={"/admin/settings"}
            id={info.data?.category_id}
        />
    );

    return (
        <React.Fragment>
            <CardHeader>
                <h4 className="card-title mb-0 flex-grow-1">
                    {t("income_list")}
                    <BtnModal
                        loading={info?.isLoading}
                        // size="lg"
                        title={t("new_income")}
                        className={"btn btn-success btn-sm float-end"}
                    >
                        {newIncome}
                    </BtnModal>
                </h4>
            </CardHeader>
            <CardBody>
                {modal && category_id ? (
                    <MyModal
                        loading={info?.isLoading}
                        // size={permission ? "" : "lg"}
                        modal={modal}
                        title={t("edit_income")}
                        handleClose={() => {
                            setModal(false);
                        }}
                    >
                        {newIncome}
                    </MyModal>
                ) : null}
                <MyTable
                    columns={columns}
                    url={"/api/admin/categories"}
                    where={{ type: "income" }}
                    // actions={actions}
                    setModal={setModal}
                />
            </CardBody>
        </React.Fragment>
    );
};

const ApprovalChain = () => {
    let info = "";
    let url = "/api/admin/categories";
    const [modal, setModal] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const { category_id, permission } = router.query || {};
    let updateInfo = Info(url, category_id);
    if (category_id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }

    const columns = [
        {
            label: t("application_form"),
            accessor: "category_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "category_id",
            actions: [{ name: "delete", link: "/api/admin/categories/" }],
        },
    ];
    const formData = {
        category_name: {
            labelClass: "col-lg-3 col-form-label text-end",
            inputClass: "col-lg-7",
            wrapperClass: "row col-lg-10",
            type: "permission",
            label: t("approval_chain"), // required: true,
            value: info.data?.permission,
            permission_value: info.data?.category_name,
        },
        categoryd_name: {
            type: "text",
            value: info.data?.category_name,
            label: t("income_name"),
            required: true, // unique: 'tbl_accounts',
        },

        type: {
            type: "hidden",
            value: "approvalChain",
        },

        submit: {
            type: "submit",
            label: t("submit"),
            className: "modal-footer",
            setModal: setModal,
        },
    };

    const newIncome = (
        <Form
            data={formData}
            cClass={{
                // wrapperClass: "row mb-3",
                wrapperClass: "form-floating mb-3",
                labelClass: "col-lg-3",
                inputClass: "col-lg-9",
            }}
            url={url}
            to={"/admin/settings"}
            id={info.data?.category_id}
        />
    );

    return (
        <React.Fragment>
            <CardHeader>
                <h4 className="card-title mb-0 flex-grow-1">
                    {t("approval_chain")}
                    <BtnModal
                        loading={info?.isLoading}
                        // size="lg"
                        title={t("new_approval")}
                        className={"btn btn-success btn-sm float-end"}
                    >
                        {newIncome}
                    </BtnModal>
                </h4>
            </CardHeader>
            <CardBody>
                {/* {modal && category_id ? (
          <MyModal
            // size={permission ? "" : "lg"}
            modal={modal}
            title={t("editIncome")}
            handleClose={() => {
              setModal(false);
            }}
          >
            {newIncome}
          </MyModal>
        ) : null} */}
                <MyTable
                    columns={columns}
                    url={"/api/admin/categories"}
                    where={{ type: "approvalChain" }}
                    // actions={actions}
                    setModal={setModal}
                />
            </CardBody>
        </React.Fragment>
    );
};
export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
