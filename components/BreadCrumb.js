import React from "react";
import {Col, Row} from "reactstrap";
import Link from "next/link";
import Head from "next/head";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import {useRouter} from "next/router";
import {PackageProgress} from "./PackageProgress";
import {isAdmin} from "./config";

const BreadCrumb = ({type, title, pageTitle, shouldRefetch, setShouldRefetch}) => {
    const router = useRouter()
    return (<React.Fragment>
        <Head>
            <title>{pageTitle && title ? pageTitle + ' | ' + title : pageTitle ? pageTitle : title}
            </title>
        </Head>
        <Row>
            <Col xs={12}>
                <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                    <div className="d-flex gap-4 col-3">
                        <h4 className="mb-sm-0">
                            <Link href={'#'} passHref onClick={() => router.back()}>
                                {title}
                            </Link>
                        </h4>
                        {type && !isAdmin() && <PackageProgress
                            type={type}
                            shouldRefetch={shouldRefetch}
                            setShouldRefetch={setShouldRefetch}/>}

                    </div>


                    <div className="page-title-right">
                        <ol className="breadcrumb m-0">
                            <li className="breadcrumb-item">
                                {pageTitle}
                            </li>
                            <li className="breadcrumb-item active">
                                <Link href={'#'} passHref onClick={() => router.back()}>
                                    {title}
                                </Link>
                            </li>
                        </ol>

                    </div>
                </div>
                <ToastContainer/>
            </Col>
        </Row>
    </React.Fragment>);
};

export default BreadCrumb;
