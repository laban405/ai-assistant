import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Card, CardBody, Col, Container, UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {useRouter} from "next/router";
import {
    API, DownloadFile, DisplayDateTime, DisplayTime,
} from "../../../components/config";
import Fb, {notify} from "../../../components/Fb";
import Image from "next/image";
import Link from "next/link";
import MyTable, {DisplayImage, Pagination} from "../../../components/MyTable";

const api = new API();
let url = "/api/admin/images";
export default function Images() {
    const {t} = useTranslation();
    const [limit, setLimit] = useState(12);
    const [grid, setGrid] = useState(false);

    const columns = [{
        linkId: "image_id", accessor: "image_id", checkbox: true,
    }, {
        label: t("title"), accessor: "image", image: true, cell: (row) => (<div className="ms-2 d-block">
            <strong className={"mb-1"}>{row.title}</strong>
            <div className={"text-muted "}>
                {t("by")} {row.fullname !== null ? row.fullname : t("unknown")}
            </div>
            <div className={"text-truncate"}>{row.description}</div>
        </div>), sortable: true,
    }, {
        label: t("resolution"), accessor: "image_size", sortable: true,
    }, {
        label: t("created_at"),
        accessor: "created_at",
        sortable: true,
        date: true,
        cell: (row) => (<div className="d-flex align-items-center p">
            <strong>{t("at") + " " + DisplayTime(row.created_at)}</strong>
        </div>),
    }, {
        label: t("action"), linkId: "image_id", btn: true, actions: [{
            name: "delete", link: url,
        }],
    },];
    let gridActions = {
        name: "btn", label: t("grid_view"), className: "btn-success", icon: "ri-grid-line",
    };
    if (grid) {
        gridActions = {
            name: "btn", label: t("list_view"), className: "btn-success", icon: "ri-list-check",
        };
    }

    const actions = [{
        ...gridActions, onClick: () => {
            setGrid(!grid);
        },
    },];
    const ImagesTab = ({images, ...params}) => {
        const {refetch} = params;
        return images ? (<div className="row gallery-wrapper">
            {images?.map((image, index) => {
                const img = image?.url || image.image;
                const [width, height] = image?.image_size
                    ?.split("x")
                    .map((s) => parseInt(s, 10)) ?? [256, 256];
                return (<Col
                    xxl={params?.col || 3}
                    xl={4}
                    sm={6}
                    className="element-item project designing development"
                    key={index}
                >
                    <Card className="gallery-box">
                        <div className="gallery-container">
                            <DisplayImage
                                src={img}
                                alt={image.title || t("generate_images")}
                                width={width || 256}
                                height={height || 256}
                                className="gallery-img img-fluid mx-auto"
                            />
                            <div className="gallery-overlay flex-column">
                                <p className="overlay-caption fs-13 my-auto w-100 ">
                                    {image.description}
                                </p>
                                <div className="d-flex justify-content-between">
                                    <UncontrolledTooltip target={`copy-${image.image_id}`}>
                                        {t("copy_to_clipboard_you_can_now_paste_it_anywhere")}
                                    </UncontrolledTooltip>

                                    <UncontrolledTooltip
                                        target={`download-${image.image_id}`}
                                    >
                                        {t("download_this_image")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`delete-${image.image_id}`}>
                                        {t("delete_this_image")}
                                    </UncontrolledTooltip>
                                    <div className="me-2">
                                        <i
                                            id={`copy-${image.image_id}`}
                                            onClick={async () => {
                                                try {
                                                    const blob = await fetch(img).then((r) => r.blob());
                                                    await navigator.clipboard.write([new ClipboardItem({
                                                        [blob.type]: blob,
                                                    }),]);
                                                    notify("success", t("copied_to_clipboard"));
                                                } catch (err) {
                                                    notify("warning", t("failed_to_copy_to_clipboard"));
                                                }
                                            }}
                                            className={`bx bx-copy text-white fs-20 me-2 pointer`}
                                        />
                                        <i
                                            id={`download-${image.image_id}`}
                                            onClick={async () => {
                                                // download image file
                                                await DownloadFile({
                                                    fileUrl: img, originalFilename: image.title + ".png",
                                                });
                                            }}
                                            className={`bx bx-download text-white fs-20 me-2 pointer`}
                                        />
                                        <i
                                            id={`delete-${image.image_id}`}
                                            onClick={async () => {
                                                if (confirm(t("are_you_sure_you_want_to_delete_this_item_?"))) {
                                                    await api
                                                        .delete("/api/admin/images", image.image_id)
                                                        .then(async (result) => {
                                                            if (result) {
                                                                notify("success", t("deleted_successfully"));
                                                                await refetch();
                                                            }
                                                        });
                                                }
                                            }}
                                            className={`bx bx-trash text-white fs-20 me-2 pointer`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box-content">
                            <div className="d-flex align-items-center mt-1">
                                <div className="flex-grow-1 text-muted">
                                    {t("by")}{" "}
                                    <Link
                                        href="saas/images#"
                                        className="text-body text-truncate"
                                    >
                                        {image?.fullname || t("unknown")}
                                    </Link>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="d-flex gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm fs-12 btn-link text-body text-decoration-none px-0"
                                        >
                                            <i className="ri-time-line text-muted align-bottom me-1"></i>{" "}
                                            {DisplayDateTime(image?.created_at)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>);
            })}
        </div>) : (<div className="text-center">
            <h3 className="text-center">{t("no_images_found")}</h3>
        </div>);
    };

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("all_images")} pageTitle={"images"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            grid={{
                                isGrid: grid,
                                type: "image",
                                limit: limit,
                                children: (images, refetch) => (<ImagesTab images={images} refetch={refetch}/>),
                            }}
                            columns={columns}
                            url={url}
                            actions={actions}
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
