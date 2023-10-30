import React, {useContext, useEffect, useState} from "react";
import Fb from "../../../../components/Fb";
import {useTranslation} from "next-i18next";
import {MyModal} from "../../../../components/Fb";
import {Context} from "../../../_app";

const ServicesModal = ({
                           data, modal, handleClose, setModal, loading, type,
                       }) => {
    const {t} = useTranslation();
    const {config, refetch} = useContext(Context);

    let url = "/api/admin/sections";
    let fields = [{
        name: "type", type: "hidden", value: "service",
    }, {
        type: "text", name: "icon", value: data?.icon, label: t("icon_from_font_awesome"),
    }, {
        type: "file", label: t("Or_Icon_from_file"), name: "attachments", // dropzone: true
        value: data?.attachments,
    }, {
        type: "text", name: "title", value: data?.title, label: t("title"), required: true,
    }, {
        name: "descriptions",
        type: "textarea",
        label: t("description"),
        value: data?.descriptions,
        editor: true,
        small: true,
        height: "100px",
    },

        {
            label: t("service_color"),
            selectOne: true,
            type: "select",
            name: "service_color",
            customClass: "form-switch form-check-inline mt-2 ",
            value: data?.status,
            options: [{
                label: t("service_1"), value: "service-1",
            }, {
                label: t("service_2"), value: "service-2",
            }, {
                label: t("service_3"), value: "service-3",
            }, {
                label: t("service_4"), value: "service-4",
            }, {
                label: t("service_5"), value: "service-5",
            }, {
                label: t("service_6"), value: "service-6",
            },],
        }, {
            label: t("status"),
            selectOne: true,
            type: "checkbox",
            name: "status",
            customClass: "form-switch form-check-inline mt-2 ",
            value: data?.status,
            options: [{
                label: t("published"), value: "published",
            }, {
                label: t("un_published"), value: "unpublished",
            },],
        },];
    if (type === "heading") {
        url = "/api/config";
        fields = [{
            name: "NEXT_PUBLIC_SERVICES_TITLE",
            type: "text",
            label: t("title"),
            value: config.NEXT_PUBLIC_SERVICES_TITLE,
        }, {
            name: "NEXT_PUBLIC_SERVICES_DESCRIPTION",
            type: "textarea",
            label: t("description"),
            value: config.NEXT_PUBLIC_SERVICES_DESCRIPTION,
            editor: true,
            small: true,
            height: "100px",
        },];
    }

    const meta = {
        columns: 1, flexible: true, formItemLayout: [3, 8], fields: [...fields, {
            type: "submit", label: t("submit"), setModal: setModal,
        },],
    };

    const newForm = (<Fb
        meta={meta}
        form={true}
        url={url}
        refetch={refetch}
        to={"/saas/frontcms/services"}
        id={data?.id}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.id ? t("edit_service") : t("create")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newForm}
    />);
};

export default ServicesModal;
