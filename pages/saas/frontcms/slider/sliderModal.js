import React, { useEffect, useState } from "react";
import Fb, { MyModal } from "../../../../components/Fb";
import { useTranslation } from "next-i18next";

const SliderModal = ({ data, modal, handleClose, setModal, loading }) => {
    const { t } = useTranslation();

    const meta = {
        columns: 1,
        flexible: true,
        formItemLayout: [3, 8],
        fields: [
            {
                type: "file",
                label: t("slider"), // required: true,
                name: "attachments", // dropzone: true
                value: data?.attachments,
            },
            {
                name: "type",
                type: "hidden",
                value: "slider",
            },
            {
                type: "text",
                name: "sub_title",
                value: data?.sub_title,
                label: t("sub_title"),
            },
            {
                type: "text",
                name: "title",
                value: data?.title,
                label: t("title"),
                required: true,
            },
            {
                type: "text",
                name: "highlighted_tag",
                value: data?.highlighted_tag,
                label: t("highlighted_title"),
                required: true,
            },

            {
                name: "descriptions",
                type: "textarea",
                label: t("description"),
                value: data?.descriptions,
                editor: true,
                small: true,
                height: "100px",
                // col: 2,
                // labelCol: 2,
            },
            {
                type: "text",
                name: "button_one",
                value: data?.button_one,
                label: t("button_one_name"),
            },
            {
                type: "text",
                name: "button_one_link",
                value: data?.button_one_link,
                label: t("button_one_link"),
            },

            {
                type: "text",
                name: "button_two",
                value: data?.button_two,
                label: t("button_two_name"),
            },
            {
                type: "text",
                name: "button_two_link",
                value: data?.button_two_link,
                label: t("button_two_link"),
            },
            {
                label: t("status"),
                selectOne: true,
                type: "checkbox",
                name: "status",
                customClass: "form-switch form-check-inline mt-2 ",
                value: data?.status,
                options: [
                    {
                        label: t("published"),
                        value: "published",
                    },
                    {
                        label: t("un_published"),
                        value: "unpublished",
                    },
                ],
            },

            {
                type: "submit",
                label: t("submit"),
                setModal: setModal,
            },
        ],
    };

    const newSlider = (
        <Fb
            meta={meta}
            form={true}
            url={"/api/admin/sections"}
            to={"/saas/frontcms/slider"}
            id={data?.id}
        />
    );

    return (
        <MyModal
            size={"lg"}
            title={data?.id ? t("edit_slider") : t("new_slider")}
            modal={modal}
            handleClose={handleClose}
            loading={loading}
            children={newSlider}
        />
    );
};

export default SliderModal;
