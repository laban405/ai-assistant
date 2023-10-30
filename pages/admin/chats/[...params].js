import React, {useContext, useEffect, useRef, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {
    Button, Col, Dropdown, DropdownMenu, DropdownToggle, Input, Row, UncontrolledTooltip,
} from "reactstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import {
    API, DisplayDateTime, GetRows, Info
} from "../../../components/config";

import Link from "next/link";
import SimpleBar from "simplebar-react";
import {useRouter} from "next/router";
import {ThreeDotSpinner} from "../../../components/Loading";
import Image from "next/image";
import {MyModal, notify} from "../../../components/Fb";
import ChatTemplate from "../templates/chats";
import {Context} from "../../_app";

const api = new API();

export default function Chats() {
    const {config, session} = useContext(Context);
    const {t} = useTranslation();
    const [search, setSearch] = useState("");
    const [editTitle, setEditTitle] = useState("");

    const [chatbotId, setChatbotId] = useState(1);
    const [conversationId, setConversationId] = useState();
    const [isOpen, setIsOpen] = useState(false);
    const [botSearch, setBotSearch] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [messageLoading, setMessageLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [toggleModal, setToggleModal] = useState(false);
    const [enableVoice, setEnableVoice] = useState(true);
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [wordCost, setWordCost] = useState(false);
    const company_id = session?.user?.company_id

    const ref = useRef();
    const toggleSearch = () => setIsOpen(!isOpen);

    const {
        data: allChatbot, isLoading: botLoading, refetch: botRefetch,
    } = GetRows("/api/admin/chatbots", {
        where: {
            company_id: 0,
        }, search_value: botSearch, // limit: 5,
    }, {}, 'AllChatbots');

    // get packageCapacity
    const router = useRouter();
    const {params} = router.query || {};
    useEffect(() => {
        if (params?.length > 0) {
            setChatbotId(params[0]);
        }
    }, [params]);

    useEffect(() => {
        // set height of textarea
        const textarea = document.querySelector(".chat-textarea");
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }, [messageText]);

    const {
        data: chatbotInfo, isLoading: botInfoLoading, refetch: botInfoRefetch,
    } = Info("/api/admin/chatbots", chatbotId);

    const {
        data: allConversation, isLoading, refetch,
    } = GetRows("/api/admin/conversations", {
        search_value: search, where: {
            "cnvrsn.chatbot_id": chatbotId, "cnvrsn.company_id": company_id,
        },
    }, {}, `AllConversation${chatbotId}`);
    const {
        data: allMessages, isLoading: mLoading, refetch: mRefetch,
    } = GetRows("/api/admin/chats", {
        where: {
            "cnvrsn.chatbot_id": chatbotId, "chts.conversation_id": conversationId, "cnvrsn.company_id": company_id,
        },
    }, {}, `AllMessages${conversationId}`);

    useEffect(() => {
        if (allConversation?.length > 0) {
            setConversationId(allConversation[0]?.conversation_id);
        }
    }, [allConversation]);

    useEffect(() => {
        ref.current.getScrollElement().scrollTop = ref.current.getScrollElement().scrollHeight;
    }, [isLoading, mLoading, messageLoading, conversationId]);

    useEffect(() => {
        let recognition;
        if ("webkitSpeechRecognition" in window) {
            recognition = new webkitSpeechRecognition();
        } else if ("SpeechRecognition" in window) {
            recognition = new SpeechRecognition();
        } else {
            setEnableVoice(false);
            console.log("Speech recognition not supported");
        }

        if (recognition) {
            // const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            recognition.onresult = (event) => {
                let interimTranscript = "";
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                setMessageText(finalTranscript);

                // setTranscript(finalTranscript);
            };
            setRecognition(recognition);
        }
    }, []);

    const handleStart = () => {
        if (recognition) {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleStop = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    const exportChats = () => {
        // export chat to .txt file
        const chat = allMessages;
        let text = "";
        chat?.map((item) => {
            text += `${DisplayDateTime(item?.date, null, config)} ${item?.fullname} : ${item?.prompt_message}\n`;
            text += `${DisplayDateTime(item?.date, null, config)}  ${item?.name} : ${item?.content}\n`;
        });
        const element = document.createElement("a");
        const file = new Blob([text], {type: "text/plain"});
        element.href = URL.createObjectURL(file);
        element.download = `conversation with ${chat[0]?.name}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };
    const deleteChat = async (id) => {
        await api
            .delete(`/api/admin/chats/`, {
                conversation_id: id,
            })
            .then(async (data) => {
                await api.delete(`/api/admin/conversations/`, id);
                await refetch();
            });
    };
    const formatAIMessage = (ai_message) => {
        if (ai_message?.indexOf("<pre><code>") === -1) {
            ai_message = ai_message?.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // Extract code blocks enclosed in triple backticks (```)
            const codeBlocks = ai_message?.match(/```([\s\S]+?)```/g);
            // Replace each code block with a <pre><code> block and add a copy button
            if (codeBlocks) {
                codeBlocks.forEach((block) => {
                    const code = block.replace(/```/g, "");
                    const newBlock = `<pre><code>${code}</code></pre>`;
                    ai_message = ai_message?.replace(block, newBlock);
                });
            }
        }
        // Replace line breaks with <br>
        ai_message = ai_message?.replace(/\n/g, "<br>");
        // Replace tabs with 4 spaces
        ai_message = ai_message?.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        // Replace spaces at start of string with &nbsp;
        ai_message = ai_message?.replace(/^ /g, "&nbsp;");
        // Replace multiple spaces with &nbsp;
        ai_message = ai_message?.replace(/ {2,}/g, "&nbsp;&nbsp;");
        // Replace each space at end of string with &nbsp;
        ai_message = ai_message?.replace(/ $/g, "&nbsp;");
        return ai_message;
    };

    const message = (<div
        className="alert alert-warning alert-dismissible px-4 fade show wordCost"
        id="copyClipBoard"
        role="alert"
    >
        Word Cost | {wordCost}
    </div>);

    const sendMessage = async () => {
        if (messageText !== "") {
            setMessageLoading(messageText);
            setMessageText("");
            const input = {
                message: messageText, botId: chatbotId, type: "chat", conversationId: conversationId,
            };
            const response = await api.post("/api/admin/generate", input);
            if (response.result) {
                setMessageLoading(false);
                // scroll to bottom of chat list on new message
                await refetch();
                await mRefetch();
                setShouldRefetch(true);
                setWordCost(response.result.words);
                setTimeout(() => {
                    setWordCost(false);
                }, 5000);
            } else if (response.error) {
                setMessageLoading(false);
                setErrorMsg(response.error.message);
            }
        }
    };

    return (<React.Fragment>
        <div className="page-content">
            <div className="container-fluid">
                <BreadCrumb
                    title={t("chats")}
                    pageTitle={t("chats")}
                    type="words_per_month"
                    shouldRefetch={shouldRefetch}
                    setShouldRefetch={setShouldRefetch}
                />
                <div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
                    <div className="chat-leftsidebar">
                        <div className="px-4 pt-4 mb-4">
                            <div className="d-flex align-items-start">
                                <div className="flex-grow-1 mb-4">
                                    <h5>{t("chats")}</h5>
                                </div>

                                <div className="flex-shrink-0">
                                    <UncontrolledTooltip
                                        placement="top"
                                        target={`new_convension`}
                                    >
                                        {t("New Conversation")}
                                    </UncontrolledTooltip>
                                    <Button
                                        color="success"
                                        onClick={async () => {
                                            setConversationId(null);
                                        }}
                                        id={`new_convension`}
                                        className="btn btn-soft-success btn-sm"
                                    >
                                        <i className="ri-add-line align-bottom"></i>
                                    </Button>
                                </div>
                            </div>
                            <div className="search-box">
                                <input
                                    type="text"
                                    className="form-control bg-light border-light"
                                    placeholder="Search here..."
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <i className="ri-search-2-line search-icon"></i>
                            </div>
                        </div>
                        <div className="chat-message-list">
                            <ul
                                className="list-unstyled chat-list chat-user-list"
                                id="userList"
                            >
                                {isLoading ? (<>
                                    <li
                                        className="skeleton"
                                        style={{
                                            width: "100%", height: "2rem", marginBottom: "0.5rem",
                                        }}
                                    ></li>
                                    <li
                                        className="skeleton"
                                        style={{
                                            width: "100%", height: "2rem", marginBottom: "0.5rem, marginTop: 0.5rem",
                                        }}
                                    ></li>
                                </>) : (allConversation?.length > 0 && allConversation.map((chat) => (<li
                                    key={`chat_${chat.conversation_id}`}
                                    className={conversationId === chat.conversation_id ? "active" : ""}
                                >
                                    <Link
                                        className="px-2 pe-0 "
                                        href="#"
                                        onClick={() => {
                                            setConversationId(chat.conversation_id);
                                        }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-between"
                                            onClick={() => {
                                                setConversationId(chat.conversation_id);
                                            }}
                                        >
                                            <div
                                                className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                <div className="avatar-xxs">
                                                    <div
                                                        className={"avatar-title bg-light  rounded-circle text-body "}
                                                    >
                                                        <i className=" ri-sticky-note-line"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="d-flex flex-grow-1 align-items-center text-truncate">
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <h5 className="mb-0 fs-14">
                                                        {editTitle.conversation_id === chat.conversation_id ? (<Input
                                                            type="text"
                                                            className="form-control"
                                                            value={editTitle.editTitle}
                                                            onChange={(e) => setEditTitle({
                                                                ...editTitle, editTitle: e.target.value,
                                                            })}
                                                        />) : (chat.title)}
                                                    </h5>
                                                    <p className="text-truncate mb-0 fs-13">
                                                        {chat.last_message}
                                                    </p>
                                                </div>
                                                <div className="d-flex flex-row">
                                                    {editTitle.conversation_id === chat.conversation_id ? (<>
                                                        <div className="flex-shrink-0">
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target={`save${chat.conversation_id}`}
                                                            >
                                                                {t("save")}
                                                            </UncontrolledTooltip>
                                                            <Button
                                                                color=""
                                                                id={`save${chat.conversation_id}`}
                                                                className="btn btn-soft-success btn-sm "
                                                                onClick={async () => {
                                                                    setEditTitle("");
                                                                    const input = {
                                                                        title: editTitle.editTitle,
                                                                    };
                                                                    await api.create("/api/admin/conversations", input, chat.conversation_id);
                                                                    await refetch();
                                                                }}
                                                            >
                                                                <i className="ri-save-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target={`cancel${chat.conversation_id}`}
                                                            >
                                                                {t("cancel")}
                                                            </UncontrolledTooltip>
                                                            <Button
                                                                color=""
                                                                id={`cancel${chat.conversation_id}`}
                                                                className="btn btn-soft-danger btn-sm "
                                                                onClick={() => setEditTitle("")}
                                                            >
                                                                <i className="ri-close-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                    </>) : ("")}
                                                    {!editTitle && conversationId === chat.conversation_id && (<>
                                                        <div className="flex-shrink-0">
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target={`edit${chat.conversation_id}`}
                                                            >
                                                                {t("edit")}
                                                            </UncontrolledTooltip>
                                                            <Button
                                                                color=""
                                                                id={`edit${chat.conversation_id}`}
                                                                className="btn btn-soft-success btn-sm "
                                                                onClick={() => setEditTitle({
                                                                    editTitle: chat.title,
                                                                    conversation_id: chat.conversation_id,
                                                                })}
                                                            >
                                                                <i className="ri-edit-2-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target={`delete${chat.conversation_id}`}
                                                            >
                                                                {t("delete")}
                                                            </UncontrolledTooltip>
                                                            <Button
                                                                color=""
                                                                onClick={async () => {
                                                                    await deleteChat(chat.conversation_id);
                                                                }}
                                                                id={`delete${chat.conversation_id}`}
                                                                className="btn btn-soft-success btn-sm"
                                                            >
                                                                <i className="ri-delete-bin-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                    </>)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>)))}
                            </ul>
                        </div>
                    </div>

                    <div className="user-chat w-100 overflow-hidden">
                        <div className="chat-content d-lg-flex">
                            <div className="w-100 overflow-hidden position-relative">
                                {wordCost && message}
                                <div className="position-relative">
                                    <div className="p-3 user-chat-topbar">
                                        <Row className="align-items-center">
                                            <Col sm={5} xs={7}>
                                                <div className="d-flex align-items-center">
                                                    <div className="flex-shrink-0 d-block d-lg-none me-3">
                                                        <Link
                                                            href="saas/chats#"
                                                            className="user-chat-remove fs-18 p-1"
                                                        >
                                                            <i className="ri-arrow-left-s-line align-bottom"></i>
                                                        </Link>
                                                    </div>
                                                    <div className="flex-grow-1 ">
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                                <div className="avatar-sm">
                                                                    {botInfoLoading ? (<>
                                                                        <div
                                                                            className="skeleton rounded-circle w-100 h-100"/>
                                                                    </>) : chatbotInfo.profile ? (<Image
                                                                        src={chatbotInfo.profile}
                                                                        alt={"chat user"}
                                                                        className="rounded-circle avatar-xs"
                                                                    />) : (<div
                                                                        className="avatar-title bg-soft-primary text-primary rounded-circle fs-20">
                                                                        {chatbotInfo?.name
                                                                            ?.split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("")}
                                                                    </div>)}
                                                                </div>
                                                            </div>
                                                            {botInfoLoading ? (<>
                                                                <div
                                                                    className="skeleton w-70 "
                                                                    style={{height: "3rem"}}
                                                                />
                                                            </>) : (<>
                                                                <div className={`d-flex flex-grow-1`}>
                                                                    <div className="flex-column">
                                                                        <h5 className="text-truncate mb-0 fs-16">
                                                                            {chatbotInfo.name}
                                                                        </h5>
                                                                        <div
                                                                            className="text-truncate text-muted fs-14 mb-0 userStatus">
                                                                            <small>{chatbotInfo.role}</small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-column">
                                                                        <Dropdown
                                                                            isOpen={isOpen}
                                                                            toggle={toggleSearch}
                                                                        >
                                                                            <DropdownToggle
                                                                                className="btn btn-ghost-secondary btn-sm pt-0"
                                                                                tag="button"
                                                                            >
                                                                                <i className="ri-arrow-down-s-line fs-4"></i>
                                                                            </DropdownToggle>
                                                                            <DropdownMenu
                                                                                className="p-0 dropdown-menu-end dropdown-menu-lg">
                                                                                <SimpleBar
                                                                                    style={{maxHeight: "330px"}}
                                                                                >
                                                                                    <div className="p-2">
                                                                                        <div
                                                                                            className="search-box">
                                                                                            <Input
                                                                                                type="text"
                                                                                                className="form-control bg-light border-light"
                                                                                                placeholder={t("search_specialist")}
                                                                                                id="searchMessage"
                                                                                                onChange={(e) => {
                                                                                                    setBotSearch(e.target.value);
                                                                                                }}
                                                                                            />
                                                                                            <i className="ri-search-2-line search-icon"></i>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="p-2">
                                                                                        {botLoading ? (
                                                                                            <ThreeDotSpinner/>) : (allChatbot?.length > 0 && allChatbot.map((chat, index) => (
                                                                                            <Link
                                                                                                key={`chatbot${index}`}
                                                                                                href={`/admin/chats/${chat.chatbot_id}`}
                                                                                            >
                                                                                                <div
                                                                                                    className="d-block dropdown-item text-wrap dropdown-item-cart px-3 py-2"
                                                                                                    key={`chatbot${index}`}
                                                                                                >
                                                                                                    <div
                                                                                                        className="d-flex align-items-center">
                                                                                                        {chat?.profile ? (
                                                                                                            <Image
                                                                                                                src={chat?.profile}
                                                                                                                alt={chat.name}
                                                                                                                className="me-3 rounded-circle avatar-sm p-2 bg-light"
                                                                                                                width={"100%"}
                                                                                                                height={"100%"}
                                                                                                            />) : (<div
                                                                                                            className="avatar-sm me-3">
                                                                                                                                <span
                                                                                                                                    className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                                                                                    {chat?.name
                                                                                                                                        .split(" ")
                                                                                                                                        .map((n) => n[0])
                                                                                                                                        .join("")}
                                                                                                                                </span>
                                                                                                        </div>)}
                                                                                                        <div
                                                                                                            className="flex-grow-1 overflow-hidden">
                                                                                                            <h5 className="mt-0 mb-1 fs-14">
                                                                                                                {chat.name}
                                                                                                            </h5>
                                                                                                            <p className="mb-0 fs-12 text-muted">
                                                                                                                {chat.role}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </Link>)))}
                                                                                    </div>
                                                                                </SimpleBar>
                                                                            </DropdownMenu>
                                                                        </Dropdown>
                                                                    </div>
                                                                </div>
                                                            </>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={7} xs={5}>
                                                <ul className="list-inline user-chat-nav text-end mb-0">
                                                    <li className="list-inline-item d-none d-lg-inline-block m-0">
                                                        <Button
                                                            type="button"
                                                            color="primary"
                                                            className="btn btn-ghost-secondary btn-sm"
                                                            onClick={exportChats}
                                                        >
                                                            <i className="ri-download-2-line"></i>
                                                        </Button>
                                                    </li>

                                                    <li className="list-inline-item m-0">
                                                        <Button
                                                            type="button"
                                                            color="danger"
                                                            id="delete"
                                                            className="btn btn-ghost-danger btn-sm ms-2"
                                                            onClick={async () => await deleteChat(conversationId)}
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </Button>
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="position-relative" id="users-chat">
                                        <SimpleBar
                                            ref={ref}
                                            className="chat-conversation p-3 p-lg-4 "
                                            id="chat-conversation"
                                        >
                                            <ul
                                                className="list-unstyled chat-conversation-list mb-2"
                                                id="users-conversation"
                                            >
                                                {mLoading ? (<>
                                                    <li className=" chat-list right ">
                                                        <div className="conversation-list mb-2 ">
                                                            <div className="chat-avatar ms-2">
                                                                <div className="avatar-xs">
                                                                    <div
                                                                        className="skeleton rounded-circle w-100 h-100"/>
                                                                </div>
                                                            </div>
                                                            <div className="user-chat-content ">
                                                                <div className="ctext-wrap">
                                                                    <div className="ctext-wrap-content ">
                                                                        <div
                                                                            className="skeleton"
                                                                            style={{
                                                                                height: "2rem", width: "250px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className=" chat-list left  ">
                                                        <div className="conversation-list mb-2 ">
                                                            <div className="chat-avatar ms-2">
                                                                <div className="avatar-xs">
                                                                    <div
                                                                        className="skeleton rounded-circle w-100 h-100"/>
                                                                </div>
                                                            </div>
                                                            <div className="user-chat-content">
                                                                <div className="ctext-wrap">
                                                                    <div className="ctext-wrap-content">
                                                                        <div
                                                                            className="skeleton mb-2 d-block"
                                                                            style={{
                                                                                height: "1rem", width: "450px",
                                                                            }}
                                                                        />
                                                                        <div
                                                                            className="skeleton"
                                                                            style={{
                                                                                height: "1rem", width: "450px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                </>) : allMessages?.length > 0 ? (allMessages.map((message, key) => {
                                                    // add two li in same key one for message.prompt_message and one for message.content
                                                    // if message.prompt_message is not null then add li for message.prompt_message
                                                    // if message.content is not null then add li for message.content
                                                    const messageContent = formatAIMessage(message.content);
                                                    return (<React.Fragment key={`fragment${key}`}>
                                                        {message.prompt_message !== null && (<li
                                                            className="chat-list right"
                                                            key={`prompt${key}`}
                                                        >
                                                            <div className="conversation-list mb-2">
                                                                <div className="chat-avatar ms-2">
                                                                    {message.profile ? (<img src={message.profile}
                                                                                             alt=""/>) : (
                                                                        <div className="avatar-xs">
                                                                            <div
                                                                                className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                                {message?.fullname
                                                                                    ?.split(" ")
                                                                                    .map((n) => n[0])
                                                                                    .join("")}
                                                                            </div>
                                                                        </div>)}
                                                                </div>
                                                                <div className="user-chat-content">
                                                                    <div className="ctext-wrap mb-1">
                                                                        <div
                                                                            className="ctext-wrap-content p-2">
                                                                            <div
                                                                                className="mb-0 ctext-content"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: formatAIMessage(message.prompt_message),
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            className="message-box-drop">
                                                                            <UncontrolledTooltip
                                                                                placement="top"
                                                                                target={`use-as-prompt-${message.chat_id}`}
                                                                            >
                                                                                {t("use_as_prompt")}
                                                                            </UncontrolledTooltip>
                                                                            <div
                                                                                className="me-2 text-muted fs-18 pointer"
                                                                                id={`use-as-prompt-${message.chat_id}`}
                                                                                onClick={() => {
                                                                                    setMessageText(message.prompt_message);
                                                                                }}
                                                                            >
                                                                                <i className="ri-add-box-line fs-24"/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>)}
                                                        {message.content !== null && (<li
                                                            className="chat-list left"
                                                            key={`response${key}`}
                                                        >
                                                            <div className="conversation-list mb-2">
                                                                <div className="chat-avatar me-2">
                                                                    {message.profile ? (<img src={message.profile}
                                                                                             alt=""/>) : (
                                                                        <div className="avatar-xs">
                                                                            <div
                                                                                className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                                {message?.name
                                                                                    .split(" ")
                                                                                    .map((n) => n[0])
                                                                                    .join("")}
                                                                            </div>
                                                                        </div>)}
                                                                </div>
                                                                <div className="user-chat-content">
                                                                    <div className="ctext-wrap mb-1">
                                                                        <div
                                                                            className="ctext-wrap-content pb-0">
                                                                            <div
                                                                                className="mb-0 ctext-content"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: messageContent,
                                                                                }}
                                                                            />
                                                                            <div
                                                                                className="mt-2 d-flex align-items-center message-box-drop">
                                                                                <UncontrolledTooltip
                                                                                    placement="top"
                                                                                    target={`copy-${message.chat_id}`}
                                                                                >
                                                                                    {t("copy")}
                                                                                </UncontrolledTooltip>
                                                                                <UncontrolledTooltip
                                                                                    placement="top"
                                                                                    target={`edit-${message.chat_id}`}
                                                                                >
                                                                                    {t("edit_with_document_editor")}
                                                                                </UncontrolledTooltip>

                                                                                <div
                                                                                    className="me-2 text-muted font-size-12 pointer"
                                                                                    id={`copy-${message.chat_id}`}
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(message.content);
                                                                                        notify("success", t("copied_to_clipboard_you_can_now_paste_it_anywhere"));
                                                                                    }}
                                                                                >
                                                                                    <i className="ri-file-copy-line fs-18"/>
                                                                                </div>
                                                                                <div
                                                                                    id={`edit-${message.chat_id}`}
                                                                                    className="me-2 text-muted font-size-12 pointer"
                                                                                >
                                                                                    <Link
                                                                                        href={`/admin/documents/chat/${message.chat_id}`}
                                                                                        className={"text-decoration-none text-muted"}
                                                                                    >
                                                                                        <i className=" ri-file-edit-line fs-18"/>
                                                                                    </Link>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>)}
                                                    </React.Fragment>);
                                                })) : (<li className="chat-list left" key={`prompddt`}>
                                                    <div className="conversation-list mb-2">
                                                        <div className="chat-avatar ms-2">
                                                            {chatbotInfo?.profile ? (
                                                                <img src={chatbotInfo.profile} alt=""/>) : (
                                                                <div className="avatar-xs">
                                                                    <div
                                                                        className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                        {chatbotInfo?.name
                                                                            ?.split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("")}
                                                                    </div>
                                                                </div>)}
                                                        </div>
                                                        <div className="user-chat-content">
                                                            <div className="ctext-wrap mb-1">
                                                                <div className="ctext-wrap-content">
                                                                    <p className="mb-0 ctext-content">
                                                                        {formatAIMessage(chatbotInfo?.welcome_message)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>)}
                                                {messageLoading && (<React.Fragment key={`messageLoading`}>
                                                    <li
                                                        className="chat-list right"
                                                        key={`messageLoading`}
                                                    >
                                                        <div className="conversation-list mb-2">
                                                            <div className="chat-avatar ms-2">
                                                                <div className="avatar-xs">
                                                                    <div
                                                                        className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                        {session?.user?.first_name.charAt(0) + session?.user?.last_name.charAt(0)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="user-chat-content">
                                                                <div className="ctext-wrap mb-1">
                                                                    <div className="ctext-wrap-content">
                                                                        <p className="mb-0 ctext-content">
                                                                            {formatAIMessage(messageLoading)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li className="chat-list left" key={`loadingM`}>
                                                        <div className="conversation-list mb-2">
                                                            <div className="chat-avatar me-2">
                                                                {chatbotInfo?.profile ? (<img src={chatbotInfo?.profile}
                                                                                              alt=""/>) : (
                                                                    <div className="avatar-xs">
                                                                        <div
                                                                            className="avatar-title bg-soft-primary text-primary rounded-circle">
                                                                            {chatbotInfo?.name
                                                                                ?.split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("")}
                                                                        </div>
                                                                    </div>)}
                                                            </div>
                                                            <div className="user-chat-content">
                                                                <div className="ctext-wrap mb-1">
                                                                    <ThreeDotSpinner/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                </React.Fragment>)}
                                            </ul>
                                        </SimpleBar>
                                    </div>
                                    <div className="chat-input-section p-3 p-lg-3">
                                        {errorMsg && (<div className="alert alert-danger" role="alert">
                                            <div dangerouslySetInnerHTML={{__html: errorMsg}}/>
                                        </div>)}
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                await sendMessage();
                                            }}
                                        >
                                            <Row className="g-0 align-items-center">
                                                <div className="col">
                                                    <div className="d-flex align-items-center bg-light">
                                                        <Input
                                                            type="textarea"
                                                            autoComplete="off"
                                                            className="form-control chat-input bg-light border-light chat-textarea"
                                                            placeholder={t("enter_message") + "..."}
                                                            id="chatInput"
                                                            value={messageText}
                                                            onKeyDown={async (e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    await sendMessage();
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                // const cursorStart = textarea.selectionStart;
                                                                const cursorStart = e.target.selectionStart;
                                                                const cursorEnd = e.target.selectionEnd;
                                                                const str = e.target.value;
                                                                const regex = /\[(.*?)\]/g;
                                                                const matches = str.match(regex);
                                                                if (matches) {
                                                                    matches.forEach((match) => {
                                                                        const matchIndex = str.indexOf(match);
                                                                        const matchLength = match.length;
                                                                        if (cursorStart > matchIndex && cursorStart < matchIndex + matchLength) {
                                                                            e.target.setSelectionRange(matchIndex, matchIndex + matchLength);
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                setMessageText(e.target.value);
                                                                e.target.style.height = "auto";
                                                                e.target.style.height = e.target.scrollHeight + "px";
                                                            }}
                                                            style={{
                                                                resize: "none", overflow: "hidden", width: "89%",
                                                            }}
                                                        />
                                                        <div className="">
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target="ChatPrompts"
                                                            >
                                                                {t("prompts_templates")}
                                                            </UncontrolledTooltip>
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target="ChatVoice"
                                                            >
                                                                {isListening ? t("stop") : t("voice")}
                                                            </UncontrolledTooltip>
                                                            <UncontrolledTooltip
                                                                placement="top"
                                                                target="ChatSend"
                                                            >
                                                                {t("send")}
                                                            </UncontrolledTooltip>

                                                            <div className="d-flex align-items-center pt-1">
                                                                <Button
                                                                    type="button"
                                                                    color="link"
                                                                    onClick={() => {
                                                                        setToggleModal(true);
                                                                    }}
                                                                    id="ChatPrompts"
                                                                    className="text-decoration-none fs-14 px-1 btn btn-link text-muted"
                                                                >
                                                                    <i className="ri-book-2-fill"></i>
                                                                </Button>

                                                                <MyModal
                                                                    modal={toggleModal}
                                                                    setModal={setToggleModal}
                                                                    handleClose={() => {
                                                                        setToggleModal(false);
                                                                    }}
                                                                    contentClass={"bg-light"}
                                                                    icon={"ri-book-2-fill"}
                                                                    btnClassName={"link"}
                                                                    // id="ChatPrompts"
                                                                    header={t("prompts_templates")}
                                                                    size={"xl"}
                                                                    className={"text-decoration-none fs-14 px-1 btn btn-link text-muted"}
                                                                >
                                                                    <ChatTemplate
                                                                        setToggleModal={setToggleModal}
                                                                        setMessageText={setMessageText}
                                                                    />
                                                                </MyModal>

                                                                {enableVoice && (<React.Fragment>
                                                                    <Button
                                                                        type="button"
                                                                        color="link"
                                                                        id="ChatVoice"
                                                                        className="text-decoration-none fs-14 px-1 btn btn-link text-muted"
                                                                    >
                                                                        {!isListening ? (<i
                                                                            onClick={handleStart}
                                                                            className="ri-mic-line pointer"
                                                                        ></i>) : (<i
                                                                            onClick={handleStop}
                                                                            className="ri-mic-fill text-danger pointer"
                                                                        ></i>)}
                                                                    </Button>
                                                                </React.Fragment>)}

                                                                <Button
                                                                    type="submit"
                                                                    color="link"
                                                                    id="ChatSend"
                                                                    {...(messageText === "" ? {disabled: true} : {})}
                                                                    className="text-decoration-none fs-14 px-1 btn btn-link text-muted
                                                                        me-3
                                                                        "
                                                                >
                                                                    <i className="ri-send-plane-2-fill"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </React.Fragment>);
}
export const getServerSideProps = async ({locale}) => ({
    props: {...(await serverSideTranslations(locale, ["common"]))},
});
