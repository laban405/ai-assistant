import {lazy, useContext, useState} from "react";
import {Button} from "reactstrap";
import {Context} from "../pages/_app";


const Overview = lazy(async () => {
    const {Overview} = await import("../components/Common/Overview");
    return {default: Overview};
});

const Discussions = lazy(async () => {
    const {Discussions} = await import("../components/Common/Discussions");
    return {default: Discussions};
});
const Comments = lazy(async () => {
    const {Comments} = await import("../components/Common/Comments");
    return {default: Comments};
});
const Activities = lazy(async () => {
    const {Activities} = await import("../components/Common/Activities");
    return {default: Activities};
});

const TicketsDetails = lazy(async () => {
    const {TicketsDetails} = await import(
        "../components/Common/TicketsDetails"
        );
    return {default: TicketsDetails};
});

const TasksDetails = lazy(async () => {
    const {TasksDetails} = await import("../components/Common/TasksDetails");
    return {default: TasksDetails};
});

const Files = lazy(async () => {
    const {Files} = await import("../components/Common/Files");
    return {default: Files};
});

const Payments = lazy(async () => {
    const {Payments} = await import("../components/Common/Payments");
    return {default: Payments};
});
const GeneralSettings = lazy(async () => {
    const {GeneralSettings} = await import(
        "../components/Settings/GeneralSettings"
        );
    return {default: GeneralSettings};
});
const CompanySettings = lazy(async () => {
    const {CompanySettings} = await import(
        "../components/Settings/CompanySettings"
        );
    return {default: CompanySettings};
});

const EmailSettings = lazy(async () => {
    const {EmailSettings} = await import("../components/Settings/Email");
    return {default: EmailSettings};
});

const PrefixSettings = lazy(async () => {
    const {Prefix} = await import("../components/Settings/Prefix");
    return {default: Prefix};
});

const showInfo = (t, data, errorMsg) => {
    const fields = {
        col: 2, render: () => {
            // data.desctioption show here in reactstrap well
            return (<>
                {errorMsg ? (<div className="alert alert-danger">{errorMsg}</div>) : null}
                <div className="card">
                    <p className="card-header bg-soft-secondary text-muted">
                        {data?.description ? data?.description : null}
                    </p>
                </div>
            </>);
        },
    };
    return fields;
};

const title = (t, title, regenerate, placeholder = "e_g__10_things_you_should_know_about", moreOption) => {
    const fields = {
        col: 2,
        label: title ? title : t("what_is_your_blog_title?"),
        name: "title",
        type: "text",
        placeholder: t(placeholder),
        required: true,
        initialValue: regenerate?.title,
        runOnChange: true,
    };
    if (moreOption) {
        fields.help = moreOptions(t);
    }
    return fields;
};

const name = (t, title, regenerate, placeholder = "e_g__10_things_you_should_know_about") => {
    const fields = {
        col: 2,
        label: title ? title : t("product_name"),
        name: "name",
        type: "text",
        placeholder: t(placeholder),
        required: true,
        initialValue: regenerate?.name,
        runOnChange: true,
    };
    return fields;
};

const moreOptions = (t, data, regenerate) => {
    return (<Button
        onClick={() => {
            // toggle change this button text to "Less"
            const btn = document.querySelector("#more");
            btn.innerText = btn.innerText === t("more_options") ? t("less_options") : t("more_options");

            // toggle change this button color to "danger"
            btn.classList.toggle("btn-info");
            btn.classList.toggle("btn-danger");
            // toogle hide/show this div with animation effect in reactstrap
            // toggle all d-none class from .common_field class with animation effect
            const commonFields = document.querySelectorAll(".common_field");
            commonFields.forEach((field) => {
                // field.classList.toggle("animate__animated");
                field.classList.toggle("d-none");
                // field.classList.toggle("animate__fadeIn");
            });
        }}
        id={"more"}
        className={"btn btn-primary btn-sm float-end mt-2 text-decoration-none"}
    >
        {t("more_options")}
    </Button>);
};

const keywords = (t, keywords, regenerate, moreOption, placeholder = "e_g_AI_machine_learning_business") => {
    const fields = {
        col: 2,
        label: keywords ? keywords : t("keywords"),
        name: "keyword",
        type: "text",
        placeholder: t(placeholder),
        initialValue: regenerate?.keywords,
        runOnChange: true,
    };
    if (moreOption) {
        fields.help = moreOptions(t);
    }
    return fields;
};
const description = (t, description, regenerate, moreOption = true, placeholder = "e_g_A_blog_about_utilizing_AI_to_improve_your_business") => {
    const fields = {
        col: 2,
        label: description ? description : t("what_is_the_blog_about?"),
        name: t("description"),
        type: "textarea",
        required: true,
        initialValue: regenerate?.description,
        placeholder: t(placeholder),
        runOnChange: true,
    };
    if (moreOption) {
        fields.helperText = moreOptions(t);
    }
    return fields;
};
const submitField = (t, data, regenerate) => {
    const submit = [{
        type: "hidden", name: "id", value: data?.template_id,
    }, {
        col: 2, type: "submit", label: regenerate ? t("regenerate") : t("generate"), submitText: t("generating"),
    },];
    return submit;
};

