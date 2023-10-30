import {signOut, useSession} from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Navbar = () => {
    const { t } = useTranslation();

    const {data: session, status} = useSession();
    const loading = status === "loading"
    return (<div
        style={{
            display: "flex", flexDirection: "row", width: "100%", backgroundColor: "#b91c1c",
        }}
    >
        <a>{session?.user.email}</a>
        &nbsp;
        <button
            onClick={() => {
                signOut({redirect: false});
            }}
        >
            {t("signout")}
        </button>
    </div>);
};
export default Navbar;




export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ["common"])),
    },
});