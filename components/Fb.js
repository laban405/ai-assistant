// create a component FB that renders a form using react-hook-form and yup for validation and reactrap for styling
import React, {useState, useEffect, forwardRef, useRef, createRef, useContext} from 'react'

function _interopDefault(ex) {
    return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex;
}

const React__default = _interopDefault(React);
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Row,
    Col,
    FormFeedback,
    FormText,
    InputGroup,
    InputGroupText,
    Table,
    InputGroupAddon,
    Modal,
    ModalHeader,
    ModalBody,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Spinner
} from 'reactstrap'

import {useForm, Controller} from 'react-hook-form'
import Flatpickr from "react-flatpickr";
import moment from "moment/moment";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
// import Slider from "react-rangeslider";
// import "react-rangeslider/lib/index.css";
import {useQuery} from "react-query";
import Dropzone from "react-dropzone";
import Image from "next/image";
import {API, DisplayMoney, GetData, GetDefaultCurrency, GetOptions, GetResult} from "./config";
import pick from "lodash/pick";
import {SubmitForm} from "./MyTable";
import {useRouter} from "next/router";
import Select from "react-select";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {toast} from "react-toastify";
import {Context} from '../pages/_app';


let deletedFiles = [];
let setTheModal

const QuestionIcon = () => {
    return (<span className="question-icon">
        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-question-circle" fill="currentColor"
             xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd"
                  d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm.5 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V5.5a.5.5 0 0 0-.5-.5zm.5 5a.5.5 0 0 1-1 0v-.5a.5.5 0 0 1 1 0V11z"/>
        </svg>
    </span>);
}


const _extends = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

const getValue = function getValue(obj, namePath) {
    let value = obj;
    let path = namePath;
    if (typeof namePath === 'string') {
        path = namePath.split('.');
    }
    path.forEach(function (key) {
        value = value[key];
    });
    return value;
};

