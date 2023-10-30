import React, {useContext, useEffect, useState} from "react";
import Fb, {MyModal} from "../../../../components/Fb";
import {useTranslation} from "next-i18next";
import {Context} from "../../../_app";

const UsecaseModal = ({
                          data, modal, handleClose, setModal, loading, type,
                      }) => {
    const {t} = useTranslation();
    let url = "/api/admin/sections";
    const {config, refetch} = useContext(Context);

    let fields = [{
        name: "type", type: "hidden", value: "usecase",
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
            name: "NEXT_PUBLIC_USE_CASE_MODEL_TITLE",
            type: "text",
            label: t("title"),
            value: config?.NEXT_PUBLIC_USE_CASE_MODEL_TITLE,
        }, {
            name: "NEXT_PUBLIC_USE_CASE_MODEL_DESCRIPTION",
            type: "textarea",
            label: t("description"),
            value: config?.NEXT_PUBLIC_USE_CASE_MODEL_DESCRIPTION,
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
        to={"/saas/frontcms/usecase"}
        id={data?.id}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.id ? t("edit_use_case") : t("create")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newForm}
    />);
};

export default UsecaseModal;
