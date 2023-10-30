import Link from "next/link";
import React from "react";
import {GetRows} from "../../config";
import Helper from "../../../lib/Helper";
import Loading from "../../Loading";
import Image from "next/image";

const HeroArea = ({data, isLoading}) => {
    return (<section className="hero-area pb-30" id={'home'}>
        {isLoading ? (<>
            <div className="hero-content">
                <div className="container">
                    <div className="row flex-row-reverse">
                        <div className="col-xl-6 col-lg-5">
                            <div className="hero-img pt-200">
                                <div className="skeleton w-100 img-fluid  p-2 rounded-3" style={{
                                    height: "400px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                }}/>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="h-content pt-200">
                                <div className="skeleton w-50 mb-4" style={{
                                    height: "30px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                }}/>
                                <div className="skeleton w-75 mb-5" style={{
                                    height: "50px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                }}/>
                                <div className="skeleton w-100 mb-5" style={{
                                    height: "30px", backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                }}/>
                                <div className="skeleton mb-5 me-5" style={{
                                    width: "35%",
                                    height: "40px",
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: "10px"
                                }}/>
                                <div className="skeleton  mb-5 ms-5" style={{
                                    width: "35%",
                                    height: "40px",
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: "10px"
                                }}/>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>) : (<>
            {data && data?.map((HeroAreaInfo, index) => {
                const images = JSON.parse(HeroAreaInfo?.attachments);
                return (<>
                    <div key={`hero-area-${index}`} className="hero-content">
                        <div className="container">
                            <div className="row flex-row-reverse">
                                <div className="col-xl-6 col-lg-5">
                                    <div className="hero-img pt-200">
                                        {images?.map((image, id) => {
                                            return (<>
                                                <Image key={`hero-area-image-${id}`}
                                                       className="img-fluid bg-gradient-primary p-2 rounded-3"
                                                       src={`${image?.fileUrl}`}
                                                       width={600}
                                                       height={100}
                                                       alt="NextAi"/>

                                            </>);
                                        })}
                                    </div>
                                </div>
                                <div className="col-xl-6 col-lg-7">
                                    <div className="h-content pt-200">
                                        <h5 className="text-uppercase fw-normal mb-4 text-light">
                                            {HeroAreaInfo?.sub_title}
                                        </h5>
                                        <h1 className="text-light mb-5">
                                            {HeroAreaInfo?.title}
                                            <br/>
                                            <span className="text-gradient-primary">
                            {HeroAreaInfo?.highlighted_tag}
                          </span>
                                        </h1>
                                        <p className="text-light mb-5">
                                            {Helper.removeHtmlTags(HeroAreaInfo?.descriptions)}
                                        </p>
                                        <ul className="btn-list d-md-flex gap-4 m-0">
                                            <li className="mb-20">
                                                <Link
                                                    href={HeroAreaInfo?.button_one_link ? HeroAreaInfo?.button_one_link : "#"}
                                                    className="font-btn"
                                                >
                                                    <i className="fab fa-google"></i>
                                                    <span className="d-inline-block mx-2">
                                {HeroAreaInfo?.button_one}
                              </span>
                                                </Link>
                                            </li>
                                            <li className="mb-20">
                                                <Link
                                                    href={HeroAreaInfo?.button_two_link ? HeroAreaInfo?.button_two_link : "#"}
                                                    className="font-btn bg-white text-black"
                                                >
                              <span className="d-inline-block mx-2">
                                {HeroAreaInfo?.button_two}
                              </span>
                                                    <i className="fas fa-long-arrow-alt-right"></i>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>);
            })}
        </>)}
    </section>);
};

export default HeroArea;
