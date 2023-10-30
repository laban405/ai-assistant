import axios from "axios";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {useMutation, useQueries, useQuery} from "react-query";
import {
    Button,
    Col,
    Input,
    Label,
    Row,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledTooltip,
    Badge,
    Card,
} from "reactstrap";
import {useTranslation} from "next-i18next";
import {
    API,
    Avatar,
    companyID,
    DisplayDate,
    DisplayDateTime,
    DisplayMoney,
    DownloadFile,
    DownloadZip,
    GetDefaultCurrency,
    TotalRows,
} from "./config";
import {Swiper, SwiperSlide} from "swiper/react";
import SwiperCore, {Navigation, EffectFade} from "swiper";

SwiperCore.use([Navigation]);
import Image from "next/image";
import Fb, {BtnModal, notify, UserImage} from "./Fb";
import Helper from "../lib/Helper";

let QuickView = "";

let refecthData = "";
export const GetData = async ({queryKey}) => {
    // passing post data to the server
    const [_, page, filter, limit, sortField, order, url, where, whereIn] = queryKey;
    const input = {
        page, filter, limit, sortField, order, where, whereIn, tableData: true,
    };
    const result = await axios.post(url, input);
    return result;
};
export const FetchData = ({
                              page, filter, limit, sortField, order, url, where, whereIn,
                          }) => {
    const {
        data, isLoading, error, refetch, status, isFetching
    } = useQuery([`tableList${url}`, page, filter, limit, sortField, order, url, where, whereIn,], GetData, {
        keepPreviousData: true, refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
    });
    return {data, isLoading, error, refetch, status, isFetching};
};

export const SubmitForm = async (data, url, id, tbl, primaryKey, moreTable, sendEmail) => {
    const api = new API();
    let getURL = url;
    if (tbl || moreTable) {
        if (!url) {
            getURL = "/api/admin/common";
        }
        data = {...data, tbl, primaryKey, moreTable};
    }
    const result = await api.create(getURL, data, id);
    if (refecthData) {
        await refecthData();
    }
    return result;
};

