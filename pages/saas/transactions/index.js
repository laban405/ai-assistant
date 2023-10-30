import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledDropdown,
} from "reactstrap";
import React, {useEffect, useState} from "react";
import {
    API, DisplayDate, DisplayMoney, DownloadFile, GetDefaultCurrency, TotalRows, TotalSum
} from "../../../components/config";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
// moment time zone
import "moment-timezone";
import BreadCrumb from "../../../components/BreadCrumb";
import Helper from "../../../lib/Helper";
import MyTable from "../../../components/MyTable";
import {useRouter} from "next/router";
import Fb, {
    BtnModal, MyModal, MyOffcanvas, notify,
} from "../../../components/Fb";
import Link from "next/link";
import PackageList from "../../../components/PackageList";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const api = new API();
const Transactions = () => {
    const [packageModal, setPackageModal] = useState({});
    const [modalData, setModalData] = useState({});
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);
    const [totalCancelled, setTotalCancelled] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [total, setTotal] = useState(0);
    const [where, setWhere] = useState({});
    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();

    const url = '/api/admin/companiesPayments';
    const {t} = useTranslation();
    const status = {
        'pending': 'primary', 'paid': 'success', 'cancelled': 'danger', 'failed': 'info',
    }
    const post = {
        all: {
            field: 'total_amount',
        }, pending: {
            field: 'total_amount', where: {
                payment_status: 'pending',
            }
        }, paid: {
            field: 'total_amount', where: {
                payment_status: 'paid',
            }
        }, cancelled: {
            field: 'total_amount', where: {
                payment_status: 'cancelled',
            }
        }, failed: {
            field: 'total_amount', where: {
                payment_status: 'failed',
            }
        }
    };
    const {data, refetch} = TotalSum(url, post);
    useEffect(() => {
        if (data) {
            setTotalPaid(data.paid);
            setTotalPending(data.pending);
            setTotalCancelled(data.cancelled);
            setTotalFailed(data.failed);
            setTotal(data.all);
        }
    }, [data]);


    const columns = [{
        label: t('company_name'), accessor: 'company_name', linkId: 'company_id', link: '/saas/companies/details/',
    }, {
        label: t('package_name'), cell: (row) => {
            return <>
                <Button
                    color="link"
                    className="p-0"
                    onClick={() => setPackageModal(row)}
                >
                    {row.package_name}
                </Button>
            </>;
        }
    }, {
        label: t('payment_date'), accessor: 'payment_date', date: true,
    }, {
        label: t('payment_method'), accessor: 'payment_method', lang: true,
    }, {
        label: t('amount'), accessor: 'amount', money: true,
    }, {
        label: t('status'), cell: (row, refetch) => {
            row.refresh = refetch;
            return (<>
                <UncontrolledDropdown>
                    <DropdownToggle tag="button"
                                    className={`btn btn-${status[row.payment_status]} btn-sm dropdown-toggle`}
                                    id="dropdownMenuButton">
                        {row.payment_status}
                    </DropdownToggle>
                    <DropdownMenu>
                        {Object.keys(status).map((key, index) => {
                            if (key !== row.payment_status) {
                                return (<DropdownItem
                                    className={`text-${status[key]}`}
                                    key={index}
                                    onClick={async () => {
                                        const confirm = window.confirm(t('are_you_sure?'));
                                        if (confirm) {
                                            await updatePayment(key, row);
                                        }
                                    }}
                                >
                                    {key}
                                </DropdownItem>);
                            }
                        })}
                    </DropdownMenu>
                </UncontrolledDropdown>
            </>);
        },

    }, {
        label: t('action'), className: "text-center", linkId: 'company_payment_id', btn: true, cell: (row, refetch) => {
            row.refresh = refetch;
            return <div className="d-flex">
                <Button
                    className="btn btn-sm btn-warning text-decoration-none me-2"
                    onClick={() => setModalData(row)}
                >
                    <i className="ri-eye-line"/>
                </Button>
                <Button
                    color={'danger'}
                    className="btn btn-sm btn-danger text-decoration-none"
                    onClick={async () => {
                        const confirm = window.confirm(t('sre_you_sure?'));
                        if (confirm) {
                            await deletePayment(row);
                        }
                    }}
                >
                    <i className="ri-delete-bin-line"/>
                </Button>


            </div>;

        },
    }];

    const updatePayment = async (status, data) => {

        const currentStatus = data.payment_status;
        if (currentStatus === 'paid' && status !== 'paid') {
            const lastPaid = await api.post("/api/admin/companiesPayments", {
                id: {
                    'cmpnyPayment.company_id': data?.company_id, payment_status: 'paid', where: {
                        'company_payment_id !=': data?.company_payment_id,
                    },
                }, getInfo: true,
            });
            if (confirm(t("warning_this_will_cancel_the_payment_and_revert_the_company_to_the_previous_package") + ' : ' + lastPaid?.package_name + '. ' + t("are_you_sure?"))) {
                const input = {
                    active: 0,
                }
                await api.update('/api/admin/companiesHistories', input, data?.company_history_id).then(async res => {
                    const input = {
                        active: 1,
                    }
                    await api.update('/api/admin/companiesHistories', input, lastPaid?.company_history_id).then(async res => {
                        const input = {
                            company_history_id: lastPaid?.company_history_id,
                        }
                        await api.update('/api/admin/companies', input, data?.company_id).then(res => {
                            notify('success', t("the_payment_has_been_deleted_successfully_and_the_company_has_been_reverted_to_the_previous_package") + ' ' + lastPaid?.package_name);
                        }).catch(err => {
                            notify("warning", err);
                        });
                    }).catch(err => {
                        notify("warning", err);
                    });
                }).catch(err => {
                    notify("warning", err);
                });
            } else {
                setModalData({});
                return;
            }
        }

        const input = {
            payment_status: status,
        };
        if (status === 'paid') {
            await api.create('/api/admin/companiesHistories', {
                active: 0,
            }, data?.company_id).then(async res => {
                await api.update('/api/admin/companiesHistories', {
                    active: 1,
                }, data?.company_history_id).then(res => {
                    notify('success', t('company_activated_successfully'));
                    data.refresh();
                    setModalData({});
                }).catch(err => {
                    notify("warning", err);
                });
            }).catch(err => {
                notify("warning", err);
            });
        }
        await api.update('/api/admin/companiesPayments', input, data?.company_payment_id).then(res => {
            notify('success', t('updated_successfully'));
            data.refresh();
            refetch();
            setModalData({});
        }).catch(err => {
            notify("warning", err);
        });

    }

    const deletePayment = async (data) => {

        const currentStatus = data.payment_status;
        if (currentStatus === 'paid') {
            const lastPaid = await api.post("/api/admin/companiesPayments", {
                id: {
                    'cmpnyPayment.company_id': data?.company_id, payment_status: 'paid', where: {
                        'company_payment_id !=': data?.company_payment_id,
                    },
                }, getInfo: true,
            });


            if (confirm(t("warning_this_will_be_delete_the_payment_and_revert_the_company_to_the_previous_package") + ' : ' + lastPaid?.package_name + '. ' + t("are_you_sure?"))) {
                const input = {
                    active: 0,
                }
                await api.update('/api/admin/companiesHistories', input, data?.company_history_id).then(async res => {
                    const input = {
                        active: 1,
                    }
                    await api.update('/api/admin/companiesHistories', input, lastPaid?.company_history_id).then(async res => {
                        const input = {
                            company_history_id: lastPaid?.company_history_id,
                        }
                        await api.update('/api/admin/companies', input, data?.company_id).then(res => {
                            notify('success', t('the_payment_has_been_deleted_successfully_and_the_company_has_been_reverted_to_the_previous_package') + ' ' + lastPaid?.package_name);
                        }).catch(err => {
                            notify("warning", err);
                        });
                    }).catch(err => {
                        notify("warning", err);
                    });
                }).catch(err => {
                    notify("warning", err);
                });
            } else {
                setModalData({});
                return;
            }
        }
        // delete the company history and the payment
        await api.delete('/api/admin/companiesHistories', data?.company_history_id).then(async res => {
            await api.delete('/api/admin/companiesPayments', data?.company_payment_id).then(res => {
                notify('success', t('deleted_successfully'));
                data.refresh();
                refetch();
            }).catch(err => {
                notify("warning", err);
            });
        }).catch(err => {
            notify("warning", err);
        });

    }
    const PaymentDetails = ({data}) => {
        const downloadReceiptPdf = () => {

            // download the html page as pdf using jsPDF and html2canvas
            const element = document.getElementById('payment-details');
            // remove button from the pdf to avoid printing it
            element.querySelector('.heading').remove();

            html2canvas(document.querySelector("#payment-details")).then(canvas => {
                // add h2 to the top of the pdf
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`receipt-${modalData?.company_name}.pdf`);
                // hide modal
                setModalData({});
            });


        }

        return <div className="row">
            <Card
                id={'payment-details'}
            >
                <CardHeader className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">{t('payment_details')}</h5>
                    <div className="d-flex align-items-center heading">
                        <Button
                            color={'danger'}
                            className="btn btn-sm btn-danger text-decoration-none"
                            onClick={downloadReceiptPdf}
                        >
                            <i className="ri-download-2-line"/> {t('download_receipt')}
                        </Button>
                    </div>
                </CardHeader>
                <CardBody

                >
                    <div className="table-responsive table-card">
                        <table
                            id={'payment-details-table'}
                            className="table mb-0">
                            <tbody>
                            <tr>
                                <td className="fw-medium">{t('company_name')}</td>
                                <td>{data?.company_name}</td>
                            </tr>
                            <tr>
                                <td className="fw-medium">{t('package_name')}</td>
                                <td>{data?.package_name}</td>
                            </tr>
                            <tr>
                                <td className="fw-medium">{t('payment_date')}</td>
                                <td>{DisplayDate(data?.payment_date)}</td>
                            </tr>
                            <tr>
                                <td className="fw-medium">{t('payment_method')}</td>
                                <td>{data?.payment_method}</td>
                            </tr>
                            <tr>
                                <td className="fw-medium">{t('amount')}</td>
                                <td>{DisplayMoney(data?.amount, currencyInfo)}</td>
                            </tr>
                            <tr>
                                <td className="fw-medium">{t('status')}</td>
                                <td>
                                    <span
                                        className={`badge p-2 bg-${status[data?.payment_status]}`}>{t(data?.payment_status)}</span>
                                    {Object.keys(status).map((item, i) => {
                                        const color = status[item];
                                        if (item !== data?.payment_status) {
                                            return <Button
                                                key={i}
                                                className={`btn btn-sm btn-${color} text-decoration-none ms-2`}
                                                onClick={async () => {
                                                    const confirm = window.confirm(t('are_you_sure?'));
                                                    if (confirm) {
                                                        await updatePayment(item, data);
                                                    }
                                                }}
                                            >
                                                <div className={'d-flex align-items-center'}>
                                                    <i className="ri-check-line me-1"/>
                                                    {t(item)}
                                                </div>

                                            </Button>;
                                        }
                                    })}


                                </td>
                            </tr>
                            {data?.deposit_slip && <tr>
                                <td className="fw-medium">{t('deposit_slip?')}</td>
                                <td>
                                    <Button
                                        color={'link'}
                                        className="btn btn-sm btn-danger text-decoration-none me-2"
                                        onClick={async () => {
                                            const files = JSON.parse(data?.deposit_slip);
                                            await DownloadFile(files[0]);
                                        }}
                                    >
                                        <i className="ri-download-2-line me-1"/> {t('download')}
                                    </Button>
                                </td>
                            </tr>}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>;
    }


    const ecomWidgets = [// total paid,total,cancelled,failed,pending
        {
            title: t('total') + ' ' + t('paid'),
            counter: DisplayMoney(totalPaid, currencyInfo),
            icon: 'ri-money-dollar-circle-fill',
            color: 'success',
            where: {
                payment_status: 'paid'
            }
        }, {
            title: t('total') + ' ' + t('pending'),
            counter: DisplayMoney(totalPending, currencyInfo),
            icon: 'ri-money-dollar-circle-fill',
            color: 'info',
            where: {
                payment_status: 'pending'
            }
        }, {
            title: t('total') + ' ' + t('cancelled'),
            counter: DisplayMoney(totalCancelled, currencyInfo),
            icon: 'ri-money-dollar-circle-fill',
            color: 'danger',
            where: {
                payment_status: 'cancelled'
            }
        }, {
            title: t('total') + ' ' + t('failed'),
            counter: DisplayMoney(totalFailed, currencyInfo),
            icon: 'ri-money-dollar-circle-fill',
            color: 'warning',
            where: {
                payment_status: 'failed'
            }
        }]

    return <div className="page-content"><Container fluid>
        <BreadCrumb title={t("transactions")} pageTitle={t("transactions")}/>
        <Row>
            <Col xl="12">
                <Row>
                    {ecomWidgets.map((item, i) => {
                        return <Col xl="3" key={i}>
                            <div className="card-animate card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-sm flex-shrink-0"><span
                                            class={`avatar-title bg-light text-${item.color} rounded-circle fs-1`}><i
                                            class={`align-middle ${item.icon}`}></i></span></div>
                                        <div className="flex-grow-1 ms-3"><p
                                            className="text-uppercase fw-semibold fs-12 text-muted mb-1 text-truncate">{item.title}</p>
                                            <h4
                                                className=" mb-0">
                                                <span>{item.counter}</span></h4></div>
                                        <div className="flex-shrink-0 align-self-end ">
                                            <span
                                                onClick={() => {
                                                    setWhere(item.where);
                                                }}
                                                class={`pointer badge bg-${item.color}`}>
                                                <i className="align-middle me-1 ri-arrow-right-line"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>;
                    })}
                </Row>
            </Col>
        </Row>
        <Card>
            <CardHeader
                className='d-flex align-items-center justify-content-between'
            >
                <h4 className="card-title mb-0 flex-grow-1">
                    <div className="">
                            <span
                                className="me-1">{t('transactions')}</span>

                        {where?.payment_status && <Button
                            color={'danger'}
                            className="btn btn-sm btn-danger text-decoration-none me-2"
                            onClick={async () => {
                                setWhere({});
                            }}
                        >
                            <i className="
                        align-middle me-1 ri-restart-line"/> {t('reset')}
                        </Button>

                        }
                    </div>

                </h4>
            </CardHeader>

            <CardBody>
                <MyTable columns={columns} url={url}
                         where={where}
                />
            </CardBody>

            {modalData && modalData?.package_name && <MyModal
                modal={modalData}
                size={'lg'}
                handleClose={() => {
                    setModalData({});
                }}
                children={<PaymentDetails
                    data={modalData}
                    handleClose={() => {
                        setModalData({});
                    }}
                />}
            />}

            {packageModal?.package_name && <MyModal
                modal={packageModal}
                handleClose={() => {
                    setPackageModal({});
                }}
                children={<PackageList data={packageModal}
                                       modal={packageModal}
                                       details={true}
                />}
            />}
        </Card>
    </Container>
    </div>
};
export default Transactions;

export const getStaticProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
