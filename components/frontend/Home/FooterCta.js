import Link from "next/link";
import React from "react";
import {GetRows} from "../../config";
import Loading from "../../Loading";
import Image from "next/image";

const FooterCta = ({data, isLoading}) => {
    return (<section className="footer-cta-area bg-light">
        <div className="container">
            <div className="footer-cta">
                {isLoading ? (<>
                    <div className="row justify-content-between align-items-center gap-xl-5">
                        <div className="col-xl-5 col-lg-6">
                            <div className="block-text">
                                <h6 className="overline-title">
                                    <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                         style={{height: "50px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                                </h6>

                                <div className="skeleton w-100 img-fluid  p-2 mb-10 rounded-3"
                                     style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>

                                <div className="skeleton w-100 img-fluid  p-2 rounded-3  mb-10 "
                                     style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>

                                <div className="skeleton w-100 img-fluid  p-2 rounded-3  mb-10 "
                                     style={{height: "20px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>

                                <div className="skeleton w-50 img-fluid  p-2 mt-10 "
                                     style={{
                                         height: "60px",
                                         backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                         borderRadius: "20px"

                                     }}/>
                            </div>

                        </div>
                        <div className="col-xl-6 col-lg-6">
                            <div className="block-image">
                                <div className="skeleton w-100 img-fluid  p-2 rounded-3"
                                     style={{height: "400px", backgroundColor: 'rgba(255, 255, 255, 0.04)'}}/>
                            </div>
                        </div>
                    </div>
                </>) : (<>
                    <div className="row justify-content-between align-items-center gap-xl-5">
                        {data && data?.map((FooterCtaInfo, index) => {
                            const images = JSON.parse(FooterCtaInfo?.attachments);
                            return (<>
                                <div key={`footer-cta-${index}`} className="col-xl-5 col-lg-6">
                                    <div className="block-text">
                                        <h6 className="overline-title">
                                            {FooterCtaInfo?.sub_title}
                                        </h6>
                                        <h2 className="title text-light mb-20">
                                            {FooterCtaInfo?.title}
                                        </h2>
                                        <div
                                            className="text-light mb-20"
                                            dangerouslySetInnerHTML={{
                                                __html: FooterCtaInfo?.descriptions,
                                            }}
                                        />
                                        <ul className="btn-list btn-list-inline mt-10">
                                            <li>
                                                <Link
                                                    className="font-btn"
                                                    href={FooterCtaInfo?.button_one_link ? FooterCtaInfo?.button_one_link : "#"}
                                                >
                                                    <span> {FooterCtaInfo?.button_one}</span>
                                                    <i className="fas fa-long-arrow-alt-right mx-3"></i>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-xl-6 col-lg-6">
                                    <div
                                        className="rounded-top-4 bg-gradient-primary pt-30 pl-30 pr-30 bg-opacity-70 cta-image">
                                        {images?.map((image, id) => {
                                            return (<>
                                                <Image src={`${image?.fileUrl}`} alt={image?.originalFilename}
                                                       className={"rounded-top-3 img-fluid"}
                                                       width={200}
                                                       height={200}
                                                />
                                            </>);
                                        })}
                                    </div>
                                </div>
                            </>);
                        })}
                    </div>
                </>)}
            </div>
        </div>
    </section>);
};

export default FooterCta;
