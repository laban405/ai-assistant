import {
    Button, Card, CardBody, Container, UncontrolledTooltip,
} from "reactstrap";
import React, {useEffect, useState} from "react";
import {
    API, AllCountry, MyID,
} from "../../../components/config";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import "moment-timezone";
import BreadCrumb from "../../../components/BreadCrumb";
import MyTable from "../../../components/MyTable";
import {useRouter} from "next/router";
import Fb, {
    MyModal, notify,
} from "../../../components/Fb";
import PackageList from "../../../components/PackageList";

const api = new API();

let url = "/api/admin/users";
let info = "";
const User = () => {
    let info = "";
    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [packageId, setPackageId] = useState("");
    const [userData, setUserData] = useState({});
    const router = useRouter();
    const myID = MyID();
    // ------- for table data start ------------
    const columns = [{
        checkbox: true, linkId: "user_id", accessor: "user_id",
    }, {
        label: t("full_name"), accessor: "fullname", sortable: true, linkId: "user_id", flex: true,
    }, {
        label: t("mobile"), accessor: "mobile", sortable: true,
    }, {
        label: t("email"), accessor: "email", sortable: true,
    }, {
        label: t("active"),
        accessor: "activated",
        sortable: true,
        update: true,
        number: true,
        type: "checkbox",
        linkId: "user_id",
    }, {
        label: t("action"), // accessor: "action",
        className: "text-center", linkId: "user_id", btn: true, flexClass: "me-2", cell: (row, refetch) => {
            if (myID !== row.user_id) {
                return (<>
                    <UncontrolledTooltip
                        placement="top"
                        target={`users${row?.user_id}`}
                    >
                        {t("users_details")}
                    </UncontrolledTooltip>
                    <UncontrolledTooltip
                        placement="top"
                        target={`edit${row?.user_id}`}
                    >
                        {t("edit")}
                    </UncontrolledTooltip>
                    <Button
                        type="button"
                        id={`users${row?.user_id}`}
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                            setModal(true);
                            setPackageId(row?.user_id);
                        }}
                    >
                        <i className="ri-eye-line"/>
                    </Button>

                    <Button
                        type="button"
                        id={`edit${row?.user_id}`}
                        className="btn btn-sm btn-success ms-2"
                        onClick={() => {
                            setNewModal(true);
                            setUserData(row);
                        }}
                    >
                        <i className="ri-pencil-line"/>
                    </Button>

                    <UncontrolledTooltip
                        placement="top"
                        target={`delete${row?.user_id}`}
                    >
                        {t("delete")}
                    </UncontrolledTooltip>

                    <Button
                        type="button"
                        id={`delete${row?.user_id}`}
                        className="btn btn-sm btn-danger ms-2"
                        onClick={async () => {
                            try {
                                if (confirm(t("are_you_sure?"))) {
                                    await api.delete("/api/admin/users", row?.user_id);
                                    await refetch();
                                    notify("success", t("deleted_successfully"));
                                }
                            } catch (error) {
                                notify("warning", error.message);
                            }
                        }}
                    >
                        <i className="ri-delete-bin-line"/>
                    </Button>
                </>);
            }
        },
    },];

    const actions = [{
        name: "btn",
        label: t("new_user"),
        className: "btn-success",
        icon: "ri-add-line",
        modal: true,
        setModal: setNewModal,
    },];

    // ------- for modal data end ------------
    return (<React.Fragment>
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title={t("users")} pageTitle={"all"}/>
                <Card>
                    <CardBody>
                        <MyTable
                            columns={columns}
                            url={"/api/admin/users"}
                            actions={actions}
                            where={{
                                role_id: 1,
                            }}
                        />
                    </CardBody>
                </Card>
                {newModal ? (<MyModal
                    size={"lg"}
                    modal={newModal}
                    title={userData.user_id ? t("update_user") : t("new_user")}
                    handleClose={() => {
                        router.push(`/saas/users`);
                        setUserData({});
                        setNewModal(false);
                    }}
                    children={<NewUser
                        setModal={setNewModal}
                        data={userData}
                        setUserData={setUserData}
                    />}
                />) : null}

                {modal ? (<MyModal
                    size={"lg"}
                    modal={modal}
                    title={t("users_details")}
                    handleClose={() => {
                        router.push(`/saas/users`);
                        setModal(false);
                    }}
                    children={<PackageList id={packageId}/>}
                />) : null}
            </Container>
        </div>
    </React.Fragment>);
};
export default User;

export const NewUser = ({data, setModal, setUserData}) => {
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const {t} = useTranslation();
    const meta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "first_name",
            type: "text",
            label: t("first_name"),
            value: data?.first_name,
            required: true,
            placeholder: t("first_name"),
        }, {
            name: "last_name",
            type: "text",
            required: true,
            label: t("last_name"),
            value: data?.last_name,
            placeholder: t("last_name"),
        }, {
            name: "username",
            type: "text",
            label: t("username"),
            value: data?.username,
            placeholder: t("username"),
            required: true,
            unique: true,
        }, {
            name: "email",
            type: "text",
            label: t("email"),
            value: data?.email,
            required: true,
            placeholder: t("email"),
            unique: true,
        }, {
            // name: "password",
            type: "password", label: t("password"), required: true, placeholder: t("password"), onChange: (e) => {
                setNewPass(e.target.value);
            },
        }, {
            name: "password",
            type: "password",
            label: t("confirmation_password"),
            placeholder: t("confirmation_password"),
            required: true,
            onChange: (e) => {
                setConfirmPass(e.target.value);
            },
            help: newPass !== confirmPass && t("confirm_password_doesn_t_match"),
        }, {
            name: "mobile", type: "text", label: t("phone"), placeholder: t("phone"), value: data?.mobile,
        }, {
            name: "language", label: t("language"), type: "select", value: data?.language, getOptions: {
                url: "/api/admin/languages",
            },
        }, {
            label: t("country"), name: "country", type: "select", value: Number(data?.country), function: AllCountry,
        }, {
            name: "address", type: "textarea", label: t("address"), placeholder: t("address"), value: data?.address,
        }, {
            type: "file", label: t("profile_photo"), name: "avatar", value: data?.avatar,
        }, {
            name: "role_id", type: "hidden", value: 1,
        }, {
            name: "company_id", type: "hidden", value: 0,
        }, {
            name: "activated", type: "hidden", value: 1,
        }, {
            name: "is_verified", type: "hidden", value: 1,
        }, {
            type: "submit", label: t("submit"), setModal: setModal,
        },],
    };

    if (data?.user_id) {
        meta.fields.splice(4, 2);
    }

    // ------- for modal data end ------------
    return (<React.Fragment>
        <CardBody>
            <Fb
                meta={meta}
                form={true}
                url={"/api/admin/users"}
                to={"/saas/users"}
                id={data?.user_id}
            />
        </CardBody>
    </React.Fragment>);
};

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
