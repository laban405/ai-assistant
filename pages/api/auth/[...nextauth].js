import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";

import DB from "../../../lib/db";
import {configItems} from "../admin/common";
import moment from "moment/moment";

const bcrypt = require("bcrypt");
let isSuperAdmin = false;

export const authOptions = {
    providers: [CredentialsProvider({
        credentials: {}, async authorize(credentials) {
            const db = new DB();
            const {username, password} = credentials;
            // get user from database by username or email address
            const checkUser = await db.data('tbl_users', {username: username, activated: 1});
            if (checkUser.length === 0) {
                throw new Error("The username or password is invalid");
            }
            const user = checkUser[0];
            // check password
            const passwordValid = await bcrypt.compare(password, user.password);
            if (!passwordValid) {
                throw new Error("The username or password is invalid");
            }

            if (user.user_id) {
                const userData = {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role_id: user.role_id,
                    company_id: user.company_id,
                    activated: user.activated,
                    is_verified: user.is_verified,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    full_name: user.first_name + ' ' + user.last_name,
                    avatar: user.avatar,
                    isAffiliate: user.isAffiliate,
                }
                if (user.role_id === 1) {
                    isSuperAdmin = true;
                }
                return {
                    user: userData,
                };
            } else {
                throw new Error("The username or password is invalid");
            }
        }
    }), GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }), FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }), GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }), TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID, clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }), LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID, clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    })], pages: {
        signIn: '/auth/login',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: null
    }, session: {
        jwt: true, maxAge: 30 * 24 * 60 * 60, // 30 days
    }, jwt: {
        secret: process.env.JWT_SECRET,
    }, callbacks: {
        async signIn({user, account, profile}) {
            if (account.provider !== 'credentials') {
                const db = new DB();
                const email = profile?.email;
                const checkUser = await db.data('tbl_users', {email: email}) || [];
                if (checkUser.length === 0) {
                    const first_name = profile?.given_name || profile?.name?.split(' ')[0] || user?.name?.split(' ')[0];
                    const last_name = profile?.family_name || profile?.name?.split(' ')[1] || user?.name?.split(' ')[1];
                    const defaultPackage = await configItems('NEXT_PUBLIC_DEFAULT_PACKAGE') || 1;
                    const packageInfo = await db.data('tbl_packages', {package_id: defaultPackage});
                    const packageData = packageInfo[0];
                    const expired_date = packageData.frequency === "monthly" ? moment().add(30, "days").format("YYYY-MM-DD") : packageData.frequency === "annual" ? moment().add(365, "days").format("YYYY-MM-DD") : null;
                    const companyData = {
                        company_name: profile?.name || profile?.name || user?.name,
                        company_email: profile?.email || user?.email,
                        frequency: 'monthly',
                        amount: packageData?.monthly_price,
                        trial_period: packageData?.trial_days,
                        is_trial: packageData.trial_days > 0 ? ("yes") : ("no"),
                        expired_date: expired_date,
                        status: 'running'
                    }

                    db.table = 'tbl_companies';
                    db.primary_key = 'company_id';
                    const companyResponse = await db.save(companyData);
                    if (companyResponse?.insertId) {
                        const companyHistoryData = {
                            company_id: companyResponse?.insertId,
                            package_id: defaultPackage,
                            package_name: packageData?.package_name,
                            ai_templates: packageData?.ai_templates,
                            ai_chat: packageData?.ai_chat,
                            words_per_month: packageData?.words_per_month,
                            images_per_month: packageData?.images_per_month,
                            ai_transcriptions: packageData?.ai_transcriptions,
                            text_to_speech: packageData?.text_to_speech,
                            speech_file_size: packageData?.speech_file_size,
                            frequency: 'monthly',
                            amount: packageData?.monthly_price,
                            i_have_read_agree: 'yes',
                            validity: expired_date,
                            active: 1,
                        }
                        db.table = 'tbl_companies_history';
                        db.primary_key = 'company_history_id';
                        const companyHistory = await db.save(companyHistoryData);

                        db.table = 'tbl_companies';
                        db.primary_key = 'company_id';
                        const updateConpany = await db.save({
                            company_history_id: companyHistory?.insertId,
                        }, companyResponse?.insertId);

                        const companyUser = {
                            company_id: companyResponse?.insertId,
                            username: profile?.email,
                            email: profile?.email,
                            password: '$2b$10$XI9kgGLjSM2Rq5bfWASvd.WsOtxgvxAYdSn9/w1XPcO/W5Q8KFDw6',
                            first_name: first_name,
                            last_name: last_name, // avatar: profile?.picture,
                            activated: 1,
                            is_verified: 1,
                            role_id: 2,
                            isAffiliate: 0,
                        }
                        db.table = 'tbl_users';
                        db.primary_key = 'user_id';
                        const userResponse = await db.save(companyUser);
                        return true;
                    }
                } else {
                    if (checkUser[0].role_id === 1) {
                        isSuperAdmin = true;
                    }

                }
                return true;
            }
            return true;
        }, async redirect({url, baseUrl}) {
            // is super admin redirect to saas/dashboard
            if (isSuperAdmin) {
                return baseUrl + '/saas/dashboard'
            } else {
                return baseUrl + '/admin/dashboard'
            }
        }, async jwt({token, user}) {
            let newToken = {}
            if (user) {
                return {...token, ...user}
            } else {
                // get user from db by token.email
                const db = new DB();
                const userData = await db.data('tbl_users', {email: token?.email});
                if (userData.length > 0) {
                    const userInfo = userData[0];
                    const user = {
                        user_id: userInfo.user_id,
                        username: userInfo.username,
                        email: userInfo.email,
                        role_id: userInfo.role_id,
                        company_id: userInfo.company_id,
                        activated: userInfo.activated,
                        is_verified: userInfo.is_verified,
                        first_name: userInfo.first_name,
                        last_name: userInfo.last_name,
                        full_name: userInfo.first_name + ' ' + userInfo.last_name,
                        avatar: userInfo.avatar,
                        isAffiliate: userInfo.isAffiliate,
                    }
                    return {
                        ...token, user: user,
                    }
                }
            }
            return {...token, ...newToken}
        }, async session({session, user, token}) {
            return token;
        },
    }
}

export default NextAuth(authOptions)