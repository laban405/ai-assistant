import React, {useContext} from "react";
import {GetRows} from "../../config";
import Helper from "../../../lib/Helper";
import Loading from "../../Loading";
import {Context} from "../../../pages/_app";

const ServicesArea = ({data, isLoading}) => {
    const {config} = useContext(Context);
    return (<section className="services-area pt-60 pb-35" id={'services'}>
        <div className="container">
            <div className="row justify-content-center text-center">
                <div className="col-lg-9 col-xl-6 col-xxl-5">
                    <div className="section-title mb-55">
                        <h2 className="text-light">
                            {config?.NEXT_PUBLIC_SERVICES_TITLE}
                        </h2>

                        <div
                            className="text-light"
                            dangerouslySetInnerHTML={{
                                __html: config?.NEXT_PUBLIC_SERVICES_DESCRIPTION,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                {isLoading ? (<>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="service">
                            <div className="service-media mb-20">
                                <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                     style={{height: "60px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                            </div>
                            <div className="service-text">
                                <h4 className="title text-light mb-10">
                                    <div className="skeleton w-75 img-fluid  p-2 rounded-3"
                                         style={{height: "40px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </h4>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="service">
                            <div className="service-media mb-20">
                                <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                     style={{height: "60px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                            </div>
                            <div className="service-text">
                                <h4 className="title text-light mb-10">
                                    <div className="skeleton w-75 img-fluid  p-2 rounded-3"
                                         style={{height: "40px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </h4>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 col-md-6">
                        <div className="service">
                            <div className="service-media mb-20">
                                <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                     style={{height: "60px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                            </div>
                            <div className="service-text">
                                <h4 className="title text-light mb-10">
                                    <div className="skeleton w-75 img-fluid  p-2 rounded-3"
                                         style={{height: "40px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </h4>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                                <div className="text-light mb-0">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </>) : (<>
                    {data && data?.map((ServiceInfo) => {
                        return (<>
                            <div className="col-xl-4 col-lg-4 col-md-6">
                                <div className="service">
                                    <div
                                        className={`service-media ${ServiceInfo?.service_color} mb-20`}
                                    >
                                        <i className={ServiceInfo?.icon}></i>
                                    </div>
                                    <div className="service-text">
                                        <h4 className="title text-light mb-10">
                                            {ServiceInfo?.title}
                                        </h4>
                                        <p className="text-light mb-0">
                                            {Helper.removeHtmlTags(ServiceInfo?.descriptions)}
                                        </p>
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

export default ServicesArea;
