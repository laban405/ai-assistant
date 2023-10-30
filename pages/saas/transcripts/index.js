import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody, Container, UncontrolledTooltip} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    DisplayTime,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";
import Helper from "../../../lib/Helper";

let url = "/api/admin/speech_to_text";
export default function Transcripts() {
    const {t} = useTranslation();
    // ------- for table data start ------------
    const columns = [{
        linkId: "speech_to_text_id", accessor: "speech_to_text_id", checkbox: true,
    }, {
        label: t("title"), accessor: "title", bold: true, cell: (row) => {
            const description = row.description.length > 60 ? row.description.substring(0, 60) + "..." : row.description;
            return (<div className="d-flex align-items-center p">
                <UncontrolledTooltip target={"description" + row.speech_to_text_id}>
                    {row.description}
                </UncontrolledTooltip>
                <span id={"description" + row.speech_to_text_id}>
                            {Helper.removeHtmlTags(description)}
                        </span>
            </div>);
        }, sortable: true, linkId: "speech_to_text_id", actions: [{
            name: "edit", link: "/admin/documents/speech/",
        }, {
            name: "delete", link: url,
        },],
    }, {
        label: t("audio"), sortable: true, cell: (row) => {
            const {file} = row;
            const audio = JSON.parse(file);
            const url = audio[0].fileUrl;
            return (<div className="d-flex align-items-center p">
                <audio controls>
                    <source src={url} type="audio/mpeg"/>
                </audio>
            </div>);
        },
    }, {
        label: t("created_at"),
        accessor: "created_at",
        sortable: true,
        date: true,
        cell: (row) => (<div className="d-flex align-items-center p">
            <strong>{t("at") + " " + DisplayTime(row.created_at)}</strong>
        </div>),
    }, {
        label: t("action"), linkId: "speech_to_text_id", btn: true, actions: [{
            name: "download", field: "file",
        }, {
            name: "delete", link: url,
        },],
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("documents")} pageTitle={"all_content"}/>
                <Card>
                    <CardBody>
                        <MyTable columns={columns} url={url}/>
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