function FBField(props) {
    const {
        field, meta, layout, register, errors, setError, control, setValue, getValues, watch, url, isLoading, ...rest
    } = props;
    const form = null;

    let label = field.label
    let labelGroupProps = {}
    let isFieldViewMode = meta.viewMode || field.viewMode || field.readOnly;
    let labelProps = {
        htmlFor: field?.name, className: !isFieldViewMode ? 'form-label' : ''
    }
    let wrapperCol = {className: ''}
    let formItemLayout = field.formItemLayout || (field.label ? getValue(meta, 'formItemLayout') || [4, 7] : null);
    if (Array.isArray(formItemLayout) && formItemLayout.length >= 2) {
        if (!field.tooltip && layout === 'horizontal') {
            labelProps.className += ' col-' + formItemLayout[0]
        } else if (layout === 'horizontal') {
            labelGroupProps.className = ' text-end col-' + formItemLayout[0] + ' horizontal'
        }
        wrapperCol.className = 'col-' + formItemLayout[1];
    }
    if (field.labelCol && layout === 'horizontal') {
        labelProps.className = 'form-label col-' + field.labelCol
    }
    if (layout === 'horizontal') {
        labelProps.className += ' col-form-label text-end'
    }
    if (field.labelClass && field.tooltip) {
        labelGroupProps.className += field.labelClass
    }
    if (field?.props?.type === 'submit') {
        if (layout === 'horizontal') {
            labelProps.className += ' invisible'
        } else {
            labelProps.className += ' d-none'
        }

    }
    if (field.label && typeof field.label === 'string') {
        if (isFieldViewMode) {
            // field.label = field.label.replace(/:$/, '')
            // add colon to label
            if (field.label.slice(-1) !== ':') {
                field.label += ':' // add colon to label
            }
        }
        // create a label element for accessibility
        label = React.createElement('label', labelProps, field.label, !isFieldViewMode && field.required ? React.createElement('span', {className: 'required text-danger mt'}, '  *') : null)
    }
    if (field.tooltip) {
        label = React.createElement('div', labelGroupProps, label, React.createElement('span', {
            className: 'sdads', 'data-tooltip': field.tooltip, title: field.tooltip
        }, React.createElement(QuestionIcon, null)))
    }
    const formItemProps = _extends({
        colon: meta.colon,
    }, {
        className: (meta.viewMode ? 'view-mode ' : '') + (field.fieldClass || '') + (field.className || '') + ' ' + (field.className || field.formItemProps && field.formItemProps.className || '') + (layout === 'horizontal' ? ' row mb-2 ' : layout === 'floating' && !isFieldViewMode ? ' form-floating mb-2 ' : ' mb-2'),
    });

    if (field.render) {
        return field.render.call(this, _extends({
            formItemProps: formItemProps, field: field,
        }, pick(props, ['disabled', 'viewMode', 'initialValues'])));
    }

    let initialValue = void 0;
    const initialValues = meta.initialValues || {};
    // check has initial value in field
    if (field.initialValue) {
        initialValue = field.initialValue;
    } else if (field.value) {
        initialValue = field.value;
    } else if (field.getInitialValue) {
        initialValue = field.getInitialValue(field, initialValues, form);
    } else {
        if (field.name) {
            initialValue = getValue(initialValues, field.name);
        }
        if (field.name === 'permission' && !initialValue) {
            // set default permission value is all
            initialValue = 'all';
        }
    }
    const rules = field.rules || {};
    if (field.required) {
        rules.required = true;
    }
    const fieldProps = _extends({
        defaultValue: initialValue, preserve: meta.preserve
    }, pick(field, ['getValueFromEvent', 'getValueProps', 'normalize', 'trigger', 'preserve', 'valuePropName', 'validateTrigger', 'validateFirst']), field.fieldProps);

    if (field.name) {
        fieldProps.name = field.name;
    }
    if (field.col && formItemProps.labelCol && !field.formItemLayout) {
        const labelCol = Math.round(formItemProps.labelCol.span / field.col);
        Object.assign(formItemProps, {
            labelCol: {span: labelCol}, wrapperCol: {span: 12 - labelCol}
        });
    }
    if (isFieldViewMode) {
        let viewEle = null;
        const formValues = form ? form.getFieldsValue(true) : {};
        // check if field.key or field.name has value in formValues
        let viewValue = initialValue;
        // let viewValue = has(formValues, field.name) ? getValue(formValues, formItemProps.name) : initialValue;
        if (field.renderView) {
            viewEle = field.renderView(viewValue, form, initialValues);
        } else if (field.viewtype) {
            const Viewtype = field.viewtype;
            viewEle = React.createElement(Viewtype, _extends({
                value: viewValue, form: form, field: field
            }, field.viewtypeProps));
        } else if (field.link) {
            const href = typeof field.link === 'string' ? field.link : viewValue;
            viewEle = React.createElement('a', {href: href, target: field.linkTarget || '_self'}, viewValue);
        } else if (field.options) {
            const found = field.options.find(function (opt) {
                return opt.value === viewValue;
            });
            if (found) {
                viewValue = found.label;
            }
        } else if (field.getOptions) {
            const {url, label, where} = field.getOptions;
            const {
                data, isLoading, status: searchStatus, error,
            } = GetOptions(url, label, where);
            if (isLoading) {
                return <div>Loading...</div>;
            }
            if (searchStatus === 'error') {
                return <div>Error: {error.message}</div>;
            }
            const found = data.find(function (opt) {
                return opt.value === viewValue;
            });
            if (found) {
                viewValue = found.label;
            }
        } else if (field.name === 'tags') {
            try {
                viewValue = JSON.parse(viewValue);
                const tags = viewValue || [];
                viewEle = React.createElement('div', wrapperCol, tags.map(function (tag) {
                    return React.createElement('span', {
                        key: tag, className: 'badge bg-primary me-1'
                    }, tag);
                }));
            } catch (e) {
                console.log('tags parse error', e);
            }
        }
        if (!viewEle) {
            if (typeof viewValue === 'boolean') viewEle = (String(viewValue)); else if (viewValue === undefined) viewEle = 'N/A'; else {
                viewEle = React.createElement('div', {className: 'form-control -static'}, String(viewValue) || '');

            }
        }
        if (field.readOnly) {
            const _ele = React.createElement('span', {
                className: ' readonly' + ' ' + wrapperCol.className,
            }, viewEle);
            // createElement for form group using reactraap
            return React.createElement('div', formItemProps, label, _ele);
        }
        delete formItemProps.name;
        return React.createElement('div', formItemProps, label, viewEle);
    }

    // handle field Class
    const fieldClass = {
        className: 'form-control',
    };

    if (field.id) {
        fieldClass.id = field.id;
    }

    if (layout === 'horizontal') {
        if (field.inputCol) {
            wrapperCol.className += ` col-${field.inputCol}`;
        }
    } else if (field.inputCol) {
        fieldClass.className += ` col-${field.inputCol}`;
    }

    const fieldClassKey = ['inputClass', 'class', 'customClass', 'selectClass', 'wrapperInputClass'];
    fieldClassKey.forEach(key => {
        if (field[key]) {
            fieldClass.className += ` ${field[key]}`;
        }
    });

    // Handle type props
    const wp = field.typeProps || {};
    const typeProps = _extends({}, pick(field, ['placeholder', 'onChange', 'onClick', 'onBlur', 'onFocus', 'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp', 'onKeyPress', 'onInput', 'onCompositionStart', 'onCompositionUpdate', 'onCompositionEnd', 'onSelect', 'onContextMenu', 'onCopy', 'onCut', 'onPaste', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onScroll', 'onWheel', 'onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart', 'onAnimationStart', 'onAnimationEnd', 'onAnimationIteration', 'onTransitionEnd', 'onToggle']), {
        disabled: field.disabled || meta.disabled || props.disabled
    }, wp);
    let Fieldtype = field.type;
    const valueProps = {
        options: field.options, props: field.props,
    };
    // push setValue, getValues to field props
    if (setValue) {
        valueProps.props = _extends({}, valueProps.props, {setValue: setValue, getValues: getValues});
    }
    if (field.name) {
        valueProps.name = field.name;
        valueProps.control = control;
        // set error message
    }
    if (rules) {
        valueProps.rules = rules;
    }
    // if typeProps placeholder is not set, set default placeholder
    if (typeProps.placeholder) {
        valueProps.placeholder = field.placeholder;
    }
    if (isLoading) {
        return <>
            <div
                className="skeleton"
                style={{
                    width: "100%", height: "2rem", marginBottom: "0.5rem",
                }}
            />
        </>
    }
    const inputEle = field?.name ? React__default.createElement(Controller, _extends({}, valueProps, fieldProps, typeProps, fieldClass, {
        setError: setError,
    }, {
        render: ({field}) => {
            // remove ref from field
            delete field.ref;
            const fieldProps = {
                ...field, onChange: (...args) => {
                    typeProps.onChange?.(...args);
                    field.onChange?.(...args);
                }, onBlur: (...args) => {
                    typeProps.onBlur?.(...args);
                    field.onBlur?.(...args);
                }, onClick: (...args) => {
                    typeProps.onClick?.(...args);
                    field.onClick?.(...args);
                }
            };
            return React__default.createElement(Fieldtype, _extends({}, valueProps, fieldProps, fieldClass));
        }
    })) : React__default.createElement(Fieldtype, _extends({}, valueProps, fieldProps, typeProps, fieldClass));
    const addonBefore = ['addonBefore', 'input-group-prepend', 'inputGroupFirst', 'inputGroup', 'input-group'];
    const addonAfter = ['addonAfter', 'input-group-append', 'inputGroupLast'];
    // check addonBefore is in field or not if have then create element for this
    const beforeAddon = addonBefore.filter(key => field[key]);
    const afterAddon = addonAfter.filter(key => field[key]);
    const actionAddons = ['actionBefore', 'actionAfter'];
    // merge addonBefore and addonAfter in one array to handle them together
    const inputGroup = [].concat(addonBefore, addonAfter);
    const inputGroupElement = inputGroup.some(key => field[key]) ? React.createElement('div', {
        className: field?.inputGroupClassName || 'input-group'
    }, beforeAddon.length > 0 && React.createElement('div', {
        className: 'input-group-prepend'
    }, React.createElement('span', {
        className: 'input-group-text pointer'
    }, field[beforeAddon[0]])), inputEle, afterAddon.length > 0 && React.createElement('div', {
        className: 'input-group-append'
    }, React.createElement('span', {
        className: 'input-group-text pointer'
    }, field[afterAddon[0]]))) : inputEle;
    // if actionBefore or actionAfter have name then setValues for this name
    useEffect(() => {
        actionAddons.some(key => field[key]) && field.actionBefore?.name && setValue(field.actionBefore.name, field.actionBefore.value);
        actionAddons.some(key => field[key]) && field.actionAfter?.name && setValue(field.actionAfter.name, field.actionAfter.value);
    }, [field.actionBefore, field.actionAfter]);
    const inputGroupWithAction = actionAddons.some(key => field[key]) ? React.createElement('div', {
        className: ''
    }, field.actionBefore && React.createElement('div', {
        className: 'input-group-prepend'
    }, React.createElement('span', {
        className: 'input-group-text pointer'
    }, field.actionBefore?.children)), inputGroupElement, field.actionAfter && React.createElement('div', {
        className: 'input-group-append'
    }, React.createElement('span', {
        className: 'input-group-text pointer p-0'
    }, field.actionAfter.children))) : inputGroupElement;

    const helpKey = ['help', 'helpText', 'extra', 'hasFeedback', 'feedback'];
    // check helpKey is in field or not if have then create element for this
    const helpElement = helpKey.some(key => field[key]) ? React.createElement('span', {
        className: 'form-help text-danger ' + (field.helpClass || ''),
    }, helpKey.filter(key => field[key])?.map(key => field[key])) : null;
    const inputElementWithHelp = helpElement ? React.createElement('div', {
        className: ''// input with help class
    }, inputGroupWithAction, helpElement) : inputGroupWithAction;

    // handle error message for field
    const errorElement = errors[field.name] ? React.createElement('span', {
        className: 'form-error text-danger ' + (field.errorClass || '')
    }, errors[field.name].message ? errors[field.name].message : `This ${field.label} is required`) : null;
    const inputElement = errorElement ? React.createElement('div', {
        className: ''// input with error class
    }, inputElementWithHelp, errorElement) : inputElementWithHelp;


    const [arrayList, setArrayList] = useState([]);
    const [deletedField, setDeletedField] = useState([]);
    useEffect(() => {
        if (field?.arrayList) {
            setArrayList(field?.arrayList);
            setValue(field.props.id, field.arrayList);
        }
    }, [field?.arrayList]);
    useEffect(() => {
        if (arrayList && deletedField.length > 0) {
            setValue('deleteField', deletedField);
        }
    }, [deletedField]);

    const arrayElement = arrayList && arrayList.length > 0 ? React.createElement('ul', {
        className: 'list-group'
    }, arrayList.map((item, index) => {
        return React.createElement('li', {
            key: index, className: 'd-flex justify-content-between align-items-center'
        }, React.createElement('div', {
            className: 'input-group mt-2'
        }, React.createElement(Input, {
            type: 'text',
            name: field.props.id,
            value: typeof item === "object" ? item[field.props.id] : item,
            onChange: (e) => {
                if (typeof item === "object") {
                    item[field.props.id] = e.target.value;
                } else {
                    field.arrayList[index] = e.target.value;
                }
                setArrayList([...field.arrayList]);
                setValue(field.props.id, field.arrayList);
            }
        }), React.createElement('div', {
            className: 'input-group-append'
        }, React.createElement('div', {
            className: 'input-group-text pointer text-danger', onClick: () => {
                const list = field.arrayList;
                list.splice(index, 1);
                setDeletedField([...deletedField, item]);
                setArrayList([...list]);
                setValue(field.props.id, list);
            }
        }, 'X'))));
    })) : null;

    // Handle wrapper props
    const wrapper = ['wrapperClass', 'wrapper', 'wrapperProps', 'wrapperStyle', 'wrapperCol', 'wrapperName'];
    const wrapperClass = {
        className: ''
    };
    wrapper.forEach(key => {
        if (field[key]) {
            wrapperClass.className += ` ${field[key]}`;
        }
    });
    const inputWithArray = arrayElement ? React.createElement('div', {
        className: ''// input with array class
    }, inputElement, arrayElement) : inputElement;


    // check helpKey is in field or not if have then create element for this
    let wrapperDiv = wrapper.some(key => field[key]) ? React.createElement('div', {
        className: wrapperClass.className
    }, inputWithArray) : inputWithArray;
    // createElement for with input and label for accessibility
    return React__default.createElement('div', formItemProps, (layout !== 'floating' && label), (layout === 'horizontal' ? React__default.createElement('div', wrapperCol, wrapperDiv) : wrapperDiv), (layout === 'floating' && label));
}

const typeMap = {};

function getType(type) {
    if (!type) return null;
    if (typeof type === 'string') {
        if (!typeMap[type] || !typeMap[type].type) {
            throw new Error('type \'' + type + '\' not found, did you defined it by FB.defineComponent?');
        }
        return typeMap[type].type;
    }
    return type;
}

function normalizeMeta(meta, url, id, initialValues) {
    let fields = Array.isArray(meta) ? meta : meta.fields || meta.elements;
    if (!fields) fields = [meta];
    fields = fields.map(function (field) {
        if (field.type === 'permission' && field.url === undefined) {
            field.url = url;
        }
        if (field.type === 'prefix' && field.url === undefined) {
            field.url = url;
            if (field.value) {
                field.oldValue = field.value;
            } else if (initialValues === undefined || initialValues === null) {
                field.oldValue = null;
            } else {
                field.oldValue = initialValues[field.name];
                field.format = initialValues.format;
                field.prefix = initialValues.prefix;
            }
        } else if (field.type === 'prefix' && field.prefixStart) {
            const prefixStart = field.prefixStart;
            if (initialValues === undefined || initialValues === null) {
                field.oldValue = null;
            } else {
                field.oldValue = initialValues[field.name];
                field.format = initialValues[prefixStart + '_format'];
                field.prefix = initialValues[prefixStart + '_prefix'];
            }
        }
        if (field.unique) {
            if (field.url === undefined) {
                field.url = url;
            }
            if (id && field.value) {
                field.oldValue = field.value || initialValues[field.name];
            } else if (initialValues === undefined || initialValues === null) {
                field.oldValue = null;
            } else {
                field.oldValue = initialValues[field.name];
            }

        }
        if (field.type === 'submit') {
            field.isSubmitting = meta.isSubmitting;
        }


        const type = getType(field.type || 'text');
        const viewtype = getType(field.viewtype);
        const dynamic = field.dynamic !== false;
        // Find metaConvertor from typeMap
        const item = Object.values(typeMap).find(entry => (entry.type === type || entry.type === viewtype) && entry.metaConvertor);
        if (item) {
            const newField = item.metaConvertor(field);
            if (!newField) {
                throw new Error('metaConvertor of \'' + String(field.type) + '\' must return a field');
            }
            return _extends({}, newField, {viewtype: viewtype, type: type, dynamic: dynamic});
        }
        return _extends({}, field, {type: type, viewtype: viewtype, dynamic: dynamic});
    });
    if (Array.isArray(meta) || !meta.fields && !meta.elements) {
        return {fields: fields};
    }
    return _extends({}, meta, {
        fields: fields
    });
}


function Fb(props) {
    const {
        getMeta,
        form,
        meta,
        viewMode,
        initialValues,
        onSubmit,
        refetch,
        url,
        id,
        to,
        header,
        layout,
        sendEmail,
        isLoading
    } = props;
    const {
        register, control, setValue, setError, getValues, handleSubmit, formState: {errors, isSubmitting}
    } = useForm({
        defaultValues: initialValues
    });


    const router = useRouter();
    meta.isSubmitting = isSubmitting;
    const newMeta = normalizeMeta(meta, url, id, initialValues);
    newMeta.viewMode = newMeta.viewMode || viewMode;
    newMeta.initialValues = newMeta.initialValues || initialValues;

    const {fields, columns = 1} = newMeta;
    if (!fields) return null;
    let allFiles = {};
    meta.fields.forEach((field) => {
        if (field.type === 'file') {
            allFiles[field.name] = true
        }
    });
    const submittedForm = async (values) => {
        const api = new API();
        let valid = true;
        let submitted = false;
        if (deletedFiles.length > 0) {
            for (const file of deletedFiles) {
                await api.deleteFiles(file);
            }
            deletedFiles = [];
        }
        for (const key of Object.keys(allFiles)) {
            if (!values[key]) {
                valid = true;
            } else if (values[key].length > 0) {
                valid = false;
                let files = values[key];
                const oldFiles = [];
                // remove value from values object
                if (files.length > 0) {
                    const formData = new FormData();
                    // check its json or array
                    const isJson = typeof files === 'string' && files.startsWith('[');
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
                    if (formData.has('file')) {
                        const result = await api.uploadFiles(formData);
                        if (result.fileData) {
                            result.fileData.forEach((file) => {
                                oldFiles.push(file);
                            });
                            // add new files to values object
                            values[key] = JSON.stringify(oldFiles);
                            valid = true;
                        }
                    } else {
                        values[key] = JSON.stringify(oldFiles);
                        valid = true;
                    }
                }
            }
        }
        if (valid) {
            Object.keys(values).forEach((key) => {
                // if values[key] is empty string, set it to null
                if (values[key] === "") {
                    values[key] = null;
                }
                if (Array.isArray(values[key])) {
                    // if values[key] is array, json.stringify it
                    values[key] = JSON.stringify(values[key]);
                }
            });
            const result = await SubmitForm(values, url, id);
            if (result?.affectedRows > 0) {
                notify("success", "Data saved successfully");
                // check setModal props is exist or not into field type is submit in meta.fields
                const setModal = fields.find(field => field?.props?.type === 'submit')?.setModal;
                const resetData = fields.find(field => field?.props?.type === 'submit')?.resetData;
                if (resetData) {
                    resetData('');
                }
                if (setModal) {
                    setModal(false);
                }
                if (setTheModal) {
                    setTheModal(false);
                }

                if (refetch) {
                    await refetch();
                }
                if (sendEmail) {
                    const {onCreate, onUpdate} = sendEmail;
                    if (id) {
                        if (onUpdate) {
                            await api.sendEmail(url, {
                                emailGroup: onUpdate, id, values,
                            });
                        }
                    } else if (onCreate) {
                        await api.sendEmail(url, {emailGroup: onCreate, id, values});
                    }
                }
                if (to) {
                    await router.replace(to);
                }
            } else {
                alert('Error in saving data');
            }
        }
    }

    const elements = React__default.createElement(FBInner, _extends({}, props, {
        form: form ? form.current || form : null,
        meta: newMeta,
        register,
        control,
        errors,
        setValue,
        getValues,
        setError,
        layout,
        isLoading
    }));
    const headerElement = header ? React__default.createElement('div', {
        className: 'border' // card
    }, React__default.createElement('div', {
            className: 'align-items-center d-flex card-header'
        }, React__default.createElement('h4', {
            className: 'card-title mb-0 flex-grow-1'
        }, header), // create button for back
        React__default.createElement('div', {
            className: 'flex-shrink-1'
        }, React__default.createElement('button', {
            type: 'button', className: 'btn btn-primary btn-sm', onClick: () => {
                router.back();
            }
        }, 'Back'))), React__default.createElement('div', {
        className: 'card-body'
    }, elements)) : elements;

    return form ? React__default.createElement('form', {
        onSubmit: handleSubmit(onSubmit ? onSubmit : submittedForm), id: 'submitForm'
    }, headerElement) : headerElement;
}

function FBInner(props) {
    const {config} = useContext(Context);
    const {meta, disabled, form, layout, setValue, getValues, isLoading} = props;
    if (!meta) return null;
    let {fields, columns = 1, flexible} = meta;

    // check if fields have hidden type and remove them from fields
    fields = fields.filter((field) => {
        if (field?.props?.type === 'hidden') {
            const value = field?.props.value || field?.props.initialValue;
            useEffect(() => {
                if (value) {
                    setValue(field.name, value);
                }
            }, [value]);
            // remove hidden field from fields
            return false;
        }
        return true;
    });
    // creat element for form and method for submit
    const elements = fields.map((field, index) => {
        return React__default.createElement(FBField, {
            key: field.key || index,
            field,
            disabled,
            meta,
            form,
            layout: layout || config?.NEXT_PUBLIC_FROM_LAYOUT || 'horizontal',
            control: props?.control,
            errors: props?.errors,
            setError: props?.setError,
            setValue,
            getValues,
            url: props?.url,
            isLoading
        });
    });

    if (columns === 1) {
        return elements;
    }


    const rows = [];
    // for each column , how many grid cols
    const spanUnit = 12 / columns;
    // eslint-disable-next-line
    for (let i = 0; i < elements.length;) {
        const cols = [];
        for (let j = 0; (j < columns || j === 0) && i < elements.length && (!['left', 'both'].includes(fields[i].clear) || j === 0);) // field doesn't need to start a new row
        {
            const fieldSpan = fields[i].col || 1;
            const fieldCol = Math.min(12, spanUnit * fieldSpan);
            const fieldClass = fields[i].fieldClass || '';
            cols.push(React__default.createElement('div', {
                key: j, className: 'col-' + fieldCol + ' ' + fieldClass
            }, elements[i]));
            j += fieldSpan;
            if (['both', 'right'].includes(fields[i].clear)) {
                i += 1;
                break;
            }
            i += 1;
        }
        rows.push(flexible ? cols : React__default.createElement(Row, {key: i}, cols));
    }

    return flexible ? React__default.createElement(Row, null, rows) : rows;

    // return rows
}

Fb.defineComponent = function (name, type) {
    const metaConvertor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (typeMap[name]) throw new Error('type "' + name + '" already defined.');
    typeMap[name] = {
        type: type, metaConvertor: metaConvertor
    };
};

Fb.defineComponent('button', Button);
const SubmitButton = (field) => {
    const {label, setModal, isSubmitting, submitText, disabled, btnClass, icon} = field.props;
    return (<>
        <Button type={isSubmitting ? 'button' : 'submit'} className={btnClass || 'btn btn-primary'}
                onClick={setModal}
                disabled={disabled || isSubmitting}
        >{isSubmitting ? // show spinner with label if submitting
            <><Spinner as="span" animation="border" size="sm" role="status"
                       aria-hidden="true"/> {submitText || 'Submitting...'}</> : // show label if not submitting
            label}
            {icon && <i className={icon}/>}
        </Button>
    </>)
}

const HiddenComponent = (field) => {
    useEffect(() => {
        if (field?.props?.value) {
            field.onChange({target: {value: field?.props?.value}});
        } else if (field?.props?.defaultValue) {
            field.onChange({target: {value: field?.props?.defaultValue}});
        } else if (field.value) {
            field.onChange({target: {value: field.value}});
        }
    }, [field?.props?.value, field?.props?.defaultValue, field.value]);
    return (<Input type="hidden" name={field.name} id={field.props.id}
                   value={field?.props?.value || field?.props?.defaultValue || field.value || field.initialValue || ''}
                   onChange={field.onChange}
    />)
}
// submit button
Fb.defineComponent('hidden', HiddenComponent, function (field) {
    return _extends({}, field, {
        props: _extends({
            value: field.value || field.initialValue || null, type: 'hidden'
        }, field.props)
    })
});


// submit button
Fb.defineComponent('submit', SubmitButton, function (field) {
    return _extends({}, field, {
        props: _extends({
            label: field.label || 'Submit',
            disabled: field.disabled || false,
            type: 'submit',
            setModal: field.setModal,
            isSubmitting: field.isSubmitting,
            submitText: field.submitText || 'Submitting...',
            btnClass: field.btnClass || '',
            icon: field.icon || null
        }, field.props)
    })
});

const InputComponent = (field) => {

    useEffect(() => {
        if (field?.props?.runOnChange && field?.props?.runOnChange === true) {
            if (field?.props?.value) {
                field.onChange({target: {value: field?.props?.value}});
            } else if (field?.props?.defaultValue) {
                field.onChange({target: {value: field?.props?.defaultValue}});
            } else if (field.value) {
                field.onChange({target: {value: field.value}});
                field.props?.setValue(field.name, field.value);
            }
        }
    }, [field?.props?.value, field?.props?.defaultValue, field.value]);
    return (<>
        <Input
            name={field.name} id={`input_${field.props.id}`} placeholder={field.placeholder}
            defaultValue={field?.props?.value || field?.props?.defaultValue || field.value || field.initialValue || ''}
            onChange={field.onChange}
            disabled={field.disabled}
        />

    </>)
}
Fb.defineComponent('input', InputComponent, function (field) {
    const fieldProps = {};
    if (field?.unique) {
        fieldProps.rules = {
            validate: async (value) => {
                return await isUnique(value, field)
            }
        }
    }
    return _extends({}, field, fieldProps, {
        props: _extends({
            defaultValue: field.initialValue ? field.initialValue : null,
            value: field.value || field.initialValue || null,
            arrayList: field.arrayList ? field.arrayList : null,
            id: field.id || field.name,
            runOnChange: field.runOnChange ? field.runOnChange : false,
        }, field.props)
    });
});
Fb.defineComponent('text', InputComponent, function (field) {
    const fieldProps = {};
    if (field.unique) {
        fieldProps.rules = {
            validate: async (value) => {
                return await isUnique(value, field)
            }
        }
    }
    return _extends({}, field, fieldProps, {
        props: _extends({
            defaultValue: field.initialValue ? field.initialValue : null,
            arrayList: field.arrayList ? field.arrayList : null,
            id: field.id || field.name,
            runOnChange: field.runOnChange ? field.runOnChange : false,
        }, field.props)
    });
});

const PasswordComponent = (field) => {
    return (<>
        <div className="position-relative auth-pass-inputgroup">
            <Input type={'password'} name={field.name} id={field.id || field.name} placeholder={field.placeholder}
                   defaultValue={field.value}
                   onChange={field.onChange}
                   autoComplete="new-password"
            />
            <button
                onClick={() => {
                    const input = document.getElementById(field.name);
                    const span = document.getElementById(`${field.name}-icon`);
                    if (input.type === 'password') {
                        input.type = 'text';
                        span.innerHTML = '<i className="ri-eye-fill align-middle"></i>';
                    } else {
                        input.type = 'password';
                        span.innerHTML = '<i className="ri-eye-off-fill align-middle"></i>';
                    }
                }}
                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                type="button"
            ><span
                id={`${field.name}-icon`}
            >
                    <i className="ri-eye-off-fill align-middle"></i>
                </span>

            </button>
        </div>
    </>)

}
Fb.defineComponent('password', PasswordComponent);

const NumberComponent = (field) => {
    const {min, max, step} = field.props;
    return (<div className={'input-group'}>
        <span
            className={'input-group-text pointer'}
            onClick={() => {
                // get current value of input field and decrement it by 1
                const input = document.getElementById(field.name || field.id);
                input.value = parseInt(input.value) - 1;
                const value = Number(input.value);
                if (min) {
                    if (value < min) {
                        input.value = min;
                        notify('warning', `Minimum value is ${min}`)
                    }
                }
                if (max) {
                    if (value > max) {
                        input.value = max;
                        notify('warning', `Maximum value is ${max}`)
                    }
                }
                field.onChange(Number(input.value));
            }}
        ><i className={'ri-subtract-fill'}> </i></span>

        <Input type={'number'} name={field.name} id={field.id || field.name} placeholder={field.placeholder}
               defaultValue={field.value || 0}
               onChange={(e) => {
                   const value = Number(e.target.value);
                   if (min) {
                       if (value < min) {
                           e.target.value = min;
                           notify('warning', `Minimum value is ${min}`);
                       }
                   }
                   if (max) {
                       if (value > max) {
                           e.target.value = max;
                           notify('warning', `Maximum value is ${max}`);
                       }
                   }
                   field.onChange(Number(e.target.value));
               }}
        />
        <span
            className={'input-group-text pointer'}
            onClick={() => {
                // get current value of input field and increment it by 1
                const input = document.getElementById(field.name || field.id);
                input.value = parseInt(input.value) + 1;
                const value = Number(input.value);
                if (min) {
                    if (value < min) {
                        input.value = min;
                        notify('warning', `Minimum value is ${min}`)
                    }
                }
                if (max) {
                    if (value > max) {
                        input.value = max;
                        notify('warning', `Maximum value is ${max}`)
                    }
                }
                field.onChange(Number(input.value));
            }}
        ><i className={'ri-add-fill'}></i> </span>
    </div>)
}
Fb.defineComponent('number', NumberComponent, function (field) {
    const fieldProps = {
        type: 'number', inputGroupClassName: 'd-flex flex-row',
    };
    if (field.unique) {
        fieldProps.rules = {
            validate: async (value) => {
                return await isUnique(value, field)
            }
        }
    }
    return _extends({}, field, fieldProps, {
        props: _extends({
            defaultValue: field.initialValue ? field.initialValue : null,
            min: field.min ? field.min : null,
            max: field.max ? field.max : null,
        }, field.props)
    })
});

const EmailComponent = (field) => {
    return <Input type={'email'} name={field.name} id={`email_${field.id || field.name}`}
                  placeholder={field.placeholder}
                  defaultValue={field.value}
                  onChange={field.onChange}
    />
}
Fb.defineComponent('email', EmailComponent, function (field) {
    const fieldProps = {
        type: 'email',
    };
    if (field.unique) {
        fieldProps.rules = {
            validate: async (value) => {
                return await isUnique(value, field)
            }, // must be a valid email
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            }


        }
    }
    return _extends({}, field, fieldProps, {
        props: _extends({
            defaultValue: field.initialValue ? field.initialValue : null,
        }, field.props)
    })
});

