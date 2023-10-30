import {
    Button, Card, CardBody, Container, UncontrolledTooltip,
} from "reactstrap";
import React, {useEffect, useState} from "react";
import {API, GetRows, Info} from "../../../components/config";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import "moment-timezone";
import BreadCrumb from "../../../components/BreadCrumb";
import MyTable from "../../../components/MyTable";
import {useRouter} from "next/router";
import Fb, {MyModal, notify,} from "../../../components/Fb";
import PackageList from "../../../components/PackageList";

const api = new API();
let url = "/api/admin/packages";
let info = "";
const Packages = () => {
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [packageInfo, setPackageInfo] = useState({});
    const [packageData, setPackageData] = useState({});
    const [refetch, setRefetch] = useState(false);
    const router = useRouter();

    // ------- for table data start ------------
    const columns = [{
        checkbox: true, linkId: "package_id", accessor: "package_id",
    }, {
        label: t("package_name"), accessor: "package_name", sortable: true, linkId: "package_id", flex: true,
    }, {
        label: t("monthly_price"), accessor: "monthly_price", money: true, sortable: true,
    }, {
        label: t("annual_price"), accessor: "annual_price", sortable: true, money: true,
    }, {
        label: t("lifetime_price"), accessor: "lifetime_price", sortable: true, money: true,
    }, {
        label: t("published"),
        accessor: "status",
        sortable: true,
        update: true,
        number: true,
        type: "checkbox",
        linkId: "package_id",
    }, {
        label: t("action"),
        className: "text-center",
        linkId: "package_id",
        btn: true,
        flexClass: "me-2",
        cell: (row) => {
            return (<>
                <UncontrolledTooltip
                    placement="top"
                    target={`packages${row?.package_id}`}
                >
                    {t("packages_details")}
                </UncontrolledTooltip>
                <UncontrolledTooltip
                    placement="top"
                    target={`edit${row?.package_id}`}
                >
                    {t("edit")}
                </UncontrolledTooltip>
                <Button
                    type="button"
                    id={`packages${row?.package_id}`}
                    className="btn btn-sm btn-warning"
                    onClick={() => {
                        setModal(true);
                        setPackageInfo(row);
                    }}
                >
                    <i className="ri-eye-line"/>
                </Button>
                <Button
                    type="button"
                    id={`edit${row?.package_id}`}
                    className="btn btn-sm btn-success ms-2"
                    onClick={() => {
                        setNewModal(true);
                        setPackageData(row);
                    }}
                >
                    <i className="ri-pencil-line"/>
                </Button>
            </>);
        },
        actions: [{
            name: "delete", link: url,
        },],
    },];

    const actions = [{
        name: "btn",
        label: t("new_package"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        setModal: setNewModal,
    },];

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("packages")} pageTitle={"all"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={"/api/admin/packages"}
                            actions={actions}
                            shouldRefetch={refetch}
                            setRefetch={setRefetch}
                        />
                    </CardBody>
                </Card>
                {newModal ? (<MyModal
                    size={"xl"}
                    modal={newModal}
                    title={t("new_package")}
                    handleClose={() => {
                        router.push(`/saas/packages`);
                        setPackageData({});
                        setNewModal(false);
                    }}
                    children={<NewPackage
                        setRefetch={setRefetch}
                        setModal={setNewModal}
                        data={packageData}
                        setPackageData={setPackageData}
                    />}
                />) : null}

                {modal ? (<MyModal
                    size={"md"}
                    modal={modal}
                    title={t("packages_details")}
                    handleClose={() => {
                        setPackageInfo({});
                        setModal(false);
                    }}
                    children={<PackageList data={packageInfo}
                                           modal={modal}
                                           details={true}
                    />}
                />) : null}
            </Container>
        </div>
    </React.Fragment>);
};
export default Packages;

