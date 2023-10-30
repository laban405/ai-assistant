import React, {useContext, useState} from "react";
import {
    Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
} from "reactstrap";
import {signOut, useSession} from "next-auth/react";

//import images
import Image from "next/image";
import {Info, MyDetails, isAdmin, Avatar} from "./config";
import Link from "next/link";
import {useTranslation} from "next-i18next";
import {Context} from "../pages/_app";

const ProfileDropdown = () => {
    const {t} = useTranslation();
    const myDetails = MyDetails();
    const {companyPackage} = useContext(Context);

    const {
        data: userInfo, isLoading, refetch,
    } = Info("/api/admin/users", {user_id: myDetails?.user_id}, {
        allUsedContent: {
            url: "/api/admin/used_contents", where: {
                "usdContent.company_id": myDetails?.company_id,
            },
        },
    });
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    return (<React.Fragment>
        <Dropdown
            isOpen={isProfileDropdown}
            toggle={toggleProfileDropdown}
            className="ms-sm-3 header-item topbar-user"
        >
            <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <Image
                            className="rounded-circle header-profile-user"
                            src={Avatar(myDetails?.avatar)}
                            height={60}
                            width={150}
                            alt="Header Avatar"
                        />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                                {myDetails?.first_name}{" "}{myDetails?.last_name}
                            </span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                                {myDetails?.role_id === 1 ? "Super Admin" : myDetails?.role_id === 2 ? "Admin" : "User"}
                            </span>
                        </span>
                    </span>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
                <h6 className="dropdown-header">{t("hello")} {myDetails?.first_name}{" "}{myDetails?.last_name}</h6>

                <Link className="dropdown-item" href={"/admin/profile"}>
                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                    <span className="align-middle">{t("my_profile")}</span>
                </Link>

                {!isAdmin() && <><DropdownItem href="#">
                    <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle">
                                {t('words_left')} : {" "}
                        <b>
                                    {companyPackage?.words_per_month ? companyPackage?.words_per_month - (companyPackage?.usedContent[0]?.used_words || 0) : 0}
                                </b>
                            </span>
                </DropdownItem>
                    <DropdownItem href="#">
                        <i className="ri-image-line text-muted fs-16 align-middle me-1"></i>{" "}
                        <span className="align-middle">
                                    {t('images_left')} : {" "}
                            <b>
                                        {companyPackage?.images_per_month ? companyPackage?.images_per_month - (companyPackage?.usedContent[0]?.used_images || 0) : 0}
                                    </b>
                                </span>
                    </DropdownItem></>}


                <Link className="dropdown-item" href={isAdmin() ? "/saas/settings" : "/admin/profile"}>
                    <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle">
                                {t('settings')}
                    </span>
                </Link>


                <DropdownItem
                    onClick={() => {
                        signOut({redirect: false});
                    }}
                >
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle" data-key="t-logout">
                            {t("logout")}
                        </span>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </React.Fragment>);
};

export default ProfileDropdown;

export const getServerSideProps = async ({locale}) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});
