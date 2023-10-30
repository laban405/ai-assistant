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
import React, { useContext, useEffect, useState } from "react";

import { AllDepartment, GetCurrencies, GetData } from "../config";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import moment from "moment";
import BreadCrumb from "../BreadCrumb";
import Helper from "../../lib/Helper";
import { Context } from "../../pages/_app";

export const GeneralSettings = () => {
    const value = useContext(Context);
    const { t } = useTranslation();
    const formData = {
        NEXT_PUBLIC_COMPANY_NAME: {
            type: 'text',
            label: t('name'),
            placeholder: t('name'),
            required: true,
            value: value?.config.NEXT_PUBLIC_COMPANY_NAME,
        }, NEXT_PUBLIC_COMPANY_EMAIL: {
            type: 'email',
            label: t('email'),
            placeholder: t('email'),
            required: true,
            value: value?.config.NEXT_PUBLIC_COMPANY_EMAIL,
        }, NEXT_PUBLIC_COMPANY_PHONE: {
            type: 'text',
            label: t('phone'),
            placeholder: t('phone'),
            required: true,
            value: value?.config.NEXT_PUBLIC_COMPANY_PHONE,
        }, NEXT_PUBLIC_COMPANY_ADDRESS: {
            type: 'textarea',
            label: t('address'),
            placeholder: t('address'),
            required: true,
            value: value?.config.NEXT_PUBLIC_COMPANY_ADDRESS,
        }, NEXT_PUBLIC_TAX_NUMBER: {
            type: 'number',
            label: t('tax_number'),
            placeholder: t('tax_number'),
            value: value?.config.NEXT_PUBLIC_TAX_NUMBER,
        }, submit: {
            type: "submit", label: t("submit"), className: "text-end",
        },
    }
    return (<Card>
        <CardHeader>
            <h5 className="card-title mb-0">{t('general_settings')}</h5>
        </CardHeader>
        <CardBody>
            <Form data={formData} url={'/api/config'}
                cClass={{
                    wrapperClass: "row mb-3", labelClass: "col-md-3 col-form-label text-end", inputClass: "col-md-7",
                }} />
        </CardBody>
    </Card>);

}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
