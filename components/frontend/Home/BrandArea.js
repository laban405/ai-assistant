import React, {useContext} from "react";
import {GetRows} from "../../config";
import Loading from "../../Loading";
import Image from "next/image";
import {Context} from "../../../pages/_app";

const BrandArea = ({data, isLoading}) => {

    const {config} = useContext(Context);
    return (<section className="pt-20 text-center" id={''}>
        <h6 className="lead-text text-light fw-normal mb-5">
            {config?.NEXT_PUBLIC_BRAND_TITLE}
        </h6>
        <div className="brand-content">
            <div className="row">
                {isLoading ? (<>
                    <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                        <div className="brand mb-30">
                            <div className="skeleton w-100 img-fluid  p-2 rounded-3" style={{
                                height: "100px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                            }}/>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                        <div className="brand mb-30">
                            <div className="skeleton w-100 img-fluid  p-2 rounded-3" style={{
                                height: "100px", backgroundColor: 'rgba(255, 255, 255, 0.04)'

                            }}/>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                        <div className="brand mb-30">
                            <div className="skeleton w-100 img-fluid  p-2 rounded-3" style={{
                                height: "100px", backgroundColor: 'rgba(255, 255, 255, 0.04)'

                            }}/>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                        <div className="brand mb-30">
                            <div className="skeleton w-100 img-fluid  p-2 rounded-3" style={{
                                height: "100px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                            }}/>
                        </div>
                    </div>
                </>) : (<>
                    {data && data?.map((BrandAreaInfo, index) => {
                        const images = JSON.parse(BrandAreaInfo?.attachments);
                        return (<>
                            <div
                                key={`brand-${index}`}
                                className="col-xl-3 col-lg-3 col-md-3 col-6">
                                <div className="brand mb-30">
                                    {images?.map((image, id) => {
                                        return (<>
                                            <Image key={id} src={image?.fileUrl} alt={image?.name} width={200}
                                                   height={100}
                                            />
                                        </>);
                                    })}
                                </div>
                            </div>
                        </>);
                    })}
                </>)}
            </div>
        </div>
    </section>);
};

export default BrandArea;
