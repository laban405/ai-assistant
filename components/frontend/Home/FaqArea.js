import React, {useContext, useState} from "react";
import {
    Accordion, AccordionBody, AccordionHeader, AccordionItem,
} from "reactstrap";
import {GetRows} from "../../config";
import Loading from "../../Loading";
import {Context} from "../../../pages/_app";

const FaqArea = ({data, isLoading}) => {
    const {config} = useContext(Context);
    const [open, setOpen] = useState(["1", "2", "3"]);
    const toggle = (id) => {
        if (open.includes(id)) {
            setOpen(open.filter((item) => item !== id));
        } else {
            setOpen([...open, id]);
        }
    };


    return (<section className="faq-area bg-light pt-20" id={'contact'}>
        <div className="container">
            <div className="row justify-content-center text-center">
                <div className="col-lg-9 col-xl-8">
                    <div className="section-title mb-55">
                        <h2 className="">{config?.NEXT_PUBLIC_FAQ_AREA_TITLE}</h2>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: config?.NEXT_PUBLIC_FAQ_AREA_DESCRIPTION,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="row g-gs justify-content-center">
                <div className="col-xl-9">
                    <div className="faq-accordion mb-90">
                        {isLoading ? (<>

                            <div className="skeleton w-100 img-fluid  p-2  mb-10"
                                 style={{
                                     height: "70px", backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px'
                                 }}/>
                            <div className="skeleton w-100 img-fluid  p-2  mb-10"
                                 style={{
                                     height: "70px", backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px'
                                 }}/>
                            <div className="skeleton w-100 img-fluid  p-2  mb-10"
                                 style={{
                                     height: "70px", backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px'
                                 }}/>

                        </>) : (<>
                            <Accordion open={open} toggle={toggle}>
                                {data && data?.map((FaqAreaInfo, index) => {
                                    return (<>
                                        <AccordionItem key={`faq-area-${index}`}>
                                            <AccordionHeader targetId={index}>
                                                {FaqAreaInfo?.title}
                                                <i className="plus fas fa-plus"></i>
                                                <i className="minus fas fa-minus"></i>
                                            </AccordionHeader>
                                            <AccordionBody accordionId={index}>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: FaqAreaInfo?.descriptions,
                                                    }}
                                                />
                                            </AccordionBody>
                                        </AccordionItem>
                                    </>);
                                })}
                            </Accordion>
                        </>)}
                    </div>
                </div>
            </div>
        </div>
    </section>);
};

export default FaqArea;