const TextareaComponent = (field) => {
    const editorRef = useRef();
    const [editorLoaded, setEditorLoaded] = useState(false);
    const {CKEditor, ClassicEditor} = editorRef.current || {};
    useEffect(() => {
        if (!editorRef.current) {
            editorRef.current = {
                CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
                ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
            };
        }
        setEditorLoaded(true);
    }, []);
    if (field.props.editor) {
        return editorLoaded && <>
            {field?.props?.helperText && (<div className={"d-flex flex-wrap"}>
                {(Array.isArray(field?.props?.helperText) && field?.props?.helperText.length > 0 && field?.props?.helperText?.map((item, index) => {
                    return (<div key={index} className="mb-2 me-1">
                        <button
                            style={{fontSize: "10px"}}
                            key={index}
                            type="button"
                            onClick={() => {
                                const domEditableElement = document.querySelector(".ck-editor__editable");
                                const editorInstance = domEditableElement.ckeditorInstance;
                                editorInstance.model.change((writer) => {
                                    const insertPosition = editorInstance.model.document.selection.getFirstPosition();
                                    writer.insertText(item, insertPosition);
                                });
                            }}
                            className="btn btn-sm btn-outline-secondary"
                        >
                            {item}
                        </button>
                    </div>)
                })) || <div className="mb-2"> {field?.props?.helperText} </div>}
            </div>)}
            <CKEditor
                editor={ClassicEditor}
                config={field.props.small && {
                    toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "blockQuote",],
                }}
                sourceEditing={true}
                data={field?.props?.value || field?.props?.defaultValue || field?.value || field?.initialValue || ''}
                onReady={(editor) => {
                    if (field.props.height) {
                        editor.editing.view.change((writer) => {
                            writer.setStyle("min-height", field.props.height + "!important", editor.editing.view.document.getRoot());
                        });
                    }
                    setEditorLoaded(true);
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    data && field.onChange(data);
                }}
            />
        </>
    } else {
        useEffect(() => {
            if (field?.props?.runOnChange && field?.props?.runOnChange === true) {
                if (field?.props?.value) {
                    field.onChange({target: {value: field?.props?.value}});
                } else if (field?.props?.defaultValue) {
                    field.onChange({target: {value: field?.props?.defaultValue}});
                } else if (field.value) {
                    field.onChange({target: {value: field.value}});
                    field.props?.setValue(field.name, field.value);
                }
            }
        }, [field?.props?.value, field?.props?.defaultValue, field.value]);

        return (<>
            <Input type="textarea" name={field.name} id={`textarea_${field.id || field.name}`}
                   placeholder={field.placeholder}
                   className={field.props.customClass ? field.props.customClass : ''}
                   defaultValue={field?.props?.defaultValue || field.value || field.initialValue || null}
                   onChange={field.onChange}
                   rows={field.props.small ? 3 : field.props.rows ? field.props.rows : 5}
            />
            {field?.props?.helperText && <span>{field?.props?.helperText}</span>}
        </>)

    }

}

