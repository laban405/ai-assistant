import React, {useState} from "react";
import {GetRows} from "../../config";
import Helper from "../../../lib/Helper";
import Loading from "../../Loading";
import {MyModal} from "../../Fb";
import PackageList from "../../PackageList";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";
import Register from "../../../pages/register";
import SinglePrice from "../../Common/SinglePrice";


const PricingArea = () => {

    const {t} = useTranslation();
    const [modal, setModal] = useState(false);
    const [packageId, setPackageId] = useState("");

    const [packages, setPackages] = useState('monthly');

    const url = "/api/admin/packages";
    const {data: packageInfo, isLoading: packageLoading} = GetRows(url);

    return (<section className={`pricing-area pt-80 pb-70 bg-light`} id={'pricing'}>
        <div className="container">
            <div className="row justify-content-center text-center">
                <div className="col-lg-9 col-xl-8">
                    <div className="badge mb-15">PRICING</div>
                    <div className="section-title mb-60">
                        <h2 className="">
                            Plans that start free and fits with your needs
                        </h2>
                        <p className="">
                            With our simple plans, supercharge your content writing to helps
                            your business. Let’s make great content together.
                        </p>
                    </div>
                    <div className="pricing-radio mb-4">

                        <input type="radio" id="monthly" name="fav_pricing" value="monthly"/>
                        <label className={`${packages === 'monthly' ? 'active' : ''}`}
                               onClick={() => setPackages('monthly')}>Monthly</label><br/>
                        <input type="radio" id="yearly" name="fav_pricing" value="yearly"/>
                        <label className={`${packages === 'yearly' ? 'active' : ''}`}
                               onClick={() => setPackages('yearly')}>Yearly</label><br/>
                        <input type="radio" id="lifetime" name="fav_pricing" value="lifetime"/>
                        <label className={`${packages === 'lifetime' ? 'active' : ''}`}
                               onClick={() => setPackages('lifetime')}>Lifetime</label>

                    </div>
                </div>
            </div>
            <div className="row">
                {packageLoading ? (<>
                    <div className={"col-xl-4 col-lg-6"}>
                        <div className="skeleton w-100 img-fluid  p-2 rounded-10 "
                             style={{
                                 height: "480px",
                             }}/>
                    </div>
                </>) : (<>
                    {packageInfo && packageInfo?.map((pricing) => {
                        return (<div className={pricing?.recommended ? "col-xl-4 col-lg-6" : "col-xl-4 col-lg-6"}>
                            <SinglePrice pricing={pricing} packages={packages} setModal={setModal}
                                         setPackageId={setPackageId}/>
                        </div>);
                    })}
                </>)}
            </div>

            {modal ? (<MyModal
                size={"xl"}
                modal={modal}
                title={t("Signup")}
                handleClose={() => {
                    setModal(false);
                }}
                children={<Register id={packageId} packages={packages}
                                    setModal={setModal}
                />}
            />) : null}

        </div>
    </section>);
};

export default PricingArea;
