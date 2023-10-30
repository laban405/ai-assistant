import React, {useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, Container, UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    API, isAdmin, companyID, isCompany,
} from "../../../components/config";

import MyTable from "../../../components/MyTable";
import Fb, {MyModal} from "../../../components/Fb";
import Helper from "../../../lib/Helper";
import {useRouter} from "next/router";

const api = new API();
let url = "/api/admin/templates";
let info = "";

export default function AllTemplates() {
    const {t} = useTranslation();
    const router = useRouter();
    const [slug, setSlug] = useState();
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState({});
    const company_id = companyID();

    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "name", label: t("name"), type: "text", value: editData?.name, onChange: (e) => {
                const slug = Helper.slugify(e.target.value);
                setSlug(slug);
            }, required: true,
        }, {
            name: "slug", label: t("slug"), type: "text", value: slug, onChange: (e) => {
                setSlug(e.target.value);
            }, required: true, runOnChange: true,
        }, {
            name: "icon", label: t('icon'), type: "text", value: editData?.icon,
        }, {
            name: "template_type", type: "hidden", value: "document",
        }, {
            required: true, name: "category_id", label: t('category'), type: "select", getOptions: {
                url: "/api/admin/categories", label: "category_name", where: {
                    type: "document",
                },
            }, value: editData?.category_id,
        }, {
            name: "description",
            label: t('description'),
            type: "textarea",
            value: editData?.description,
            required: true,
        }],
    };
    if (!editData.template_id || editData?.custom === "Yes") {
        meta.fields.push({
            name: "prompt", label: t("prompt"), type: "textarea", required: true,
        }, {
            name: "custom", type: "hidden", value: "Yes",
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
        to={"/admin/templates/all"}
    />);

    const columns = [{
        label: t("name"), accessor: "name", sortable: true, linkId: "template_id",
    },];
    if (isAdmin()) {
        columns.push({
            label: t("category"), accessor: "category_name", sortable: true,
        });
    }
    columns.push({
        label: t("description"), accessor: "description", sortable: true, length: 150,
    }, {
        label: t("status"),
        accessor: "template_status",
        update: true,
        number: true,
        type: "checkbox",
        sortable: true,
        linkId: "template_id",
    });
    if (isAdmin() || isCompany()) {
        columns.push({
            label: t("action"), linkId: "template_id", btn: true, flex: "d-inline-flex", actions: [{
                name: "delete", link: url,
            },], cell: (row, refetch) => {
                if (row?.company_id === company_id) {
                    return (<>
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
                }
            },
        });
    }

    const actions = [{
        name: "btn",
        label: t("new_template"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        onClick: () => {
            setEditData({});
            setSlug("");
        },
        setModal: setModal, // children: createtTemplate,
    },];

    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("templates")} pageTitle={"AllContent"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            where={{
                                "tmpl.company_id": companyID(), // 'tmpl.template_status': 1,
                            }}
                            columns={columns}
                            url={url}
                            actions={actions}
                        />
                    </CardBody>
                </Card>
            </Container>
            {modal && (<MyModal
                size={"xl"}
                title={info.data?.template_id ? t("update_template") : t("create_template")}
                modal={modal}
                handleClose={() => setModal(!modal)}
                children={createtTemplate}
            />)}
        </div>
    </React.Fragment>);
}

export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
