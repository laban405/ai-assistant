import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody, Container} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    DisplayTime, companyID,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";

let url = "/api/admin/document_editor";
export default function Index() {
    const {t} = useTranslation();
    const router = useRouter();
    const {params} = router.query || {};
    const company_id = companyID();
    // ------- for table data start ------------
    const columns = [{
        linkId: "document_editor_id", accessor: "document_editor_id", checkbox: true,
    }, {
        label: t("title"), accessor: "title", cell: (row) => (<div className="d-flex align-items-center p">
            <span>{row.template_name}</span>
        </div>), sortable: true, linkId: "document_editor_id", actions: [{
            name: "details", link: "/admin/documents/editedDetails/",
        }, {
            name: "edit", link: "/admin/documents/edit/",
        }, {
            name: "delete", link: url,
        },],
    }, {
        label: t("description"), accessor: "description", length: 80, sortable: true,
    }, {
        label: t("created_at"),
        accessor: "created_at",
        sortable: true,
        date: true,
        cell: (row) => (<div className="d-flex align-items-center p">
            <strong>{t("at") + " " + DisplayTime(row.created_at)}</strong>
        </div>),
    }, {
        label: t("action"), linkId: "document_editor_id", btn: true, actions: [{
            name: "details", link: "/admin/documents/editedDetails/",
        }, {
            name: "edit", link: "/admin/documents/edit/",
        }, {
            name: "delete", link: url,
        },],
    },];

    const actions = [{
        name: "btn",
        label: t("new_document"),
        className: "btn-success",
        icon: "ri-add-line",
        link: "/admin/documents/new",
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("documents")} pageTitle={"AllContent"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
                            actions={actions}
                            where={{
                                "tbl_document_editor.company_id": company_id,
                            }}
                        />
                    </CardBody>
                </Card>
            </Container>
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