const MyTable = ({grid, columns, url, actions, where, whereIn, quickView, shouldRefetch, setRefetch}) => {
    const {t} = useTranslation();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState(null);
    const [limit, setLimit] = useState(grid?.isGrid && grid?.limit || process.env.NEXT_PUBLIC_TABLE_PAGINATION_LIMIT || 15);
    const [sortField, setSortField] = useState("");
    const [order, setOrder] = useState("asc");
    const [qview, setQview] = useState(false);
    const {data: currencyInfo, refetch: userRefetch, isLoading: userLoading} = GetDefaultCurrency();
    const OpenQuickView = (id) => {
        QuickView = quickView;
        // if qview === id then close quick view else open quick view
        setQview(qview === id ? false : id);
    };
    const CountTotal = (props) => {
        const {count, item} = props;
        const {tbl, field} = count;
        let where = count.where;
        // field key and value
        const fieldKey = Object.keys(field);
        // useQueries
        const results = useQueries(fieldKey?.map((key) => {
            // add where by field key
            where = {...where, [key]: item[field[key]]};
            const input = {
                tbl, where: where, getTotalRows: true,
            };
            return {
                queryKey: [`coudddnt${tbl}${key}`, where, tbl], queryFn: async () => {
                    const result = await axios.post("/api/admin/common", input);
                    return result;
                }, refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
            };
        }));
        return (<span>
        {results?.map((result, index) => {
            return <span key={index}>{result?.data?.all}</span>;
        })}
      </span>);
        return <>{data?.all || 0}</>;
    };
    const handleSortingChange = (accessor) => {
        const sortOrder = accessor === sortField && order === "asc" ? "desc" : "asc";
        setSortField(accessor);
        setOrder(sortOrder);
    };
    const {data, isLoading, error, refetch, status} = FetchData({
        page, filter, limit, sortField, order, url, where, whereIn,
    });
    // --- sorting start ---

    refecthData = refetch;


    useEffect(() => {
        if (shouldRefetch) {
            refetch();
            setRefetch(false);
        }
    }, [shouldRefetch, refetch, setRefetch]);


    if (error) {
        return <p>{error}</p>;
    }

    const handleDelete = async (url, id, all = false, moreDelete = null) => {
        // show confirm message before delete
        if (confirm("Are you sure you want to delete this item?")) {
            let result = "";
            if (all) {
                let input = {id, deleteAll: true};
                result = await axios.post(url, input);
            } else {
                result = await axios.delete(url, {data: {id: id}});
            }
            if (result.status === true) {
                notify("success", result.message || "The information Deleted successfully");
                await refetch();
            } else {
                notify("warning", result.message || "Failed to delete the information");
            }
            return result;
        }
    };
    const updateData = async (id, accessor, value, emailGroup, onlyOne, dependency) => {
        const api = new API();
        const input = {[accessor]: value};
        // check anyone is not null or empty if onlyOne is 0 then update all
        if (onlyOne === 0 || onlyOne === "no") {
            input.onlyOne = {[accessor]: onlyOne};
        }
        if (dependency) {
            input.dependency = {[accessor]: dependency};
        }
        const res = await api.create(url, input, id);
        if (res.affectedRows > 0) {
            notify("success", "The information updated successfully");
            await refetch();
            if (emailGroup) {
                await api.sendEmail(url, {emailGroup, id, accessor, value});
            }
        } else {
            if (res.status === false) {
                notify("warning", res.message);
            } else {
                notify("warning", "Failed to update the information");
            }
        }
    };

    const checkedAll = (e) => {
        const checkboxes = document.querySelectorAll('input.checkId[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = e.target.checked;
        });
    };

    // check if any checkbox is checked from .checkId then show the .deleteAll button
    const checkId = (e) => {
        const checkboxes = document.querySelectorAll('input.checkId[type="checkbox"]');
        const deleteAll = document.querySelector(".deleteAll");
        let checked = false;
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                checked = true;
            }
        });
        if (checked) {
            deleteAll.classList.remove("d-none");
        } else {
            deleteAll.classList.add("d-none");
        }
    };
    const Actions = (props) => {
        const {item, actions, link, linkId, index, btn} = props;
        return (<div className="flex-shrink-0 ">
            <ul
                className={`list-inline ${btn ? "hstack gap-2" : "tasks-list-menu"} mb-0`}
            >
                {Array.isArray(actions) && actions.length > 0 && actions?.map(({
                                                                                   name,
                                                                                   link,
                                                                                   id,
                                                                                   permission,
                                                                                   field,
                                                                                   ...props
                                                                               }) => {
                    if (permission) {
                        const permissionKey = Object.keys(permission)[0];
                        const permissionValue = permission[permissionKey];
                        if (item[permissionKey] != permissionValue) {
                            return;
                        }
                    }
                    if (name === "edit") {
                        return (<li className="list-inline-item me-0" key={name}>
                            <Link
                                key={`action${name}${index}`}
                                href={props?.as ? link + "?" + linkId + "=" + item[linkId] : link + item[linkId]}
                                as={props?.as ? link : link + item[linkId]}
                                className={btn ? `btn btn-sm btn-success text-decoration-none` : ""}
                            >
                                <i
                                    className={`${btn ? "ri-pencil-line" : "ri-pencil-fill align-bottom me-1 text-success"}`}
                                ></i>
                            </Link>
                        </li>);
                    }
                    if (name === "editModal") {
                        // const asLink = props.asLink ? props.asLink : link + item[linkId];
                        const {modal, setModal, setEditData} = props;
                        return (<li className="list-inline-item me-0" key={name}>
                            <Link
                                key={`action${name}${index}`}
                                href={modal ? '' : link + "?" + linkId + "=" + item[linkId]}
                                as={modal ? '' : link}
                                onClick={(e) => {
                                    setModal(true);
                                    setEditData && setEditData(item);
                                }}
                                className={btn ? `btn btn-sm btn-success text-decoration-none` : ""}
                            >
                                <i
                                    className={`${btn ? "ri-pencil-line" : "ri-pencil-fill align-bottom me-1 text-success"}`}
                                ></i>
                            </Link>
                        </li>);
                    }
                    if (name === "details") {
                        // check asLink with [discussion_id]
                        // if [discussion_id] is present then replace it with item[linkId] and pass it to asLink
                        // else pass link + item[linkId]
                        const asLink = props.asLink ? props.asLink.replace(`[${linkId}]`, item[linkId]) : link + item[linkId];
                        return (<li className="list-inline-item me-0" key={"dd" + name}>
                            <Link
                                key={`action${name}${index}`}
                                href={asLink}
                                as={asLink}
                                className={btn ? `btn btn-sm btn-warning text-decoration-none` : ""}
                            >
                                <i
                                    className={`${btn ? "ri-eye-line" : "ri-eye-fill align-bottom me-1 text-warning"}`}
                                ></i>
                            </Link>
                        </li>);
                    }
                    // download
                    if (name === "download") {
                        const files = item[field] && JSON.parse(item[field]);
                        // check the files is array or not
                        // if array and check the length of array is greater than 1 then download all files by downloadZip function
                        // else download single file
                        if (Array.isArray(files) && files.length > 1) {
                            return (<li className="list-inline-item me-0" key={`addddction${name}${index}`}>
                                <Link
                                    key={`action${name}${index}`}
                                    href="#"
                                    onClick={async () => {
                                        await DownloadZip(url, {
                                            [linkId]: item[linkId],
                                        });
                                    }}
                                    className={btn ? `btn btn-sm btn-primary text-decoration-none` : ""}
                                >
                                    <i
                                        className={`${btn ? "ri-download-line" : "ri-download-fill align-bottom me-1 text-primary"}`}
                                    ></i>
                                </Link>
                            </li>);
                        } else if (Array.isArray(files) && files.length === 1) {
                            return (<li className="list-inline-item me-0" key={`adddction${name}${index}`}>
                                <Link
                                    key={`action${name}${index}`}
                                    href="#"
                                    onClick={async () => {
                                        // if item[field] is an array then download all files by downloadZip function else download single file
                                        await DownloadFile(files[0]);
                                    }}
                                    className={btn ? `btn btn-sm btn-primary text-decoration-none` : ""}
                                >
                                    <i
                                        className={`${btn ? "ri-download-line" : "ri-download-fill align-bottom me-1 text-primary"}`}
                                    ></i>
                                </Link>
                            </li>);
                        } else {
                            return (<li className="list-inline-item me-0" key={`adddction${name}${index}`}>
                                <Link
                                    key={`action${name}${index}`}
                                    href="#"
                                    onClick={async () => {
                                        await DownloadFile(files);
                                    }}
                                    className={btn ? `btn btn-sm btn-primary text-decoration-none` : ""}
                                >
                                    <i
                                        className={`${btn ? "ri-download-line" : "ri-download-fill align-bottom me-1 text-primary"}`}
                                    ></i>
                                </Link>
                            </li>);
                        }
                    }
                    if (name === "delete") {
                        return (<li className="list-inline-item me-0" key={name}>
                            <Link
                                key={`action${name}${index}`}
                                href="#"
                                color="danger"
                                size="sm"
                                className={btn ? `btn btn-sm btn-danger text-decoration-none` : ""}
                                onClick={() => handleDelete(link, item[linkId])}
                            >
                                <i
                                    className={btn ? "ri-delete-bin-line" : "ri-delete-bin-2-line align-bottom me-1 text-danger"}
                                ></i>
                            </Link>
                        </li>);
                    }
                })}
            </ul>
        </div>);
    };
    const ImagesTab = ({images, ...params}) => {
        const api = new API();
        return (images ? <div className="row gallery-wrapper">
            {images?.map((image, index) => {
                const img = image?.url || image.image;
                const [width, height] = image?.image_size?.split('x').map((s) => parseInt(s, 10)) ?? [256, 256]
                return (<Col xxl={params?.col || 3} xl={4} sm={6} className="element-item project designing development"
                             key={index}>
                    <Card className="gallery-box">
                        <div className="gallery-container">
                            <DisplayImage src={img} alt={image.title || 'NextAi Image'}
                                          width={width || 256}
                                          height={height || 256}
                                          className="gallery-img img-fluid mx-auto"
                            />
                            <div className="gallery-overlay flex-column">
                                <p className="overlay-caption fs-13 my-auto w-100 ">{image.description}</p>
                                <div className="d-flex justify-content-between">
                                    <UncontrolledTooltip target={`copy-${image.image_id}`}>
                                        {t("Copy to clipboard you can now paste it anywhere")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`favorite-${image.image_id}`}>
                                        {image?.favorite === 'Yes' ? t("Remove from favorite") : t("Add to favorite")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`prompt-${image.image_id}`}>
                                        {t("Use this same prompt to generate more images")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`download-${image.image_id}`}>
                                        {t("Download this Image")}
                                    </UncontrolledTooltip>
                                    <UncontrolledTooltip target={`delete-${image.image_id}`}>
                                        {t("Delete this Image")}
                                    </UncontrolledTooltip>
                                    <div className="me-2">
                                        <i
                                            id={`favorite-${image.image_id}`}
                                            onClick={async () => {
                                                let message = '';
                                                let input = {
                                                    favorite: image?.favorite === 'Yes' ? 'No' : 'Yes',
                                                }
                                                message = image?.favorite === 'Yes' ? t("Removed from favorite") : t("Added to favorite");
                                                const result = await api.create('/api/admin/images', input, image.image_id)
                                                if (result) {
                                                    notify('success', message)
                                                    await refetch();
                                                }
                                            }}
                                            className={`bx ${image?.favorite === 'Yes' ? 'bxs-heart text-danger' : 'bx-heart text-white'}  fs-20 me-2 pointer`}/>

                                        <i
                                            id={`prompt-${image.image_id}`}
                                            onClick={() => {
                                                setRegenerate(image)
                                                // setExample(image.description)
                                            }}
                                            className='bx bx-add-to-queue text-white fs-20 me-2 pointer'/>
                                    </div>
                                    <div className="me-2">
                                        <i
                                            id={`copy-${image.image_id}`}
                                            onClick={async () => {
                                                try {
                                                    const blob = await fetch(img).then((r) => r.blob());
                                                    await navigator.clipboard.write([new ClipboardItem({
                                                        [blob.type]: blob,
                                                    }),]);
                                                    notify('success', t("Copied to clipboard"))
                                                } catch (err) {
                                                    notify("warning", t("Failed to copy to clipboard"))
                                                }
                                            }}
                                            className={`bx bx-copy text-white fs-20 me-2 pointer`}/>
                                        <i
                                            id={`download-${image.image_id}`}
                                            onClick={async () => {
                                                // download image file
                                                await DownloadFile({
                                                    fileUrl: img, originalFilename: image.title + '.png',
                                                });
                                            }}
                                            className={`bx bx-download text-white fs-20 me-2 pointer`}/>
                                        <i
                                            id={`delete-${image.image_id}`}
                                            onClick={async () => {
                                                if (confirm(t("Are you sure you want to delete this item?"))) {
                                                    await api.delete('/api/admin/images', image.image_id).then(async (result) => {
                                                        if (result) {
                                                            notify('success', t("Deleted successfully"))
                                                            await refetch();
                                                        }
                                                    })
                                                }
                                            }}

                                            className={`bx bx-trash text-white fs-20 me-2 pointer`}/>
                                    </div>
                                </div>
                            </div>


                        </div>
                        <div className="box-content">
                            <div className="d-flex align-items-center mt-1">
                                <div className="flex-grow-1 text-muted">{t('By')} <Link href="#"
                                                                                        className="text-body text-truncate">{image?.fullname || 'Unknown'}</Link>

                                </div>
                                <div className="flex-shrink-0">
                                    <div className="d-flex gap-3">
                                        <button type="button"
                                                className="btn btn-sm fs-12 btn-link text-body text-decoration-none px-0">
                                            <i className="ri-time-line text-muted align-bottom me-1"></i> {DisplayDateTime(image?.created_at)}

                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>)
            })}
        </div> : <div className="text-center">
            <h3 className="text-center">{t('No Images Found')}</h3>
        </div>)
    }

    return (<div id="customerList" className={qview ? "d-lg-flex gap-1" : ""}>
        {isLoading ? (<>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="skeleton" style={{height: '1.5rem', width: '15%'}}/>
                <div className="skeleton" style={{height: '1.5rem', width: '15%'}}/>
            </div>
            <div className="skeleton mb-1 w-100" style={{height: '1.5rem'}}/>
            <div className="skeleton mb-1 w-100" style={{height: '1.5rem'}}/>
            <div className="skeleton mb-1 w-100" style={{height: '1.5rem'}}/>
            <div className="skeleton mb-1 w-100" style={{height: '1.5rem'}}/>
            <div className="skeleton mb-1 w-100" style={{height: '1.5rem'}}/>

            <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="skeleton" style={{height: '1.5rem', width: '15%'}}/>
                <div className="skeleton" style={{height: '1.5rem', width: '15%'}}/>
            </div>

        </>) : (<>
            <div className={"w-100 p-3 py-0"}>

                <Row className="g-4 mb-3">
                    <Col className="col-sm-auto">
                        <div className="d-flex justify-content-sm-end">
                            <div className="search-box ms-2">
                                <input
                                    type="text"
                                    className="form-control form-control-sm search"
                                    placeholder="Search..."
                                    value={filter || ""}
                                    onChange={(e) => setFilter(e.target.value.trim())}
                                />
                                <i className="ri-search-line search-icon"></i>
                            </div>
                            <div className="ms-2">
                                <Button
                                    color="danger"
                                    className="btn-sm d-none deleteAll"
                                    onClick={() => {
                                        const checked = document.querySelectorAll('input.checkId[type="checkbox"]:checked');
                                        const ids = [];
                                        checked.forEach((checkbox) => {
                                            ids.push(checkbox.value);
                                        });
                                        if (ids.length > 0) {
                                            const res = handleDelete(url, ids, true);
                                            res.then((result) => {
                                                if (result.affectedRows > 0) {
                                                    // uncheck all checkboxes
                                                    checkedAll({target: {checked: false}});
                                                    // hide the deleteAll button
                                                    checkId();
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <i className="ri-delete-bin-line"></i>
                                </Button>
                            </div>
                        </div>
                    </Col>
                    <Col className="col-sm-auto ms-auto">
                        <div className="hstack gap-2">
                            {actions && actions.map((action, index) => {
                                if (action.name === "btn") {
                                    if (action.modal === true) {
                                        if (action.setModal) {
                                            return (<div key={`modalDiv${index}`}>
                                                <Button
                                                    title={action.label ? action.label : ""}
                                                    className={`btn btn-sm ${action.className ? action.className : "btn-primary"}`}
                                                    key={`tableModalButton${index}`}
                                                    color={action.color}
                                                    onClick={() => {
                                                        action.setModal(true);
                                                        if (action.onClick) {
                                                            action.onClick();
                                                        }
                                                    }}
                                                    size={action.size ? action.size : ""}
                                                    icon={action.icon ? action.icon : ""}
                                                >
                                                    {action.label}
                                                </Button>
                                            </div>);
                                        } else {
                                            return (<div key={`modalDiv${index}`}>
                                                <BtnModal
                                                    title={action.label ? action.label : ""}
                                                    className={`btn btn-sm ${action.className ? action.className : "btn-primary"}`}
                                                    key={`tableModalButton${index}`}
                                                    color={action.color}
                                                    size={action.size ? action.size : ""}
                                                    icon={action.icon ? action.icon : ""}
                                                >
                                                    {action.children}
                                                </BtnModal>
                                            </div>);
                                        }
                                    } else if (action.link) {
                                        return (<Link
                                            href={action.link}
                                            className={`btn btn-sm ${action.className ? action.className : "btn-primary"}`}
                                            key={index}
                                        >
                                            {action.icon && (<i className={`align-bottom me-1 ${action.icon}`}/>)}
                                            {action.label ? action.label : ""}
                                        </Link>);
                                    } else if (action.onClick) {
                                        return (<Button
                                            className={`btn btn-sm ${action.className ? action.className : "btn-primary"}`}
                                            key={index}
                                            color={action.color}
                                            onClick={() => action.onClick()}
                                        >
                                            {action.icon && (<i className={`align-bottom me-1 ${action.icon}`}/>)}
                                            {action.label}
                                        </Button>);
                                    }
                                } else if (action.name === "dropdown") {
                                    return (<UncontrolledDropdown
                                        key={`UncontrolledDropdown ${index}`}
                                    >
                                        <DropdownToggle
                                            className={`btn btn-sm ${action.className ? action.className : "btn-primary"}`}
                                        >
                                            {action.icon && (<i className={`align-bottom me-1 ${action.icon}`}/>)}
                                            {action.label ? action.label : ""}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {action.items && action.items.map((item, index) => {
                                                return (<DropdownItem
                                                    className={`btn btn-sm btn-outline-primary ${item.className ? item.className : ""}`}
                                                    key={`DropdownItem ${index}`}
                                                    onClick={() => item.onClick()}
                                                >
                                                    {item.icon && (<i
                                                        className={`align-bottom me-1 ${item.icon}`}
                                                    />)}
                                                    {item.label ? item.label : ""}
                                                </DropdownItem>);
                                            })}
                                        </DropdownMenu>
                                    </UncontrolledDropdown>);
                                } else if (action.children) {
                                    return action.children;
                                }
                            })}
                        </div>
                    </Col>
                </Row>

                {grid?.isGrid ? grid.type === 'image' && (<>
                    {grid.children ? grid.children(data?.results, refetch) : <ImagesTab images={data?.results}
                                                                                        columns={grid.columns}
                    />}

                </>) : (<div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle " id="customerTable">
                        <thead className="table-light">
                        <tr>
                            {columns.map(({
                                              label, accessor, sortable, checkbox, hideOnQuick, ...props
                                          }) => {
                                const cl = sortable ? sortField === accessor && order === "asc" ? "up" : sortField === accessor && order === "desc" ? "down" : "default" : "";
                                if (checkbox) {
                                    return (<th
                                        key={accessor}>
                                        <div className="form-check form-check-table">
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                value=""
                                                id="checkall"
                                                onChange={(e) => {
                                                    checkedAll(e);
                                                    checkId(e);
                                                }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                htmlFor="customerCheckAll"
                                            />
                                        </div>
                                    </th>);
                                }
                                // if quickView is true,then Hide the column with hideOnQuick property set to true in the columns array
                                if (qview && hideOnQuick) {
                                    return null;
                                }
                                return (<th
                                    key={label}
                                    onClick={sortable ? () => handleSortingChange(accessor) : null}
                                    className={cl}
                                >
                                    {label}
                                </th>);
                            })}
                        </tr>
                        </thead>
                        <tbody className="list form-check-all">
                        {data?.results?.map((item, index) => (<tr id={`tblrow${index}`} key={index}>
                            {columns.map(({
                                              label,
                                              accessor,
                                              checkbox,
                                              link,
                                              linkId,
                                              emailGroup,
                                              actions,
                                              image,
                                              quickView,
                                              hideOnQuick,
                                              ...props
                                          }) => {


                                // if quickView is true,then Hide the column with hideOnQuick property set to true in the columns array
                                if (qview && hideOnQuick) {
                                    return null;
                                }
                                if (checkbox) {
                                    return (<td key={`checkbox${index}`}>
                                        <div className="form-check form-check-table">
                                            <Input
                                                type="checkbox"
                                                className="form-check-input checkId"
                                                id={`customerCheck${index}`}
                                                name={`${accessor}[]`}
                                                value={item[linkId]}
                                                onChange={(e) => {
                                                    checkId(e);
                                                }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                htmlFor={`customerCheck${index}`}
                                            />
                                        </div>
                                    </td>);
                                } else if (accessor === "permission") {
                                    return (<td key={`permission${index}`}>
                                        <PermissionData
                                            key={`permissionFor${item[linkId]}${index}`}
                                            menu_id={props.menu_id}
                                            href={link + "?" + linkId + "=" + item[linkId] + "&permission=" + props.menu_id}
                                            asLink={link}
                                            linkId={item[linkId]}
                                            data={item}
                                            modal={props?.modal}
                                            url={url}
                                        />
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                } else if (accessor === "prefix") {
                                    return (<td key={`prefix${index}`}>
                                        <div key={`actions${index}`} className="d-flex">
                                            {quickView ? (<div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    OpenQuickView(item[linkId]);
                                                }}
                                            >
                                                <Link href={"#"}>
                                                    <PrefixData
                                                        key={`prefixFor${item[linkId]}${index}`}
                                                        {...item}
                                                    />
                                                </Link>
                                            </div>) : (<Link href={link ? link + item[linkId] : "#"}>
                                                <PrefixData
                                                    key={`prefixFor${item[linkId]}${index}`}
                                                    {...item}
                                                />
                                            </Link>)}
                                            {actions && (<Actions
                                                key={`actionsFor${item[linkId]}${index}`}
                                                item={item}
                                                actions={actions}
                                                link={link}
                                                linkId={linkId}
                                                index={index}
                                                {...props}
                                            />)}
                                            {props.cell && props.cell(item, refetch)}
                                        </div>
                                    </td>);
                                } else if (image) {
                                    // check item[accessor] is json or string
                                    // check item[accessor] is json or not
                                    if (item[accessor]?.startsWith("[{")) {
                                        const allFiles = JSON.parse(item[accessor]);
                                        return (<td key={`prefix${index}`}>
                                            <div style={{width: "50px"}}>
                                                <Swiper
                                                    pagination={false}
                                                    spaceBetween={0}
                                                    slidesPerView={1}
                                                    loop={false}
                                                    autoplay={{delay: 5000}}
                                                >
                                                    {allFiles?.map((file, index) => {
                                                        return (<SwiperSlide
                                                            className="swiper-slide"
                                                            key={`image${index}`}
                                                        >
                                                            <div className="avatar-sm">
                                                                <div
                                                                    className="avatar-title bg-light text-secondary rounded fs-24">
                                                                    <Link
                                                                        href={"#"}
                                                                        passHref={true}
                                                                        onClick={async () => {
                                                                            await DownloadFile(file);
                                                                        }}
                                                                    >
                                                                        {file?.mimetype?.includes("image") ? (
                                                                            <DisplayImage
                                                                                src={file.fileUrl}
                                                                                alt="image"
                                                                                width={50}
                                                                                height={50}
                                                                                className="img-fluid rounded"
                                                                            />) : (
                                                                            <i className="mdi mdi-file-document-outline "/>)}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>);
                                                    })}
                                                </Swiper>
                                                {props.download !== false && (<Button
                                                    color="primary"
                                                    size="sm"
                                                    className="btn-rounded waves-effect waves-light"
                                                    onClick={async () => {
                                                        await DownloadZip(url, {
                                                            [linkId]: item[linkId],
                                                        });
                                                    }}
                                                >
                                                    {<i className="bx bx-download fs-16 align-middle mr-2"/>}
                                                </Button>)}
                                            </div>
                                        </td>);
                                    } else {
                                        return (<td
                                            className={'py-1'}
                                            key={`images${index}`}>
                                            <div className={'py-1 d-flex align-items-center'}>
                                                <div className={'gallery-box p-0 m-0'} style={{width: "50px"}}>
                                                    <div className="gallery-container">
                                                        <DisplayImage
                                                            src={item[accessor] ? item[accessor] : "/../public/uploads/defaultImage.png"}
                                                            alt="image"
                                                            width={50}
                                                            height={50}
                                                            className="img-fluid rounded"
                                                        />
                                                        <div className="gallery-overlay">
                                                            <i
                                                                id={`download-${image.image_id}`}
                                                                onClick={async () => {
                                                                    const name = image?.title || item?.title || "images";
                                                                    // download image file
                                                                    await DownloadFile({
                                                                        fileUrl: item[accessor],
                                                                        originalFilename: name + ".png",
                                                                    });
                                                                }}
                                                                className={`bx bx-download text-white fs-20 me-2 pointer`}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                {props.cell && props.cell(item, refetch)}
                                            </div>
                                        </td>);
                                    }
                                } else if (props.array) {
                                    return (<td key={`sssarray${index}`}>
                                        <div className={"d-flex flex-wrap gap-1"}>
                                            {item[accessor] && item[accessor].split(",").map((tag, index) => {
                                                return (<Badge
                                                    key={`ssssssarray${index}`}
                                                    className="badge bg-soft-primary"
                                                    color={"primary"}
                                                >
                                                    {tag}
                                                </Badge>);
                                            })}
                                            {props.cell && props.cell(item, refetch)}
                                        </div>
                                    </td>);
                                } else if (props.update) {
                                    if (props.type === "checkbox") {
                                        const checked = item[accessor] === (props?.number ? 1 : "yes") ? true : false;
                                        let onlyOne = null;
                                        if (props?.onlyOne) {
                                            onlyOne = props?.number ? 0 : "no";
                                        }
                                        return (<td key={`checkboxUpdate${index}`}>
                                            <div className="form-check form-check-table form-switch">
                                                <Input
                                                    type="checkbox"
                                                    className="form-check-input "
                                                    id={`customerCheck${index}`}
                                                    name={`${accessor}`}
                                                    value={item[accessor]}
                                                    checked={checked}
                                                    onChange={(e) => updateData(item[linkId], accessor, e.target.checked ? props?.number ? 1 : "yes" : props?.number ? 0 : "no", emailGroup, onlyOne, props?.dependency)}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    htmlFor={`customerCheck${index}`}
                                                />
                                            </div>
                                            {props.cell && props.cell(item, refetch)}
                                        </td>);
                                    }
                                    // get status details from props.status
                                    const status = props.update?.find((status) => status.value === item[accessor]);
                                    return (<td key={`status${index}${accessor}`}>
                                        <Badge
                                            key={`status${index}${accessor}`}
                                            color={status?.color || "primary"}
                                        >
                                            {props.update && (<UncontrolledDropdown>
                                                <DropdownToggle
                                                    className="btn btn-xs btn-link  dropdown-toggle"
                                                    tag="a"
                                                >
                                                    {status?.label || item[accessor]}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {props.update.map((status, index) => {
                                                        return (<DropdownItem
                                                            key={`statusChange${index}${accessor}`}
                                                            className={status.value === item[accessor] ? "active" : ""}
                                                            onClick={() => updateData(item[linkId], accessor, status.value, emailGroup)}
                                                        >
                                                            {status.label}
                                                        </DropdownItem>);
                                                    })}
                                                </DropdownMenu>
                                            </UncontrolledDropdown>)}
                                        </Badge>
                                    </td>);
                                } else if (accessor === "tags") {
                                    let allTages = "";
                                    try {
                                        allTages = JSON.parse(item[accessor]).map((tag, index) => {
                                            return (<Badge
                                                key={`tags${index}`}
                                                className="badge bg-soft-primary"
                                                color={"primary"}
                                            >
                                                {tag}
                                            </Badge>);
                                        });
                                    } catch (e) {
                                    }
                                    return (<td key={`tags${index}`}>
                                        <div className={"d-flex flex-wrap gap-1"}>
                                            {allTages}
                                        </div>
                                    </td>);
                                } else if (link) {
                                    return (<td key={`link${index}`}>
                                        <div key={`actionsLink${index}`} className="d-flex align-items-center">
                                            <Link
                                                className={"fw-medium link-primary"}
                                                href={props?.asLink ? props.asLink + "?" + props.asLinkId + "=" + item[props.asLinkId] : link + item[linkId]}
                                                as={link + item[linkId]}
                                            >
                                                {item[accessor]}
                                                {props.cell && props.cell(item, refetch)}
                                            </Link>
                                            {actions && (<Actions
                                                key={`actionsseFor${item[linkId]}${index}`}
                                                item={item}
                                                actions={actions}
                                                link={link}
                                                linkId={linkId}
                                                index={index}
                                                {...props}
                                            />)}
                                        </div>
                                    </td>);
                                } else if (actions) {
                                    return (<td key={`actassions${index}${accessor ? accessor : 'sad'}`}>
                                        <div key={`actions${index}`}
                                             className={`${props?.cell || props?.flex ? `${props?.flex} d-flex align-items-center` : ""}`}>
                                            {item[accessor] ? (<div className="flex-grow-1 tasks_name">
                                                {props?.bold ? (<b>{item[accessor]}</b>) : item[accessor]}
                                                {props.cell && props.cell(item, refetch)}
                                            </div>) : (
                                                <div className={`${props?.flexClass || 'flex-grow-1 tasks_name'}`}>
                                                    {props.cell && props.cell(item, refetch)}
                                                </div>)}
                                            {actions && (<Actions
                                                key={`actionsForddd${item[linkId]}${index}`}
                                                item={item}
                                                actions={actions}
                                                link={link}
                                                linkId={linkId}
                                                index={index}
                                                {...props}
                                            />)}
                                        </div>
                                    </td>);
                                } else if (props.dateTime) {
                                    return (<td
                                        key={`dateTime${(index, accessor, item[accessor])}`}
                                    >
                                        {DisplayDateTime(item[accessor])}
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                } else if (props.date) {
                                    return (<td key={`date${(index, accessor, item[accessor])}`}>
                                        {DisplayDate(item[accessor])}
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                } else if (props.money) {
                                    let currency = {};
                                    if (item?.currency_code) {
                                        currency.currency_name = item.currency_name;
                                        currency.symbol = item.symbol;
                                        currency.currency_code = item.currency_code;
                                        currency.precision = item.precision;
                                        currency.decimal_separator = item.decimal_separator;
                                        currency.thousand_separator = item.thousand_separator;
                                        currency.symbol_position = item.symbol_position;
                                        currency.exchange_rate = item.exchange_rate;
                                    } else {
                                        currency = currencyInfo;
                                    }
                                    return (<td key={`money${(index, accessor)}`}>
                                        {DisplayMoney(item[accessor], currency)}
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                } else if (props.count) {
                                    return (<td key={`count${index}`}>
                                        <CountTotal
                                            key={`CountTotal${item[linkId]}${index}`}
                                            count={props.count}
                                            id={item[linkId]}
                                            item={item}
                                        />
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                }
                                // if length is true then show string as per the length
                                if (props.length) {
                                    const tData = item[accessor] ? item[accessor] : "——";
                                    const shortData = tData.length > props.length ? tData.substring(0, props.length) + "..." : tData;


                                    return (<td key={`Field ${accessor}${index}`}>
                                        <UncontrolledTooltip target={`shortData${accessor}${index}`}>
                                            {tData}
                                        </UncontrolledTooltip>
                                        <span
                                            id={`shortData${accessor}${index}`}>{Helper.removeHtmlTags(shortData)}</span>
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                }
                                if (accessor) {
                                    const tData = item[accessor] ? item[accessor] : "——";
                                    return (<td key={`Field asdddsadsaasf ${accessor}`}>
                                        {props?.bold ? (
                                            <b>{props.lang ? t(tData) : tData}</b>) : props.lang ? t(tData) : tData}
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                } else if (props.cell) {
                                    return (<td key={`Field adsdsdsa ${index}${label}`}>
                                        {props.cell && props.cell(item, refetch)}
                                    </td>);
                                }
                            })}
                        </tr>))}
                        </tbody>
                    </table>
                </div>)}
                <Pagination
                    data={data}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            </div>
        </>)}


        {qview && (<>
            <div className="quick-view-details p-2 py-0 w-100">
                <div className="d-flex justify-content-end">
                    <Button
                        className="btn btn-sm btn-danger"
                        onClick={() => setQview(null)}
                    >
                        Close
                    </Button>
                </div>
                {qview && (<QuickView id={qview} page={"details"} quickView={true}/>)}
            </div>
        </>)}
    </div>);
};
export default MyTable;

export const Pagination = (props) => {
    const {data, page, setPage, limit, setLimit} = props;
    const options = [5, 10, 20, 50, 100];
    // if limit is not in options add it
    if (!options.includes(limit)) {
        options.push(limit);
        options.sort((a, b) => a - b);
    }
    const {t} = useTranslation();

    return (<div className="d-flex justify-content-center">
        <div className="gridjs-footer">
            <div className="gridjs-pagination">
                <div className="gridjs-pagination">
                    <div
                        role="status"
                        aria-live="polite"
                        className="gridjs-summary"
                        title="Page 1 of 2"
                    >
                        <Label className="form-label me-1">
                            <select
                                value={limit}
                                className="form-control form-control-sm"
                                onChange={(e) => setLimit(e.target.value)}
                            >
                                {options.map((item, index) => (<option key={index} value={item}>
                                    {item}
                                </option>))}
                            </select>
                        </Label>
                        {data?.showing}
                    </div>
                    <div className="gridjs-pages">
                        {data?.pagination?.map((item, index) => (<Button
                            key={index}
                            disabled={item.disable}
                            className={`page-item ${item.active === true ? "gridjs-currentPage" : ""}`}
                            onClick={() => setPage(item.page)}
                            title={item.title}
                        >
                            {item.title}
                        </Button>))}
                    </div>
                </div>
            </div>
        </div>
    </div>);
}

const PermissionNotAll = (props) => {
    const api = new API();
    const {data, id, menu_id, url, asLink, avatar} = props;
    const {permission, permission_value} = data;
    const [modal, setModal] = useState(false);
    const {t} = useTranslation();
    const results = useQueries(permission_value?.split(",").map((id) => {
        return {
            queryKey: [permission, id], queryFn: async () => {
                return await api.create("/api/admin/common", {
                    id, permissionById: true, permission,
                });
            },
        };
    }));
    const permissionData = results?.map((result) => {
        return result.data;
    });
    return (<div className="d-flex align-items-center ">
        <div className="avatar-group">
            {permissionData?.map((value, key) => (<React.Fragment key={`inpuser${key}`}>
                <Link
                    href="#"
                    id={`permissionTooltip${key}${permission}${id}`}
                    className="avatar-group-item"
                >
                    <div className={`avatar${avatar ? "-" + avatar : "-xxs"}`}>
                        {permission === "select_designations" ? (<>
                            <div className="avatar-title rounded-circle bg-soft-primary text-primary">
                                <i className={"ri-group-2-line"}/>
                            </div>
                            <UncontrolledTooltip
                                placement="top"
                                target={`permissionTooltip${key}${permission}${id}`}
                            >
                                {value?.designations}
                            </UncontrolledTooltip>{" "}
                        </>) : (<>
                            <UserImage image={value}/>
                            <UncontrolledTooltip
                                placement="top"
                                target={`permissionTooltip${key}${permission}${id}`}
                            >{`${value?.first_name} ${value?.last_name}`}</UncontrolledTooltip>{" "}
                        </>)}
                    </div>
                </Link>
            </React.Fragment>))}
            {props?.modal ? (<BtnModal
                className={`avatar-group-item`}
                id={`table_individual_people_more`}
                permission={true}
                title={t("Update Permission")}
                size=""
                link={true}
                show={modal}
                // handleClose={() => setModal(false)}
                avatar={avatar}
                href={asLink}
            >
                <PermissionForm setModal={setModal} {...props} />
            </BtnModal>) : (<Link
                className={`avatar-group-item`}
                id={`table_individual_people_more`}
                title={t("Update Permission")}
                key={`action${menu_id}${id}`}
                href={props.href}
                as={asLink}
            >
                <div className={`avatar${avatar ? "-" + avatar : "-xxs"}`}>
                    <div className="avatar-title  rounded-circle bg-light border-dashed border text-primary">
                        {" "}
                        +
                    </div>
                </div>
            </Link>)}
            <UncontrolledTooltip
                placement="top"
                target={`table_individual_people_more`}
            >
                {t("Add More")}
            </UncontrolledTooltip>
        </div>
    </div>);
};

const PermissionID = (props) => {
    const api = new API();
    const {data, id, menu_id, url, asLink, avatar} = props;
    const {permission} = data;
    const userID = JSON.parse(permission);
    const [modal, setModal] = useState(false);
    const {t} = useTranslation();
    const results = useQueries(userID?.map((id) => {
        return {
            queryKey: [permission, id], queryFn: async () => {
                return await api.create("/api/admin/common", {
                    id, permissionById: true, permission,
                });
            },
        };
    }));
    const permissionData = results?.map((result) => {
        return result.data;
    });
    return (<div className="d-flex align-items-center ">
        <div className="avatar-group">
            {permissionData?.map((value, key) => value && (<React.Fragment key={`inpuser${key}`}>
                <Link
                    href="#"
                    id={`permissionTooltip${key}${value?.user_id}${id}`}
                    className="avatar-group-item"
                >
                    <div className={`avatar${avatar ? "-" + avatar : "-xxs"}`}>
                        <DisplayImage
                            src={Avatar(value?.avatar)}
                            className={`rounded-circle img-fluid`}
                            width={40}
                            height={40}
                            alt="user"
                        />
                        <UncontrolledTooltip
                            placement="top"
                            target={`permissionTooltip${key}${value?.user_id}${id}`}
                        >{`${value?.first_name} ${value?.last_name}`}</UncontrolledTooltip>{" "}
                    </div>
                </Link>
            </React.Fragment>))}
            {props?.modal ? (<BtnModal
                className={`avatar-group-item`}
                id={`table_individual_people_more`}
                permission={true}
                title={t("Update Permission")}
                size=""
                link={true}
                show={modal}
                // handleClose={() => setModal(false)}
                avatar={avatar}
                href={asLink}
            >
                <PermissionForm setModal={setModal} {...props} />
            </BtnModal>) : (<BtnModal
                className={`avatar-group-item`}
                id={`table_individual_people_more`}
                permission={true}
                title={t("Assign Permission")}
                size=""
                link={true}
                show={modal}
                // handleClose={() => setModal(false)}
                avatar={avatar}
                href={asLink}
            >
                <PermissionIDForm setModal={setModal} {...props} />
            </BtnModal>)}
            <UncontrolledTooltip
                placement="top"
                target={`table_individual_people_more`}
            >
                {t("Add More")}
            </UncontrolledTooltip>
        </div>
    </div>);
};

const PermissionForm = (props) => {
    const {setModal} = props;
    const {t} = useTranslation();
    const meta = {
        columns: 1, fields: [{
            name: "permission", type: "permission", label: t("Permission"), // required: true,
            value: props.data?.permission, permission_value: props.data?.permission_value,
        }, {
            type: "submit", label: "Submit", setModal: setModal, className: "text-end",
        },],
    };
    return (<Fb
        meta={meta}
        form={true}
        url={props.url}
        to={props.asLink}
        id={props.linkId}
        refetch={props?.refetch}
        layout={"vertical"}
    />);
};

const PermissionIDForm = (props) => {
    const company_id = companyID();
    const {setModal} = props;
    const {t} = useTranslation();
    const meta = {
        columns: 1, fields: [{
            name: "permission",
            value: props.data?.permission,
            type: "select",
            isMulti: true,
            required: true,
            placeholder: t("assign_to"),
            getOptions: {
                url: "/api/admin/users", where: {
                    "company_id": company_id,
                }
            },
        }, {
            type: "submit", label: "Submit", setModal: setModal, className: "text-end",
        },],
    };
    return (<Fb
        meta={meta}
        form={true}
        url={props.url}
        to={props.asLink}
        id={props?.id ? props?.id : props?.linkId}
        refetch={props?.refetch}
        layout={"vertical"}
    />);
};

export const PermissionData = (props) => {
    const {t} = useTranslation();
    const {data, id, href, menu_id, asLink, avatar} = props;
    const {permission, permission_value} = data;
    const [modal, setModal] = useState(false);
    if (permission === "all") {
        return (<div className="hstack gap-2 flex-wrap">
            <span className="badge bg-success">{t("Everyone")}</span>
            {props?.modal ? (<BtnModal
                permission={true}
                title={t("Update Permission")}
                size=""
                link={true}
                show={modal}
                // handleClose={() => setModal(false)}
                avatar={avatar}
                href={asLink}
            >
                <PermissionForm setModal={setModal} {...props} />
            </BtnModal>) : (<BtnModal
                className={`avatar-group-item`}
                id={`table_individual_people_more`}
                permission={true}
                title={t("Assign Permission")}
                size=""
                link={true}
                show={modal}
                avatar={avatar}
                href={asLink}
            >
                <PermissionIDForm setModal={setModal} {...props} />
            </BtnModal>)}
        </div>);
    } else {
        if (permission_value) {
            return (<PermissionNotAll
                asLink={asLink}
                url={href}
                data={data}
                id={id}
                menu_id={menu_id}
                {...props}
            />);
        } else if (permission) {
            return (<PermissionID
                asLink={asLink}
                url={href}
                data={data}
                id={id}
                menu_id={menu_id}
                {...props}
            />);
        } else {
            return (<Link
                title={t("Update Permission")}
                key={`action${menu_id}${id}`}
                href={href}
                as={asLink}
            >
                <div className={`avatar${avatar ? "-" + avatar : "-xxs"}`}>
                    <div
                        className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                        {" "}
                        +
                    </div>
                </div>
            </Link>);
        }
    }
};

const PrefixData = (props) => {
    // generate prefix data
    let setPrefix = "";
    const {number, format, prefix} = props;
    if (format) {
        const date = new Date();
        setPrefix = format?.replace("[PREFIX]", prefix);
        setPrefix = setPrefix?.replace("[yyyy]", date.getFullYear());
        setPrefix = setPrefix?.replace("[yy]", date.getFullYear().toString().substr(-2));
        setPrefix = setPrefix?.replace("[mm]", (date.getMonth() + 1).toString().padStart(2, "0"));
        setPrefix = setPrefix?.replace("[m]", date.getMonth() + 1);
        setPrefix = setPrefix?.replace("[dd]", date.getDate().toString().padStart(2, "0"));
        setPrefix = setPrefix?.replace("[d]", date.getDate());
        setPrefix = setPrefix?.replace("[number]", number);
    } else {
        setPrefix = number;
    }
    return <span>{setPrefix}</span>;
};

export const DisplayImage = ({src, width, height, className, alt}) => {
    const imageUrl = encodeURIComponent(src);
    const imageWidth = width ? width : 100;
    const imageHeight = height ? height : 100;
    const imageClass = className ? className : "";
    const imageAlt = alt ? alt : "Image";
    return (<Image src={`${src}?${new Date().getTime()}`} alt={imageAlt}
                   width={imageWidth} height={imageHeight} className={imageClass}/>);
}
