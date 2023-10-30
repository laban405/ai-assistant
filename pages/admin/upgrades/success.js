import {useRouter} from "next/router";
import {companyID, updatePackage} from "../../../components/config";
import React, {useEffect} from "react";
import {notify} from "../../../components/Fb";
import BreadCrumb from "../../../components/BreadCrumb";
import {Card, CardBody, Container} from "reactstrap";
import {useTranslation} from "next-i18next";

export default function Success() {
    const {t} = useTranslation();
    const router = useRouter();
    const {session_id} = router.query;
    const company_id = companyID();
    // get all the data from local storage


    useEffect(() => {
        const packageData = JSON.parse(localStorage.getItem('packageData'));
        packageData.payment_status = 'paid';
        packageData.currency = 'USD';
        packageData.payment_method = 'stripe';
        packageData.company_id = company_id;
        const updatadPackage = async () => {
            const res = await updatePackage(packageData);
            if (res.affectedRows > 0) {
                // redirect to the dashboard
                notify('success', t("your_payment_has_been_successfully_processed"))
                // redirect to the dashboard after 3 seconds
                setTimeout(() => {
                    router.push('/admin/dashboard');

                }, 1000);
            }
        }
        if (session_id) {
            updatadPackage().then(r => console.log(r));
        }

    }, [session_id]);

    return (<div className="page-content"><Container fluid>
        <BreadCrumb title={t('upgrades')}/>
        <Card>
            <CardBody>
                <div className="text-center">
                    <h1 className="display-1">{t("thank_you")}</h1>
                    <p className="lead">{t("your_payment_has_been_successfully_processed")}</p>
                    <p className="lead">{t("you_will_be_redirected_to_the_dashboard_in_a_few_seconds")}</p>
                </div>
            </CardBody>
        </Card>
    </Container>
    </div>)
}