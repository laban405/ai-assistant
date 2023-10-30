import React, {useContext, useEffect, useRef, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Card, CardBody, CardHeader, Container,
} from "reactstrap";

import {
    API, AllCountry, GetRows, getRow, Info, MyDetails,
} from "../../../components/config";
import {signOut, useSession} from "next-auth/react";
import Fb, {MyModal, notify} from "../../../components/Fb";
import {useRouter} from "next/router";
import Loading from "../../../components/Loading";
import {Context} from "../../_app";

let url = "/api/admin/settings";
const api = new API();

export default function Settings() {
    const {t} = useTranslation();
    const [disabledChangeEmail, setDisabledChangeEmail] = useState(true);
    const [disabledChangePass, setDisabledChangePass] = useState(true);
    const [disabledChangeUserName, setDisabledChangeUserName] = useState(true);
    const [existEmail, setExistEmail] = useState(false);
    const [existUserName, setExistUserName] = useState(false);
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const myDetails = MyDetails();
    const url = "/api/admin/users";

    const {
        data: userInfo, isLoading: userInfoLoading, refetch,
    } = Info(url, {user_id: myDetails?.user_id},);

    const profileMeta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "first_name", label: t("first_name"), type: "text", required: true, value: userInfo?.first_name,
        }, {
            name: "last_name", label: t("last_name"), type: "text", value: userInfo?.last_name,
        }, {
            name: "mobile", type: "text", label: t("phone"), value: userInfo?.mobile,
        }, {
            name: "language", label: t("language"), type: "select", value: userInfo?.language, getOptions: {
                url: "/api/admin/languages", where: {
                    active: 1,
                },
            },
        }, {
            label: t("country"),
            name: "country",
            type: "select",
            value: Number(userInfo?.country),
            function: AllCountry,
        }, {
            type: "file", label: t("profile_photo"), name: "avatar", value: userInfo?.avatar,
        },

            {
                type: "submit", label: t("update_profile"), // setModal: setModal,
            },],
    };

    const EmailMeta = {
        columns: 1, formItemLayout: [3, 8], fields: [{
            name: "password",
            label: t("password"),
            type: "password",
            required: true,
            placeholder: t("current_password"),
            help: !disabledChangeEmail && t("Your_Entered_Password_Do_Not_Match"),
            onChange: async (e) => {
                const data = {
                    password: e.target.value, user_password: true,
                };
                const password = await api.post("/api/admin/users", data);
                setDisabledChangeEmail(password.result);
            },
        }, {
            name: "email",
            label: t("New_Email"),
            type: "text",
            required: true,
            placeholder: t("New_Email"),
            help: existEmail && t("Email_already_exist"),
            onChange: async (e) => {
                const exist = await getRow("/api/admin/users", {
                    "usr.email": e.target.value,
                });
                if (exist?.email === e.target.value) {
                    setExistEmail(true);
                } else {
                    setExistEmail(false);
                }
            },
        }, {
            type: "submit", label: t("Change_Email"), // setModal: setModal,
            disabled: !disabledChangeEmail || existEmail,
        },],
    };

    const changeEmail = async (values) => {
        const data = {
            email: values.email,
        };
        const update = await api.update("/api/admin/users", data, userInfo?.user_id);
        if (update?.affectedRows > 0) {
            notify("success", t("Email_update_successfully"));
        }
    };

    const PasswordMeta = {
        columns: 1, formItemLayout: [4, 8], fields: [{
            name: "old_password",
            label: t("Old_Password"),
            type: "password",
            required: true,
            placeholder: t("Enter_your_Old_Password"),
            help: !disabledChangePass && t("Your_Entered_Password_Do_Not_Match"),
            onChange: async (e) => {
                const data = {
                    password: e.target.value, user_password: true,
                };
                const password = await api.post("/api/admin/users", data);
                setDisabledChangePass(password.result);
            },
        }, {
            name: "new_password",
            label: t("new_password"),
            type: "password",
            required: true,
            placeholder: t("Enter_Your_New_Password"),
            onChange: (e) => {
                setNewPass(e.target.value);
            },
        }, {
            name: "confirm_password",
            label: t("confirm_password"),
            type: "password",
            required: true,
            placeholder: t("Enter_Your_Confirm_Password"),
            onChange: (e) => {
                setConfirmPass(e.target.value);
            },
            help: newPass !== confirmPass && t("Confirm_Password_Doesn't_match"),
        },

            {
                type: "submit", label: t("Change_Password"), // setModal: setModal,
                disabled: !disabledChangePass || newPass !== confirmPass,
            },],
    };

    const changePassword = async (values) => {
        const data = {
            password: values.confirm_password,
        };
        await api.update("/api/admin/users", data, userInfo?.user_id);

        signOut({redirect: false});
        // notify("success", t("password_update_successfully"));
    };

    const UserNameMeta = {
        columns: 1, formItemLayout: [4, 8], fields: [{
            name: "password",
            label: t("current_password"),
            type: "password",
            required: true,
            placeholder: t("current_password"),
            help: !disabledChangeUserName && t("Your_Entered_Password_Do_Not_Match"),
            onChange: async (e) => {
                const data = {
                    password: e.target.value, user_password: true,
                };
                const password = await api.post("/api/admin/users", data);
                setDisabledChangeUserName(password.result);
            },
        }, {
            name: "username",
            label: t("new_username"),
            type: "text",
            required: true,
            placeholder: t("new_username"),
            help: existUserName && t("username_already_exist"),
            onChange: async (e) => {
                const exist = await getRow("/api/admin/users", {
                    "usr.username": e.target.value,
                });
                if (exist?.username === e.target.value) {
                    setExistUserName(true);
                } else {
                    setExistUserName(false);
                }
            },
        },

            {
                type: "submit", label: t("change_username"), // setModal: setModal,
                disabled: !disabledChangeUserName || existUserName,
            },],
    };

    const changeUserName = async (values) => {
        const data = {
            username: values.username,
        };
        const update = await api.update("/api/admin/users", data, userInfo?.user_id);
        if (update?.affectedRows > 0) {
            // notify("success", "Username update successfully");
        }
    };

    return (<div className="page-content">
        <Container fluid>
            <CardHeader className="mb-3">
                <h4 className="card-title mb-0 flex-grow-1">{t("profile")}</h4>
            </CardHeader>
            <div className="row">
                <div className="col-xl-6">
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0 flex-grow-1">
                                {t("update_profile")}
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Fb
                                meta={profileMeta}
                                form={true}
                                id={userInfo?.user_id}
                                isLoading={userInfoLoading}
                                url={"/api/admin/users"}
                                to={"/admin/profile"}
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0 flex-grow-1">
                                {t("Change_Email")}
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Fb meta={EmailMeta}
                                isLoading={userInfoLoading}
                                form={true} onSubmit={changeEmail}/>
                        </CardBody>
                    </Card>
                </div>
                <div className="col-xl-6">
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0 flex-grow-1">
                                {t("Change_Password")}
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Fb
                                meta={PasswordMeta}
                                isLoading={userInfoLoading}
                                form={true}
                                url={"/api/admin/users"}
                                id={userInfo?.user_id}
                                onSubmit={changePassword}
                            />
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0 flex-grow-1">
                                {t("change_username")}
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Fb
                                meta={UserNameMeta}
                                isLoading={userInfoLoading}
                                form={true}
                                onSubmit={changeUserName}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Container>
    </div>);
}


export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
