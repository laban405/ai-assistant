import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Card, CardBody, Container, UncontrolledTooltip} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    DisplayTime,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";
import Helper from "../../../lib/Helper";

let url = "/api/admin/text_to_speech";
export default function Transcripts() {
    const {t} = useTranslation();
    // ------- for table data start ------------
    const columns = [{
        linkId: "text_to_speech_id", accessor: "text_to_speech_id", checkbox: true,
    }, {
        label: t("title"), accessor: "title", bold: true, cell: (row) => {
            const description = row?.text?.length > 60 ? row.text.substring(0, 60) + "..." : row.text;
            return (<div className="d-flex align-items-center p">
                <UncontrolledTooltip target={"description" + row.text_to_speech_id}>
                    {row.text}
                </UncontrolledTooltip>
                <span id={"description" + row.text_to_speech_id}>
                            {Helper.removeHtmlTags(description)}
                        </span>
            </div>);
        }, sortable: true, linkId: "text_to_speech_id", actions: [{
            name: "download", field: "file",
        }, {
            name: "delete", link: url,
        },],
    }, {
        label: t("audio"), sortable: true, cell: (row) => {
            const audio = row?.file && JSON.parse(row.file);
            const audioUrl = audio ? audio.fileUrl : row.dataURL;
            return (<div className="d-flex align-items-center p">
                <audio controls>
                    <source src={audioUrl} type="audio/mpeg"/>
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
        label: t("action"), linkId: "text_to_speech_id", btn: true, actions: [{
            name: "download", field: "file",
        }, {
            name: "delete", link: url,
        },],
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("text_to_speech")} pageTitle={"AllContent"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
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
