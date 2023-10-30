import React, {useContext} from "react";
import {GetRows} from "../../config";
import Loading from "../../Loading";
import {Context} from "../../../pages/_app";

const ContentStepsArea = ({data, isLoading}) => {
    const {config} = useContext(Context);
    return (<section className="steps  bg-white pt-90 rounded-top-6" id={'features'}>
        <div className="container">
            <div className="row justify-content-center text-center">
                <div className="col-xl-8 col-lg-9">
                    <div className="badge mb-15">How To</div>
                    <div className="section-title mb-55">
                        <h2 className="">
                            {config?.NEXT_PUBLIC_CONTENT_STEPS_TITLE}
                        </h2>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: config?.NEXT_PUBLIC_CONTENT_STEPS_DESCRIPTION,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="section-content">
                {isLoading ? (<>
                    <div className={`bg-3 step-here mb-15`}>
                        <div className="row flex-row-reverse">
                            <div className="col-xl-6 col-lg-6">
                                <div

                                >
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                                         style={{height: "400px", backgroundColor: 'rgb(219 234 242)'}}/>

                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6">
                                <div className="step-wrap mb-30">
                                    <div className="skeleton w-25 img-fluid  p-2 rounded-10 "
                                         style={{height: "60px", backgroundColor: 'rgb(219 234 242)'}}/>

                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 mt-20"
                                         style={{height: "60px", backgroundColor: 'rgb(219 234 242)'}}/>

                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 mt-10 "
                                         style={{height: "30px", backgroundColor: 'rgb(219 234 242)'}}/>
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 mt-10"
                                         style={{height: "30px", backgroundColor: 'rgb(219 234 242)'}}/>
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 mt-10"
                                         style={{height: "30px", backgroundColor: 'rgb(219 234 242)'}}/>
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-10 mt-10"
                                         style={{height: "30px", backgroundColor: 'rgb(219 234 242)'}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </>) : (<>{data && data?.map((ContentStepsAreaInfo) => {
                    const images = JSON.parse(ContentStepsAreaInfo?.image);
                    const attach = JSON.parse(ContentStepsAreaInfo?.attachments);
                    return (<>
                        <div
                            className={`${ContentStepsAreaInfo?.background_color} step-here mb-15`}
                        >
                            <div className="row flex-row-reverse">
                                <div className="col-xl-6 col-lg-6">
                                    <div
                                        className={`${ContentStepsAreaInfo?.gradient_color}  p-5 rounded-10 bg-opacity-50 pb-0 mb-30 mt-20`}
                                    >
                                        {images?.map((image, id) => {
                                            return (<>
                                                <img
                                                    key={id}
                                                    className="img-fluid rounded-10"
                                                    src={`${image?.fileUrl}`}
                                                    alt=""
                                                />
                                            </>);
                                        })}
                                    </div>
                                </div>
                                <div className="col-xl-6 col-lg-6">
                                    <div className="step-wrap mb-30">
                                        {attach ? (attach?.map((image, id) => {
                                            return (<>
                                                <img
                                                    key={id}
                                                    className="mb-4"
                                                    style={{maxHeight: "5rem"}}
                                                    src={`${image?.fileUrl}`}
                                                    alt=""
                                                />
                                            </>);
                                        })) : (<i
                                            style={{maxHeight: "5rem"}}
                                            className={`mb-4 ${ContentStepsAreaInfo?.icon}`}
                                        ></i>)}

                                        <h3>{ContentStepsAreaInfo?.title}</h3>

                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: ContentStepsAreaInfo?.descriptions,
                                            }}
                                        />
                                    </div>
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

export default ContentStepsArea;