export const NewPackage = ({data, setModal, setPackageData, setRefetch}) => {
    let info = "";
    const {t} = useTranslation();
    const router = useRouter();

    const meta = {
        columns: 2, formItemLayout: [4, 8], fields: [{
            name: "package_name", type: "text", label: t("package_name"), value: data?.package_name, required: true,
        }, {
            name: "trial_days", type: "number", label: t("trial_days"), value: data?.trial_days,
        }, {
            col: 3, render: () => {
                return (<div className="border-bottom mb-2 mt-2">
                    <h5 className="">{t("pricing_info")}</h5>
                </div>);
            },
        }, {
            name: "monthly_price",
            type: "number",
            label: t("monthly_price"),
            value: data?.monthly_price,
            help: t("set_0_to_disable_it"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "annual_price",
            type: "number",
            label: t("annual_price"),
            value: data?.annual_price,
            help: t("set_0_to_disable_it"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "lifetime_price",
            type: "number",
            label: t("lifetime_price"),
            value: data?.lifetime_price,
            help: t("set_0_to_disable_it"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "recommended",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("recommended"),
            value: data?.recommended,
        }, {
            col: 3, render: () => {
                return (<div className="border-bottom mb-2 mt-2">
                    <h5 className="">{t("package_info")}</h5>
                </div>);
            },
        }, {
            name: "ai_templates", type: "select", label: t("ai_templates"), isMulti: true, getOptions: {
                url: "/api/admin/templates", key: "category_name", where: {template_type: "document"}, getJoin: true,
            }, value: data?.ai_templates, help: t("select_AI_templates_for_this_plan"), helpClass: "fs-11 text-muted",
        }, {
            name: "words_per_month",
            type: "number",
            label: t("AI_words_per_month"),
            value: data?.words_per_month,
            help: t("set_-1_for_unlimited"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "images_per_month",
            type: "number",
            label: t("AI_images_per_month"),
            value: data?.images_per_month,
            help: t("set_-1_for_unlimited"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "speech_file_size",
            type: "number",
            label: t("transcriptions_file_size"),
            value: data?.speech_file_size,
            help: t("set_file_size_limit_for_the_file_in_MB_Set-1_for_unlimited"),
            helpClass: "fs-11 text-muted",
        }, {
            name: "ai_chat",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("AI_chats"),
            value: data?.ai_chat,
        }, {
            name: "ai_transcriptions",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("AI_transcriptions"),
            value: data?.ai_transcriptions,
        }, {
            name: "text_to_speech",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("AI_text_to_speech"),
            value: data?.text_to_speech,
        }, {
            name: "status",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("status"),
            value: data?.status,
        },],
    };
    if (data?.package_id) {
        // add new field for update all package
        meta.fields.push({
            name: "update_all_package",
            type: "checkbox",
            customClass: "form-switch form-check-inline mt-2 ",
            label: t("update_All_Company_Package"),
        });
    }
    meta.fields.push({
        type: "submit", label: t("submit"), setModal: setModal, resetData: setPackageData,
    });
    // ------- for modal data end ------------
    return (<React.Fragment>
        <CardBody>
            <Fb
                meta={meta}
                form={true}
                onSubmit={async (post) => {
                    const update_all_package = post.update_all_package;
                    delete post.update_all_package;

                    const res = await api.create(url, post, data?.package_id);
                    if (res?.affectedRows > 0) {
                        if (update_all_package) {
                            notify("success", t("package_updated_successfully"));
                            const input = {
                                getRows: true, where: {
                                    package_id: data?.package_id, active: 1,
                                },
                            };
                            const companyList = await api.post("/api/admin/companiesHistories", input);
                            if (companyList?.length > 0) {
                                // update all company package
                                // update all company package by company_history_id
                                companyList.map(async (item) => {
                                    const updateCompanyPackage = await api.create("/api/admin/companiesHistories/", {
                                        package_id: data?.package_id,
                                        package_name: post.package_name,
                                        ai_templates: post.ai_templates,
                                        ai_chat: post.ai_chat,
                                        words_per_month: post.words_per_month,
                                        images_per_month: post.images_per_month, // speech_per_month: post.speech_per_month,
                                        speech_file_size: post.speech_file_size,
                                        ai_transcriptions: post.ai_transcriptions,
                                        text_to_speech: post.text_to_speech,
                                    }, item.company_history_id);
                                });
                            }
                        } else {
                            notify("success", t("package_updated_successfully"));
                            await router.push(`/saas/packages`);
                        }
                        setRefetch(true);
                        setModal(false);
                        setPackageData({});
                    } else {
                        notify("warning", t("something_went_wrong"));
                    }
                }}
                // layout={"vertical"}
                url={"/api/admin/packages"}
                to={"/saas/packages"}
                id={data?.package_id}
            />
        </CardBody>
    </React.Fragment>);
};
export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
