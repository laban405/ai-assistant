import React, {useEffect, useState} from "react";
import MyTable from "../../../../components/MyTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Card, CardBody, CardHeader, Container,
} from "reactstrap";
import BreadCrumb from "../../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    Info,
} from "../../../../components/config";
import StepsModal from "./stepsModal";

let info = "";
let url = "/api/admin/sections";
export default function Steps() {
    const {t} = useTranslation();
    const router = useRouter();
    const [modal, setModal] = useState(false);
    const [modalHeading, setModalHeading] = useState("");

    const {id, permission} = router.query || {};
    let updateInfo = Info(url, id);
    if (id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }

    // ------- for table data start ------------
    const columns = [{
        linkId: "id", accessor: "id", checkbox: true,
    }, {
        label: t('title'), accessor: "title", sortable: true, linkId: "id", flex: 1, actions: [{
            name: "editModal", link: "/saas/frontcms/steps/", setModal: setModal,
        }, {name: "delete", link: "/api/admin/sections/"},],
    }, {
        label: t('image'), accessor: "image", sortable: true, linkId: "id", image: true,
        download: false,
    }, {
        label: t('icon'), accessor: "icon", sortable: true,
    }, {
        label: t("status"), accessor: "status", update: [{
            label: t("published"), value: "published", color: "success",
        }, {
            label: t("un_published"), value: "unpublished", color: "danger",
        },], linkId: "id",
    }, {
        label: t("action"), accessor: "action", className: "text-center", linkId: "id", btn: true, actions: [{
            name: "editModal", link: "/saas/frontcms/steps/", setModal: setModal,
        }, {name: "delete", link: "/api/admin/sections/"},],
    },];

    const actions = [{
        name: "btn",
        label: t("new_step"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        size: "xl",
        setModal: setModal,
        onClick: () => {
            setModalHeading("");
        },
    }, {
        name: "btn",
        label: t("step_heading"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        size: "xl",
        setModal: setModal,
        onClick: () => {
            setModalHeading("heading");
        },
    },];

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("step")} pageTitle={t("step_list")}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={url}
                            actions={actions}
                            where={{type: "steps"}}
                        />
                    </CardBody>
                </Card>
            </Container>
        </div>
        {modal ? (<>
            {<StepsModal
                size={"md"}
                type={modalHeading}
                modal={modal}
                title={t("edit_step")}
                loading={info?.isLoading}
                data={info?.data}
                setModal={setModal}
                handleClose={() => {
                    router.push(`/saas/frontcms/steps`);
                    setModal(false);
                }}
            />}
        </>) : null}
    </React.Fragment>);
}
export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
