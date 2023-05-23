import React, { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";
import {
  cancel_chat_icon,
  contacts_icon_img,
  employees_icon_img,
  link_tracker_icon,
  messages_icon_img,
  settings_icon_img,
  start_chat_icon,
  websites_icon_img,
} from "../services/icons";
import { getAppTimeAgo } from "../services/timeago";
import notification_music from "../audios/notification.mp3";
import {Call, Phone, VideoCall, VoiceChat} from '@material-ui/icons'

export default function Main() {
  const {
    user_id,
    logOut,
    createJsonFile,
    loadJsonFile,
    setDarkMode,
    setTabActive,
    tabActive,
    chatsLists,
    countNames,
    selectThisChat,
    removeChatsList,
    handleContactChange,
    contactDetails,
    saveContact,
    contacts,
    addToChat,
    removeContact,
    hideMenu,
    menuToDisplay,
    changeFileHandler,
    setFullScreen,
    selectedChat,
    appData,
    handleChange,
    setSettings,
    settings,
    darkMode,
    loginForm,
    setSelectedChat,
    setRefLast,
    resendMsg,
    sendMessage,
    userMessage,
    handleMsgChange,
    textRows,
    copyMsg,
    randomcolor,
    tabChatsFunction,
    setSelectedChatFalse,
    isCalling,
    callUser,
  } = useContext(AppContext);

  var sidebar_main_profile = "";
  sidebar_main_profile = (
    <>
      <div className="profile_wrapper">
        {user_id && (
          <img
            src={employees_icon_img}
            className={
              user_id
                ? "user_" +
                  user_id.toString().replace("+", "_").toLowerCase() +
                  " user"
                : null + " user"
            }
            alt="profile_pic"
          />
        )}

        <span>{user_id && user_id.toString().substr(0, 10)}</span>
        <span className="btn_main" onClick={(e) => logOut(e)}>
          logout
        </span>
        <span
          onClick={() => createJsonFile()}
          style={{ margin: "10px" }}
          className="btn_main"
        >
          Export Data
        </span>
        <span
          onClick={() => loadJsonFile()}
          style={{ margin: "10px" }}
          className="btn_main"
        >
          Import Data
        </span>
        <span
          style={{ margin: "10px" }}
          onClick={() => setDarkMode(!darkMode)}
          className="btn_main"
        >
          Mode ({darkMode ? "dark" : "light"})
        </span>
      </div>
    </>
  );

  var sidebar_main_chat = "";
  sidebar_main_chat = (
    <div className="tabs">
      <span
        onClick={(e) => tabChatsFunction(e)}
        className={tabActive.chats ? "tab active" : "tab"}
      >
        <img src={messages_icon_img} className="chats icon" alt="messages" />
        <p>Chats</p>
      </span>
      <span
        onClick={(e) =>
          setTabActive({ ...tabActive, contacts: true, chats: false })
        }
        className={tabActive.contacts ? "tab active" : "tab"}
      >
        <img src={contacts_icon_img} className="contacts icon" alt="contacts" />
        <p>Contacts</p>
      </span>
    </div>
  );
  var sidebar_main_chat_data = "";

  sidebar_main_chat_data = (
    <>
      <div className="contacts">
        {chatsLists?.map((contact, index) => {
          let getResponse = countNames(contact?.phone);
          if (getResponse > 10) {
            getResponse = `9+`;
          } else {
            getResponse = getResponse;
          }

          return (
            <>
              <div
                className="contact_wrapper data_tosearch"
                data-target="chats"
              >
                <div
                  data-target="chats"
                  data-value={contact.phone}
                  className={
                    "contact chatslist_" +
                    contact?.phone?.replace("+", "_").toLowerCase()
                  }
                  key={index}
                  onClick={(e) => selectThisChat(contact)}
                  title="add this to conversation"
                >
                  {/* <img
                    data-target="chats"
                    data-value={contact.phone}
                    src={employees_icon_img}
                    className={
                      "user user_" +
                      contact?.phone?.replace("+", "_").toLowerCase()
                    }
                    alt="profile_pic"
                  /> */}
                  <div
                    data-target="chats"
                    data-value={contact.phone}
                    style={{ background: randomcolor(3) }}
                    className="user user_profile_pic"
                    alt="profile_pic"
                  >
                    {contact.name.substr(0, 1)}
                  </div>
                  <span className="space_between">
                    <span
                      className="contact_details"
                      data-target="chats"
                      data-value={contact.phone}
                    >
                      <span data-target="chats" data-value={contact.phone}>
                        <h3 data-target="chats" data-value={contact.phone}>
                          {contact?.name?.substr(0, 10)}
                        </h3>
                        <p data-target="chats" data-value={contact.phone}>
                          {contact.phone?.substr(0, 13)}
                        </p>
                      </span>
                    </span>

                    <span
                      data-target="chats"
                      data-value={contact.phone}
                      className="badge"
                    >
                      {getResponse}
                    </span>
                  </span>
                </div>
                <div className="contact_option">
                  <img
                    title="delete chat"
                    src={link_tracker_icon}
                    alt="link-tracker"
                    onClick={(e) => removeChatsList(contact.phone)}
                    className="icon"
                    draggable={false}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
            </>
          );
        })}

        {chatsLists?.length < 1 && (
          <>
            <div className="notfound_data">
              <p>Ooops chats not found</p>
              <p onClick={(e) => loadJsonFile(e)} className="btn_main">
                import
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );

  var sidebar_main_contacts_data = "";
  sidebar_main_contacts_data = (
    <>
      <div className="contacts_add">
        <div className="input_wrapper">
          <input
            type="text"
            className="input"
            onChange={handleContactChange}
            value={contactDetails.name}
            name="name"
            placeholder="name."
            data-target="paste"
            data-value={copyMsg}
          />
          <input
            type="text"
            className="input"
            onChange={handleContactChange}
            value={contactDetails.phone}
            name="phone"
            placeholder="+263....."
            data-target="paste"
            data-value={copyMsg}
          />
          <button className="btn_main" onClick={saveContact}>
            Add
          </button>
        </div>

        <div className="contacts">
          {contacts?.map((contact, index) => {
            return (
              <>
                <div
                  className="contact_wrapper data_tosearch"
                  data-target="contacts"
                  data-value={contact.phone}
                >
                  <div
                    className="contact"
                    key={index}
                    onClick={(e) => addToChat(contact)}
                    title="add this contact to chat"
                    data-target="contacts"
                    data-value={contact.phone}
                  >
                    {/* <img
                      src={employees_icon_img}
                      className={
                        "user user_" +
                        contact?.phone?.replace("+", "_").toLowerCase()
                      }
                      alt="profile_pic"
                      data-target="contacts"
                      data-value={contact.phone}
                    /> */}
                    <div
                      data-target="contacts"
                      data-value={contact.phone}
                      style={{ background: randomcolor(3) }}
                      className="user user_profile_pic"
                      alt="profile_pic"
                    >
                      {contact.name.substr(0, 1)}
                    </div>
                    <span className="contact_details">
                      <h3 data-target="contacts" data-value={contact.phone}>
                        {contact.name?.substr(0, 10)}
                      </h3>
                      <p data-target="contacts" data-value={contact.phone}>
                        {contact.phone?.substr(0, 17)}
                      </p>
                    </span>
                  </div>
                  <div className="contact_option">
                    <img
                      title="remove"
                      src={link_tracker_icon}
                      alt="link-tracker"
                      onClick={(e) => removeContact(contact.phone)}
                      className="icon"
                      draggable={false}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              </>
            );
          })}
          {contacts?.length < 1 && (
            <>
              <div className="notfound_data">
                <p>No contacts created at the moment</p>
                <p onClick={(e) => loadJsonFile(e)} className="btn_main">
                  import
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
  var menuInserted = "";
  menuInserted = (
    <>
      {user_id && (
        <div className="gene_menu is-hidden">
          <div className="menu_header">
            <span onClick={hideMenu}>Hide</span>
            <span
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? "toggle_btn active" : "toggle_btn"}
            >
              <span className="toggle"></span>
            </span>
          </div>
          <div className="menu_items">
            {menuToDisplay?.msg && (
              <>
                <span className="item" data-target="reply">
                  {appData?.reply ? "Cancel Reply" : "Reply"}
                </span>
                <span className="item" data-target="unread">
                  Mark As Unread
                </span>
              </>
            )}
            {menuToDisplay?.msg && (
              <>
                <span className="item" data-target="delete">
                  Delete For Me
                </span>
                <span className="item" data-target="copy">
                  Copy
                </span>
              </>
            )}
            {menuToDisplay?.paste && (
              <>
                <span className="item" data-target="paste">
                  Paste
                </span>
              </>
            )}
            {menuToDisplay?.chats && (
              <>
                <span className="item" data-target="delete">
                  Delete
                </span>
              </>
            )}
            {menuToDisplay?.contacts && (
              <>
                <span className="item" data-target="delete">
                  Delete
                </span>
              </>
            )}
            <span className="item" onClick={() => loadJsonFile()}>
              Import Chats
            </span>
            <span className="item" onClick={() => createJsonFile()}>
              Export Data
            </span>
            <span className="item" onClick={(e) => logOut(e)}>
              logout
            </span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="main_app">
     <div>
      <audio
        style={{ display: "none" }}
        id="notification_audio"
        className="notification_audio"
        src={notification_music}
      />
     <input
          className="input is-hidden jsonFileInput"
          id="jsonFileInput"
          accept=".json"
          name="file"
          onChange={changeFileHandler}
          type="file"
        />
        {menuInserted}
        <div className="flex_end">
          <div>Gene Piki</div>
          <div className="flex wide_screen_icon">
            <span
              onClick={() => setFullScreen(true)}
              className="fullmode icon"
            ></span>
            <span
              onClick={() => setFullScreen(false)}
              className="minimize icon"
            ></span>
          </div>
        </div>
     </div>
        <div className="gridTwo">
          <div className={selectedChat.chatOpen ? "sidebar hide" : "sidebar"}>
            <div className="search_head">
              <div className="search_input">
                <input
                  type="text"
                  value={appData?.search}
                  onChange={handleChange}
                  name="search"
                  placeholder="search"
                />
                <img
                  src={websites_icon_img}
                  className="website icon"
                  alt="search"
                />
                <span></span>
              </div>
              <div
                className="head_settings"
                onClick={(e) => setSettings(!settings)}
              >
                <img
                  src={settings_icon_img}
                  className="settings"
                  alt="settings"
                />
              </div>
            </div>
            <div className="sidebar_main">
              {user_id ? (
                <>
                  {settings && <>{sidebar_main_profile}</>}
                  {!settings && (
                    <>
                      {sidebar_main_chat}
                      <div className="tab_state_data">
                        {tabActive.chats && <>{sidebar_main_chat_data}</>}

                        {tabActive.contacts && (
                          <>{sidebar_main_contacts_data}</>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <form onSubmit={loginForm}>
                    <div className="login_wrapper">
                      <input
                        type="text"
                        className="input"
                        onChange={handleChange}
                        name="phone"
                        value={appData.phone}
                        placeholder="+263......."
                        data-target="paste"
                        data-value={copyMsg}
                      />
                      <span>NB: Don't use incognito window...</span>
                      <button
                        style={{ marginTop: "20px" }}
                        className="btn_main"
                      >
                        genepiki
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
          <div className={selectedChat.chatOpen ? "dm_msgs" : "dm_msgs hide"}>
            {selectedChat.chatOpen && (
              <>
                <div className="selected_user">
                  <img
                    src={cancel_chat_icon}
                    onClick={(e) => setSelectedChatFalse(e)}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                    className="cancel"
                    alt="profile_pic"
                  />
                  <div
                    // src={employees_icon_img}
                    style={{ background: randomcolor(3) }}
                    className="user user_profile_pic"
                    alt="profile_pic"
                  >
                    {selectedChat.name.substr(0, 1)}
                  </div>
                  <div className="user_status">
                    <h3>{selectedChat.name.substr(0, 19)}</h3>
                    <span
                      className={
                        "user_" +
                        selectedChat?.phone?.replace("+", "_").toLowerCase() +
                        " status"
                      }
                    >
                      last seen: 1min ago
                    </span>
                    <span
                      className={
                        "status_span status_" +
                        selectedChat?.phone?.replace("+", "_").toLowerCase()
                      }
                    ></span>
                  </div>

                  <div className="call" style={{display:'flex',justifyContent: 'end',width:'40%',cursor:'pointer'}}>
                    <VoiceChat onClick={(e)=> callUser(selectedChat?.phone)} />
                  </div>
                </div>
                 {isCalling && (
                <div className="call_left_side" style={{width:"100%", height:"100%",display:"block", background:"GREEN"}}>
                      Call Or Video Chat
                </div>

                 )}
                 {!isCalling && (

                <div className="msg_left_app">
                <div className="selected_msgs">
                  <div className="encrypted_wrapper">
                    <p className="encrypted_msg">
                      Gene Piki created this chat app as one time send message
                      (we do not store any users infomation)
                    </p>
                  </div>
                  {selectedChat.msgs?.map((msg, index) => {
                    const lastMessage = selectedChat.msgs.length - 1 === index;

                    return (
                      <>
                        <div
                          ref={lastMessage ? setRefLast : null}
                          data-target="msg"
                          data-value={msg?.now}
                          className={
                            msg.from == user_id
                              ? "msgs_wrapper fromMe data_tosearch"
                              : "msgs_wrapper data_tosearch"
                          }
                        >
                          <span
                            data-target="msg"
                            data-value={msg?.now}
                            key={index}
                            className={
                              msg.from == user_id
                                ? "msg fromMeMsg"
                                : "msg fromOther"
                            }
                          >
                            {msg.msg}{" "}
                          </span>
                          <span data-target="msg" data-value={msg?.now}>
                            {getAppTimeAgo(msg?.now)}
                          </span>
                          {/* <span>{msg.time}</span> */}
                          <span
                            data-target="msg"
                            data-value={msg?.now}
                            style={{ color: "#fff" }}
                            className={
                              "msg_" +
                              msg?.time?.replace(":", "_").toLowerCase()
                            }
                            onClick={() => resendMsg(msg)}
                          >
                            {msg.status == "error" ? "resend" : "send"}
                          </span>
                        </div>
                      </>
                    );
                  })}
                </div>
                <form onSubmit={sendMessage}>
                  <div data-target="file" className="selected_msgs_input_send">
                    <span data-target="file">file</span>
                    <textarea
                      rows={textRows}
                      value={userMessage}
                      onChange={handleMsgChange}
                      type="text"
                      className="send_msg_input"
                      data-target="paste"
                      data-value={copyMsg}
                      placeholder="type to send message"
                    />
                    <button className="btn_main" type="submit">
                      {appData.reply ? "reply" : "send"}
                    </button>
                  </div>
                </form>
                </div>
                 )}
              </>
            )}
            {!selectedChat.chatOpen && (
              <>
                <p className="centered">
                  <img
                    title="remove"
                    src={start_chat_icon}
                    alt="link-tracker"
                    className="icon"
                    width="30px"
                    draggable={false}
                    style={{ cursor: "pointer" }}
                  />
                  please select chat
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
