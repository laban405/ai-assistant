import React, {useEffect, useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Button, Card, CardBody, Container, DropdownItem, UncontrolledTooltip} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    API, companyID, DisplayTime,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";
import Fb, {MyModal} from "../../../components/Fb";
import Helper from "../../../lib/Helper";

let url = "/api/admin/templates";
const api = new API();
export default function Index() {
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [slug, setSlug] = useState();
    const [editData, setEditData] = useState({});
    const [viewData, setViewData] = useState({});
    const [viewModal, setViewModal] = useState(false);

    useEffect(() => {
        if (editData?.template_id) {
            setSlug(editData?.slug);
        } else {
            setSlug('');
        }
    }, [editData, modal]);

    const columns = [{
        linkId: "template_id", accessor: "template_id", checkbox: true,
    }, {
        label: t("title"), cell: (row) => (<div className="d-flex align-items-center p">
            <i className={`${row.icon} fs-18 me-1 mt-1`}></i>
            <span>{row.name}</span>
        </div>), sortable: true,
    }, {
        label: t("category"), accessor: "category_name", length: 20, sortable: true,
    }, {
        label: t("description"), accessor: "description", length: 80, sortable: true,
    }, {
        label: t("status"),
        accessor: "template_status",
        update: true,
        number: true,
        type: "checkbox",
        sortable: true,
        linkId: "template_id",
    }, {
        label: t("action"), flex: "d-inline-flex", linkId: "template_id", btn: true, actions: [{
            name: "delete", link: url,
        },], cell: (row, refetch) => {
            return (<>
                <Button
                    id={"view" + row?.template_id}
                    color="warning"
                    size="sm"
                    className="btn-rounded waves-effect waves-light me-2"
                    onClick={() => {
                        row.refetch = refetch;
                        setViewData(row);
                        setViewModal(!viewModal);
                    }}
                >
                    <i className="mdi mdi-eye-outline"/>
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target={"view" + row?.template_id}
                >
                    {t("view")}
                </UncontrolledTooltip>

                <Button
                    id={"edit" + row?.template_id}
                    color="success"
                    size="sm"
                    className="btn-rounded waves-effect waves-light me-2"
                    onClick={() => {
                        row.refetch = refetch;
                        setEditData(row);
                        setModal(!modal);
                    }}
                >
                    <i className="mdi mdi-pencil-outline"/>
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target={"edit" + row?.template_id}
                >
                    {t("edit")}
                </UncontrolledTooltip>
            </>);

        },
    },];
    const actions = [{
        name: "btn",
        label: t("new_template"),
        className: "btn-primary",
        icon: "ri-add-line",
        modal: true,
        onClick: () => {
            setEditData({});
            setSlug('')
        },
        setModal: setModal,
    },];


    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "name", label: t("name"), type: "text", value: editData?.name, onChange: (e) => {
                const slug = Helper.slugify(e.target.value);
                setSlug(slug);
            }, required: true,
        }, {
            name: "slug", label: t("slug"), type: "text", runOnChange: true, value: slug, onChange: (e) => {
                setSlug(e.target.value);
            }, required: true,
        }, {
            name: "icon", label: t("icon"), type: "text", value: editData?.icon,
        }, {
            required: true, name: "category_id", label: "Category", type: "select", getOptions: {
                url: "/api/admin/categories", label: "category_name", where: {
                    type: "document",
                },
            }, value: editData?.category_id,
        }, {
            name: "description",
            label: t("description"),
            type: "textarea",
            value: editData?.description,
            required: true,
        }],
    };
    if (!editData.template_id || editData?.custom === "Yes") {
        meta.fields.push({
            name: "prompt", label: t("prompt"), type: "textarea", value: editData?.prompt, required: true,
        }, {
            name: "custom", type: "hidden", value: "Yes",
        }, {
            name: "template_type", type: "hidden", value: "document",
        }, {
            name: "company_id", type: "hidden", value: companyID(),
        });
    }
    meta.fields.push({
        col: 2, type: "submit", setModal,
    });
    const createtTemplate = (<Fb
        meta={meta}
        layout={"vertical"}
        form={true}
        url={url}
        id={editData?.template_id}
        to={"/saas/templates"}
    />);
    const status = {
        'published': 'success', 'un_published': 'danger',
    }

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("templates")} pageTitle={t("content")}/>
                <Card>
                    <CardBody>
                        <MyTable columns={columns} url={url}
                                 where={{type: "document"}}
                                 actions={actions}/>
                    </CardBody>
                </Card>
            </Container>
            {modal && (<MyModal
                size={"xl"}
                title={editData?.template_id ? t("update_template") : t("create_template")}
                modal={modal}
                handleClose={() => setModal(!modal)}
                children={createtTemplate}
            />)}
            {viewModal && (<MyModal
                title={t("view_template")}
                modal={viewModal}
                handleClose={() => setViewModal(!viewModal)}
                children={<>
                    <div className="table-responsive table-card">
                        <table className="table mb-0">
                            <tbody>
                            <tr>
                                <th>{t("title")}</th>
                                <td>{viewData?.name}</td>
                            </tr>
                            <tr>
                                <th>{t("category")}</th>
                                <td>{viewData?.category_name}</td>
                            </tr>
                            <tr>
                                <th>{t("icon")}</th>
                                <td>{viewData?.icon}</td>
                            </tr>
                            <tr>
                                <th>{t("slug")}</th>
                                <td>{viewData?.slug}</td>
                            </tr>
                            <tr>
                                <th>{t("description")}</th>
                                <td>{viewData?.description}</td>
                            </tr>
                            <tr>
                                <th>{t("status")}</th>
                                <td>
                                    <span
                                        className={`badge p-2 bg-${viewData?.template_status === 1 ? "success" : "danger"}`}>
                                        {viewData?.template_status === 1 ? t("published") : t("unpublished")}
                                    </span>
                                    {Object.keys(status).map((key, index) => {
                                        const status = key === 'published' ? 1 : 0;
                                        if (status !== viewData?.template_status) {
                                            return <Button
                                                key={index}
                                                className={`btn btn-sm btn-${status[key]} text-decoration-none ms-2`}
                                                onClick={async () => {
                                                    const confirm = window.confirm(t('are_you_sure?'));
                                                    if (confirm) {
                                                        const input = {
                                                            template_status: key === 'published' ? 1 : 0,
                                                        }
                                                        await api.create('/api/admin/templates/', input, viewData?.template_id);
                                                    }
                                                    await viewData.refetch();
                                                    setViewModal(!viewModal)
                                                    setViewData('')
                                                }}
                                            >
                                                <div className={'d-flex align-items-center'}>
                                                    <i className="ri-check-line me-1"/>
                                                    {t(key)}
                                                </div>

                                            </Button>;
                                        }
                                    })}
                                </td>
                            </tr>

                            </tbody>
                        </table>
                    </div>


                </>}
            />)}
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({props: {...(await serverSideTranslations(locale, ["common"])),},});
