import React, { useEffect, useState } from "react";
import MyTable from "../../../../components/MyTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Row,
} from "reactstrap";
import BreadCrumb from "../../../../components/BreadCrumb";
import { useRouter } from "next/router";
import {
    GetCurrencies,
    GetDefaultCurrency,
    Info,
} from "../../../../components/config";

import SliderModal from "./sliderModal";

let info = "";
let url = "/api/admin/sections";
export default function Slider() {
    const { t } = useTranslation();
    const router = useRouter();
    const [modal, setModal] = useState(false);

    const { id, permission } = router.query || {};
    let updateInfo = Info(url, id);
    if (id || permission) {
        info = updateInfo;
    } else {
        info = "";
    }

    // ------- for table data start ------------
    const columns = [
        {
            linkId: "id",
            accessor: "id",
            checkbox: true,
        },
        {
            label: "Title",
            accessor: "title",
            sortable: true,
            linkId: "id",
            flex: 1,
            actions: [
                {
                    name: "editModal",
                    link: "/saas/frontcms/slider/",
                    setModal: setModal,
                },
                { name: "delete", link: "/api/admin/sections/" },
            ],
        },

        {
            label: t("status"),
            accessor: "status",
            update: [
                {
                    label: t("published"),
                    value: "published",
                    color: "success",
                },
                {
                    label: t("un_published"),
                    value: "unpublished",
                    color: "danger",
                },
            ],
            linkId: "id",
        },
        {
            label: t("action"),
            accessor: "action",
            className: "text-center",
            linkId: "id",
            btn: true,
            actions: [
                {
                    name: "editModal",
                    link: "/saas/frontcms/slider/",
                    setModal: setModal,
                },
                { name: "delete", link: "/api/admin/sections/" },
            ],
        },
    ];

    const actions = [
        {
            name: "btn",
            label: t("new_slider"),
            className: "btn-success",
            icon: "ri-add-line",
            modal: true,
            size: "xl",
            setModal: setModal,
        },
    ];

    // ------- for modal data end ------------
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title={t("slider_list")} pageTitle={t("slider_list")} />
                    <Card>
                        <CardBody>
                            <MyTable
                                columns={columns}
                                url={url}
                                actions={actions}
                                where={{ type: "slider" }}
                            />
                        </CardBody>
                    </Card>
                </Container>
            </div>
            {modal ? (
                <>
                    {
                        <SliderModal
                            size={"md"}
                            modal={modal}
                            title={t("edit_slider")}
                            loading={info?.isLoading}
                            data={info?.data}
                            setModal={setModal}
                            handleClose={() => {
                                router.push(`/saas/frontcms/slider`);
                                setModal(false);
                            }}
                        />
                    }
                </>
            ) : null}
        </React.Fragment>
    );
}
export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
