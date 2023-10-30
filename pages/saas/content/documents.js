import React, {useEffect, useState} from "react";
import MyTable from "../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import Fb from "../../../components/Fb";
import Loading from "../../../components/Loading";
import axios from "axios";

let info = '';
let url = '/api/admin/documents';
export default function Documents() {
    const {t} = useTranslation();
    const router = useRouter();
    const [modal, setModal] = useState(false);

// ------- for table data start ------------
    const columns = [{
        linkId: 'account_id', accessor: "document_id", checkbox: true,
    }, {
        label: t('title'), accessor: "title", sortable: true
    }, {
        label: "description", accessor: "description"
    }, {
        label: "words", accessor: "words"
    }, {
        label: t('action'), accessor: "action", className: "text-center", linkId: 'document_id', btn: true, actions: [{
            name: 'editModal', link: '/admin/accounts/', setModal: setModal,
        }, {name: 'details', link: '/api/admin/details/'}, {name: 'delete', link: '/api/admin/accounts/'}]
    }];
    const actions = [{
        name: "btn",
        label: t("New Account"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        size: "xl",
        setModal: setModal
    }];

// ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t('Content')} pageTitle={t('Documents')}/>
                <Card>
                    <CardHeader>
                        <h4 className="card-title mb-0 flex-grow-1">{t('Document List')}</h4>
                    </CardHeader>
                    <CardBody>
                        <MyTable columns={columns} url={url}
                                 actions={actions}
                        />
                    </CardBody>
                </Card>
            </Container>
        </div>
    </React.Fragment>);
}
export const getStaticProps = async ({locale}) => ({
    props: {
        ...await serverSideTranslations(locale, ['common']),
    },
})