Fb.defineComponent('textarea', TextareaComponent, function (field) {
    return _extends({}, field, {
        props: _extends({
            editor: field.editor ? field.editor : false,
            customClass: field.customClass ? field.customClass : '',
            height: field.height ? field.height : null,
            small: field.small ? field.small : false,
            rows: field.rows ? field.rows : null,
            value: field.value || field.initialValue || null,
            helperText: field.helperText ? field.helperText : null,
            runOnChange: field.runOnChange ? field.runOnChange : false,
        }, field.props)
    })
});

const SelectComponent = (field) => {
    const api = new API();
    const [loading, setLoading] = useState(false);
    let [SelectOptions, setSelectOptions] = useState([]);
    let [defaultValue, setDefaultValue] = useState([]);

    const filterOptions = (inputValue) => {
        return SelectOptions?.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
    };
    const promiseOptions = (inputValue) => new Promise((resolve) => {
        setTimeout(() => {
            resolve(filterOptions(inputValue));
        }, 1000);
    });
    const getDefaultValue = (field, SelectOptions) => {
        const fieldValue = field?.props?.value || field.props?.initialValue || field.value || null;
        if (field.props.isMulti) {
            // const fieldValues = JSON.parse(fieldValue);
            const fieldValues = (fieldValue);
            defaultValue = [];
            SelectOptions.forEach((option) => {
                if (option.options) {
                    option.options.forEach((subOption) => {
                        if (fieldValues.includes(subOption.value)) {
                            defaultValue.push(subOption);
                        }
                    });
                } else {
                    if (fieldValues.includes(option.value)) {
                        defaultValue.push(option);
                    }
                }
            });
        } else {
            SelectOptions?.forEach((option) => {
                if (option.options) {
                    option.options.forEach((item) => {
                        if (item.value === fieldValue) {
                            defaultValue = item;
                        }
                    });
                } else {
                    if (option.value === fieldValue) {
                        defaultValue = option;
                    }
                }
            });
        }
    }
    if (field.props?.getOptions) {
        const {url, label, where, value, join, create, key, getJoin} = field.props.getOptions;
        if (url) {
            const {
                data, isLoading, status: searchStatus, error,
            } = GetOptions(url, label, where, value, join, key, getJoin);
            if (isLoading) {
                return <div>Loading...</div>;
            }
            if (searchStatus === "error") {
                return <div>Error: {error?.message}</div>;
            }
            if (data) {
                SelectOptions = data;
            }
        }

        if (create) {
            const handleCreateOption = async (inputValue) => {
                setLoading(true);
                let input = {
                    [label]: inputValue,
                };
                if (where) {
                    // merge where object with input object
                    input = {...where, ...input};
                }
                const res = await api.create(url, input);
                if (res.insertId) {
                    setLoading(false);
                    const newOption = {
                        key: 'value' + res.insertId, label: inputValue, value: res.insertId,
                    };
                    SelectOptions?.push(newOption);
                    // set default value for select
                    if (field.props.isMulti) {
                        if (field.value) {
                            field.onChange([...field.value, res.insertId]);
                        } else {
                            field.onChange([res.insertId]);
                        }
                    } else {
                        field.onChange(res.insertId);
                    }
                }
            };
            if (field.value || field?.props.value || field?.props.initialValue) {
                getDefaultValue(field, SelectOptions);
            }

            return (<AsyncCreatableSelect
                name={field.name}
                defaultValue={defaultValue}
                defaultOptions={SelectOptions}
                isClearable
                isDisabled={loading}
                isLoading={loading}
                onCreateOption={handleCreateOption}
                noOptionsMessage={() => `There is no data`}
                createOptionPosition={"first"}
                placeholder={`Select or create new ....`}
                loadingMessage={() => "Loading..."}
                formatCreateLabel={(inputValue) => `Create new "${inputValue}"`}
                isValidNewOption={(inputValue) => {
                    // remove white space and special characters from input value
                    const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
                    const newValue = inputValue.replace(regex, "");
                    // check if input value is empty or not
                    if (newValue === "") {
                        return false;
                    }
                    // check if input value is already in options or not
                    const isExist = SelectOptions?.find((option) => option.label.toLowerCase() === newValue.toLowerCase());
                    if (isExist) {
                        return false;
                    }
                    return true;
                }}
                cacheOptions
                loadOptions={promiseOptions}
                value={SelectOptions?.filter((i) => {
                    if (field.value) {
                        if (field.props.isMulti) {
                            return field.value?.includes(i.value);
                        } else {
                            return field.value === i.value;
                        }
                    }
                })}
                onChange={(e) => {
                    if (field.props.isMulti) {
                        field.onChange(e?.map((i) => i.value));
                    } else {
                        field.onChange(e?.value);
                    }
                }}
                isMulti={field.props.isMulti ? field.props.isMulti : false}
                id={`select_${field?.props?.id || field.name}`}
                className={field.props.className ? field.props.className : ""}
            />);
        }
    } else if (field.props?.function) {
        const {function: Function} = field.props;
        let result = "";
        if (typeof Function === "object") {
            const {url, fun} = Function;
            result = fun(url);
        } else {
            // if function is string
            result = Function();
        }
        const {
            data: allData, isLoading: LoadingFun, status: searchStatus, error,
        } = result;
        if (LoadingFun) {
            return <div>Loading...</div>;
        }
        if (allData) {
            SelectOptions = allData;
        }
    } else {
        SelectOptions = field.props.options;
    }
    // if (field.props?.isMulti) {
    //     // push select all option to select options array if not exist in array
    //     const isExist = SelectOptions?.find((option) => option.value === "select-all");
    //     if (!isExist) SelectOptions.unshift({label: "Select All", value: "select-all"});
    // }
    // const handleOnChange = (selected) => {
    //     if (field.props?.isMulti) {
    //         // selected is array of selected options values
    //         // [{label: 'Select All', value: 'select-all'}]
    //         // if selected value is select-all then select all options
    //         if (selected?.find((option) => option.value === "select-all")) {
    //             // deselect all selected options except select all option
    //             const allValues = SelectOptions.filter((option) => option.value !== "select-all").map((option) => option.value);
    //
    //             // update select all label to total options length - select all option into SelectOptions array
    //             SelectOptions[0].label = `Selected (${allValues.length}) options`;
    //             // reset defaultValue to all options values except select all option
    //             setDefaultValue([]);
    //
    //
    //         } else {
    //             // handleSelectAll();
    //         }
    //     }
    // };
    const handleSelectAll = () => {
        // get all options values except select all option
        const allValues = SelectOptions.filter((option) => option.value !== "select-all").map((option) => option.value);
        // update select all label to total options length - select all option into SelectOptions array
        SelectOptions[0].label = `Selected (${allValues.length}) options`;


    }

    const Option = (props) => {
        const {data, isSelected, isFocused, innerRef, innerProps} = props;
        return (<div
            ref={innerRef}
            {...innerProps}
            className={isSelected ? "selected" : ""}
        >
            {data.label}
        </div>);
    }

    if (field.value || field?.props.value || field?.props.initialValue) {
        getDefaultValue(field, SelectOptions);
    }
    // isAllSelected ? [selectAllOption] :
    return <>
        <AsyncSelect
            name={field.name}
            cacheOptions
            defaultOptions={SelectOptions}
            defaultValue={defaultValue}
            isDisabled={field.props.isDisabled ? field.props.isDisabled : false}
            isMulti={field.props.isMulti ? field.props.isMulti : false}
            id={`select_${field?.props?.id || field.name}`}
            instanceId={`select_${field?.props?.id || field.name}`}
            placeholder={field?.props?.placeholder ? field?.props?.placeholder : `Select ${field?.props?.label}` || "Select"}
            noOptionsMessage={() => `There is no  ${field.props.label}`}
            isClearable={true}
            loadOptions={promiseOptions}
            onChange={(e) => {
                // handleOnChange(e);
                if (field.props.isMulti) {
                    field.onChange(e?.map((i) => i.value));
                } else {
                    field?.onChange(e?.value);
                }
            }}
            className={field.props.className ? field.props.className : ""}
        />
    </>;

}

Fb.defineComponent('select', SelectComponent, function (field) {
    return _extends({}, field, {
        props: _extends({
            getOptions: field.getOptions ? field.getOptions : null,
            function: field.function ? field.function : null,
            isDisabled: field.isDisabled ? field.isDisabled : false,
            isMulti: field.isMulti ? field.isMulti : false,
            id: field.id ? field.id : null,
            className: field.className ? field.className : null,
            options: field.options ? field.options : null,
            label: field.label ? field.label : null,
            value: field.value ? field.value : null,
            initialValue: field.initialValue ? field.initialValue : null,
            lang: field.lang ? field.lang : null,
            placeholder: field.placeholder ? field.placeholder : null,
        }, field.props)
    })

});


