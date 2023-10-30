import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Alert,
} from "reactstrap";
import React, {useEffect, useState} from "react";

import {API, GetData} from "../config";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Fb, {notify} from "../Fb";

const api = new API();

export const EmailSettings = ({config}) => {
    const {t} = useTranslation();
    const [activeTab, setActiveTab] = useState("settings");
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [currentTemplate, setCurrentTemplate] = useState();
    return (<Card>
        <CardBody>
            <Nav pills className="nav-pills-custom bb pb-2">
                <NavItem>
                    <NavLink
                        href="#"
                        className={activeTab === "settings" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("settings");
                        }}
                    >
                        <i className="bx bx-cog me-1"/>
                        {t("email_settings")}
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        href="#"
                        className={activeTab === "templates" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("templates");
                        }}
                    >
                        <i className="bx bx-file me-1"/>
                        {t("email_templates")}
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane className="mt-3 " tabId={activeTab}>
                    {activeTab === "settings" && <EmailSettingsTab
                        config={config}
                    />}
                    {activeTab === "templates" && (<EmailTemplatesTab
                        config={config}
                        setCurrentTemplate={setCurrentTemplate}
                        currentTemplate={currentTemplate}
                        setEmailTemplates={setEmailTemplates}
                    />)}
                </TabPane>
            </TabContent>
        </CardBody>
    </Card>);
};
const EmailSettingsTab = ({config}) => {
    const {t} = useTranslation();
    const [testEmail, setTestEmail] = useState(false);
    const [emailError, setEmailError] = useState(false);

    const meta = {
        columns: 1, flexible: true, formItemLayout: [2, 7], fields: [{
            name: "NEXT_PUBLIC_SMTP_HOST",
            label: t("SMTP_Host"),
            type: "text",
            required: true,
            value: config?.NEXT_PUBLIC_SMTP_HOST,
        }, {
            name: "NEXT_PUBLIC_SMTP_USERNAME",
            label: t("SMTP_Username"),
            type: "text",
            required: true,
            value: config?.NEXT_PUBLIC_SMTP_USERNAME,
        }, {
            name: "NEXT_PUBLIC_SMTP_PASSWORD",
            label: t("SMTP_Password"),
            type: "password",
            required: true,
            value: config?.NEXT_PUBLIC_SMTP_PASSWORD,
        }, {
            name: "NEXT_PUBLIC_SMTP_PORT",
            label: t("SMTP_Port"),
            type: "text",
            required: true,
            value: config?.NEXT_PUBLIC_SMTP_PORT || 587,
        }, {
            name: "NEXT_PUBLIC_SMTP_SECURE",
            label: t("smtp_secure"),
            type: "checkbox",
            required: true,
            customClass: "form-switch form-check-inline mt-2 ",
            selectOne: true,
            options: [{value: "yes", label: t("yes")}],
            value: config?.NEXT_PUBLIC_SMTP_SECURE || "yes",
        }, {
            render: () => {
                // save and test button here
                return (<div className={"row mb-2"}>
                    <div className={`col-md-${meta.formItemLayout[0]}`}/>
                    <div className={`col-md-${meta.formItemLayout[1]}`}>
                        <Button color="secondary" className="me-1" type="submit">
                            {t("Update")}
                        </Button>
                        <Button
                            className="pull-right float-end"
                            color="primary"
                            type="button"
                            onClick={() => {
                                setTestEmail(!testEmail);
                            }}
                        >
                            {t("test")}
                        </Button>
                    </div>
                </div>);
            },
        },],
    };
    if (testEmail) {
        meta.fields.push({
            name: "test_email", label: t("test_email"), type: "email", required: testEmail,
        }, {
            render: () => {
                // save and test button here
                return (<div className={"row mb-2"}>
                    <div className={`col-md-${meta.formItemLayout[0]}`}/>
                    <div className={`col-md-${meta.formItemLayout[1]}`}>
                        <Button
                            color="primary"
                            type="button"
                            onClick={async (e) => {
                                const saveConfirm = confirm(t("you_need_to_save_settings_before_testing_email_do_you_already_saved_settings"));
                                if (!saveConfirm) {
                                    return;
                                }
                                const testEmail = document.querySelector('input[name="test_email"]').value;
                                const result = await api.sendEmail("/api/admin/emailTemplate", {
                                    template: {
                                        subject: t("smtp_setup_testing"),
                                        message: t("this_is_test_smtp_email_br_if_you_received_this_message_that_means_that_your_smtp_settings_is_corrects"),
                                        sendTo: testEmail,
                                    },
                                });
                                if (result.status === true) {
                                    setEmailError(false);
                                    notify("success", t("email_sent_successfully"));
                                } else {
                                    setEmailError(result?.error);
                                    notify("warning", t("email_sending_failed"));
                                }
                            }}
                        >
                            {t("Send")}
                        </Button>
                    </div>
                </div>);
            },
        });
    }

    return (<React.Fragment>
        {emailError && (<Alert className={"mt-2"} color="danger">
            <p className="mb-1 text-danger font-weight-bold fs-3">
                {t("email_sending_failed")}
            </p>
            {emailError}
        </Alert>)}
        <Fb meta={meta} form={true} url={"/api/config"}/>
    </React.Fragment>);
};
const EmailTemplatesTab = ({
                               setEmailTemplates, currentTemplate, setCurrentTemplate,
                           }) => {
    const {t} = useTranslation();
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [mergeFields, setMergeFields] = useState([]);
    const url = "/api/admin/common/email_templates";

    const globalKeys = ["{COMPANY_NAME}", "{COMPANY_EMAIL}", "{COMPANY_PHONE}", "{COMPANY_ADDRESS}", "{COMPANY_URL}", "{EMAIL_SIGNATURE}", "{COMPANY_LOGO}",];

    const emailGroup = [{
        accounts: {
            activate_account: [...globalKeys, "{ACTIVATE_URL}", "{FIRST_NAME}", "{LAST_NAME}", "{EMAIL}", "{USERNAME}", "{PASSWORD}",],
            forgot_password: [...globalKeys, "{RESET_URL}", "{FIRST_NAME}", "{LAST_NAME}", "{EMAIL}", "{USERNAME}",],
            new_account: [...globalKeys, "{FIRST_NAME}", "{LAST_NAME}", "{EMAIL}", "{USERNAME}", "{PASSWORD}",],
            change_email: [...globalKeys, "{FIRST_NAME}", "{LAST_NAME}", "{NEW_EMAIL}", "{NEW_EMAIL_URL}",],
            reset_password: [...globalKeys, "{FIRST_NAME}", "{LAST_NAME}", "{EMAIL}", "{USERNAME}", "{NEW_PASSWORD}",],
            welcome_email: [...globalKeys, "{FIRST_NAME}", "{LAST_NAME}", "{EMAIL}", "{USERNAME}", "{PASSWORD}",],
        },
    },];

    // get email group value by key name from emailGroup array

    let getEmailGroupValue = [];
    // set emailGroup keys from emailGroup array into setEmailTemplates using useEffect
    useEffect(() => {
        const emailGroupKeys = emailGroup.map((item) => Object.keys(item)).flat();
        setEmailTemplates(emailGroupKeys);
        setCurrentTemplate(emailGroupKeys[0]);
    }, []);
    if (currentTemplate) {
        getEmailGroupValue = Object.entries(emailGroup.filter((item) => Object.keys(item).includes(currentTemplate))[0][currentTemplate]);
    }
    useEffect(() => {
        // get first value of getEmailGroupValue array and set into mergeFields
        if (getEmailGroupValue.length > 0) {
            setActiveTemplate(getEmailGroupValue[0][0]);
            setMergeFields(getEmailGroupValue[0][1]);
        }
    }, [currentTemplate]);

    const where = {
        email_group: activeTemplate, code: "en",
    };
    const {data: emailTemplateInfo, isLoading} = GetData("tbl_email_templates", where, null, true);

    if (isLoading) {
        return "Loading...";
    }
    let helperText = "";
    mergeFields.length > 0 && mergeFields?.map((item, index) => {
        helperText += (<div key={"mergeFields" + index}>
            <button
                type={"button"}
                onClick={() => {
                    const domEditableElement = document.querySelector(".ck-editor__editable");
                    const editorInstance = domEditableElement.ckeditorInstance;
                    editorInstance.model.change((writer) => {
                        const insertPosition = editorInstance.model.document.selection.getFirstPosition();
                        writer.insertText(item, insertPosition);
                    });
                }}
                className={"btn btn-outline-secondary"}
            >
                {item}
            </button>
        </div>);
    });

    const meta = {
        columns: 2, fields: [{
            type: "text",
            label: t("subject"),
            placeholder: t("enter_subject"),
            value: emailTemplateInfo?.subject,
            required: true,
            name: "subject",
        }, {
            type: "text",
            label: t("send_from"),
            placeholder: t("enter_send_from"),
            value: "{COMPANY_NAME} | CRM",
            name: "send_from",
        }, {
            label: t("email_group"),
            type: "text",
            value: activeTemplate,
            name: "email_group",
            disabled: true,
            placeholder: t("enter_email_group"),
        }, {
            type: "checkbox", label: t("active"), customClass: "form-switch mt-2", name: "active",
        }, {
            type: "textarea",
            label: t("message"),
            placeholder: t("enter_message"),
            value: emailTemplateInfo?.message,
            required: true,
            name: "message",
            editor: true,
            labelCol: 2,
            inputCol: 10,
            col: 2,
            helperText: mergeFields,
        }, {
            type: "hidden", value: emailTemplateInfo?.send_to || "staff", name: "send_to",
        }, {
            type: "hidden", value: emailTemplateInfo?.code || "en", name: "code",
        }, {
            type: "submit", label: t("submit"),
        },],
    };

    return (<React.Fragment>
        <div className={"mt-2"}>
            <div key={"emailTemplate"} className={"mb-2 bb"}>
                <div className={"d-flex flex-wrap"}>
                    {getEmailGroupValue.map((eValue, index) => {
                        return (<div key={"emailddD" + index} className="me-1 mb-2">
                            <button
                                type={"button"}
                                className={`btn btn-outline-secondary ${eValue[0] === activeTemplate ? "active" : ""}`}
                                onClick={() => // set activeTemplate value and set mergeFields value
                                {
                                    setActiveTemplate(eValue[0]);
                                    setMergeFields(eValue[1]);
                                }}
                            >
                                {t(eValue[0])}
                            </button>
                        </div>);
                    })}
                </div>
            </div>
            <Fb
                meta={meta}
                form={true}
                id={emailTemplateInfo?.email_template_id}
                to={"/admin/settings/"}
                url={"/api/admin/emailTemplate"}
                // layout={'vertical'}
            />
        </div>
    </React.Fragment>);
};


export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
  