import React, {useEffect, useState} from "react";
import Fb from "../../../../components/Fb";
import {useTranslation} from "next-i18next";
import {MyModal} from "../../../../components/Fb";

const FooterCtaModal = ({data, modal, handleClose, setModal, loading}) => {
    const {t} = useTranslation();

    const meta = {
        columns: 1, flexible: true, formItemLayout: [3, 8], fields: [{
            type: "file", label: t("cta_image"), // required: true,
            name: "attachments", // dropzone: true
            value: data?.attachments,
        }, {
            name: "type", type: "hidden", value: "footerCta",
        }, {
            type: "text", name: "sub_title", value: data?.sub_title, label: t("sub_title"),
        }, {
            type: "text", name: "title", value: data?.title, label: t("title"), required: true,
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
            }, {
                type: "text", name: "button_one", value: data?.button_one, label: t("button"),
            }, {
                type: "text", name: "button_one_link", value: data?.button_one_link, label: t("button_link"),
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
            },

            {
                type: "submit", label: t("submit"), setModal: setModal,
            },],
    };

    const newForm = (<Fb
        meta={meta}
        form={true}
        url={"/api/admin/sections"}
        to={"/saas/frontcms/footer-cta"}
        id={data?.id}
    />);

    return (<MyModal
        size={"lg"}
        title={data?.id ? t("edit_cta") : t("new_cta")}
        modal={modal}
        handleClose={handleClose}
        loading={loading}
        children={newForm}
    />);
};

export default FooterCtaModal;