const DateOptions = (field) => {
    const {config} = useContext(Context);
    return _extends({}, field, {
        props: _extends({
            max: field.max ? field.max : null,
            min: field.min ? field.min : null,
            minDate: field.min ? field.min : null,
            maxDate: field.max ? field.max : null,
            altFormat: field.altFormat ? field.altFormat : config?.NEXT_PUBLIC_DATE_FORMAT ? config?.NEXT_PUBLIC_DATE_FORMAT : "D-M-Y",
            dateFormat: field.dateFormat ? field.dateFormat : "Y-M-D",
            minTime: field.minTime ? field.minTime : null,
            maxTime: field.maxTime ? field.maxTime : null,
            defaultDate: field.initialValue ? field.initialValue : null,
            altInput: true,
        }, field.props)
    });
}
const DateComponent = (field) => {
    const {config} = useContext(Context);
    const {max, min, getValues} = field.props;

    if (min) {
        field.props.minDate = getValues(min);
    }
    if (max) {
        field.props.maxDate = getValues(max);
    }


    return (<Flatpickr
        id={field.id}
        className={`form-control ${field.className}`}
        name={field.name}
        value={field.value}
        options={{
            minDate: field.props.minDate ? field.props.minDate : null,
            maxDate: field.props.maxDate ? field.props.maxDate : null,
            mode: field.props.mode ? field.props.mode : "single",
            inline: field.props.inline ? field.props.inline : false,
            enableTime: field.props.time ? field.props.time : false,
            noCalendar: field.props.noCalendar ? field.props.noCalendar : false,
            dateFormat: "Y-M-D",
            altFormat: config?.NEXT_PUBLIC_DATE_FORMAT ? config?.NEXT_PUBLIC_DATE_FORMAT : "D-M-Y",
            minTime: field.props.minTime ? field.props.minTime : null,
            maxTime: field.props.maxTime ? field.props.maxTime : null,
            defaultDate: field.value ? field.value : null,
            altInput: true,
            parseDate: (dateString, format) => {
                return moment(dateString, format).toDate();
            },
            formatDate: (dateObj, format) => {
                return moment(dateObj).format(format);
            },
            onChange: (selectedDates, dateStr) => {
                field.onChange(dateStr);
            }
        }}
    />)
}

Fb.defineComponent('date', DateComponent, DateOptions);
const TimePickerComponent = (field) => {
    return (<Flatpickr
        id={field.id}
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        options={field.options}
    />)
}
Fb.defineComponent('time', TimePickerComponent, function (field) {
    const {config} = useContext(Context);
    field.time = true;
    field.dateFormat = "H:i";
    field.altFormat = config?.NEXT_PUBLIC_TIME_FORMAT ? config?.NEXT_PUBLIC_TIME_FORMAT : "H:i";
    return DateOptions(field);
});


const CheckboxComponent = (field) => {
    const {customClass, selectOne, type} = field.props;
    let selectClick = null;
    if (selectOne) {
        // select one checkbox from .select_one class
        selectClick = (e) => {
            // remove all checked from field.name .select_one
            const select_one = document.querySelectorAll(`.select_one[name="${field.name}"]`);
            // const select_one = document.querySelectorAll(".select_one");
            select_one.forEach((el) => {
                // uncheck all except current target
                if (el !== e.target) {
                    el.checked = false;
                }
            });
        };
    }
    if (field.options && field.options.length > 0) {
        return (field.options.map((option, index) => {
            return (<div
                className={`form-check ${customClass ? customClass : ""}`}
                key={index}>
                <label className="form-check-label">
                    <input
                        type={type ? type : "checkbox"}
                        className={`form-check-input ${selectOne ? "select_one" : ""}`}
                        id={`checkbox_${field.name}_${index}`}
                        name={field.name}
                        defaultChecked={option.value === field.value}
                        onChange={(e) => {
                            // if select one is true then uncheck all other checkboxes and select current
                            if (selectOne) {
                                selectClick(e);
                                field.onChange(e.target.checked ? option.value : null);
                            } else {
                                if (type === "radio") {
                                    field.onChange(option.value);
                                } else {
                                    // assign value to field as array of checked values
                                    let values = field.value ? field.value : [];
                                    if (e.target.checked) {
                                        values.push(option.value);
                                    } else {
                                        values = values?.filter((v) => v !== option.value);
                                    }
                                    field.onChange(values);
                                }
                            }
                        }}
                        onClick={field.onClick}

                    />
                    {option.label}
                </label>
                {option?.data && <>
                    {field?.control && <Controller control={field.control} name='permission_value'
                                                   render={({field: {onChange, value}}) => {
                                                       return <SelectComponent
                                                           props={{
                                                               options: option.data,
                                                               isMulti: true,
                                                               className: `permissions ${option.value === field.value ? "d-block" : "d-none"}`,
                                                               id: option.value,
                                                           }}
                                                           name={'permission_value'}
                                                           value={field.value === option.value || field.props.initialValue === option.value ? field.props.permission_value : value}
                                                           onChange={(e) => {
                                                               onChange(e);
                                                           }}
                                                       />
                                                   }}/>}
                </>}
            </div>)
        }))
    } else {
        return (<div className={`form-check ${customClass ? customClass : ""}`}>
            <label className="form-check-label">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id={`checkbox_${field.id || field.name}`}
                    name={field.name}
                    defaultChecked={field.value === true || field.value === "true" || field.value === 1 || field.value === "1"}
                    // value={field.value}
                    onChange={field.onChange}
                    onClick={field.onClick}
                />
                {field.label}
            </label>
        </div>)
    }
}
const PermissionComponent = (field) => {
    return (<>
        <CheckboxComponent {...field} />
    </>)
}

Fb.defineComponent('permission', PermissionComponent, function (field) {
    const api = new API();
    const {url, menu_id} = field;
    const {data, isLoading} = useQuery(["getPermissions", url, menu_id], async () => {
        const input = {
            getPermission: true, menu_id,
        };
        const result = await api.post(url, input);
        return result;
    });
    if (isLoading) {
        return (<div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
        </div>);
    }

    const permission = [{
        label: "Everyone", value: "all",
    }, {
        label: "Select designations", value: "select_designations", data: data?.department,
    }, {
        label: "Select individual people", value: "select_individual_people", data: data?.allUsers,
    }];
    return _extends({}, field, {
        onChange: (value) => {

            const selectPermissions = document.querySelectorAll(".permissions");
            if (value === "all") {
                // hide all select.permissions dropdown and add classname 'd-none'
                selectPermissions.forEach((select) => {
                    select.style.display = "none";
                    select.classList.add("d-none");
                });
            } else {
                // show dropdown as per id  == value
                selectPermissions.forEach((select) => {
                    const selectId = `select_${value}`;
                    if (select.id === selectId) {
                        select.style.display = "block";
                        select.classList.remove("d-none");
                    } else {
                        select.style.display = "none";
                        select.classList.add("d-none");
                    }
                });
            }
        }, type: "radio", rules: {
            required: true,
        }, options: permission, props: _extends({
            customClass: field.customClass ? field.customClass : null,
            selectOne: field.selectOne ? field.selectOne : false,
            type: "radio",
            initialValue: field?.initialValue || field?.value || "all",
            permission_value: field.permission_value ? field.permission_value : null,
        }, field.props),
    }, field);
});


Fb.defineComponent('checkbox', CheckboxComponent, function (field) {
    return _extends({}, field, {
        props: _extends({
            customClass: field.customClass ? field.customClass : null,
            selectOne: field.selectOne ? field.selectOne : false,
        }, field.props)
    });
});
const RadioComponent = (field) => {
    return CheckboxComponent(field);
}
Fb.defineComponent('radio', RadioComponent, function (field) {
    return _extends({}, field, {
        props: _extends({
            customClass: field.customClass ? field.customClass : null, type: "radio",
        }, field.props)
    });
});

Fb.defineComponent('range', function (field) {
    // return <Slider
    //     orientation="horizontal"
    //     min={0}
    //     max={100}
    //     value={field.value}
    //     onChange={field.onChange}
    // />
    return <input type="range" min={0} max={100} value={field.value} onChange={field.onChange}/>
});

