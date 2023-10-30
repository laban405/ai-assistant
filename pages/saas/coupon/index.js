import { Card, CardBody } from "reactstrap";
import React, { useEffect, useState } from "react";
import { Info } from "../../../components/config";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// moment time zone
import "moment-timezone";
import BreadCrumb from "../../../components/BreadCrumb";
import MyTable from "../../../components/MyTable";
import { useRouter } from "next/router";
import Fb, { BtnModal, MyModal, MyOffcanvas } from "../../../components/Fb";

const Coupon = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <BreadCrumb title={t("Coupon")} pageTitle={t("All Coupon")} />
          <Card className={"row"}>
            <CardBody>
              <AllCoupon />
            </CardBody>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};
export default Coupon;

const AllCoupon = () => {
  let info = "";
  let url = "/api/admin/coupon";
  const [modal, setModal] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const { coupon_id } = router.query || {};
  let updateInfo = Info("/api/admin/coupon", coupon_id);
  if (coupon_id) {
    info = updateInfo;
  } else {
    info = "";
  }
  if (info?.isLoading) {
    return <div>Loading...</div>;
  }

  // ------- for table data start ------------
  const columns = [
    {
      label: t("Coupon For"),
      accessor: "name",
      sortable: true,
      linkId: "coupon_id",
      actions: [
        {
          name: "editModal",
          link: "/admin/coupon",
          setModal: setModal,
        },
        {
          name: "delete",
          link: url,
        },
      ],
    },

    {
      label: t("name"),
      accessor: "name",
      sortable: true,
    },
    {
      label: t("Code"),
      accessor: "code",
      sortable: true,
    },
    {
      label: t("amount"),
      accessor: "amount",
      sortable: true,
    },
    {
      label: t("End Date"),
      accessor: "end_date",
      sortable: true,
    },

    {
      label: t("Published"),
      accessor: "status",
      update: true,
      type: "checkbox",
      number: true,
      linkId: "coupon_id",
      sortable: true,
      // sortbyOrder: "desc",
    },
  ];

  const actions = [
    {
      name: "btn",
      label: t("New Coupon"),
      className: "btn-success",
      icon: "ri-add-line",
      modal: true,
      setModal: setModal,
    },
  ];
  // ------- for modal data end ------------
  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <MyTable
            actions={actions}
            columns={columns}
            url={"/api/admin/coupon"}
          />
        </CardBody>
        {modal ? (<>
            {<CouponModal
                size={"md"}
                modal={modal}
                title={t("Edit Account")}
                loading={info?.isLoading}
                data={info?.data}
                setModal={setModal}
                handleClose={() => {
                    router.push(`/admin/coupon`)
                    setModal(false);
                }}/>}

        </>) : null}
        
      </Card>
    </React.Fragment>
  );
};

const CouponModal = ({ data, modal, handleClose, setModal, loading }) => {
  const { t } = useTranslation();

  const meta = {
    columns: 1,
    formItemLayout: [3, 9],
    fields: [
      {
        name: "name",
        type: "text",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("name"),
        value: data?.name,
      },
      {
        name: "code",
        type: "text",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("Code"),
        addonAfter: "Code",
        value: data?.code,
      },
      {
        name: "amount",
        type: "text",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("amount"),
        addonAfter: "Percentage",
        value: data?.amount,
      },
      {
        name: "end_date",
        type: "date",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("End Date"),
        value: data?.end_date,
      },
      {
        name: "package",
        type: "select",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("Select Package"),
        options: [
          {
            label: "All Package",
            value: "1",
          },
          {
            label: "FREE PLAN",
            value: "2",
          },
          {
            label: "BIZPLAN DAI CA BEBE",
            value: "3",
          },
          {
            label: "TEAMPLUS",
            value: "4",
          },
          {
            label: "BIZPLUS",
            value: "5",
          },
        ],
        value: data?.package,
      },
      {
        name: "showing_on_pricing",
        type: "checkbox",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("Showing on Pricing"),
        value: data?.showing_on_pricing,
      },

      {
        name: "status",
        type: "checkbox",
        customClass: "form-switch form-check-inline mt-2 ",
        label: t("status"),
        value: data?.status,
      },

      {
        type: "submit",
        label: t("submit"),
        setModal: setModal,
      },
    ],
  };

  const newCoupon = (
    <Fb
      meta={meta}
      form={true}
      url='/api/admin/coupon'
      id={data?.coupon_id}
      to={"/admin/coupon"}
    />
  );

  return (
    <MyModal
      size={"md"}
      title={data?.coupon_id ? t("Edit Coupon") : t("New Coupon")}
      modal={modal}
      handleClose={handleClose}
      loading={loading}
      children={newCoupon}
    />
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
