import React, {useContext, useEffect, useState} from "react";
import Fb from "../../../../components/Fb";
import {useTranslation} from "next-i18next";
import {MyModal} from "../../../../components/Fb";
import {Context} from "../../../_app";

const BrandModal = ({data, modal, handleClose, setModal, loading, type}) => {
    const {t} = useTranslation();
    const {config, refetch} = useContext(Context);

    let url = "/api/admin/sections";
    //   let brand = data?.id ? t("Edit Brand") : t("New Brand");
    // type == heading
    let fields = [{
        type: "file", label: t("brand"), // required: true,
        name: "attachments", // dropzone: true
        value: data?.attachments,
    }, {
        name: "type", type: "hidden", value: "brand",
    },

        {
            name: "descriptions",
            type: "textarea",
            label: t("description"),
            value: data?.descriptions,
            editor: true,
            small: true,
            height: "100px", // col: 2,
            // labelCol: 2,
        },

        {
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
            name: "NEXT_PUBLIC_BRAND_TITLE", type: "text", label: t("title"), value: config.NEXT_PUBLIC_BRAND_TITLE,
        },];
    }

    const meta = {
        columns: 1, flexible: true, formItemLayout: [3, 8], fields: [...fields, {
            type: "submit", label: t("submit"), setModal: setModal,
        },],
    };

    const newData = (<Fb
        meta={meta}
        form={true}
        url={url}
        refetch={refetch}
        to={"/saas/frontcms/brand"}
        id={data?.id}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.id ? t("edit_brand") : t("create")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newData}
    />);
};

export default BrandModal;