const TagsComponent = (field) => {

    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [input, setInput] = useState("");
    const url = '/api/admin/tags'
    const label = 'name'
    const where = field?.props?.where ? field?.props?.where : {
        type: 'tags'
    }
    useEffect(() => {
        try {
            setTags(JSON.parse(field.value));
        } catch (e) {
            // setTags([]);
        }
    }, [field.value]);


    useEffect(() => {
        field.onChange(tags);
    }, [tags]);

    const handleChange = (e) => {
        const value = e.target.value;
        if (value) {
            setInput(value);
            handleSuggestion();
        }
    }


    const handleDelete = (i) => {
        const newTags = [...tags];
        newTags.splice(i, 1);
        setTags(newTags);
        field.onChange(newTags);
    }
    const handleKeyDown = (e) => {
        if (e.keyCode === 9 || e.keyCode === 13) {
            e.preventDefault();
        }
        const text = suggestions.length ? suggestions[0].text : input;
        if ([9, 13].includes(e.keyCode) && text) {
            // check if tag already exists in tags array
            if (tags.find((tag) => tag.toLowerCase() === text.toLowerCase())) {
                return;
            } else {
                setTags([...tags, text]);
                setInput("");
            }
        }
    }
    const ref = useRef(null);
    useEffect(() => {
        function handleOutsideClick(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setSuggestions([]);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const {
        data, isLoading, status: searchStatus, error,
    } = GetOptions(url, label, where);
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (searchStatus === "error") {
        return <div>Error: {error?.message}</div>;
    }
    const handleSuggestion = () => {
        const suggestFilterInput = data?.filter((suggest) => suggest.label.toLowerCase().includes(input.toLowerCase()));
        const suggestFilterTags = suggestFilterInput.filter((suggest) => !tags.includes(suggest.label));
        setSuggestions(suggestFilterTags);
    }
    return (<div className="tags-content mb-1"
                 ref={ref}
    >
        <div className="tags-input bg-white">
            {tags?.map((tag, i) => (<span key={tag} className="tag">
                {tag}
                <span className="remove-tag" onClick={() => handleDelete(i)}>
                    x
                </span>
            </span>))}
            <input
                type="text"
                className={`border-0 p-0  ${suggestions.length ? "suggestion" : ""}`}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleSuggestion}
                placeholder="Add a tag"
            />
        </div>
        <div>
            {suggestions.length > 0 && (<div className="tags-suggestions bg-white">
                {suggestions.map((suggest, index) => (<div
                    className="suggestion-item"
                    key={`suggest ${index}`}
                    onClick={() => {// check if tag already exists in tags array
                        if (!tags.includes(suggest.label)) {
                            setTags([...tags, suggest.label]);
                            // remove suggestion from suggestions array
                            const newSuggestions = suggestions.filter((s) => s.label !== suggest.label);
                            setSuggestions(newSuggestions);
                        }
                        setInput("");
                    }}
                >
                    {suggest.label}
                </div>))}
            </div>)}
        </div>
    </div>)
}

Fb.defineComponent('tags', TagsComponent, function (field) {
    const fieldProps = {};
    if (field.unique) {
        fieldProps.rules.validate = async (value) => {
            return await isUnique(value, field)
        }
    }
    field.props = _extends({}, {
        where: field.where
    }, field.props);

    return _extends({}, field, fieldProps);
});

const PrefixComponent = (field) => {
    const {prefixStart, format, prefix, number} = field?.props;
    return (<>
        <input
            type={'hidden'} {...field?.control?.register(prefixStart ? prefixStart + '_format' : 'format', {value: format})} />
        <input
            type={'hidden'} {...field?.control?.register(prefixStart ? prefixStart + '_prefix' : 'prefix', {value: prefix})} />
        <Input type={'number'} name={field.name} id={field.id || field.name} placeholder={field.placeholder}
               defaultValue={field.value || number}
               onChange={(e) => field.onChange(e.target.value)}
        /></>)
}
const isUnique = async (value, field) => {
    const api = new API();
    if (value) {
        const input = {
            getUnique: true,
            field: field?.unique?.field || field.name,
            value,
            oldValue: field?.oldValue || field?.initialValue,
        };
        const result = await api.post(field?.unique?.url || field?.url, input);
        return result.status === 'error' ? result?.message : true;
    }
    return true;
}
Fb.defineComponent('prefix', PrefixComponent, function (field) {
    const api = new API();
    const {format, prefix, url, value} = field;
    const {data, isLoading} = useQuery(["getPrefixByURL", url], () => {
        const input = {
            getPrefix: true, format, prefix,
        };
        return api.post(url, input);
    });
    if (isLoading) {
        return <div>Loading...</div>;
    }
    const {input_first, input_last, number, format: vFormat, prefix: vPrefix} = data;
    return _extends({}, field, {
        rules: {
            required: true, validate: async (value) => {
                field.unique = {field: 'number'};
                return await isUnique(value, field)
            }
        }, addonBefore: input_first, addonAfter: input_last, initialValue: value || Number(number), props: _extends({
            format: vFormat, number: value || Number(number), prefix: vPrefix, prefixStart: field.prefixStart
        }, field.props)
    });
});
const FileComponent = (field) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const {dropzone, multiple, image, accept} = field.props;
    let files = [];
    useEffect(() => {
        try {
            files = JSON.parse(field.value);
            files.forEach((file) => {
                file.preview = file.fileUrl;
                file.name = file.newFilename;
                file.formattedSize = file.size;
            });
            setSelectedFiles(files);
        } catch (e) {
        }
    }, [field.value]);

    const handleAcceptedFiles = (acceptedFiles) => {
        const files = acceptedFiles.map((file) => Object.assign(file, {
            preview: URL.createObjectURL(file),
        }));
        // merge new files with existing files
        setSelectedFiles([...selectedFiles, ...files]);
        field?.onChange(files);
    }
    const handleRemoveFile = (file) => {
        // remove file from selected files
        const newFiles = selectedFiles.filter((f) => f !== file);
        setSelectedFiles(newFiles);
        deletedFiles.push(file);
        field.onChange(newFiles);
    }
    if (dropzone) {
        return (<>
            <Dropzone
                onDrop={(acceptedFiles) => {
                    handleAcceptedFiles(acceptedFiles);
                }}
            >
                {({
                      getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject,
                  }) => {
                    let className = "dropzone-input";
                    if (isDragActive) {
                        className += " active";
                        if (isDragReject) {
                            className += " rejected";
                        } else {
                            className += " accepted";
                        }
                    }
                    return (<div {...getRootProps()} className={className}>
                        <input {...getInputProps()} />
                        <div className="dz-clickable">
                            <div className="dz-message needsclick" {...getRootProps()}>
                                <div className="mb-3">
                                    <i className="display-4 text-muted ri-upload-cloud-2-fill"/>
                                </div>
                            </div>
                        </div>
                    </div>);
                }}
            </Dropzone>
            <div className="dropzone-preview mt-2 ">
                {selectedFiles?.map((file) => {
                    let imagesHere = ''
                    const fileTypes = file?.type?.split('/') || file?.mimetype?.split('/');
                    if (fileTypes[0] === 'image') {
                        imagesHere = (<div className="dropzone-preview-item-image">
                            <Image
                                className={"avatar-xxs"}
                                src={file.preview}
                                alt={file.name}
                                width={50}
                                height={50}
                            />
                        </div>)
                    }

                    return <div key={file.name} className="dropzone-preview-item">
                        {imagesHere}
                        <div className="dropzone-preview-item-details">
                            <div className="dropzone-preview-item-details-name">
                                {file.name}
                            </div>
                            <div className="dropzone-preview-item-details-size">
                                {file.formattedSize}
                            </div>
                        </div>
                        <div
                            className="dropzone-preview-item-remove"
                            onClick={() => handleRemoveFile(file)}
                        >
                            <i className="ri-close-line"/>
                        </div>
                    </div>
                })}
            </div>
        </>)
    } else {
        // else if (image) {
        //     return (<>
        //         <input type={'hidden'} {...field?.control?.register('image', {value: image})} />
        //         <input type={'hidden'} {...field?.control?.register('accept', {value: accept})} />
        //         <Image name={field.name} id={field.id || field.name} accept={accept}
        //                onChange={(e) => field.onChange(e.target.value)}/>
        //
        //     </>)
        // }

        const hiddenFileInput = useRef(null);
        const handleClick = event => {
            hiddenFileInput.current.click();
        }
        const handleChange = event => {
            const fileUploaded = event.target.files[0];
            const files = [fileUploaded];
            handleAcceptedFiles(files);
        }

        return (<>
            <Button
                onClick={handleClick}>
                Upload a file
            </Button>
            <div className="dropzone-preview mt-2">
                {selectedFiles?.map((file) => {
                    let imagesHere = ''
                    const fileTypes = file?.type?.split('/') || file?.mimetype?.split('/');
                    if (fileTypes[0] === 'image') {
                        imagesHere = (<div className="dropzone-preview-item-image">
                            <Image
                                className={"avatar-xxs"}
                                src={file.preview}
                                alt={file.name}
                                width={50}
                                height={50}
                            />
                        </div>)
                    }
                    return <div key={file.name} className="dropzone-preview-item">
                        {imagesHere}
                        <div className="dropzone-preview-item-details">
                            <div className="dropzone-preview-item-details-name">
                                {file.name}
                            </div>
                            <div className="dropzone-preview-item-details-size">
                                {file.formattedSize}
                            </div>
                        </div>
                        <div
                            className="dropzone-preview-item-remove"
                            onClick={() => handleRemoveFile(file)}
                        >
                            <i className="ri-close-line"/>
                        </div>
                    </div>
                })}
            </div>
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleChange}
                style={{display: 'none'}}
            />
        </>)
    }

}
Fb.defineComponent('file', FileComponent, function (field) {

    return _extends({}, field, {
        props: _extends({
            dropzone: field?.dropzone ? field?.dropzone : false,
            multiple: field?.multiple ? field?.multiple : false,
            image: field?.image ? field?.image : false,
            accept: field?.image ? 'image/*' : field?.accept ? field?.accept : '*',
        })
    }, field);
});
const ProductComponent = (field) => {
    const {config} = useContext(Context);
    const {setValue, currency, module, module_id, items, info} = field?.props
    const {t} = useTranslation();
    const [qtyLabel, setQtyLabel] = useState(info?.show_quantity_as || 'qty');
    const itemWiseDiscount = config?.NEXT_PUBLIC_EACH_ITEM_DISCOUNT;
    const {data: defaultCurrency, isLoading: Loading} = GetDefaultCurrency();
    const [products, setProducts] = useState(items); // initial products state
    const [suggestProducts, setSuggestProducts] = useState([]);
    const [discount, setDiscount] = useState({
        discount_type: info?.discount_option || 'fixed', discount_amount: Number(info?.discount) || 0,
    }); // initial discount state
    const [adjustment, setAdjustment] = useState(info?.adjustment || 0); // initial adjustment state
    const [shippingCharge, setShippingCharge] = useState(info?.shipping_charge || 0); // initial shipping charge state
    const [exchangeRate, setExchangeRate] = useState(info?.conversion_rate || defaultCurrency?.exchange_rate || 1);
    const [deletedField, setDeletedField] = useState([]); // initial deleted field state

    const handleProductChange = (index, field, value) => {
        const updatedProducts = products.map((product, i) => {
            if (i === index) {
                return {...product, [field]: value};
            }
            return product;
        });
        setProducts(updatedProducts);
    };

    const calculateTotals = () => {
        let subTotal = 0;
        let totalTax = [];
        let grandTotal = 0;
        let totalDiscount = 0;
        products.forEach(product => {
            const {amount, qty, item_tax, discount_type} = product;
            const discount_amount = product.discount_amount || 0;
            // check if item_tax is json or array
            const tax = typeof item_tax === 'string' ? JSON.parse(item_tax) : item_tax;
            const itemTotal = amount * qty;
            const discountAmount = discount_type === 'fixed' ? parseFloat(discount_amount) : (itemTotal * (parseFloat(discount_amount) / 100));
            subTotal += itemTotal - discountAmount;
            totalDiscount += discountAmount;
            tax.forEach(taxOption => {
                const [taxName, taxValue] = taxOption.split('|');
                const taxAmount = (itemTotal - discountAmount) * (parseFloat(taxValue.replace(/\s/g, "")) / 100);
                // check if taxValue and taxName already exist in totalTax array
                const taxExists = totalTax.find((tax) => tax.taxName === taxName && tax.percentage === parseFloat(taxValue));
                if (taxExists) {
                    taxExists.amount += taxAmount
                }
                // if tax name doesn't exist in totalTax array, add it to the array
                else {
                    totalTax.push({
                        taxValue: taxOption, taxName: taxName, percentage: parseFloat(taxValue), amount: taxAmount
                    });
                }
            });
        });
        // if discount.discount_amount is not set, set it to 0
        discount.discount_amount = discount.discount_amount || 0;
        const discountAmount = // set discount amount is 0 if discount type is not set
            discount.discount_type === 'fixed' ? parseFloat(discount.discount_amount) : (subTotal * (parseFloat(discount.discount_amount) / 100));
        grandTotal = subTotal + totalTax.reduce((acc, tax) => acc + tax.amount, 0) + adjustment + shippingCharge - discountAmount;
        return {subTotal, totalTax, totalDiscount, discountAmount, grandTotal};
    }
    const {subTotal, totalTax, totalDiscount, grandTotal, discountAmount} = calculateTotals();
    useEffect(() => {
        setValue('items', products)
        setValue('sub_total', subTotal)
        setValue('taxes', totalTax)
        setValue('total_tax', totalTax.reduce((acc, tax) => acc + tax.amount, 0))
        setValue('item_total_discount', totalDiscount)
        setValue('discount', discount.discount_amount)
        setValue('discount_option', discount.discount_type)
        setValue('discount_total', discountAmount)
        setValue('adjustment', adjustment)
        setValue('shipping_charge', shippingCharge)
        setValue('total_amount', grandTotal)
        setValue('show_quantity_as', qtyLabel)
        setValue('conversion_rate', exchangeRate)
    }, [products, adjustment, shippingCharge, qtyLabel, exchangeRate])

    useEffect(() => {
        if (products && deletedField.length > 0) {
            setValue('deleteField', deletedField);
        }
    }, [deletedField]);

    const {data: allTaxes, isLoading, status} = GetResult("/api/admin/taxes");
    if (isLoading) {
        return <div>Loading...</div>;
    }
    const taxOptions = [];
    if (allTaxes) {
        allTaxes.map((tax) => {
            taxOptions.push({
                value: tax.tax_name + "|" + tax.percentage, label: tax.tax_name + " | " + tax.percentage + "%",
            });
        });
    }

    const AddManualProduct = () => {
        const [items, setItems] = useState({
            item_name: '',
            item_desc: '',
            amount: 0,
            qty: 1,
            item_tax: [],
            discount_type: 'fixed',
            discount: 0,
            unit: '',
        });
        const meta = {
            columns: 2, fields: [{
                name: 'module', type: 'hidden', value: module
            }, {
                name: 'module_id', type: 'hidden', value: module_id
            }, {
                col: 2,
                type: 'text',
                label: t("Item Name"),
                placeholder: t("Item Name"),
                required: true,
                onChange: (e) => setItems({...items, item_name: e.target.value})
            }, {
                col: 2,
                type: 'textarea',
                label: t("Item Description"),
                placeholder: t("Item Description"),
                onChange: (e) => setItems({...items, item_desc: e.target.value})
            }, {
                name: 'amount',
                id: 'manually_amount',
                type: 'number',
                label: t("Amount"),
                placeholder: t("Amount"),
                required: true,
                onChange: (e) => setItems({...items, amount: e})
            }, {
                type: 'number',
                id: 'manually_qty',
                label: t("Quantity"),
                placeholder: t("Quantity"),
                required: true,
                initialValue: 1,
                onChange: (e) => setItems({...items, qty: e})
            }],
        }
        if (itemWiseDiscount === "yes") {
            meta.fields.push({
                type: 'number',
                id: 'manually_discount_amount',
                label: t("Discount Amount"),
                placeholder: t("Discount Amount"),
                onChange: (e) => setItems({...items, discount: e})
            }, {
                type: 'select',
                label: t("Discount Type"),
                onChange: (e) => setItems({...items, discount_type: e}),
                options: [{value: "percentage", label: t("Percentage")}, {value: "fixed", label: t("Fixed")},],
            })
        }
        meta.fields.push({
            type: 'text',
            label: t("Unit"),
            placeholder: t("Unit"),
            onChange: (e) => setItems({...items, unit: e.target.value})
        }, {
            type: 'select',
            label: t("Tax"),
            options: taxOptions,
            placeholder: t("Tax"),
            isMulti: true,
            onChange: (e) => setItems({...items, item_tax: e})
        }, {
            col: 2, render: () => {
                return <div className="
                w-100 d-flex justify-content-between align-items-center
                border-top pt-2
                ">
                    <button type="button" className="btn btn-danger ml-2"
                            onClick={() => {
                                setTheModal(false)
                            }}
                    >
                        <i className="fa fa-times-circle mr-1"/>
                        {t("Close")}
                    </button>
                    <button type="button" className="btn btn-success"
                            onClick={async () => {
                                await onSubmit(items);
                            }}
                    >
                        <i className="fa fa-plus-circle mr-1"/>
                        {t("Add & More")}
                    </button>
                    <button type="button"
                            onClick={async () => {
                                setTheModal(false)
                                await onSubmit(items);
                            }}
                            className="btn btn-primary"
                    >
                        <i className="fa fa-plus-circle mr-1"/>
                        {t("Add & Close")}
                    </button>


                </div>
            }
        })


        const onSubmit = async (data) => {
            const totalAmount = data.amount * data.qty;
            let discount_amount = 0;
            if (itemWiseDiscount === "yes") {
                if (data.discount_type === 'percentage') {
                    discount_amount = totalAmount * (parseFloat(data.discount) / 100);
                } else {
                    discount_amount = parseFloat(data.discount);
                }
            }
            // calculate tax amount
            let taxAmount = 0;
            if (data.item_tax) {
                data.item_tax.map((taxOption) => {
                    const taxValue = taxOption.split("|")[1];
                    taxAmount += totalAmount * (parseFloat(taxValue) / 100);
                });
            }
            const item = {
                module: module,
                module_id: module_id,
                item_name: data.item_name,
                item_desc: data.item_desc,
                amount: data.amount || 0,
                qty: data.qty || 1,
                unit: data.unit,
                item_tax: data.item_tax || [],
                item_tax_total: taxAmount,
                discount: discount_amount || 0,
                discount_type: data.discount_type || 'percentage',
                discount_amount: data.discount || 0,
                total_amount: data.amount * data.qty,
            };
            setProducts([...products, item]);
            setSuggestProducts([]);
        }

        return (<Fb meta={meta}
                    layout={"vertical"}
        />)
    }


    const GetAllProductsBySearch = async (e) => {
        const search = e.target.value.trim();
        if (search.length > 0) {
            const url = "/api/admin/products";
            const input = {
                getRows: true, search_value: search,
            };
            const response = await api.post(url, input);
            if (response) {
                setSuggestProducts(response);
            }
        } else {
            setSuggestProducts([]);
        }
    }
    return (<>
        <div className="border border-dashed border-end-0 border-start-0 pt-3 mt-3">
            <Row className="gap-3">
                <Col sm={6} className="col-xxl-5">
                    <div className="">
                        <InputGroup className="mb-3">
                            <InputGroupText id="basic-addon1">
                                <i className="ri-search-line"/>
                            </InputGroupText>
                            <input
                                type="text"
                                onChange={GetAllProductsBySearch}
                                className="form-control"
                                placeholder={("product_search_placeholder")}
                            />
                            <BtnModal
                                footer
                                className={"btn btn-primary"}
                                title={t("New Product")}
                                icon={"ri-add-line me-1"}
                                children={<AddManualProduct/>}
                            ></BtnModal>
                        </InputGroup>
                        {suggestProducts && suggestProducts.length > 0 && (<div className="row ">
                            {suggestProducts?.map((product) => {
                                const all_tax_id = product.tax_id;
                                product.item_tax = [];
                                product.item_tax_total = 0;
                                allTaxes.map((tax) => {
                                    if (all_tax_id?.includes(tax.tax_id.toString())) {
                                        product.item_tax.push(tax.tax_name + "|" + tax.percentage);
                                        product.item_tax_total += (Number(product.sale_price) * tax.percentage) / 100;
                                    }
                                });
                                return (<div
                                    key={`productList${product.product_id}`}
                                    className={"col-lg-6 mb-2"}
                                >
                                    <div
                                        key={`kl${product.product_id}`}
                                        className="d-flex align-items-center me-2"
                                    >
                                        <div className="flex-shrink-0 me-3">
                                            <div className="avatar-sm bg-light rounded p-1 ">
                                                {product?.product_image ? (<Image
                                                    src={product?.product_image && JSON.parse(product?.product_image)[0]?.fileUrl}
                                                    alt=""
                                                    width={50}
                                                    height={50}
                                                    className="avatar-img rounded "
                                                />) : (<i className="ri-image-line ri-2x text-muted"/>)}
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="fs-14 mb-1">
                                                <a href="#" className="text-dark">
                                                    {" "}
                                                    {product.product_name}{" "}
                                                </a>
                                            </h5>
                                            <p className="text-muted mb-0">
                                                Category :{" "}
                                                <span className="fw-medium">
                                                    {" "}
                                                    Bike Accessories
                                                </span>
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <h6 className="mb-0">
                                                {DisplayMoney(Number(product.sale_price), currency)}
                                            </h6>
                                            <Button
                                                type={"button"}
                                                variant="primary"
                                                onClick={() => {
                                                    // check if product already exists in products array
                                                    const productExists = products.find((p) => p.product_id === product.product_id);
                                                    if (productExists) {
                                                        productExists.qty += 1;
                                                        setProducts([...products]);
                                                    }
                                                    // if product doesn't exist in products array, add it to the array
                                                    else {
                                                        setProducts([...products, {
                                                            product_id: product.product_id,
                                                            item_name: product.product_name,
                                                            item_desc: product.product_desc,
                                                            amount: product.sale_price,
                                                            qty: 1,
                                                            module: module,
                                                            module_id: module_id,
                                                            discount: 0,
                                                            discount_type: "percentage",
                                                            discount_amount: 0,
                                                            item_tax: product.item_tax,
                                                            item_tax_total: product.item_tax_total,
                                                            total_amount: product.sale_price,
                                                            hsn_code: "",
                                                            order: 0,
                                                        }]);
                                                    }
                                                }}
                                                className="btn btn-primary ms-2 btn-sm"
                                            >
                                                <i className="ri-add-line me-1"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>);
                            })}
                        </div>)}

                    </div>
                </Col>
                <Col sm={4} className="col-xxl-2">
                    <div>
                        <Select
                            placeholder={"Select Billable Task"}
                            options={[{value: "1", label: "Option 1"}, {value: "2", label: "Option 2"}, {
                                value: "3", label: "Option 3",
                            },]}
                            name="choices-single-default"
                            id="idStatus"
                        ></Select>
                    </div>
                </Col>
                <Col sm={4} className="col-xxl-1 align-items-center d-flex gap-2">
                    <div className="form-check-label">{t("Show Quantity as :")}</div>
                    <div className="form-check form-switch d-flex gap-3">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="inlineRadioOptions"
                                checked={qtyLabel === "qty"}
                                onChange={() => {
                                    setQtyLabel("qty")
                                    setValue("show_quantity_as", 'qty')
                                }}
                            />
                            <label className="form-check-label" htmlFor="inlineRadio1">
                                {t("qty")}
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="inlineRadioOptions"
                                checked={qtyLabel === "hours"}
                                onChange={() => {
                                    setQtyLabel("hours")
                                    setValue("show_quantity_as", 'hours')
                                }}
                            />
                            <label className="form-check-label" htmlFor="inlineRadio2">
                                {t("hours")}
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="inlineRadioOptions"
                                checked={qtyLabel === "qty_hours"}
                                onChange={() => {
                                    setQtyLabel("qty_hours")
                                    setValue("show_quantity_as", 'qty_hours')
                                }}
                            />
                            <label className="form-check-label" htmlFor="inlineRadio3">
                                {t("qty_hours")}
                            </label>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
        <div className="p-4">
            <div className="table-responsive">
                <Table className="invoice-table table-borderless table-nowrap mb-0">
                    <thead className="align-middle">
                    <tr className="table-active">
                        <th scope="col">
                            #
                        </th>
                        <th scope="col">{t("Product Details")}</th>
                        <th scope="col" style={{width: "120px"}}>
                            <div className="d-flex currency-select input-light align-items-center">
                                {t("amount")}
                            </div>
                        </th>
                        <th scope="col" style={{width: "100px"}}>
                            {t(qtyLabel)}
                        </th>
                        <th scope="col" style={{width: "210px"}}>
                            {t("Tax")}
                        </th>
                        {itemWiseDiscount === "yes" && (<th
                            scope="col"
                            style={{width: "150px"}}
                            className="text-end"
                        >
                            {t("Discount")}
                        </th>)}
                        <th scope="col" style={{width: "120px"}} className="text-end">
                            {t("Amount")}
                        </th>
                        <th
                            scope="col"
                            className="text-end"
                            style={{width: "105px"}}
                        ></th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product, index) => {
                        // check if item_tax is json or array
                        const tax = typeof product.item_tax === "string" ? JSON.parse(product.item_tax) : product.item_tax;
                        return (<tr key={index}>
                            <th scope="row" className="product-id">
                                {index + 1}
                            </th>

                            <td className="text-start">
                                <div className="mb-2">
                                    <Input
                                        className="form-control border-0"
                                        type="text" value={product.item_name}
                                        onChange={(e) => product.item_name = e.target.value}/>
                                </div>
                                <textarea
                                    className="form-control border-0"
                                    placeholder={t("Product Description")}
                                    rows="2"
                                    defaultValue={product.item_desc}
                                    onChange={(e) => {
                                        product.item_desc = e.target.value;
                                    }}
                                />
                            </td>

                            <td>
                                <InputGroup>
                                    <InputGroupText>{currency?.symbol}</InputGroupText>
                                    <Input type="number" value={product.amount}
                                           onChange={(e) => handleProductChange(index, "amount", e.target.value)}/>
                                </InputGroup>
                                <Input type="text"
                                       className="form-control border-0 mt"
                                       placeholder={t("Unit")}
                                       defaultValue={product.unit}
                                       onChange={e => product.unit = e.target.value}/>
                            </td>
                            <td>
                                <div className="input-step">
                                    <Button
                                        type="button"
                                        className="btn btn-light minus btn-sm"
                                        onClick={() => handleProductChange(index, "qty", product.qty - 1)}
                                    >
                                        <i className="mdi mdi-minus"></i>
                                    </Button>

                                    <Input type="number" value={product.qty}
                                           onChange={(e) => handleProductChange(index, "qty", e.target.value)}/>
                                    <Button
                                        type="button"
                                        className="btn btn-light plus btn-sm"
                                        onClick={() => handleProductChange(index, "qty", product.qty + 1)}
                                    >
                                        <i className="mdi mdi-plus"></i>
                                    </Button>
                                </div>
                            </td>
                            <td>
                                <Select
                                    isMulti
                                    value={tax.map(tax => {
                                        const [taxName, taxValue] = tax.split('|');
                                        return {
                                            value: `${taxName}|${parseFloat(taxValue)}`,
                                            label: `${taxName} (${parseFloat(taxValue)}%)`,
                                        }
                                    })}
                                    options={taxOptions}
                                    onChange={(e) => {
                                        product.item_tax = e.map((tax) => tax.value);
                                        setProducts([...products]);
                                    }}
                                />
                            </td>
                            <td>
                                <InputGroup>
                                    <InputGroupText>
                                        <Input addon type="radio"
                                               checked={product.discount_type === 'fixed'}
                                               onChange={(e) => handleProductChange(index, "discount_type", 'fixed')}/>
                                        <span className={'mx-1'}>{currency?.symbol}</span>
                                        <Input addon type="radio"
                                               checked={product.discount_type === 'percentage'}
                                               onChange={(e) => handleProductChange(index, "discount_type", 'percentage')}/>
                                        %
                                    </InputGroupText>
                                    <Input type="number" value={product.discount_amount}
                                           onChange={e => handleProductChange(index, 'discount_amount', e.target.value)}/>

                                </InputGroup>
                            </td>
                            <td className="text-end">
                                <h5 className="m-0">
                                    <span>{DisplayMoney(product.amount * product.qty - (product.discount_type === 'fixed' ? product.discount_amount : (product.amount * product.qty * product.discount_amount) / 100), currency)}</span>
                                </h5>
                            </td>
                            <td className="product-removal">
                                <Button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                        products.splice(index, 1);
                                        setProducts([...products]);
                                        setDeletedField([...deletedField, product]);
                                    }}
                                >
                                    <i className="mdi mdi-close"/>
                                </Button>
                            </td>
                        </tr>);
                    })}
                    <tr className="border-top border-top-dashed mt-2 ">
                        <td colSpan="5"></td>
                        <td colSpan="7" className="text-end">
                            <Table className="table-borderless table-sm table-nowrap align-middle mb-0">
                                <tbody>
                                <tr>
                                    <th scope="row">{t("Sub Total")} :</th>
                                    <td style={{width: "200px"}}>
                                        <Input
                                            type="text"
                                            className="form-control bg-light border-0"
                                            id="sub_total"
                                            placeholder="$0.00"
                                            readOnly
                                            value={DisplayMoney(subTotal, currency)}
                                        />

                                    </td>
                                </tr>
                                {totalTax.map((tax, index) => {
                                    // add tax amount in totalAmount
                                    return (<tr key={index}>
                                        <th scope="row">
                                            {tax.taxName} ({tax.percentage} % )
                                        </th>
                                        <td>
                                            <Input
                                                type="text"
                                                className="form-control bg-light border-0"
                                                id="cart-subtotal"
                                                placeholder="$0.00"
                                                readOnly
                                                value={DisplayMoney(tax.amount, currency)}
                                            />
                                        </td>
                                    </tr>);
                                })}
                                {itemWiseDiscount === "yes" && (<tr>
                                    <th scope="row">{t("Total Discount")}</th>
                                    <td>
                                        <Input
                                            type="text"
                                            className="form-control bg-light border-0"
                                            placeholder="$0.00"
                                            readOnly
                                            value={DisplayMoney(totalDiscount, currency)}
                                        />
                                    </td>
                                </tr>)}
                                <tr>
                                    <th style={{
                                        width: "120px"
                                    }}>
                                        <InputGroup>
                                            <InputGroupText>
                                                <Input addon type="radio" name={`
                                            discountType`}
                                                       checked={discount.discount_type === 'fixed'}
                                                       onChange={e => setDiscount({
                                                           ...discount, discount_type: 'fixed'
                                                       })}/>
                                                <span className={'mx-1'}>{currency?.symbol}</span>
                                                <Input addon type="radio" name={`
                                            discountType`}
                                                       checked={discount.discount_type === 'percentage'}
                                                       onChange={e => setDiscount({
                                                           ...discount, discount_type: 'percentage'
                                                       })}/>
                                                %
                                            </InputGroupText>
                                            <Input type="number"
                                                   id='discount'
                                                   value={discount.discount_amount}
                                                   onChange={e => setDiscount({
                                                       ...discount, discount_amount: e.target.value
                                                   })}/>
                                        </InputGroup>
                                    </th>
                                    <td>
                                        <Input
                                            type="text"
                                            className="form-control bg-light border-0"
                                            id="totalDiscount"
                                            placeholder="$0.00"
                                            readOnly
                                            value={DisplayMoney(discountAmount, currency)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">{t("Shipping Charge") + " (" + currency?.symbol + ")"}</th>
                                    <td>
                                        <Input
                                            type="text"
                                            className="form-control border-0"
                                            placeholder="$0.00"
                                            value={shippingCharge}
                                            onChange={(e) => {
                                                setShippingCharge(Number(e.target.value));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">{t("Adjustment") + " (" + currency?.symbol + ")"}</th>
                                    <td>
                                        <Input
                                            type="text"
                                            className="form-control  border-0"
                                            placeholder="$0.00"
                                            value={adjustment}
                                            onChange={(e) => {
                                                setAdjustment(Number(e.target.value));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr className="border-top border-top-dashed">
                                    <th scope="row">{t("Total Amount")}</th>
                                    <td>
                                        <Input
                                            type="text"
                                            className="form-control bg-light border-0"
                                            id="totalAmount"
                                            placeholder="$0.00"
                                            readOnly
                                            value={DisplayMoney(grandTotal, currency)}
                                        />
                                    </td>
                                </tr>
                                {currency?.currency_id !== defaultCurrency?.currency_id && (<tr>
                                    <th scope="row">{t("Currency conversion")} {t("at")} <br/>
                                        <span className="text-muted">
                                                    {DisplayMoney((grandTotal) * exchangeRate, defaultCurrency)}
                                            {` ` + defaultCurrency?.currency_code}
                                                </span>
                                    </th>
                                    <td>
                                        <Input
                                            type={`number`}
                                            className="form-control bg-light border-0"
                                            id="currencyExchangeRate"
                                            placeholder="0.00"
                                            defaultValue={exchangeRate}
                                            onChange={(e) => {
                                                setExchangeRate(Number(e.target.value));
                                                setValue("conversion_rate", Number(e.target.value));
                                            }}

                                        />
                                    </td>
                                </tr>)}

                                </tbody>
                            </Table>
                        </td>
                    </tr>
                    </tbody>
                </Table>

            </div>
        </div>

    </>)
}
Fb.defineComponent('productPanel', ProductComponent, function (field) {
    return _extends({}, field, {
        props: _extends({}, field.props, {
            currency: field.currency || {},
            module: field?.module || null,
            module_id: field?.module_id || null,
            items: field?.items || field?.data?.items || [],
            info: field?.data || {},
        })
    }, field);
});

export const BtnModal = ({
                             title,
                             offCanvas = false,
                             children,
                             size = "",
                             className = "",
                             icon = "",
                             id = "",
                             link = false,
                             show = false,
                             setToggleModal,
                             ...rest
                         }) => {
    const [modal, setModal] = useState(false);
    const handleClose = () => {
        setTheModal = setModal;
        setToggleModal = setModal;
        setModal(!modal);
    }

    return (<>
        {link ? (<Link
            id={id}
            href={rest?.href ? rest?.href : ""}
            onClick={handleClose}
            passHref={true}
            className={className}
        >
            {rest.permission ? (<div
                className={`avatar${rest.avatar ? "-" + rest.avatar : "-xxs"}`}
            >
                <div
                    className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                    {" "}
                    +
                </div>
            </div>) : (<>
                {icon ? <i className={icon}></i> : ""}
                {title}
            </>)}
        </Link>) : (<Button
            id={id}
            color={rest.btnClassName ? rest.btnClassName : "primary"}
            className={className}
            onClick={handleClose}
        >
            {icon && <i className={icon}></i>}
            {title}{" "}
        </Button>)}
        {offCanvas ? (<MyOffcanvas title={title} modal={modal} handleClose={handleClose}
                                   size={size} {...rest}>  {rest.loading ? (<div className="text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>) : (children)}</MyOffcanvas>) : (
            <MyModal title={title} modal={modal} handleClose={handleClose} size={size} {...rest}>
                {rest.loading ? (<div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>) : (children)}
            </MyModal>)}
    </>);
};


export const notify = (type = "success", message = "The information successfully updated") => {
    toast(message, {
        type: type,
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "bg-" + type + " text-white",
    });
};
export const UserImage = ({
                              user, size = 40, className = ""
                          }) => {
    return (<div className={`avatar ${className}`}>
        {user?.avatar ? (<Image
            className={`rounded-circle img-fluid`}
            src={user.avatar}
            alt="avatar"
        />) : (<Image
            className={`rounded-circle img-fluid`}
            src={avatar}
            alt="avatar"
        />)}
    </div>);
};
export const MyModal = ({
                            title, children, handleClose, size = "", modal, setModal, loading, setLoading, ...rest
                        }) => {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        // Simulate loading for 1 second
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [loading]);

    return (<Modal
        size={size ? size : ""}
        isOpen={modal}
        toggle={handleClose}
        modalClassName="zoomIn"
        contentClassName={rest?.contentClass ? rest?.contentClass : ""}
        centered
    >
        {title || rest?.header ? (<ModalHeader className="modal-title" toggle={handleClose}>
            {title ? title : rest?.header}
        </ModalHeader>) : ("")}
        <ModalBody>{isLoading ? (<div className="spinner-border text-primary" role="status"> <span
            className="sr-only">Loading...</span></div>) : children}</ModalBody>
    </Modal>);
};


export const MyOffcanvas = ({
                                title, children, handleClose, size = "", modal, setModal, loading, ...rest
                            }) => {
    return (<Offcanvas
        isOpen={modal}
        toggle={handleClose}
        direction={rest.direction ? rest.direction : "end"}
    >
        <OffcanvasHeader
            className={'border-bottom'}
            toggle={handleClose}
        >
            {title}
        </OffcanvasHeader>
        <OffcanvasBody>{loading ? (<div className="spinner-border text-primary" role="status"> <span
            className="sr-only">Loading...</span></div>) : children}</OffcanvasBody>
    </Offcanvas>);
}
export default Fb;