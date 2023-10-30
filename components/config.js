import axios from "axios";
import {useQuery} from "react-query";
import moment from "moment";
import {useContext} from "react";
import {Context} from "../pages/_app";
import Helper from "../lib/Helper";

axios.defaults.headers.post["Content-Type"] = "application/json";
// intercepting to capture errors
axios.interceptors.response.use(function (response) {
    return response.data ? response.data : response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let message;
    switch (error.status) {
        case 500:
            message = "Internal Server Error";
            break;
        case 401:
            message = "Invalid credentials";
            break;
        case 404:
            message = "Sorry! the data you are looking for could not be found";
            break;
        case 400:
            message = "Bad Request";
            break;
        case 403:
            message = "Forbidden";
            break;
        case 409:
            message = "Conflict";
            break;
        case 422:
            message = error.message || error;
        default:
            message = error.message || error;
    }
    return Promise.reject(message);
});

class API {
    get = async (url, params) => {
        let paramKeys = [];
        if (params) {
            Object.keys(params).map((key) => {
                paramKeys.push(key + "=" + params[key]);
                return paramKeys;
            });
            const queryString = paramKeys && paramKeys.length ? paramKeys.join("&") : "";
            return await axios
                .get(`${url}?${queryString}`, params)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                });
        } else {
            return await axios
                .get(`${url}`, params)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                });
        }
    };
    post = async (url, data) => {
        return await axios
            .post(url, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    /**
     * post given data to url
     */
    create = async (url, data, id) => {
        Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
                data[key] = JSON.stringify(data[key]);
            }
        });
        if (id) {
            data.edit_id = id;
            return await axios
                .put(url, data)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                });
        } else {
            return await axios
                .post(url, data)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    return err;
                });
        }
    };
    /**
     * Updates data
     */
    update = async (url, data, id) => {
        data.edit_id = id;
        return await axios
            .put(url, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    /**
     * Delete
     */
    delete = async (url, id) => {
        return await axios
            .delete(url, {data: {id: id}})
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    uploadFiles = async (data) => {
        data.uploadFile = true;
        return await axios
            .post("/api/upload", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    deleteFiles = async (data) => {
        data.deleteFile = true;
        return await axios
            .post(`/api/delete/`, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    sendEmail = async (url, data) => {
        data.sendEmail = true;
        return await axios
            .post(url, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    sendSMS = async (url, data) => {
        data.sendSMS = true;
        return await axios
            .post(url, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
    sendPushNotification = async (url, data) => {
        data.sendPushNotification = true;
        return await axios
            .post(url, data)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                return err;
            });
    };
}

const MyDetails = () => {
    // get user from session using next-auth
    const {session} = useContext(Context);
    return session?.user;
};


export const MyID = () => {
    // get user from session using next-auth
    const {session} = useContext(Context);
    return session?.user?.user_id;
};

export const isAdmin = () => {
    const {session} = useContext(Context);
    // get user from session using next-auth
    return session?.user?.role_id === 1;
};
export const isCompany = () => {
    // get user from session using next-auth
    const {session} = useContext(Context);
    return session?.user?.role_id === 2;
};
export const companyID = () => {
    const {session} = useContext(Context);
    // get user from session using next-auth
    return session?.user?.company_id;
}
export const SiteLogo = () => {
    const {config} = useContext(Context);
    const logo = config?.NEXT_PUBLIC_COMPANY_LOGO;
    return logo ? JSON.parse(logo)[0].fileUrl : '/assets/img/logo.png';
}

export const GetOptions = (url, label = null, where = null, id = null, join = null, key = null, getJoin = null) => {
    const input = {
        select: true, label, where, id, join, key, getJoin
    };
    const {data, isLoading, status, isFetching} = useQuery(["GetOptions", {
        url, where, label, id, getJoin
    }], async () => {
        const result = await axios.post(url, input);
        return result;
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, isFetching};
    }
};
export const Info = (url, id, include, enabled = null, name) => {
    const input = {
        id, getInfo: true,
    };
    const {data, isLoading, status, refetch, remove} = useQuery([name || "GetInfo", {
        url, id, include, enabled
    }], async () => {
        const result = await axios.post(url, input);
        if (include) {
            const includes = {};
            await Promise.all(Object.keys(include).map(async (index) => {
                const {join, row, label, id, key, field, limit} = include[index];
                let {url, where, method} = include[index];
                if (!method) {
                    method = 'getRows';
                }
                if (!url) {
                    url = "/api/admin/common";
                }
                // if where is not defined then create where object
                if (!where) {
                    where = {};
                }
                if (field) {
                    Object.keys(field).map((key) => {
                        where[key] = result[field[key]];
                    });
                }
                const input = {
                    where, join, row, label, id, key, limit, [method]: true, include: true
                };
                includes[index] = await axios.post(url, input);
                return includes;
            }));
            // add all includes key to result
            Object.keys(includes).map((key) => {
                result[key] = includes[key];
            });
        }
        return result;
    }, {
        enabled: enabled === null ? id !== null : enabled,
        keepPreviousData: false,
        staleTime: 0,
        cacheTime: 0,
        refetchInterval: 0,
    });
    if (id === null || id === undefined || id === "") {
        return null;
    } else {
        return {data, isLoading, status, refetch, remove};
    }
};

export const TotalRows = (url, where = null, limit = null) => {
    const input = {
        where, getTotalRows: true, limit,
    };
    const {data, isLoading, status, refetch} = useQuery(["getTotalRows", {url, where}], async () => {
        const result = await axios.post(url || "/api/admin/common", input);
        return result;
    }, {
        keepPreviousData: false, refetchOnMount: false, refetchOnWindowFocus: false,
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch};
    }
};
export const TotalSum = (url, field, where = null) => {
    const input = {
        where, getTotalSum: true, field,
    };
    const {data, isLoading, status, refetch} = useQuery(["getTotalSum", {url, field, where}], async () => {
        const result = await axios.post(url || "/api/admin/common", input);
        return result;
    }, {
        keepPreviousData: false, refetchOnMount: false, refetchOnWindowFocus: false,
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch};
    }
};
export const GetData = (table, where = null, join = null, row = null) => {
    const input = {
        table, where, join, row, GetData: true,
    };
    const {data, isLoading, status, refetch, isFetching, error} = useQuery(["GetResultData", {
        table, where
    }], async () => {
        const result = await axios.post("/api/admin/common", input);
        return result;
    }, {
        enabled: table !== null && table !== undefined,
        keepPreviousData: false,
        refetchOnWindowFocus: true,
        staleTime: 0,
        cacheTime: 0,
        refetchInterval: 0,
    });
    if (table === null || table === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch, isFetching, error};
    }
};
export const GetResult = (url, where = null, row = null) => {
    const input = {
        where, GetResult: true, row
    };
    const {data, isLoading, status, refetch} = useQuery(["GetResultd", {url, where}], async () => {
        const result = await axios.post(url, input);
        return result;
    }, {
        enabled: url !== null && url !== undefined,
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch};
    }
};
export const GetRows = (url, props, include, name) => {
    const api = new API();
    const input = {
        ...props, getRows: true,
    };
    const {data, isLoading, status, refetch} = useQuery([name || "GetRows", {url, props}], async () => {
        const result = await axios.post(url, input);
        if (include) {
            const includes = {};
            await Promise.all(Object.keys(include).map(async (index) => {
                const {join, row, label, id, key, field, limit} = include[index];
                let {url, where, method} = include[index];
                if (!method) {
                    method = 'getRows';
                }
                if (!url) {
                    url = "/api/admin/common";
                }
                // if where is not defined then create where object
                if (!where) {
                    where = {};
                }
                if (field) {
                    Object.keys(field).map((key) => {
                        where[key] = result[field[key]];
                    });
                }
                const input = {
                    where, join, row, label, id, key, limit, [method]: true, include: true
                };
                includes[index] = await axios.post(url, input);
                return includes;
            }));
            // add all includes key to result
            Object.keys(includes).map((key) => {
                result[key] = includes[key];
            });
        }
        return result;
    }, {
        enabled: url !== null && url !== undefined,
        keepPreviousData: false,
        staleTime: 0,
        cacheTime: 0,
        refetchInterval: 0,
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch};
    }
}
export const CustomTable = (url, props) => {
    const {page = 1, limit, filter, sortField, order, where, whereIn} = props;
    const input = {
        page, limit, filter, sortField, order, where, whereIn, tableData: true,
    };
    const {data, isLoading, refetch, status, isFetching} = useQuery(["CustomTable", {url, ...props}], async () => {
        const result = await axios.post(url, input);
        return result;
    }, {
        enabled: url !== null && url !== undefined,
        keepPreviousData: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    if (url === null || url === undefined) {
        return null;
    } else {
        return {data, isLoading, status, refetch, isFetching};
    }

}

export const DisplayDate = (date, sqlFormat = null, configs = null) => {
    let configData = configs;
    if (!configs) {
        const {config} = useContext(Context);
        configData = config;
    }
    const date_format = configData?.NEXT_PUBLIC_DATE_FORMAT || "DD-MM-YYYY";
    if (sqlFormat) {
        return moment(date).add(1, 'days').format(`YYYY-MM-DD`);
    }
    return moment(date).format(date_format);
};
export const DisplayDateTime = (date, sqlFormat = null, configs = null) => {
    let configData = configs;
    if (!configs) {
        const {config} = useContext(Context);
        configData = config;
    }
    const date_format = configData?.NEXT_PUBLIC_DATE_FORMAT || "DD-MM-YYYY";
    const time_format = configData?.NEXT_PUBLIC_TIME_FORMAT || "HH:mm:ss";
    if (sqlFormat) {
        date = moment(date).add(1, 'days');
        return moment(date).format(`YYYY-MM-DD HH:mm:ss`);
    }
    return moment(date).format(`${date_format} ${time_format}`);
};
export const DisplayTime = (time, sqlFormat = null, configs = null) => {
    let configData = configs;
    if (!configs) {
        const {config} = useContext(Context);
        configData = config;
    }
    const time_format = configData?.NEXT_PUBLIC_TIME_FORMAT || "HH:mm:ss";
    if (sqlFormat) {
        return moment(time).format(`HH:mm:ss`);
    }
    return moment(time).format(time_format);
};
export const TimeAgo = (date) => {
    return moment(date).fromNow();
}
export const DisplayPrefix = (props) => {
    let Prefix = "";
    const {number, format, prefix} = props;
    if (format) {
        const date = new Date();
        Prefix = format?.replace("[PREFIX]", prefix);
        Prefix = Prefix?.replace("[yyyy]", date.getFullYear());
        Prefix = Prefix?.replace("[yy]", date.getFullYear().toString().substr(-2));
        Prefix = Prefix?.replace("[mm]", (date.getMonth() + 1).toString().padStart(2, "0"));
        Prefix = Prefix?.replace("[m]", date.getMonth() + 1);
        Prefix = Prefix?.replace("[dd]", date.getDate().toString().padStart(2, "0"));
        Prefix = Prefix?.replace("[d]", date.getDate());
        Prefix = Prefix?.replace("[number]", number);
    } else {
        Prefix = number;
    }
    return Prefix;
};

export const DisplayMoney = (amount, currencyInfo = null, convert = null) => {
    if (amount === null || amount === undefined) {
        amount = 0;
    }
    if (currencyInfo === null || currencyInfo === undefined) {

    }
    if (currencyInfo) {
        let result = "";
        const {
            currency_name = "United States dollar",
            symbol = "$",
            currency_code = "USD",
            precision = 2,
            decimal_separator = ".",
            thousand_separator = ",",
            symbol_position = "before",
            exchange_rate = 1,
        } = currencyInfo;
        // make format money with precision,symbol,decimal_separator,thousand_separator and exchange rate
        let amount_format = 0;
        if (convert) {
            amount_format = amount * exchange_rate;
        } else {
            amount_format = amount;
        }
        const amount_format_precision = amount_format.toFixed(precision);
        const amount_format_precision_split = amount_format_precision.split(".");
        const amount_format_precision_split_first = amount_format_precision_split[0];
        const amount_format_precision_split_last = amount_format_precision_split[1];
        const amount_format_precision_split_first_format = amount_format_precision_split_first?.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator);
        const amount_format_precision_split_last_format = amount_format_precision_split_last?.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator);
        const amount_format_precision_split_format = `${amount_format_precision_split_first_format}${decimal_separator}${amount_format_precision_split_last_format}`;
        if (symbol_position === "before") {
            result = `${symbol}${amount_format_precision_split_format}`;
        } else {
            result = `${amount_format_precision_split_format}${symbol}`;
        }
        return result;
    } else {
        return amount;
    }
};
export const Avatar = (avatar) => {
    const fileUrl = JSON.parse(avatar);
    if (fileUrl) {
        return fileUrl[0]?.fileUrl;
    }
    return "/assets/img/avatar.jpg";
};
export const getRow = async (url, id) => {
    const input = {
        id, getInfo: true,
    };
    const result = await axios.post(url, input);
    return result;
};
export const selectData = async (url, where = null, label, id = null, join = null, key = null) => {
    const input = {
        where, join, select: true, value: label, id, key,
    };
    const result = await axios.post(url, input);
    return result;
};
export const getData = async (url, props) => {
    const input = {
        ...props, getRows: true,
    };
    const result = await axios.post(url, input);
    return result;
};

export const AllEmployee = (url = null, menu_id = null) => {
    if (!url) {
        url = "/api/admin/common";
    }
    const {data, isLoading, status} = useQuery(["getAllEmployeeByMenuID", {menu_id}], async () => {
        const input = {
            getPermission: true, menu_id, user: true,
        };
        const result = await axios.post(url, input);
        return result.allUsers;
    });
    return {data, isLoading, status};
};
export const GetPaymentMethods = () => {
    const allMethods = Helper.paymentMethods();
    const Options = [];
    allMethods.map((method) => {
        Options.push({value: method.name, label: method.name});
    });
    return Options;

};
export const AllCountry = () => {
    const url = "/api/admin/common";
    const {data, isLoading, status} = useQuery([`getAllCountry`], async () => {
        const input = {
            select: true, getCountry: true,
        };
        const result = await axios.post(url, input);
        return result;
    });
    return {data, isLoading, status};
};
export const GetCurrencies = () => {
    const url = "/api/admin/currencies";
    const {data, isLoading, status} = useQuery([`GetCurrencies`], async () => {
        const input = {
            select: true,
        };
        const result = await axios.post(url, input);
        return result;
    });
    return {data, isLoading, status};
};
export const GetDefaultCurrency = (value = null, configs = null) => {
    let configData = configs;
    if (!configs) {
        const {config} = useContext(Context);
        configData = config;
    }
    let currency_id = {};
    if (value) {
        currency_id = Number(value);
    } else {
        currency_id = Number(configData?.NEXT_PUBLIC_DEFAULT_CURRENCY || 1);
        // where.is_default = 'yes';
    }
    const url = "/api/admin/currencies";
    const {data, isLoading, status} = useQuery([`GetDefaultCurrency`, {currency_id}], async () => {
        const input = {
            getInfo: true, id: {currency_id},
        };
        const result = await axios.post(url, input);
        return result;
    }, {
        keepPreviousData: false, refetchOnWindowFocus: true, staleTime: 0, cacheTime: 0, refetchInterval: 0,
    });

    // return data first row of data array
    return {data, isLoading, status}
}
export const DefaultCurrency = (value = null, configs = null) => {
    let configData = configs;
    if (!configs) {
        const {config} = useContext(Context);
        configData = config;
    }
    if (value) {
        return Number(value);
    } else {
        return Number(config.NEXT_PUBLIC_DEFAULT_CURRENCY || 1);
    }
};

export const AllDepartment = (url = null, menu_id = null) => {
    if (!url) {
        url = "/api/admin/common";
    }
    const {data, isLoading} = useQuery(["getAllAllDepartmentByMenuID", {menu_id}], async () => {
        const input = {
            getPermission: true, menu_id, department: true,
        };
        const result = await axios.post(url, input);
        return result.department;
    });
    return {data, isLoading};
};
export const AllDesignation = (url = null, menu_id = null) => {
    if (!url) {
        url = "/api/admin/common";
    }
    const {data, isLoading} = useQuery(["getAllAllDesignationByMenuID", {menu_id}], async () => {
        const input = {
            getPermission: true, menu_id, designation: true,
        };
        const result = await axios.post(url, input);
        return result.designation;
    });
    return {data, isLoading};
};
export const DownloadZip = async (url, where) => {
    const input = {
        where, DownloadZip: true,
    };
    // set header and response type
    const config = {
        headers: {}, responseType: "blob",
    };
    const result = await axios.post(url, input, config);
    // get file name from response header
    // create blob url from response data
    const urlBlob = window.URL.createObjectURL(new Blob([result]));
    // create download link
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", "fildde.zip");
    // append link to body
    document.body.appendChild(link);
    // click download link
    link.click();
    // remove link from body
    link.parentNode.removeChild(link);
};
export const DownloadFile = async (file) => {
    // download file from uoloads folder
    const result = await axios.get(file.fileUrl, {responseType: "blob"});
    // get file name from response header
    // create blob url from response data
    const urlBlob = window.URL.createObjectURL(new Blob([result]));
    // create download link
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", file.originalFilename);
    // append link to body
    document.body.appendChild(link);
    // click download link
    link.click();
    // remove link from body
    link.parentNode.removeChild(link);
};

export const GetConfig = (key) => {
    const url = "/api/config";
    const {data, isLoading, refetch} = useQuery(["GetConfig", {key}], async () => {
        const input = {
            key, getConfig: true,
        };
        const result = await axios.post(url, input);
        return result;
    });
    if (key) {
        return data;
    }
    return {data, isLoading, refetch};
};

export const updatePackage = async (data) => {
    const api = new API();

    const companyId = data?.company_id;
    const expired_date = data.frequency === 'monthly' ? moment().add(30, 'days').format('YYYY-MM-DD') : data.frequency === 'annual' ? moment().add(365, 'days').format('YYYY-MM-DD') : null;
    const amount = data[data.frequency + '_price'];
    const companyData = {
        amount: amount, frequency: data.frequency, trial_period: 0, expired_date: expired_date,
    }

    const res = await api.create('/api/admin/companies', companyData, companyId);
    if (res.affectedRows > 0) {
        if (data.payment_status === 'paid') {
            // update company history where active = 1 to 0*/
            await api.update('/api/admin/companiesHistories', {
                active: 0 // where active = 1
            }, {
                company_id: companyId
            });
        }

        const companyHistoryData = {
            company_id: companyId,
            package_id: data.package_id,
            package_name: data.package_name,
            ai_templates: data.ai_templates,
            ai_chat: data.ai_chat,
            words_per_month: data.words_per_month,
            images_per_month: data.images_per_month,
            ai_transcriptions: data.ai_transcriptions,
            text_to_speech: data.text_to_speech,
            speech_file_size: data.speech_file_size,
            frequency: data.frequency,
            amount: amount,
            payment_method: data.payment_method,
            i_have_read_agree: '1', // '1' means 'yes'
            validity: expired_date,
            active: data.payment_status === 'paid' ? 1 : 0,
        }
        const res = await api.create('/api/admin/companiesHistories', companyHistoryData);
        if (res.insertId > 0) {
            const companyData = {
                company_history_id: res.insertId,
            }
            await api.update('/api/admin/companies', companyData, companyId);
        }

        const paymentData = {
            company_id: companyId,
            company_history_id: res.insertId,
            reference_no: data.reference_no ? data.reference_no : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            transaction_id: data.transaction_id ? data.transaction_id : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            payment_method: data.payment_method,
            payment_date: data.payment_date ? data.payment_date : moment().format('YYYY-MM-DD'),
            currency: data.currency ? data.currency : 'USD',
            subtotal: amount,
            discount_percent: 0,
            discount_amount: 0,
            coupon_code: '',
            total_amount: amount,
            deposit_slip: data.deposit_slip ? data.deposit_slip : '',
            notes: data.notes ? data.notes : '',
            payment_status: data.payment_status ? data.payment_status : 'pending',
        }
        await api.create('/api/admin/companiesPayments', paymentData);
        // remove packageData from local storage if exist
        if (typeof window !== 'undefined') {
            localStorage.removeItem('packageData');
        }
    }
    return res;

}

export {API, MyDetails};
