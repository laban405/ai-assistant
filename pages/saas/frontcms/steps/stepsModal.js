import React, {useContext, useEffect, useState} from "react";
import Fb, {MyModal} from "../../../../components/Fb";
import {useTranslation} from "next-i18next";
import {Context} from "../../../_app";

const StepsModal = ({data, modal, handleClose, setModal, loading, type}) => {
    const {t} = useTranslation();
    const {config, refetch} = useContext(Context);

    let url = "/api/admin/sections";
    let fields = [{
        name: "type", type: "hidden", value: "steps",
    }, {
        type: "text", name: "icon", value: data?.icon, label: t("icon_from_font_awesome"),
    }, {
        type: "file", label: t("Or_Icon_from_file"), name: "attachments", // dropzone: true
        value: data?.attachments,
    }, {
        label: t("gradient_color"),
        selectOne: true,
        type: "select",
        name: "gradient_color",
        customClass: "form-switch form-check-inline mt-2 ",
        value: data?.gradient_color,
        options: [{
            label: t("gradient_primary"), value: "bg-gradient-primary",
        }, {
            label: t("gradient_warning"), value: "bg-gradient-warning",
        }, {
            label: t("gradient_info"), value: "bg-gradient-info",
        },],
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
            type: "file", label: t("image"), name: "image", // dropzone: true
            value: data?.image,
        }, {
            label: t("background_color"),
            selectOne: true,
            type: "select",
            name: "background_color",
            customClass: "form-switch form-check-inline mt-2 ",
            value: data?.background_color,
            options: [{
                label: t("BG 1"), value: "bg-1",
            }, {
                label: t("BG 2"), value: "bg-2",
            }, {
                label: t("BG 3"), value: "bg-3",
            },],
        },

        {
            label: t("status"),
            selectOne: true,
            type: "checkbox",
            name: "status",
            customClass: "form-switch form-check-inline mt-2 ",
            value: data?.status,
            options: [{
                label: t("Published"), value: "published",
            }, {
                label: t("Un Published"), value: "unpublished",
            },],
        },];
    if (type === "heading") {
        url = "/api/config";
        fields = [{
            name: "NEXT_PUBLIC_CONTENT_STEPS_TITLE",
            type: "text",
            label: t("title"),
            value: config?.NEXT_PUBLIC_CONTENT_STEPS_TITLE,
        }, {
            name: "NEXT_PUBLIC_CONTENT_STEPS_DESCRIPTION",
            type: "textarea",
            label: t("description"),
            value: config?.NEXT_PUBLIC_CONTENT_STEPS_DESCRIPTION,
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
        refetch={refetch}
        url={url}
        to={"/saas/frontcms/steps"}
        id={data?.id}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.id ? t("edit_step") : t("create")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newForm}
    />);
};

export default StepsModal;
