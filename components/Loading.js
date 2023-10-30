// create a Loading component using reactstrap
import React from 'react';
import {Spinner} from 'reactstrap';

export default function Loading() {

    // show a spinner into center of the page
    return (<>
        <div className="d-flex ">
            <h1 className="text-primary me-2">Loading </h1>
            <ThreeDotSpinner/>
        </div>
    </>);
}

export const ThreeDotSpinner = ({color1, color2, color3}) => {
    return (<>
        <div className="text-center">
            <div className="mt-3">
                <div className="spinner-dot"
                     style={{backgroundColor: color3, animationDelay: '0.08s'}}
                />
                <div className="spinner-dot"
                     style={{backgroundColor: color1, animationDelay: '0.16s'}}/>
                <div className="spinner-dot"
                     style={{backgroundColor: color3, animationDelay: '0.32s'}}/>
            </div>
        </div>
    </>);
};
ThreeDotSpinner.defaultProps = {
    color1: '#405089', color2: '#f50103', color3: '#3093d1',
};
// <div className="spinner-border text-primary" role="status"> <span
//     className="sr-only">Loading...</span></div>
