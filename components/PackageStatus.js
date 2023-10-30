import {Row} from "reactstrap";
import React, {useEffect, useState} from "react";
import {Info} from "./config";

export const PackageStatus = ({companyId, type, shouldRefetch, setShouldRefetch}) => {
    const {data: packageCapacity, isLoading, refetch} = Info('/api/admin/companiesHistories', {
        'cmpny.company_id': companyId, 'cmpnyDetail.active': 1,
    }, {
        usedContent: {
            url: '/api/admin/used_contents', where: {
                'usdContent.company_id': companyId, month: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`
            }
        }
    });

    useEffect(() => {
        if (shouldRefetch) {
            refetch().then(r => {

            });
            setShouldRefetch(false);
        }
    }, [shouldRefetch]);
    const TotalInfo = ({data, type}) => {
        // if data?.[type] is -1 then it is unlimited if 0 then it is not active
        const typeText = data?.[type] === -1 ? 'Unlimited' : data?.[type] === 0 ? 'Not Active' : data?.[type];
        const used = data?.usedContent[0]?.used_words || 0;

        return (<>
            <h6 className="mb-0 text-muted">
                {used} / {typeText}
            </h6>
        </>);

    }

    return (<Row className="align-items-start justify-content-between ">
        {isLoading ? <>
            <div className="skeleton w-100"
                 style={{height: "30px"}}/>
        </> : <>
            <div className="col">
                <div className="p-1">
                    <div className="progress animated-progess progress-sm">
                        <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{width: "50.16%"}}
                            aria-valuenow="50.16"
                            aria-valuemin="0"
                            aria-valuemax="100"
                        ></div>
                    </div>
                </div>
            </div>
            <div className="col-auto">
                <div className="p-1">
                    <TotalInfo data={packageCapacity} type={type}/>
                </div>
            </div>
        </>}
    </Row>);

}