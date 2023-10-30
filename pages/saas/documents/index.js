import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody, Container} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    API, DisplayTime,
} from "../../../components/config";
import MyTable from "../../../components/MyTable";

let url = "/api/admin/documents";
export default function Index() {
    const {t} = useTranslation();
    // ------- for table data start ------------
    const columns = [{
        linkId: "document_id", accessor: "document_id", checkbox: true,
    }, {
        label: t("title"), accessor: "title", cell: (row) => (<div className="d-flex align-items-center p">
            <i className={`${row.icon} fs-18 me-1 mt-1`}></i>
            <span>{row.template_name}</span>
        </div>), sortable: true, linkId: "document_id", actions: [{
            name: "details", link: "/saas/documents/details/",
        }, {
            name: "edit", link: "/saas/documents/lib/",
        }, {
            name: "delete", link: url,
        },],
    }, {
        label: t("description"), accessor: "description", length: 100, sortable: true,
    }, {
        label: t("created_at"),
        accessor: "created_at",
        sortable: true,
        date: true,
        cell: (row) => (<div className="d-flex align-items-center p">
            <strong>{t("at") + " " + DisplayTime(row.created_at)}</strong>
        </div>),
    }, {
        label: t("action"), linkId: "document_id", btn: true, actions: [{
            name: "details", link: "/saas/documents/details/",
        }, {
            name: "edit", link: "/saas/documents/lib/",
        }, {
            name: "delete", link: url,
        },],
    },];


    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("documents")} pageTitle={t("all_content")}/>
                <Card>
                    <CardBody>
                        <MyTable columns={columns} url={url} />
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