class Helper {
    static blogIntro = (t, data, regenerate, errorMsg) => {
        const fields = [{
            col: 2, render: () => {
                // data.desctioption show here in reactstrap well
                return (<div className="card">
                    {errorMsg ? (<div className="alert alert-danger">{errorMsg}</div>) : null}
                    <p className="card-header bg-soft-secondary text-muted">
                        {data?.description ? data?.description : null}
                    </p>
                </div>);
            },
        }, {
            col: 2,
            label: t("what_is_your_blog_title?"),
            name: "title",
            type: "text",
            placeholder: t("e_g__10_things_you_should_know_about"),
            required: true,
            initialValue: regenerate?.title,
            runOnChange: true,
        }, {
            col: 2,
            label: t("what_is_the_blog_about?"),
            name: t("description"),
            type: "textarea",
            required: true,
            runOnChange: true,
            initialValue: regenerate?.description,
            placeholder: t("e_g_A_blog_about_utilizing_AI_to_improve_your_business"),
            helperText: (<Button
                onClick={() => {
                    // toggle change this button text to "Less"
                    const btn = document.querySelector("#more");
                    btn.innerText = btn.innerText === t("more_options") ? t("less_options") : t("more_options");
                }}
            >
                {t("more_options")}
            </Button>),
        },];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // title,description,
    static blogDefault = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, null, regenerate), description(t, null, regenerate),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // description,
    static blogIdeas = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), description(t, null, regenerate),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,keywords
    static blogParagraph = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, null, regenerate), keywords(t, null, regenerate, true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,keywords
    static blogSection = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, null, regenerate), keywords(t, t("subheading"), regenerate, true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    static blogTalkingPoints = (t, data, regenerate, errorMsg) => {
        return this.blogSection(t, data, regenerate, errorMsg);
    };
    // title,description,keywords
    static blogPost = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, null, regenerate), description(t, null, regenerate, false), keywords(t, null, regenerate, true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    static blogTitle = (t, data, regenerate, errorMsg) => {
        return this.blogIdeas(t, data, regenerate, errorMsg);
    };
    // title,keywords,description
    static aboutUs = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("product"), regenerate, t("e_g_netflix_spotify_uber")), keywords(t, t("audience"), regenerate, false, t("e_g_Musicians_filmmakers_gamers")), description(t, t("the_description_of_the_product_or_service"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // call-to-action
    static callToAction = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // title,description
    static faqs = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("product"), regenerate, t("e_g_netflix_spotify_uber")), description(t, t("the_description_of_the_product_or_service"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // headline
    static headline = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // subheadline
    static subheadline = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // how-it-works
    static howItWorks = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // title,keywords,description
    static metaDescription = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("title"), regenerate, t("e_g_floaty_floral_blue_maxi_dress")), keywords(t, t("target_keyword"), regenerate, false, t("e_g_luxco_specializes_in_airy_wedding_ready_outfits_at_an_affordable_price")), description(t, t("description"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,description
    static metaKeywords = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("title"), regenerate, t("e_g_floaty_floral_blue_maxi_dress")), description(t, t(t("description")), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // testimonials
    static testimonials = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // pros-and-cons
    static prosAndCons = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // review
    static review = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // title,name,keywords,description
    static featureSection = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("title"), regenerate, t("best_traveling_tips_and_tricks")), name(t, t("product"), regenerate, t("e_g_netflix_spotify_uber")), keywords(t, t("audience"), regenerate, false, t("e_g_freelancers_designers")), description(t, t(t("description")), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,keywords,description
    static faqAnswers = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("product_name"), regenerate, t("best_traveling_tips_and_tricks")), keywords(t, t("question"), regenerate, false, t("e_g_netflix_spotify_uber")), description(t, t("description"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // seo-meta-tags-blog-post
    static seoMetaTagsBlogPost = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // seo-meta-tags-homepage
    static seoMetaTagsHomepage = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // name,title,keywords,description
    static seoMetaTagsProductPage = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), name(t, t("company_name"), regenerate, t("best_traveling_tips_and_tricks")), title(t, t("product_name"), regenerate), keywords(t, null, regenerate), description(t, t("product_service_description"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // advertisement
    static advertisement = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // mission-statement
    static missionStatement = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // name,title,description
    static newsletter = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), name(t, t("company_name"), regenerate, t("best_traveling_tips_and_tricks")), title(t, t("subject"), regenerate), description(t, t("descriptions"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // pain-agitate-solution
    static painAgitateSolution = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };

    // press-release
    static pressRelease = (t, data, regenerate, errorMsg) => {
        return this.newsletter(t, data, regenerate, errorMsg);
    };

    // keywords
    static startupIdeas = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), keywords(t, t("text_or_keywords_to_be_used"), regenerate, true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // press-release
    static pressRelease = (t, data, regenerate, errorMsg) => {
        return this.newsletter(t, data, regenerate, errorMsg);
    };


    // description,keywords
    static startupNames = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), description(t, t("description"), regenerate, false, t("web_and_mobile_software_development_agency")), keywords(t, null, regenerate, true, "Web, dev, neo"),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // value-proposition
    static valueProposition = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // title,description
    static visionStatement = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("company_name"), regenerate, t("best_traveling_tips_and_tricks")), description(t, t("descriptions"), regenerate, true, t("learn_how_to_program_through_our_easy_to_understand_course")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,description
    static productSheet = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("product_name"), regenerate, t("best_traveling_tips_and_tricks")), description(t, t("descriptions"), regenerate, true, t("learn_how_to_program_through_our_easy_to_understand_course")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // title,description
    static pushNotification = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("subject"), regenerate, t("best_traveling_tips_and_tricks")), description(t, t("descriptions"), regenerate, true, t("learn_how_to_program_through_our_easy_to_understand_course")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // google-ad-titles
    static googleAdTitles = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // /facebook-advertisement
    static facebookAdvertisement = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // name,title,description
    static jobDescription = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), name(t, t("company_name"), regenerate, t("company")), title(t, t("job_title"), regenerate, t("accountant_doctor_programmer")), description(t, t("job_description"), regenerate, true, t("write_a_job_description_that_will_attract_the_right_candidates")),];

        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // facebook-ads-headlines
    static facebookAdsHeadlines = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // google-ad-descriptions
    static googleAdDescriptions = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // linkedin-ad-headlines
    static linkedinAdHeadlines = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // /linkedin-ad-descriptions
    static linkedinAdDescriptions = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // /facebook-ad-pas
    static facebookAdPas = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // google-ads
    static googleAds = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };

    // content-rewrite
    static contentRewrite = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // content-summary
    static contentSummary = (t, data, regenerate, errorMsg) => {
        return this.faqs(t, data, regenerate, errorMsg);
    };
    // description
    static contentGrammar = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), description(t, t("description"), regenerate, true, t("the_content_to_be_corrected")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // article-outlines
    static articleOutlines = (t, data, regenerate, errorMsg) => {
        return this.blogDefault(t, data, regenerate, errorMsg);
    };
    // talking-points
    static talkingPoints = (t, data, regenerate, errorMsg) => {
        return this.blogDefault(t, data, regenerate, errorMsg);
    };
    static paragraphWriter = (t, data, regenerate, errorMsg) => {
        return this.startupNames(t, data, regenerate, errorMsg);
    };
    // content-rephrase
    static contentRephrase = (t, data, regenerate, errorMsg) => {
        return this.startupNames(t, data, regenerate, errorMsg);
    };
    // title,description
    static welcomeEmail = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("subject"), regenerate, t("welcome_to_our_company")), description(t, t("description"), regenerate, true, t("what_are_the_main_points_you_want_to_cover_in_your_welcome_email?")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // cold-email
    static coldEmail = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("your_company_product_name"), regenerate, t("e_g_apple_inc_nextAi")), description(t, t("scenario"), regenerate, false, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")), keywords(t, t("context_to_include_in_the_email"), regenerate, true, t("e_g_netflix_spotify_uber")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // name,description,keywords
    static followUpEmail = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), name(t, t("your_company_product_name"), regenerate, t("e_g_apple_inc_nextAi")), description(t, t("describe_your_product_or_company"), regenerate, false, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")), name(t, t("following_up_after"), regenerate, t("e_g_following_up_after")), keywords(t, t("audience"), regenerate, true, t("e_g_Musicians_filmmakers_gamers")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // email-content
    static emailContent = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // generate-email-subject
    static generateEmailSubject = (t, data, regenerate, errorMsg) => {
        return this.coldEmail(t, data, regenerate, errorMsg);
    };
    // cover-letter
    static coverLetter = (t, data, regenerate, errorMsg) => {
        return this.metaKeywords(t, data, regenerate, errorMsg);
    };
    // coupon-discount-email
    static couponDiscountEmail = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("product_name"), regenerate, t("name_of_the_product")), keywords(t, t("discounts"), regenerate, false, t("discount_offer")), description(t, t("describe_your_product_how_to_claim"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // testimonial-email
    static testimonialEmail = (t, data, regenerate, errorMsg) => {
        return this.productSheet(t, data, regenerate, errorMsg);
    };
    // event-promotion-email
    static eventPromotionEmail = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("topic"), regenerate, t("what_is_the_topic")), description(t, t("descriptions"), regenerate, true, t("event_details_date_time_location_etc")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // seasonal-holiday-email
    static seasonalHolidayEmail = (t, data, regenerate, errorMsg) => {
        return this.coldEmail(t, data, regenerate, errorMsg);
    };
    // build-anticipation-launch-new-product-email
    static buildAnticipationLaunchNewProductEmail = (t, data, regenerate, errorMsg) => {
        return this.aboutUs(t, data, regenerate, errorMsg);
    };
    // hashtags
    static hashtags = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };

    // social-post-caption
    static socialPostCaption = (t, data, regenerate, errorMsg) => {
        return this.visionStatement(t, data, regenerate, errorMsg);
    };
    // twitter-tweet
    static twitterTweet = (t, data, regenerate, errorMsg) => {
        return this.eventPromotionEmail(t, data, regenerate, errorMsg);
    };
    // twitter-thread
    static twitterThread = (t, data, regenerate, errorMsg) => {
        return this.eventPromotionEmail(t, data, regenerate, errorMsg);
    };
    // social-media-post-personal
    static socialMediaPostPersonal = (t, data, regenerate, errorMsg) => {
        return this.eventPromotionEmail(t, data, regenerate, errorMsg);
    };
    // social-media-post-business
    static socialMediaPostBusiness = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // instagram-captions
    static instagramCaptions = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // /instagram-hashtags
    static instagramHashtags = (t, data, regenerate, errorMsg) => {
        return this.hashtags(t, data, regenerate, errorMsg);
    };
    // youtube-titles
    static youtubeTitles = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // youtube-descriptions
    static youtubeDescriptions = (t, data, regenerate, errorMsg) => {
        return this.eventPromotionEmail(t, data, regenerate, errorMsg);
    };
    // youtube-outlines
    static youtubeOutlines = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // linkedin-posts
    static linkedinPosts = (t, data, regenerate, errorMsg) => {
        return this.eventPromotionEmail(t, data, regenerate, errorMsg);
    };
    // tiktok-video-scripts
    static tiktokVideoScripts = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // discount-or-special-promotion
    static discountOrSpecialPromotion = (t, data, regenerate, errorMsg) => {
        return this.couponDiscountEmail(t, data, regenerate, errorMsg);
    };
    // product-name
    static productName = (t, data, regenerate, errorMsg) => {
        return this.startupNames(t, data, regenerate, errorMsg);
    };
    // product-descriptions
    static productDescriptions = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // amazon-product-titles
    static amazonProductTitles = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // amazon-product-descriptions
    static amazonProductDescriptions = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // amazon-product-features
    static amazonProductFeatures = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // amazon-sponsored-brand-ads-headline
    static amazonSponsoredBrandAdsHeadline = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // video-description
    static videoDescription = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // video-script
    static videoScript = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // title
    static videoTags = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("title"), regenerate, t("5_steps_to_becoming_a_programmer"), true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // video-title
    static videoTitle = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // youtube-tags
    static youtubeTags = (t, data, regenerate, errorMsg) => {
        return this.videoTags(t, data, regenerate, errorMsg);
    };
    // youtube-channel-description
    static youtubeChannelDescription = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    //text-extender
    static textExtender = (t, data, regenerate, errorMsg) => {
        return this.startupNames(t, data, regenerate, errorMsg);
    };
    // content-shorten
    static contentShorten = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // quora-answers
    static quoraAnswers = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("question"), regenerate, t("asking_a_Question_for_Quora")), description(t, t("information"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // stories
    static stories = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), keywords(t, t("audience"), regenerate, t("write_a_stories_for_Audience")), description(t, t("description"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // bullet-point-answers
    static bulletPointAnswers = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // definition
    static definition = (t, data, regenerate, errorMsg) => {
        return this.startupIdeas(t, data, regenerate, errorMsg);
    };
    // answers
    static answers = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // questions
    static questions = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // passive-to-active-voice
    static passiveToActiveVoice = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // rewrite-with-keywords-pro
    static rewriteWithKeywordsPro = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), description(t, t("What_would_you_like_to_rewrite?"), regenerate, false, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")), keywords(t, null, regenerate, true),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // company-bios
    static companyBios = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("company_name"), regenerate, t("next_ai")), description(t, t("company_information"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };
    // company-mission
    static companyMission = (t, data, regenerate, errorMsg) => {
        return this.companyBios(t, data, regenerate, errorMsg);
    };
    // company-vision
    static companyVision = (t, data, regenerate, errorMsg) => {
        return this.companyBios(t, data, regenerate, errorMsg);
    };
    // tone-changer
    static toneChanger = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    //song-lyrics
    static songLyrics = (t, data, regenerate, errorMsg) => {
        const fields = [showInfo(t, data, errorMsg), title(t, t("topic"), regenerate, t("next_ai")), description(t, t("genre"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    };

    // translate
    static translate = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };

    // motivational-quote
    static motivationalQuote = (t, data, regenerate, errorMsg) => {
        return this.videoTags(t, data, regenerate, errorMsg);
    };
    // wedding-vows
    static weddingVows = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    //sales-landing-page
    static salesLandingPage = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };
    // rejection-letter
    static rejectionLetter = (t, data, regenerate, errorMsg) => {
        return this.metaDescription(t, data, regenerate, errorMsg);
    };
    // freestyle
    static freestyle = (t, data, regenerate, errorMsg) => {
        return this.contentGrammar(t, data, regenerate, errorMsg);
    };

    static DefaultForm(t, data, regenerate, errorMsg) {
        const fields = [showInfo(t, data, errorMsg), title(t, t("topic"), regenerate, t("next_ai")), description(t, t("prompt"), regenerate, true, t("explain_here_to_the_AI_what_your_product_or_service_is_about_rewrite_to_get_different_results")),];
        const common = Helper.CommonFields(t);
        return [...fields, ...common, ...submitField(t, data, regenerate)];
    }

    static AiCreativity(t, value) {
        // calulate the creativity value 0.0 - 1.0
        const aiCreativity = [{
            label: t("repetitive"), value: 0, color: "danger",
        }, {
            label: t("deterministic"), value: 0.2, color: "warning",
        }, {
            label: t("original"), value: 0.4, color: "success",
        }, {
            label: t("innovative"), value: 0.6, color: "primary",
        }, {
            label: t("creative"), value: 0.8, color: "secondary",
        }, {
            label: t("imaginative"), value: 1, color: "info",
        },];
        if (value) {
            return aiCreativity.find((item) => item.value === value);
        }

        return aiCreativity;
    }

    static AiTone(t, value) {
        const aiTone = [{
            label: t("friendly"), value: "friendly", color: "info",
        }, {
            label: t("luxury"), value: "luxury", color: "warning",
        }, {
            label: t("professional"), value: "professional", color: "success",
        }, {
            label: t("elegant"), value: "elegant", color: "primary",
        }, {
            label: t("modern"), value: "modern", color: "secondary",
        }, {
            label: t("Minimalist"), value: "minimalist", color: "danger",
        }, {
            label: t("traditional"), value: "traditional", color: "info",
        }, {
            label: t("funny"), value: "funny", color: "warning",
        }, {
            label: t("casual"), value: "casual", color: "success",
        }, {
            label: t("exciting"), value: "exciting", color: "primary",
        }, {
            label: t("innovative"), value: "innovative", color: "secondary",
        }, {
            label: t("Sophisticated"), value: "sophisticated", color: "danger",
        }, {
            label: t("creative"), value: "creative", color: "info",
        }, {
            label: t("energetic"), value: "energetic", color: "warning",
        },];
        if (value) {
            return aiTone.find((item) => item.value === value);
        }

        return aiTone;
    }

    static AiModel = (t, data) => {
        // list of ai model from openai api https://beta.openai.com/docs/api-reference/models
        //     return array(
        //         'text-ada-001' => __('Ada (Simple & Fastest)'),
        //         'text-babbage-001' => __('Babbage (Moderate)'),
        //         'text-curie-001' => __('Curie (Good)'),
        //         'text-davinci-003' => __('Davinci (Most Expensive & Powerful)'),
        //         'gpt-3.5-turbo' => __('ChatGPT 3.5'),
        //         'gpt-4' => __('ChatGPT 4 (Beta)'),
        // );
        const aiModel = [{
            label: t("davinci_GPT_3"), value: "code-davinci-002", color: "info",
        }, {
            label: t("davinci_GPT_3"), value: "text-davinci-003", color: "info",
        }, {
            label: t("cushman_GPT_3"), value: "text-cushman-003", color: "warning",
        }, {
            label: t("curie_GPT_3"), value: "text-curie-001", color: "success",
        }, {
            label: t("babbage_GPT_3"), value: "text-babbage-001", color: "primary",
        }, {
            label: t("ada_GPT_3"), value: "text-ada-001", color: "secondary",
        }, {
            label: t("ChatGPT_3_5_Turbo"), value: "gpt-3.5-turbo", color: "danger",
        }, {
            label: t("ChatGPT_3_5"), value: "gpt-3.5", color: "info",
        }, {
            label: t("GPT_4_8K"), value: "gpt-4", color: "warning",
        }, {
            label: t("GPT_4_32K"), value: "gpt-4-32k", color: "primary",
        },];

        return aiModel;
    };
    static aiTemplatesChatModel = (t, data) => {
        const aiModel = [{
            label: t("GPT_4_best_AI"), value: "gpt-4", color: "info",
        }, {
            label: t("turbo_GPT_3_5_incredible"), value: "gpt-3.5-turbo", color: "warning",
        }, {
            label: t("GPT_3_5_good_AI"), value: "gpt-3.5", color: "success",
        }, {
            label: t("davinci_text_davinci_003"), value: "text-davinci-003", color: "primary",
        }, {
            label: t("curie_Text_curie_001"), value: "text-curie-001", color: "secondary",
        }, {
            label: t("babbage_Text_babbage_001"), value: "text-babbage-001", color: "danger",
        }, {
            label: t("ada_Text_ada_001"), value: "text-ada-001", color: "info",
        },];
        return aiModel;
    };
    static aiChatModel = (t, data) => {
        const aiChatModel = [{
            label: t("GPT_4_best_AI"), value: "gpt-4", color: "info",
        }, {
            label: t("turbo_GPT_3_5_incredible"), value: "gpt-3.5-turbo", color: "warning",
        },];
        return aiChatModel;
    };
    static aiImageModel = (t, data) => {
        // DALL-E and stable-diffusion
        const aiImageModel = [{
            label: t("DALL_E"), value: "dall-e", color: "info",
        }, {
            label: t("stable_diffusion"), value: "stable-diffusion", color: "warning",
        },];
        return aiImageModel;
    };

    static CommonFields(t, value) {
        const {config} = useContext(Context);

        const commonFields = [{
            fieldClass: "common_field d-none", name: "language", label: t("language"), type: "select", getOptions: {
                url: "/api/admin/languages",
            }, value: config?.NEXT_PUBLIC_DEFAULT_LANGUAGE,
        }, {
            fieldClass: "common_field d-none",
            name: "tone",
            label: t("tone"),
            type: "select",
            options: Helper.AiTone(t),
            create: true,
            value: "friendly",
        }, {
            fieldClass: "common_field d-none",
            name: "creativity",
            label: t("creativity"),
            type: "select",
            options: Helper.AiCreativity(t),
            value: 0.4,
        }, {
            fieldClass: "common_field d-none", name: "max_result", label: t("max_result"), type: "number", value: 200,
        }, {
            fieldClass: "common_field d-none", name: "variations", label: t("variations"), type: "number", value: 1,
        },];
        return commonFields;
    }

    static ArtStyle(t, value) {
        const artStyle = [{
            label: t("digital_art"), value: "digital_art", color: "info",
        }, {
            label: t("3D_art"), value: "3d_art", color: "info",
        }, {
            label: t("photorealistic"), value: "photorealistic", color: "info",
        }, {
            label: t("low_poly"), value: "low_poly", color: "info",
        }, {
            label: t("pixel_art"), value: "pixel_art", color: "info",
        }, {
            label: t("unreal_engine_5"), value: "unreal_engine_5", color: "info",
        }, {
            label: t("houdini_3d"), value: "houdini_3d", color: "info",
        }, {
            label: t("glitch_art"), value: "glitch_art", color: "info",
        }, {
            label: t("pencil_drawing"), value: "pencil_drawing", color: "info",
        }, {
            label: t("pastel"), value: "pastel", color: "info",
        }, {
            label: t("cartoon"), value: "cartoon", color: "info",
        }, {
            label: t("minecraft"), value: "minecraft", color: "info",
        }, {
            label: t("sticker"), value: "sticker", color: "info",
        }, {
            label: t("realistic"), value: "realistic", color: "info",
        }, {
            label: t("isometric"), value: "isometric", color: "info",
        }, {
            label: t("cyberpunk"), value: "cyberpunk", color: "info",
        }, {
            label: t("line_art"), value: "line_art", color: "info",
        }, {
            label: t("ballpoint_pen_drawing"), value: "ballpoint_pen_drawing", color: "info",
        }, {
            label: t("watercolor"), value: "watercolor", color: "info",
        }, {
            label: t("origami"), value: "origami", color: "info",
        }, {
            label: t("retro"), value: "retro", color: "info",
        }, {
            label: t("renaissance"), value: "renaissance", color: "info",
        }, {
            label: t("abstract"), value: "abstract", color: "info",
        }, {
            label: t("oil_painting"), value: "oil_painting", color: "info",
        }, {
            label: t("sketch"), value: "sketch", color: "info",
        }, {
            label: t("mixed_media"), value: "mixed_media", color: "info",
        }, {
            label: t("impressionism"), value: "impressionism", color: "info",
        }, {
            label: t("cubism"), value: "cubism", color: "info",
        }, {
            label: t("pop_art"), value: "pop_art", color: "info",
        }, {
            label: t("minimalism"), value: "minimalism", color: "info",
        },];

        if (value) {
            return artStyle.find((item) => item.value === value);
        }
        return artStyle;
    }

    static ArtType = (t, value) => {
        const artType = [{
            label: t("midjourney_style"), value: "midjourney_style", color: "info",
        }, {
            label: t("canyon_galaxy"), value: "canyon_galaxy", color: "info",
        }, {
            label: t("abstract_art"), value: "abstract_art", color: "info",
        }, {
            label: t("outer_space"), value: "outer_space", color: "info",
        }, {
            label: t("modern_house"), value: "modern_house", color: "info",
        }, {
            label: t("anime"), value: "anime", color: "info",
        }, {
            label: t("low_poly"), value: "low_poly", color: "info",
        }, {
            label: t("professional_scenic_photographs"), value: "professional_scenic_photographs", color: "info",
        }, {
            label: t("surreal_micro_worlds"), value: "surreal_micro_worlds", color: "info",
        }, {
            label: t("floating_island"), value: "floating_island", color: "info",
        }, {
            label: t("stormy"), value: "stormy", color: "info",
        }, {
            label: t("hyper_realistic_anime"), value: "hyper_realistic_anime", color: "info",
        },];

        if (value) {
            return artType.find((item) => item.value === value);
        }
        return artType;
    };

    static LightingStyle = (t, value) => {
        const lightingStyle = [{
            label: t("warm"), value: "warm", color: "info",
        }, {
            label: t("cold"), value: "cold", color: "info",
        }, {
            label: t("golden_hour"), value: "golden_hour", color: "info",
        }, {
            label: t("blue_hour"), value: "blue_hour", color: "info",
        }, {
            label: t("sunset"), value: "sunset", color: "info",
        }, {
            label: t("Sunrise"), value: "sunrise", color: "info",
        }, {
            label: t("daylight"), value: "daylight", color: "info",
        }, {
            label: t("night"), value: "night", color: "info",
        }, {
            label: t("ambient"), value: "ambient", color: "info",
        }, {
            label: t("studio"), value: "studio", color: "info",
        }, {
            label: t("Natural"), value: "natural", color: "info",
        }, {
            label: t("flash"), value: "flash", color: "info",
        }, {
            label: t("Neon"), value: "neon", color: "info",
        }, {
            label: t("blacklight"), value: "blacklight", color: "info",
        }, {
            label: t("dramatic"), value: "dramatic", color: "info",
        }, {
            label: t("cinematic"), value: "cinematic", color: "info",
        }, {
            label: t("foggy"), value: "foggy", color: "info",
        }, {
            label: t("rainy"), value: "rainy", color: "info",
        }, {
            label: t("snowy"), value: "snowy", color: "info",
        }, {
            label: t("cloudy"), value: "cloudy", color: "info",
        },];
        if (value) {
            return lightingStyle.find((item) => item.value === value);
        }
        return lightingStyle;
    };
    static AiMode = (t, value) => {
        const aiMode = [{
            label: t("aggressive"), value: "aggressive", color: "info",
        }, {
            label: t("angry"), value: "angry", color: "info",
        }, {
            label: t("anxious"), value: "anxious", color: "info",
        }, {
            label: t("boring"), value: "boring", color: "info",
        }, {
            label: t("bright"), value: "bright", color: "info",
        }, {
            label: t("calm"), value: "calm", color: "info",
        }, {
            label: t("cheerful"), value: "cheerful", color: "info",
        }, {
            label: t("cold"), value: "cold", color: "info",
        }, {
            label: t("cute"), value: "cute", color: "info",
        }, {
            label: t("chilling"), value: "chilling", color: "info",
        }, {
            label: t("dark"), value: "dark", color: "info",
        }, {
            label: t("depressed"), value: "depressed", color: "info",
        }, {
            label: t("Dreamy"), value: "dreamy", color: "info",
        }, {
            label: t("eerie"), value: "eerie", color: "info",
        }, {
            label: t("elegant"), value: "elegant", color: "info",
        }, {
            label: t("energetic"), value: "energetic", color: "info",
        }, {
            label: t("excited"), value: "excited", color: "info",
        }, {
            label: t("fierce"), value: "fierce", color: "info",
        }, {
            label: t("flirty"), value: "flirty", color: "info",
        }, {
            label: t("funny"), value: "funny", color: "info",
        }, {
            label: t("gentle"), value: "gentle", color: "info",
        }, {
            label: t("gloomy"), value: "gloomy", color: "info",
        }, {
            label: t("happy"), value: "happy", color: "info",
        }, {
            label: t("hot"), value: "hot", color: "info",
        }, {
            label: t("colorful"), value: "colorful", color: "info",
        }, {
            label: t("intense"), value: "intense", color: "info",
        }, {
            label: t("neutral"), value: "neutral", color: "info",
        }, {
            label: t("peaceful"), value: "peaceful", color: "info",
        }, {
            label: t("playful"), value: "playful", color: "info",
        }, {
            label: t("powerful"), value: "powerful", color: "info",
        }, {
            label: t("romantic"), value: "romantic", color: "info",
        }, {
            label: t("sad"), value: "sad", color: "info",
        }, {
            label: t("scary"), value: "scary", color: "info",
        }, {
            label: t("soft"), value: "soft", color: "info",
        }, {
            label: t("somber"), value: "somber", color: "info",
        },];
        if (value) {
            return aiMode.find((item) => item.value === value);
        }
        return aiMode;
    };

    static AllowDecimal(t, value) {
        const decimal = [{
            label: t("not_started"), value: null, color: "secondary",
        }, {
            label: t("yes"), value: "yes", color: "info",
        }, {
            label: t("no"), value: "no", color: "warning",
        },];
        if (value) {
            return decimal.find((item) => item.value === value);
        }
        return decimal;
    }

    static months(t, value) {
        const months = [{
            label: t("january"), value: 1,
        }, {
            label: t("february"), value: 2,
        }, {
            label: t("march"), value: 3,
        }, {
            label: t("april"), value: 4,
        }, {
            label: t("may"), value: 5,
        }, {
            label: t("june"), value: 6,
        }, {
            label: t("july"), value: 7,
        }, {
            label: t("august"), value: 8,
        }, {
            label: t("september"), value: 9,
        }, {
            label: t("october"), value: 10,
        }, {
            label: t("november"), value: 11,
        }, {
            label: t("december"), value: 12,
        },];
        if (value) {
            return months.find((item) => item.value === value);
        }
    }

    static SettingsTabs(t, data) {
        const url = "/admin/settings/";
        const tabs = [{
            label: t("general"),
            value: "general",
            order: 1,
            url: url + "?type=general",
            icon: "ri-settings-3-line",
            children: <GeneralSettings/>,
        }, {
            label: t("company_settings"),
            value: "company",
            order: 2,
            url: url + "?type=company",
            icon: "ri-building-4-line",
            children: <CompanySettings/>,
        }, {
            label: t("leaves_settings"),
            value: "leaves",
            order: 3,
            url: url + "?type=leaves_settings",
            icon: "ri-leaf-line",
            children: <LeaveSettings/>,
        }, {
            label: t("email"),
            value: "email",
            order: 3,
            url: url + "?type=email",
            icon: "ri-mail-line",
            children: <EmailSettings/>,
        }, {
            label: t("prefix_settings"),
            value: "prefix_settings",
            order: 3,
            url: url + "?type=set_prefix",
            icon: "ri-mail-line",
            children: <PrefixSettings/>,
        }, {
            label: t("email_templates"),
            value: "email_templates",
            order: 14,
            url: url + "?type=email_templates",
            icon: "ri-mail-line",
        }, {
            label: t("payment_gateways"),
            value: "payment_gateways",
            order: 4,
            url: url + "?type=payment_gateways",
            icon: "ri-credit-card-line",
        }, {
            label: t("localization"),
            value: "localization",
            order: 5,
            url: url + "?type=localization",
            icon: "ri-earth-line",
        }, {
            label: t("custom_fields"),
            value: "custom_fields",
            order: 6,
            url: url + "?type=custom_fields",
            icon: "ri-file-list-3-line",
        }, {
            label: t("tax_rates"),
            value: "tax_rates",
            order: 15,
            url: url + "?type=tax_rates",
            icon: "ri-file-list-3-line",
        }, {
            label: t("currencies"),
            value: "currencies",
            order: 16,
            url: url + "?type=currencies",
            icon: "ri-file-list-3-line",
        }, {
            label: t("payment_methods"),
            value: "payment_methods",
            order: 17,
            url: url + "?type=payment_methods",
            icon: "ri-file-list-3-line",
        }, {
            label: t("payment_terms"),
            value: "payment_terms",
            order: 18,
            url: url + "?type=payment_terms",
            icon: "ri-file-list-3-line",
        }, {
            label: t("system_logs"),
            value: "system_logs",
            order: 13,
            url: url + "?type=system_logs",
            icon: "ri-file-list-3-line",
        },];
        // sort tabs by order
        tabs.sort((a, b) => (a.order > b.order ? 1 : -1));
        return tabs;
    }

    static Gender(t, value) {
        const gender = [{
            label: t("any"), value: "any",
        }, {
            label: t("male"), value: "male",
        }, {
            label: t("female"), value: "female",
        }, {
            label: t("other"), value: "Other",
        },];
        if (value) {
            return gender.find((item) => item.value === value);
        }
        return gender;
    }

    static Priority(t, value) {
        const priority = [{
            label: t("low"), value: "low", color: "secondary",
        }, {
            label: t("medium"), value: "medium", color: "info",
        }, {
            label: t("high"), value: "high", color: "warning",
        }, {
            label: t("urgent"), value: "urgent", color: "danger",
        },];
        if (value) {
            return priority.find((item) => item.value === value);
        }
        return priority;
    }

    static aws_language(t, value) {
        const language = [{
            label: t("Arabic"), value: "arb",
        }, {
            label: t("Arabic (Gulf)"), value: "ar-AE",
        }, {
            label: t("Catalan"), value: "ca-ES",
        }, {
            label: t("Chinese (Cantonese)"), value: "yue-CN",
        }, {
            label: t("Chinese (Mandarin)"), value: "cmn-CN",
        }, {
            label: t("Danish"), value: "da-DK",
        }, {
            label: t("Dutch (Belgian)"), value: "nl-BE",
        }, {
            label: t("Dutch"), value: "nl-NL",
        }, {
            label: t("English (Australian)"), value: "en-AU",
        }, {
            label: t("English (British)"), value: "en-GB",
        }, {
            label: t("English (Indian)"), value: "en-IN",
        }, {
            label: t("English (New Zealand)"), value: "en-NZ",
        }, {
            label: t("English (South African)"), value: "en-ZA",
        }, {
            label: t("English (US)"), value: "en-US",
        }, {
            label: t("English (Welsh)"), value: "en-GB-WLS",
        }, {
            label: t("Finnish"), value: "fi-FI",
        }, {
            label: t("French"), value: "fr-FR",
        }, {
            label: t("French (Canadian)"), value: "fr-CA",
        }, {
            label: t("Hindi"), value: "hi-IN",
        }, {
            label: t("German"), value: "de-DE",
        }, {
            label: t("German (Austrian)"), value: "de-AT",
        }, {
            label: t("Icelandic"), value: "is-IS",
        }, {
            label: t("Italian"), value: "it-IT",
        }, {
            label: t("Japanese"), value: "ja-JP",
        }, {
            label: t("Korean"), value: "ko-KR",
        }, {
            label: t("Norwegian"), value: "nb-NO",
        }, {
            label: t("Polish"), value: "pl-PL",
        }, {
            label: t("Portuguese (Brazilian)"), value: "pt-BR",
        }, {
            label: t("Portuguese (European)"), value: "pt-PT",
        }, {
            label: t("Romanian"), value: "ro-RO",
        }, {
            label: t("Russian"), value: "ru-RU",
        }, {
            label: t("Spanish (European)"), value: "es-ES",
        }, {
            label: t("Spanish (Mexican)"), value: "es-MX",
        }, {
            label: t("Spanish (US)"), value: "es-US",
        }, {
            label: t("Swedish"), value: "sv-SE",
        }, {
            label: t("Turkish"), value: "tr-TR",
        }, {
            label: t("Welsh"), value: "cy-GB",
        }];

        if (value) {
            return language.find((item) => item.value === value);
        }
        return language;
    }

    static aws_voice(t, language, value) {
        // get voices by language code
        // https://docs.aws.amazon.com/polly/latest/dg/voicelist.html

        let voices = [];
        if (language === "arb") {
            voices = [{
                label: t("Zeina (Female)"), value: "Zeina",
            }];
        } else if (language === "ar-AE") {
            voices = [{
                label: t("Hala (Female)"), value: "Hala",
            }];
        } else if (language === "ca-ES") {
            voices = [{
                label: t("Arlet (Female)"), value: 'Arlet'
            }]
        } else if (language === "yue-CN") {
            voices = [{
                label: t('Hiujin (Female)'), value: 'Hiujin'
            }]
        } else if (language === "cmn-CN") {
            voices = [{
                label: t('Zhiyu (Female)'), value: 'Zhiyu'
            }]
        } else if (language === "da-DK") {
            voices = [{label: t('Naja (Female)'), value: 'Naja'}, {
                label: t('Mads (Male)'), value: 'Mads'
            }, {label: t('Sofie (Female)'), value: 'Sofie'},]
        } else if (language === "nl-BE") {
            voices = [{label: t('Lisa (Female)'), value: 'Lisa'}]
        } else if (language === "nl-NL") {
            voices = [{label: t('Laura (Female)'), value: 'Laura'}, {
                label: t('Lotte (Female)'), value: 'Lotte'
            }, {label: t('Ruben (Male)'), value: 'Ruben'},]
        } else if (language === "en-AU") {
            voices = [{label: t('Nicole (Female)'), value: 'Nicole'}, {
                label: t('Olivia (Female)'), value: 'Olivia'
            }, {label: t('Russell (Male)'), value: 'Russell'},]
        } else if (language === "en-GB") {
            voices = [{label: t('Amy (Female)'), value: 'Amy'}, {
                label: t('Emma (Female)'), value: 'Emma'
            }, {label: t('Brian (Male)'), value: 'Brian'}, {label: t('Arthur (Male)'), value: 'Arthur'},]
        } else if (language === "en-IN") {
            voices = [{label: t('Aditi (Female)'), value: 'Aditi'}, {
                label: t('Raveena (Female)'), value: 'Raveena'
            }, {label: t('Kajal (Female)'), value: 'Kajal'},]
        } else if (language === "en-US") {
            voices = [{label: t('Ivy (Female)'), value: 'Ivy'}, {
                label: t('Joanna (Female)'), value: 'Joanna'
            }, {label: t('Kendra (Female)'), value: 'Kendra'}, {
                label: t('Kimberly (Female)'), value: 'Kimberly'
            }, {label: t('Salli (Female)'), value: 'Salli'}, {
                label: t('Ruth (Female)'), value: 'Ruth'
            }, {label: t('Joey (Male)'), value: 'Joey'}, {
                label: t('Justin (Male)'), value: 'Justin'
            }, {label: t('Kevin (Male)'), value: 'Kevin'}, {
                label: t('Matthew (Male)'), value: 'Matthew'
            }, {label: t('Stephen (Male)'), value: 'Stephen'}, {label: t('Brian (Male)'), value: 'Brian'},]
        } else if (language === "fr-CA") {
            voices = [{label: t('Chantal (Female)'), value: 'Chantal'}, {
                label: t('Gabrielle (Female)'), value: 'Gabrielle'
            }, {label: t('Liam (Male)'), value: 'Liam'},]
        } else if (language === "fr-FR") {
            voices = [{label: t('Céline (Female)'), value: 'Céline'}, {
                label: t('Léa (Female)'), value: 'Léa'
            }, {label: t('Mathieu (Male)'), value: 'Mathieu'}, {label: t('Rémi (Male)'), value: 'Rémi'},]
        } else if (language === "de-DE") {
            voices = [{label: t('Marlene (Female)'), value: 'Marlene'}, {
                label: t('Vicki (Female)'), value: 'Vicki'
            }, {label: t('Hans (Male)'), value: 'Hans'}, {label: t('Daniel (Male)'), value: 'Daniel'},]
        } else if (language === "hi-IN") {
            voices = [{label: t('Aditi (Female)'), value: 'Aditi'}, {label: t('Kajal (Female)'), value: 'Kajal'},]
        } else if (language === "is-IS") {
            voices = [{label: t('Dóra (Female)'), value: 'Dóra'}, {label: t('Karl (Female)'), value: 'Karl'},]
        } else if (language === "it-IT") {
            voices = [{label: t('Carla (Female)'), value: 'Carla'}, {
                label: t('Bianca (Female)'), value: 'Bianca'
            }, {label: t('Giorgio (Male)'), value: 'Giorgio'}, {label: t('Adriano (Male)'), value: 'Adriano'},]
        } else if (language === "ja-JP") {
            voices = [{label: t('Mizuki (Female)'), value: 'Mizuki'}, {
                label: t('Kazuha (Female)'), value: 'Kazuha'
            }, {label: t('Tomoko (Female)'), value: 'Tomoko'}, {label: t('Takumi (Male)'), value: 'Takumi'},]
        } else if (language === "ko-KR") {
            voices = [{label: t('Seoyeon (Female)'), value: 'Seoyeon'}]
        } else if (language === "nb-NO") {
            voices = [{label: t('Liv (Female)'), value: 'Liv'}, {label: t('Ida (Female)'), value: 'Ida'}]
        } else if (language === "pl-PL") {
            voices = [{label: t('Ewa (Female)'), value: 'Ewa'}, {
                label: t('Maja (Female)'), value: 'Maja'
            }, {label: t('Ola (Female)'), value: 'Ola'}, {label: t('Jacek (Male)'), value: 'Jacek'}, {
                label: t('Jan (Male)'), value: 'Jan'
            }]
        } else if (language === "pt-BR") {
            voices = [{label: t('Camila (Female)'), value: 'Camila'}, {
                label: t('Vitória (Female)'), value: 'Vitória'
            }, {label: t('Ricardo (Male)'), value: 'Ricardo'}, {
                label: t('Thiago (Male)'), value: 'Thiago'
            }]
        } else if (language === "pt-PT") {
            voices = [{}]
        } else if (language === "ro-RO") {
            voices = [{}]
        } else if (language === "ru-RU") {
            voices = [{}]
        } else if (language === "sk-SK") {
            voices = [{}]
        } else if (language === "sv-SE") {
            voices = [{}]
        } else if (language === "tr-TR") {
            voices = [{}]
        } else if (language === "zh-CN") {
            voices = [{}]
        } else if (language === "zh-HK") {
            voices = [{}]
        } else if (language === "zh-TW") {
            voices = [{}]
        } else {
            voices = [{}] // default
        }
        if (value) {
            return voices.find(v => v.value === value)?.label
        }
        return voices

    }

    static TasksTabs(t, data, link = "/admin") {
        const where = {
            module: "tasks", module_id: data?.task_id,
        };
        const url = link + "/tasks/details/" + data?.task_id;
        const Tabs = [{
            label: t("details"),
            value: "tasks",
            order: 1,
            url: url + "?type=tasks",
            icon: "ri-file-list-3-line",
            children: <TasksDetails data={data} link={link}/>,
        }, {
            label: t("files"),
            value: "files",
            order: 3,
            url: url + "?type=files",
            icon: "ri-file-list-3-line",
            children: <Files moduleWhere={{...where, type: "file"}} link={link}/>,
        }, {
            label: t("comments"),
            value: "comments",
            order: 5,
            url: url + "?type=comments",
            icon: "ri-chat-1-line",
            children: (<Comments data={data} moduleWhere={{...where, type: "comment"}} link={link}/>),
        }];
        // sort tabs by order
        Tabs.sort((a, b) => (a.order > b.order ? 1 : -1));
        return Tabs;
    }

    static TaskStatus(t, value) {
        const status = [{
            label: t("not_started"), value: "not_started", color: "secondary",
        }, {
            label: t("In Progress"), value: "in_progress", color: "info",
        }, {
            label: t("testing"), value: "testing", color: "warning",
        }, {
            label: t("waiting_for_someone"), value: "waiting_for_someone", color: "danger",
        }, {
            label: t("Completed"), value: "completed", color: "success",
        },];
        if (value) {
            return status.find((item) => item.value === value);
        }
        return status;
    }

    static VoiceId(t, value) {
        const status = [{
            label: t("Zeina"), value: "Zeina",
        }, {
            label: t("Joanna"), value: "Joanna",
        }, {
            label: t("Hiujin"), value: "Hiujin",
        },];
        if (value) {
            return status.find((item) => item.value === value);
        }
        return status;
    }

    static RelatedTo(t, value) {
        const related_to = [{
            label: t("projects"), value: "projects",
        }, {
            label: t("leads"), value: "leads",
        }, {
            label: t("customers"), value: "customers",
        }, {
            label: t("opportunities"), value: "opportunities",
        }, {
            label: t("tasks"), value: "tasks",
        }, {
            label: t("tickets"), value: "tickets",
        }, {
            label: t("expenses"), value: "expenses",
        }, {
            label: t("Invoices"), value: "invoices",
        }, {
            label: t("estimates"), value: "estimates",
        }, {
            label: t("proposals"), value: "proposals",
        }, {
            label: t("credit_notes"), value: "creditNotes",
        },];
        if (value) {
            return related_to.find((item) => item.value === value);
        }
        return related_to;
    }

    static RepeatEvery(t, value) {
        const repeat_every = [{
            label: t("none"), value: "",
        }, {
            label: t("week"), value: "1_week",
        }, {
            label: t("2_weeks"), value: "2_week",
        }, {
            label: t("1_month"), value: "1_month",
        }, {
            label: t("2_months"), value: "2_month",
        }, {
            label: t("3_months"), value: "3_month",
        }, {
            label: t("6_months"), value: "6_month",
        }, {
            label: t("year"), value: "1_year",
        }, {
            label: t("custom"), value: "custom",
        },];
        if (value) {
            return repeat_every.find((item) => item.value === value);
        }
        return repeat_every;
    }

    static TicketsStatus(t, value) {
        const status = [{
            label: t("answered"), value: "answered", color: "info",
        }, {
            label: t("closed"), value: "closed", color: "warning",
        }, {
            label: t("open"), value: "open", color: "danger",
        }, {
            label: t("in_progress"), value: "in_progress", color: "success",
        },];
        if (value) {
            return status.find((item) => item.value === value);
        }
        return status;
    }

    static slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-") // Replace spaces with -
            .replace(/[^\w\-]+/g, "") // Remove all non-word chars
            .replace(/\-\-+/g, "-") // Replace multiple - with single -
            .replace(/^-+/, "") // Trim - from start of text
            .replace(/-+$/, ""); // Trim - from end of text
    }

    static removeHtmlTags(str) {
        if (str === null || str === "") {
            return false;
        }
        str = str.toString();
        // remove html tags and space chars
        return str.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "");
    }


    static TicketsTabs(t, data, link = "/saas") {
        const url = link + "/tickets/details/" + data?.tickets_id + "/";
        const where = {module: "tickets", module_id: data?.tickets_id};

        const tabs = [{
            label: t("details"),
            value: "tickets",
            order: 1,
            url: url + "?type=tickets",
            icon: "ri-file-list-3-line",
            children: <TicketsDetails data={data} link={link}/>,
        }, {
            label: t("files"),
            value: "files",
            order: 4,
            url: url + "?type=files",
            icon: "ri-file-list-3-line",
            children: <Files moduleWhere={{...where, type: "file"}} link={link}/>,
        }, {
            label: t("comments"),
            value: "comments",
            order: 5,
            url: url + "?type=comments",
            icon: "ri-chat-1-line",
            children: (<Comments data={data} moduleWhere={{...where, type: "comment"}} link={link}/>),
        },];
        // sort tabs by order
        tabs.sort((a, b) => (a.order > b.order ? 1 : -1));
        return tabs;
    }


    static stripHtml(html) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    static getErrorByStatusCode(response, data) {
        const statusCode = response.toString().split("code ")[1];
        let error = statusCode;
        if (statusCode === "499") {
            const mailBody = `Hello. I tried to upgrade to the latest version but for some reason the upgrade failed. Please remove the key from the upgrade log so i can try again. My installation URL is: ${data?.url}. Regards.`;
            const mailSubject = `Purchase code Removal Request - [${data?.purchase_code}]`;
            error = `The Purchase code already used to download upgrade files. Performing multiple auto updates to the latest version with one/regular version purchase code is not allowed. If you have multiple installations you must buy another license.<br /><br /> If you have staging/testing installation and auto upgrade is performed there, <b>you should perform manually upgrade</b> in your production area<br /><br /> <h4 className="bold">Upgrade failed?</h4> The error can be shown also if the update failed for some reason, but because the purchase code is already used to download the files, you won’t be able to re-download the files again.<br /><br />Click <a href="mailto:uniquecoder007@gmail.com?subject='${mailSubject}'&body='${mailBody}'"><b>here</b></a> to send an mail and get your purchase code removed from the upgrade log.`;
        } else if (statusCode === "498") {
            error = "Your username or purchase code is Invalid.Please enter the valid information.";
        } else if (statusCode === "497") {
            error = "Your Download Item ID and the software ID does not match.Please download it from your . <a href='https://help.market.envato.com/hc/en-us/articles/202501014-How-To-Download-Your-Items'> download </a> drop-down menu";
        } else if (statusCode === "496") {
            error = "Your Purchase code is Empty.";
        } else if (statusCode === "495") {
            error = "Your envato username does not match the buyer username";
        } else if (statusCode === "494") {
            error = "Your purchase item already takes refund. please remove your file or purchase again.";
        } else if (statusCode === "493") {
            error = "The Purchase code already used in another Install.<strong>this software url and instalation url is not same.</strong> Performing multiple install to the latest version with one/regular version purchase code is not allowed. If you have multiple installations you must buy another license.<br /><br /> If you have staging/testing installation and auto Install is performed there, <b>you should perform manually Install</b> in your production area<br /><br /> ";
        }
        return error;
    }

    static paymentMethods() {
        const {config} = useContext(Context)
        const allMethods = [{
            name: "paypal", client_id: {
                name: "NEXT_PUBLIC_PAYPAL_CLIENT_ID", value: config?.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
            }, client_secret: {
                name: "NEXT_PUBLIC_PAYPAL_SECRET_KEY", value: config?.NEXT_PUBLIC_PAYPAL_SECRET_KEY,
            }, status: {
                name: "NEXT_PUBLIC_PAYPAL_STATUS", value: config?.NEXT_PUBLIC_PAYPAL_STATUS,
            },
        }, {
            name: "stripe", client_id: {
                name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", value: config?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            }, client_secret: {
                name: "NEXT_PUBLIC_STRIPE_SECRET_KEY", value: config?.NEXT_PUBLIC_STRIPE_SECRET_KEY,
            }, status: {
                name: "NEXT_PUBLIC_STRIPE_STATUS", value: config?.NEXT_PUBLIC_STRIPE_STATUS,
            },
        }, {
            name: "rozorpay", client_id: {
                name: "NEXT_PUBLIC_ROZORPAY_PUBLISHABLE_KEY", value: config?.NEXT_PUBLIC_ROZORPAY_PUBLISHABLE_KEY,
            }, client_secret: {
                name: "NEXT_PUBLIC_ROZORPAY_SECRET_KEY", value: config?.NEXT_PUBLIC_ROZORPAY_SECRET_KEY,
            }, status: {
                name: "NEXT_PUBLIC_ROZORPAY_STATUS", value: config?.NEXT_PUBLIC_ROZORPAY_STATUS,
            },
        }, {
            name: "bankTransfer", client_id: {
                name: "NEXT_PUBLIC_BANK_TRANSFER_PUBLISHABLE_KEY",
                value: config?.NEXT_PUBLIC_BANK_TRANSFER_PUBLISHABLE_KEY,
            }, client_secret: {
                name: "NEXT_PUBLIC__BANK_TRANSFER_SECRET_KEY", value: config?.NEXT_PUBLIC__BANK_TRANSFER_SECRET_KEY,
            }, status: {
                name: "NEXT_PUBLIC_BANK_TRANSFER_STATUS", value: config?.NEXT_PUBLIC_BANK_TRANSFER_STATUS,
            },
        },];
        return allMethods;
    }
}

export default Helper;
