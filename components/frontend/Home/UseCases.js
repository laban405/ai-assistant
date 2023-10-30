import React, {useContext} from "react";
import {GetRows} from "../../config";
import Loading from "../../Loading";
import {Context} from "../../../pages/_app";

const UseCases = ({data, isLoading}) => {
    const {config} = useContext(Context);
    return (<section className="use-cases bg-light pt-90 pb-40" id={'use-cases'}>
        <div className="container">
            <div className="row justify-content-center text-center">
                <div className="col-lg-9 col-xl-8">
                    <div className="badge mb-15">USE CASES</div>
                    <div className="section-title mb-55">
                        <h2 className="">
                            {config?.NEXT_PUBLIC_USE_CASE_MODEL_TITLE}
                        </h2>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: config?.NEXT_PUBLIC_USE_CASE_MODEL_DESCRIPTION,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                {isLoading ? (<>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="use-cases-wrapper text-center mb-50">
                            <div className="d-flex justify-content-center">
                                <div
                                    className=" mb-25 service-media ">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{
                                             height: "60px",
                                         }}/>
                                </div>
                            </div>
                            <div className="cases-text">
                                <h3 className="title mb-10">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{height: "35px"}}/>
                                </h3>

                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="use-cases-wrapper text-center mb-50">
                            <div className="d-flex justify-content-center">
                                <div
                                    className=" mb-25 service-media ">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{
                                             height: "60px",
                                         }}/>
                                </div>
                            </div>
                            <div className="cases-text">
                                <h3 className="title mb-10">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{height: "35px"}}/>
                                </h3>

                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="use-cases-wrapper text-center mb-50">
                            <div className="d-flex justify-content-center">
                                <div
                                    className=" mb-25 service-media ">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{
                                             height: "60px",
                                         }}/>
                                </div>
                            </div>
                            <div className="cases-text">
                                <h3 className="title mb-10">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{height: "35px"}}/>
                                </h3>

                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                                <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                     style={{height: "25px"}}/>
                            </div>
                        </div>
                    </div>
                </>) : (<>
                    {data && data?.map((UseCaseInfo, key) => {
                        const images = JSON.parse(UseCaseInfo?.attachments);
                        return (<>
                            <div
                                key={`use-case-${key}`}
                                className="col-xl-4 col-lg-4 col-md-6">
                                <div className="use-cases-wrapper text-center mb-50">
                                    <div className="d-flex justify-content-center">
                                        <div
                                            className="use-cases-media mb-25 service-media text-bg-danger-soft-outline">
                                            {images?.map((image, id) => {
                                                return (<>
                                                    <img
                                                        key={id}
                                                        style={{height: "35px"}}
                                                        className="img-fluid"
                                                        src={`${image?.fileUrl}`}
                                                        alt=""
                                                    />
                                                </>);
                                            })}
                                        </div>
                                    </div>
                                    <div className="cases-text">
                                        <h3 className="title mb-10">{UseCaseInfo?.title}</h3>
                                        <div
                                            className="mb-0"
                                            dangerouslySetInnerHTML={{
                                                __html: UseCaseInfo?.descriptions,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>);
                    })}
                </>)}
            </div>
        </div>
    </section>);
};

export default UseCases;
