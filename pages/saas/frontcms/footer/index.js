import React, {useContext, useEffect, useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Container,
} from "reactstrap";
import BreadCrumb from "../../../../components/BreadCrumb";
import Fb from "../../../../components/Fb";
import {Context} from "../../../_app";

let newPages = "";
export default function PagesDetails({id, page, quickView}) {
    const {t} = useTranslation();
    const {config, refetch} = useContext(Context);
    const meta = {
        columns: 1, flexible: true, formItemLayout: [3, 5], fields: [

            {
                render: () => {
                    return <div className="row">
                        <div className="col-3"></div>
                        <div className="col-5">
                            <button type="button" className="btn btn-primary mb-1 mt-3">Col 1</button>
                        </div>
                    </div>
                }
            }, {
                type: "text",
                name: "NEXT_PUBLIC_facebook_link",
                value: config?.NEXT_PUBLIC_facebook_link,
                label: t("facebook"),
            }, {
                type: "text",
                name: "NEXT_PUBLIC_github_link",
                value: config?.NEXT_PUBLIC_github_link,
                label: t("github"),
            },

            {
                type: "text",
                name: "NEXT_PUBLIC_linkedin_link",
                value: config?.NEXT_PUBLIC_linkedin_link,
                label: t("linkedin"),
            }, {
                type: "text",
                name: "NEXT_PUBLIC_youtube_link",
                value: config?.NEXT_PUBLIC_youtube_link,
                label: t("youtube"),
            }, {
                type: "text",
                name: "NEXT_PUBLIC_twitter_link",
                value: config?.NEXT_PUBLIC_twitter_link,
                label: t("twitter"),
            },

            {
                render: () => {
                    return <div className="row">
                        <div className="col-3"></div>
                        <div className="col-5">
                            <button type="button" className="btn btn-primary mb-1 mt-3">Col 2</button>
                        </div>
                    </div>
                }
            },

            {
                type: "text",
                name: "NEXT_PUBLIC_footer_col_2_title",
                value: config?.NEXT_PUBLIC_footer_col_2_title,
                label: t("title"),

            },


            {
                name: "NEXT_PUBLIC_footer_col_2_description",
                type: "textarea",
                value: config?.NEXT_PUBLIC_footer_col_2_description,
                editor: true,
                small: true,
                height: "100px",
                label: t("description"),

            },

            {
                render: () => {
                    return <div className="row">
                        <div className="col-3"></div>
                        <div className="col-5">
                            <button type="button" className="btn btn-primary mb-1 mt-3">Col 3</button>
                        </div>
                    </div>
                }
            },

            {
                type: "text",
                name: "NEXT_PUBLIC_footer_col_3_title",
                value: config?.NEXT_PUBLIC_footer_col_3_title,
                label: t("title"),
            },


            {
                name: "NEXT_PUBLIC_footer_col_3_description",
                type: "textarea",
                value: config?.NEXT_PUBLIC_footer_col_3_description,
                editor: true,
                small: true,
                height: "100px",
                label: t("description"),
            },

            {
                render: () => {
                    return <div className="row">
                        <div className="col-3"></div>
                        <div className="col-5">
                            <button type="button" className="btn btn-primary mb-1 mt-3">Col 4</button>
                        </div>
                    </div>
                }
            }, {
                type: "text",
                name: "NEXT_PUBLIC_footer_col_4_title",
                value: config?.NEXT_PUBLIC_footer_col_4_title,
                label: t("title"),
            },


            {
                name: "NEXT_PUBLIC_footer_col_4_description",
                type: "textarea",
                value: config?.NEXT_PUBLIC_footer_col_4_description,
                editor: true,
                small: true,
                height: "100px",
                label: t("description"),
            }, {
                render: () => {
                    return <div className="row">
                        <div className="col-3"></div>
                        <div className="col-5">
                            <button type="button" className="btn btn-primary mb-1 mt-3">Col 5</button>
                        </div>
                    </div>
                }
            },

            {
                type: "text",
                name: "NEXT_PUBLIC_footer_col_5_title",
                value: config?.NEXT_PUBLIC_footer_col_5_title,
                label: t("title"),
            }, {
                name: "NEXT_PUBLIC_footer_col_5_description",
                type: "textarea",
                value: config?.NEXT_PUBLIC_footer_col_5_description,
                editor: true,
                small: true,
                height: "100px",
                label: t("description"),
            }, {
                name: "NEXT_PUBLIC_copyright",
                type: "textarea",
                value: config?.NEXT_PUBLIC_copyright,
                editor: true,
                small: true,
                height: "100px",
                label: t("copy_right"),
            }, {
                // submit button
                col: 2, type: "submit", label: t("submit"), className: "text-end",
            },],
    };

    newPages = (<>
        <BreadCrumb
            title={t("footer")}
            pageTitle={t("update_footer")}
        />

        <Fb
            meta={meta}
            // onSubmit={onSubmit}
            form={true}
            header={t("update_footer")}
            url="/api/config"
            to={"/saas/frontcms/footer"}

        />
    </>);

    return (<React.Fragment>

        <>
            <div className="page-content">
                <Container fluid>{newPages}</Container>
            </div>
        </>

    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
