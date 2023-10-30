import {Button, UncontrolledTooltip} from "reactstrap";
import Fb, {BtnModal, MyModal, notify} from "../Fb";
import {useTranslation} from "next-i18next";
import {
    API, companyID, DisplayMoney, GetDefaultCurrency, MyDetails, updatePackage,
} from "../config";
import moment from "moment";
import {useState} from "react";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Image from "next/image";

const api = new API();

const BankTransfer = ({data}) => {

    const [modal, setModal] = useState(false);
    const router = useRouter();
    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

    const {t} = useTranslation();
    const company_id = companyID();
    const myDetails = MyDetails();
    const bankDetails = {
        bank_name: "HDFC Bank", account_name: "Company Name", account_number: "1234567890", ifsc_code: "HDFC0000000",
    };

    const meta = {
        columns: 1, flexible: true, formItemLayout: [4, 7], fields: [{
            name: "payment_date",
            label: t("deposit_date"),
            type: "date",
            required: true,
            value: moment().format("YYYY-MM-DD"),
        }, {
            name: "transaction_id", label: t("transaction_id"), type: "text", required: true,
        }, {
            name: "notes", label: t("notes"), type: "textarea", required: true,
        }, {
            name: "deposit_slip", label: t("deposit_slip"), type: "file", required: true,
        }, {
            type: "submit", label: t("submit"),
        },],
    };
    const SubmitBankTransfer = async (values) => {
        data.transaction_id = values.transaction_id;
        data.payment_status = "pending";
        data.payment_method = "bank_transfer";
        data.company_id = company_id;
        data.reference_no = values.transaction_id;
        data.notes = values.notes;

        if (values.deposit_slip && values.deposit_slip.length > 0) {
            const formData = new FormData();
            let files = values.deposit_slip;
            const oldFiles = [];
            const isJson = typeof files === "string" && files.startsWith("[");
            if (isJson) {
                files = JSON.parse(files);
            }
            if (Array.isArray(files)) {
                files.forEach((file) => {
                    if (!file.newFilename) {
                        formData.append("file", file);
                    } else {
                        oldFiles.push(file);
                    }
                });
            }
            if (formData.has("file")) {
                const result = await api.uploadFiles(formData);
                if (result.fileData) {
                    result.fileData.forEach((file) => {
                        oldFiles.push(file);
                    });
                    data.deposit_slip = JSON.stringify(oldFiles);
                }
            } else {
                data.deposit_slip = JSON.stringify(oldFiles);
            }
        }
        data.payment_date = values.payment_date;

        const res = await updatePackage(data);
        if (res.affectedRows > 0) {
            // redirect to the dashboard
            notify("success", "your_payment_has_been_successfully_processed");
            // hide the modal

            setTimeout(() => {
                window.location.href = "/admin/dashboard";
            }, 2000);
        }
    };

    return (<>
        <div
            className="payment-logo"
            onClick={() => {
                setModal(true);
            }}
        >
            <Image src="/assets/img/bank-transfer.png"
                   width={200}
                   height={200}
                   alt=""/>
        </div>

        {modal ? (<MyModal
            size={"lg"}
            modal={modal}
            title={t("bank_transfer")}
            handleClose={() => {
                router.push(`/admin/upgrades`);
                setModal(false);
            }}
            children={<>
                <div className="text-center">
                    <p>{t("make_your_payment_directly_into_our_bank_account_please_use_your_package_name_and_email_address_as_the_payment_reference_your_account_will_be_activated_once_the_funds_have_cleared_in_our_account")}</p>
                </div>
                <div className="d-flex justify-content-center align-items-center flex-column">
                    <h4>
                        {t("amount")}:{" "}
                        {DisplayMoney(data[data.frequency + "_price"], currencyInfo)}
                    </h4>
                    <h4>
                        {t("reference")} : {data.package_name}&
                        {myDetails?.company_name ? myDetails?.company_name : myDetails?.email}
                    </h4>
                </div>

                <UncontrolledTooltip html={true} placement="top" target="copy">
                    <div>
                        {t("reference")}: {data.package_name}&
                        {myDetails?.company_name ? myDetails?.company_name : myDetails?.email}
                    </div>
                    <div>
                        {t("bank_name")} : {bankDetails?.bank_name}
                    </div>
                    <div>
                        {t("account_name")}: {bankDetails?.account_name}
                    </div>
                    <div>
                        {t("account_number")}: {bankDetails?.account_number}
                    </div>
                    <div>
                        {t("ifsc_code")}: {bankDetails?.ifsc_code}
                    </div>
                </UncontrolledTooltip>
                <div className="text-center">
                    <Button
                        color="primary"
                        id={"copy"}
                        onClick={() => {
                            navigator.clipboard.writeText(`
                                    ${t("amount")}:${DisplayMoney(data[data.frequency + "_price"], currencyInfo)} /${data.frequency}
                                    ${t("reference")} : ${data.package_name}&${myDetails?.company_name ? myDetails?.company_name : myDetails?.email}
                                    ${t("bank_name")} : ${bankDetails?.bank_name}
                                    ${t("account_name")}: ${bankDetails?.account_name}
                                    ${t("account_number")}: ${bankDetails?.account_number}
                                    ${t("ifsc_code")}: ${bankDetails?.ifsc_code}`);
                            notify("success", t("copied_to_clipboard_successfully"));
                        }}
                        className="btn-sm me-2"
                    >
                        <i className="ri-file-copy-line me-2"></i>
                        {t("copy_bank_details")}
                    </Button>
                    <Button
                        onClick={() => {
                            // download as text file
                            const element = document.createElement("a");
                            const file = new Blob([`
                                    ${t("amount")}:${DisplayMoney(data[data.frequency + "_price"], currencyInfo)} /${data.frequency}
                                    ${t("reference")} : ${data.package_name}&${myDetails?.company_name ? myDetails?.company_name : myDetails?.email}
                                    ${t("bank_name")} : ${bankDetails?.bank_name}
                                    ${t("account_name")}: ${bankDetails?.account_name}
                                    ${t("account_number")}: ${bankDetails?.account_number}
                                    ${t("ifsc_code")}: ${bankDetails?.ifsc_code}`,], {type: "text/plain"});
                            element.href = URL.createObjectURL(file);
                            element.download = "bank_details.txt";
                            document.body.appendChild(element); // Required for this to work in FireFox
                            element.click();
                        }}
                        color="primary"
                        className="btn-sm"
                    >
                        <i className="fa fa-download me-2"></i>
                        {t("download_bank_details")}
                    </Button>
                </div>
                <hr/>
                <Fb meta={meta} form={true} onSubmit={SubmitBankTransfer}/>
            </>}
        />) : null}
    </>);
};

export default BankTransfer;

export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
