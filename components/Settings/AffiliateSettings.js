import { Card, CardBody } from "reactstrap";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const AffiliateSettings = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardBody>
        <div className="">
          <div className="flex-grow-1 overflow-hidden">
            <h5 className="text-uppercase fw-medium text-muted text-truncate mb-2">
              {t("Affiliate Link")}
            </h5>
            <p className="text-muted">{t("Get Link")}</p>
            <h5 className="bg-light fs-15 mb-4 p-4">{p("plan_features")}:</h5>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};



export const getServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale, ["common"])) },
});

