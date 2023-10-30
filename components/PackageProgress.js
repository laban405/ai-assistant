import React, {useContext, useEffect, useState} from "react";
import {Context} from "../pages/_app";

export const PackageProgress = ({type, shouldRefetch, setShouldRefetch}) => {
    const {companyPackage, companyLoading, companyRefetch} = useContext(Context);
    useEffect(() => {
        if (shouldRefetch) {
            companyRefetch().then(r => {
            });
            setShouldRefetch(false);
        }
    }, [shouldRefetch]);

    const typeText = companyPackage?.[type] === -1 ?
        <i className="mdi mdi-infinity"></i> : companyPackage?.[type] === 0 ? 'Not Active' : companyPackage?.[type];
    const used = type === 'images_per_month' ? companyPackage?.usedContent[0]?.used_images || 0 : companyPackage?.usedContent[0]?.used_words || 0;
    const percent = (used / typeText) * 100;
    const progressColor = percent > 80 ? 'bg-danger' : percent > 50 ? 'bg-warning' : 'bg-success';

    return (<>
        {companyLoading ? <div className="skeleton w-100"
                               style={{height: "30px"}}/> : <div className="col">
            <div className="progress animated-progess progress-sm" style={{height: "7px"}}>
                <div
                    className={`progress-bar ${progressColor}`}
                    role="progressbar"
                    style={{width: `${(used / typeText) * 100}%`}}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            <div className="p-1">
                <h6 className="mb-0 text-muted">
                    {used} / {typeText}
                </h6>
            </div>
        </div>}
    </>);

}