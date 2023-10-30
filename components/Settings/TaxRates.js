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
import { BtnModal, MyModal } from "../Fb";
import { GetData, Info } from "../config";
import BreadCrumb from "../BreadCrumb";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import MyTable from "../MyTable";
import { useRouter } from "next/router";

export const TaxRates = ({ moduleWhere }) => {
    let info = "";

    let url = "/api/admin/taxes"; // this is DB url
    const [modal, setModal] = useState(false);
    const [where, setWhere] = useState(moduleWhere);
    const { t } = useTranslation();
    const router = useRouter();
    const { tax_id, permission } = router.query || {};
    let updateInfo = Info(url, tax_id);
    if (tax_id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }

    const columns = [
        {
            linkId: "tax_id",
            accessor: "tax_id",
            checkbox: true,
        },

        {
            label: t("tax_rate_name"),
            accessor: "tax_name",
            sortable: true,
            sortbyOrder: "desc",
            linkId: "tax_id",
            actions: [
                {
                    name: "editModal",
                    id: "tax_id",
                    link: "/admin/settings", // id: 'tax_id' // linkId is optional
                    setModal: setModal,
                },
                { name: "delete", link: "/api/admin/taxes/" },
            ],
        },
        {
            label: t("tax_rate_percent"),
            accessor: "percentage",
            sortable: true,
        },
    ];
    const formData = {
        tax_name: {
            type: "text",
            value: info.data?.tax_name,
            label: t("tax_rate_name"),
            required: true, // unique: 'tbl_accounts',
        },

        percentage: {
            type: "number",
            label: t("tax_rate_percent"),
            value: info.data?.percentage,
            required: true, // unique: 'tbl_accounts',
        },
        permission: {
            labelClass: "col-lg-3 col-form-label text-end",
            inputClass: "col-lg-7",
            wrapperClass: "row col-lg-10",
            type: "permission",
            label: t("permission"), // required: true,
            value: info.data?.permission,
            permission_value: info.data?.permission_value,
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
            id={info.data?.tax_id}
        />
    );

    return (
        <React.Fragment>
            <Card>
                <CardHeader>
                    <h4 className="card-title mb-0 flex-grow-1">
                        <i className="ri-file-list-3-line" />
                        {t("tax_rates")}
                        <BtnModal
                            loading={info?.isLoading}
                            // size="lg"
                            title={t("new_tax_rate")}
                            className={"btn btn-success btn-sm float-end"}
                        >
                            {newExpense}
                        </BtnModal>
                    </h4>
                </CardHeader>
                <CardBody>
                    {modal && tax_id ? (
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
                        where={where}
                        url={url}
                        // actions={actions}
                        setModal={setModal}
                    ></MyTable>
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});

