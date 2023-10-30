import {Button, Card, CardBody, CardHeader, Offcanvas} from "reactstrap";
import React, {useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Helper from "../../lib/Helper";
import Fb, {MyOffcanvas} from "../Fb";

const url = "/api/config";
export const Prefix = () => {
    const {t} = useTranslation('common');
    const [modal, setModal] = useState(false);
    const [prefix, setPrefix] = useState("");
    const [prefixName, setPrefixName] = useState("");
    const [formatName, setFormatName] = useState("");
    const [formatValue, setFormatValue] = useState("");
    const [preview, setPreview] = useState("");
    const [editPrefix, setEditPrefix] = useState();
    const makePrefix = (value, dprefix = null) => {
        const mprefix = dprefix || prefix;
        let result = "";
        if (value) {
            result = value?.replace(/\[PREFIX\]/g, mprefix);
            result = result?.replace(/\[yyyy\]/g, new Date().getFullYear());
            result = result?.replace(/\[yy\]/g, new Date().getFullYear().toString().slice(-2));
            result = result?.replace(/\[mm\]/g, new Date().getMonth() + 1);
            result = result?.replace(/\[dd\]/g, new Date().getDate());
            result = result?.replace(/\[number\]/g, 1);
        }
        return result;
    };
    useEffect(() => {
        let makePreview = "";
        if (formatValue) {
            makePreview = makePrefix(formatValue);
            setPreview(makePreview);
        }
    }, [formatValue]);

    useEffect(() => {
        if (!editPrefix) return;
        setPrefix(editPrefix?.prefix);
        setPrefixName(editPrefix?.value.replace("_FORMAT", "_PREFIX"));
        setFormatName(editPrefix?.value);
        setFormatValue(editPrefix?.format);
    }, [editPrefix]);

    const meta = {
        columns: 1, fields: [{
            label: t("type"), type: "select", options: Helper.prefixType(t), required: true, onChange: (value) => {
                const prefix = Helper.prefixType(t).find((item) => item?.value === value)?.prefix;
                const format = Helper.prefixType(t).find((item) => item?.value === value)?.format;
                setFormatValue(format);
                setPreview(makePrefix(format, prefix));
                setPrefix(prefix);
                // remove _FORMAT from value and Replace _PREFIX with value
                setPrefixName(value.replace("_FORMAT", "_PREFIX"));
                setFormatName(value);
            }, fieldClass: `${editPrefix ? "d-none" : ""}`,
        }, {
            label: t("prefix"), type: "text", required: true, initialValue: prefix, onChange: (e) => {
                setPrefix(e.target.value);
                setPreview(makePrefix(formatValue, e.target.value));
            },
        }, {
            name: prefixName, value: prefix, type: "hidden",
        }, {
            name: formatName, value: formatValue, type: "hidden",
        }, {
            label: t("format"), // name: formatName,
            initialValue: formatValue, type: "text", required: true, onChange: (e) => {
                setFormatValue(e.target.value);
                setPreview(makePrefix(e.target.value, prefix));
            }, helpText: (<span className={"text-muted"} key={"help"}>
                        Use{" "}
                <span
                    key={"prefix"}
                    className={"pointer text-primary"}
                    onClick={() => {
                        if (!prefix) {
                            alert("Please enter prefix first");
                            return;
                        }
                        // setFormatValue with previous value
                        setFormatValue((prev) => prev + "[PREFIX]");
                    }}
                >
                            [PREFIX]
                        </span>{" "}
                for prefix,
                        <span
                            key={"yyyy"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "[yyyy]");
                            }}
                        >
                            [yyyy]
                        </span>{" "}
                for year,
                        <span
                            key={"yy"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "[yy]");
                            }}
                        >
                            [yy]
                        </span>{" "}
                for year short,
                        <span
                            key={"mm"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "[mm]");
                            }}
                        >
                            [mm]
                        </span>{" "}
                for month,
                        <span
                            key={"dd"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "[dd]");
                            }}
                        >
                            [dd]
                        </span>{" "}
                for day,
                        <span
                            key={"number"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "[number]");
                            }}
                        >
                            [number]
                        </span>{" "}
                for number
                        <span
                            key={"dash"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + "-");
                            }}
                        >
                            {" "}
                            ( - ){" "}
                        </span>{" "}
                for dash
                        <span
                            key={"dot"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + ".");
                            }}
                        >
                            {" "}
                            ( . ){" "}
                        </span>{" "}
                for dot
                        <span
                            key={"Space"}
                            className={"pointer text-primary"}
                            onClick={() => {
                                if (!prefix) {
                                    alert("Please enter prefix first");
                                    return;
                                }
                                // setFormatValue with previous value
                                setFormatValue((prev) => prev + " ");
                            }}
                        >
                            {" "}
                            ( ){" "}
                        </span>{" "}
                for Space
                    </span>),
        }, {
            render: () => {
                // makePreview with label
                if (preview) {
                    return (<div className={"form-group mb-2"}>
                        <label className={"form-label"}>{t("preview")}</label>
                        <div className={"form-control"}>{preview}</div>
                    </div>);
                }
            },
        }, {
            type: "submit", label: t("submit"), setModal: setModal,
        },],
    };

    const newPrefix = (<Fb
        meta={meta}
        form={true}
        url={url}
        to={"/admin/settings"}
        layout={"vertical"}
    />);

    return (<Card>
        <CardHeader>
            <h4 className="card-title mb-0 flex-grow-1">
                {t("prefix")}
                <Button
                    color="success"
                    size="sm"
                    className="btn-rounded waves-effect waves-light float-end btn-sm"
                    onClick={() => {
                        setModal(true);
                    }}
                >
                    <i className="mdi mdi-plus font-size-16 align-middle me-1"/>{" "}
                    {t("new_prefix")}
                </Button>
            </h4>
        </CardHeader>
        <CardBody>
            {modal ? (<MyOffcanvas
                modal={!!modal}
                title={t("edit_prefix")}
                handleClose={() => {
                }}
            >
                {newPrefix}
            </MyOffcanvas>) : null}

            <table className="table table-centered table-nowrap mb-0">
                <thead className="table-light">
                <tr>
                    <th>{t("type")}</th>
                    <th>{t("prefix")}</th>
                    <th>{t("format")}</th>
                    <th>{t("preview")}</th>
                    <th>{t("action")}</th>
                </tr>
                </thead>
                <tbody>
                {Helper.prefixType(t).map((item, index) => {
                    return (<tr key={index}>
                        <td>{item.label}</td>
                        <td>{item.prefix}</td>
                        <td>{item.format}</td>
                        <td>
                            {item?.format && makePrefix(item.format, item.prefix)}
                        </td>
                        <td>
                            <Button
                                color="primary"
                                size="sm"
                                className="btn-rounded waves-effect waves-light"
                                onClick={() => {
                                    setEditPrefix(item);
                                    setModal(true);
                                }}
                            >
                                <i className="mdi mdi-pencil font-size-16 align-middle me-1"/>{" "}
                                {t("edit")}
                            </Button>
                        </td>
                    </tr>);
                })}
                </tbody>
            </table>
        </CardBody>
    </Card>);
};


export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});