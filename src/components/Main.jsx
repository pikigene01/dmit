import React, { useState, useEffect, useCallback } from "react";
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
import useLocalStorageArray from "../services/useLocalStorageArray";
import swal from "sweetalert";
import useLocalStorage from "../services/useLocalStorage";
import { getAppTimeAgo } from "../services/timeago";
import notification_music from "../audios/notification.mp3";
import { testPatternPhone } from "../services/functions";

export default function Main({ socket }) {
  const [appData, setAppData] = useState({
    search: "",
    phone: "",
  });
  const [me, setMe] = useState();
  const [fullScreen, setFullScreen] = useState(false);
  const setRefLast = useCallback((node) => {
    if (node) {
      node.scrollIntoView({ smooth: true });
    }
  }, []);
  const [userMessage, setUserMessage] = useState("");
  const [menuToDisplay, setMenuToDisplay] = useState({
    chats: false,
    msg: false,
    file: false,
    contacts: false,
  });
  const [contacts, setContacts] = useLocalStorageArray("contacts");
  const [messages, setMessages] = useLocalStorageArray("messages");
  const [chatsLists, setChatsLists] = useLocalStorageArray("chatslist");
  const [settings, setSettings] = useLocalStorage("settings");
  const [user_id, setUser_id] = useLocalStorage("user_id");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeens, setLastSeens] = useState([]);
  const [darkMode, setDarkMode] = useLocalStorage("theme_data");
  const [profileImgs, setProfileImgs] = useState([]); //we push user id and url for the image
  const [tabActive, setTabActive] = useState({
    chats: true,
    contacts: false,
  });
  const [selectedChat, setSelectedChat] = useState({
    msgs: [],
    chatOpen: false,
  });
  const [contactDetails, setContactDetails] = useState({
    name: "",
    phone: "",
  });
  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
    liveSearch(e);
  };
  const handleContactChange = (e) => {
    setContactDetails({ ...contactDetails, [e.target.name]: e.target.value });
  };
  const handleMsgChange = (e) => {
    setUserMessage(e.target.value);
  };
  const addContactFunction = async (name, phone) => {
    if (!name || !phone) return () => {};
    if (phone == user_id) return () => {}; //you can not save your contact ID
    if (contacts.some((user) => user.phone === phone)) return () => {};
    if (!phone.includes("+")) {
      swal("Warning", "phone must include +", "warning");
      return () => {};
    }
    let testresult = await testPatternPhone(phone);
    if (!testresult) return () => {};

    let contactData = { name, phone };

    let setData = await setContacts((prevData) => {
      return [...prevData, contactData];
    });
    setContactDetails({ ...contactDetails, name: "", phone: "" });
    return contacts;
  };
  useEffect(() => {
    if (selectedChat.chatOpen) {
      let dataFind = [];
      let dataFindarray = [];

      messages.map((msgmap) => {
        dataFind.push(msgmap);
        var getFind = dataFind.find((msg) => {
          return (
            msg.to === selectedChat.phone || msg.from === selectedChat.phone
          );
        });
        if (getFind !== undefined) {
          dataFindarray.push(getFind);
          let new_array = dataFind.filter((msg) => msg.msg !== getFind?.msg);
          dataFind = new_array; //l did filter data to remove added messages
        }
      });

      setSelectedChat({
        ...selectedChat,
        name: selectedChat.name,
        phone: selectedChat.phone,
        chatOpen: true,
        msgs: dataFindarray,
      });
    }
  }, [selectedChat.chatOpen, selectedChat.name, messages]);

  const countNames = (value) => {
    let dataFind = [];
    let dataFindarray = [];

    messages.map((msgmap) => {
      dataFind.push(msgmap);
      var getFind = dataFind.find((msg) => {
        return msg.to === value || msg.from === value;
      });
      if (getFind !== undefined) {
        dataFindarray.push(getFind);
        let new_array = dataFind.filter((msg) => msg.msg !== getFind?.msg);
        dataFind = new_array; //l did filter data to remove added messages
      }
    });
    return dataFindarray.length;
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    // if(!user_id) return () => {}
    socket?.on("me", (id) => setMe(id));
    if (!user_id) return () => {};
    socket?.emit("newUser", user_id);
  }, [socket, user_id]);

  useEffect(() => {
    socket?.on("online_users", (data) => {
      setOnlineUsers(data);
    });
    socket?.on("getMessage", (data) => {
      setMessages((prevData) => {
        return [...prevData, data];
      });
      notify();
    });

    return () => {
      socket?.off("getMessage");
    };
  }, [socket]);
  useEffect(() => {
    if (!lastSeens) return () => {};
    const status_span = document.querySelectorAll(".status_span");
    status_span.forEach((span) => {
      span.innerHTML = "";
    });
    lastSeens.map((seen) => {
      const users = document.querySelectorAll(
        ".status_" + seen?.phone?.replace("+", "_").toLowerCase()
      );

      users.forEach((user) => {
        user.innerHTML = `Last Seen: ${getAppTimeAgo(seen?.now)}`;
      });
    });
  }, [lastSeens, selectedChat?.phone]);
  useEffect(() => {
    socket?.on("last_seens", (data) => {
      setLastSeens(data);
    });

    return () => {
      socket?.off("last_seens");
    };
  }, [socket]);
  useEffect(() => {
    if (!socket) return () => {};
    socket?.on("getProfiles", (data) => {
      setProfileImgs((prevData) => {
        return [...prevData, data];
      });
    });

    return () => {
      socket?.off("getProfiles");
    };
  }, [socket]);
  useEffect(() => {
    if (!socket) return () => {};
    socket?.emit("get_online_users", {});
  }, [socket, selectedChat?.phone]);

  useEffect(() => {
    const main_app_wrappers = document.querySelectorAll(".main_app");

    main_app_wrappers.forEach((main_app) => {
      if (fullScreen) {
        main_app.requestFullscreen();
      } else {
        if (document.fullscreen) {
          document?.exitFullscreen();
        }
      }
      main_app.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        startInsertMenu(e);
      });
    });
  }, [fullScreen]);

  useEffect(() => {
    const status = document.querySelectorAll(".status");
    status.forEach((stat) => {
      stat.innerHTML = "";
    });
    onlineUsers.forEach((user) => {
      const users = document.querySelectorAll(
        ".user_" + user?.username?.replace("+", "_").toLowerCase()
      );
      users.forEach((user) => {
        user.innerHTML = "online";
      });
    });
  }, [onlineUsers, selectedChat.msgs]);
  useEffect(() => {
    let filterMsgs = messages,
      getContact = [];
    if (messages) {
      messages.map((msgmap) => {
        chatsLists.map((chat) => {
          if (chat.name === msgmap.from) {
            let check_contact = contacts.find((contact) => {
              return contact.phone === chat.name;
            });
            if (check_contact) {
              removeChatsList(msgmap.from); //remove chatlist when contact is saved and reload
              //get name from saved contacts
            }
          }
        });

        var getOneUser = filterMsgs?.find((user) => {
          return user.from === msgmap.from;
        });
        !getContact.some((user) => user.from === getOneUser?.from) &&
          getContact.push(getOneUser);
        let newcreateMsgs = filterMsgs.filter(
          (data) => data.from !== msgmap.from
        );
      });

      getContact?.map((msgmap) => {
        //this functuion really helps me to not jublicate chat lists
        //since we filtered the pushed item in getContacts as array of find and filter the rest
        var contact = contacts?.find((chat) => {
          return chat.phone === msgmap.from;
        }); //we check each message if got save name
        var you = (user_id == msgmap?.from && "You (me)") || msgmap?.from;

        var name = (contact && contact.name) || you;
        var phone = msgmap?.from;
        var combinedContact = { phone, name, msgs: [] };

        const check_chatlist = chatsLists?.find((chat) => {
          return chat?.phone === msgmap?.from;
        });

        if (check_chatlist === undefined) {
          setChatsLists((prevData) => {
            return [...prevData, combinedContact];
          });
        }
      });
      // document.querySelectorAll(".chatslist_"+msgmap?.from?.replace('+',"_").toLowerCase())[0]?.classList.add('is-hidden');

      //set chatList if received messages
    }
  }, [messages, chatsLists, contacts]);
  const addToChat = (contact) => {
    if (chatsLists.some((user) => user.phone === contact?.phone))
      return () => {};
    //add chat to side bar
    let combinedData = { name: contact.name, phone: contact.phone, msgs: [] };
    setChatsLists((prevData) => {
      return [...prevData, combinedData];
    });
    swal("Success", "contact added to chat", "success");
  }; //this function add contact to chat

  const selectThisChat = (contact) => {
    //set selected conversation to true and array of messages
    if (selectedChat?.phone == contact?.phone) return () => {};
    setSelectedChat({
      ...selectedChat,
      chatOpen: true,
      name: contact.name,
      msgs: contact?.msgs,
      phone: contact?.phone,
    });
  };

  const removeContact = (phone) => {
    let new_contacts = contacts.filter((contact) => contact.phone !== phone);
    setContacts(new_contacts);
  };
  const removeChatsList = (phone) => {
    let new_contacts = chatsLists.filter((contact) => contact.phone !== phone);
    setChatsLists(new_contacts);
  };

  const loginForm = async (e) => {
    e.preventDefault();
    if (!appData.phone.includes("+")) {
      swal("Warning", "phone must include +", "warning");
      return () => {};
    }
    let testResult = await testPatternPhone(appData.phone);
    if (!testResult) {
      swal(
        "Warning",
        "please do not include letters as your phone number",
        "warning"
      );
    }
    if (!testResult) return () => {};

    let response = socket?.emit("logIn", appData.phone);
    if (!response?.connected) {
      swal("Warning", "you can not login whilst offline", "warning");
    }
  };

  useEffect(() => {
    socket?.on("loginResponse", (data) => {
      if (data.success) {
        switch (data?.type) {
          case "login":
            setUser_id(data.phone);
            swal("Suceess", data?.msg, "success");
            break;
          case "logout":
            setUser_id(false);
            swal("Suceess", data?.msg, "success");

            break;
        }
      } else {
        swal("Warning", data?.msg, "warning");
      }
    });
    return () => {
      socket?.off("loginResponse");
    };
  }, [socket]);
  const liveSearch = (e) => {
    // Locate the card elements
    const cards = document.querySelectorAll(".data_tosearch");
    // Locate the search input
    let search_query = e.target.value;
    // Loop through the cards
    for (var i = 0; i < cards.length; i++) {
      // If the text is within the card...
      if (
        cards[i].innerText
          .toLowerCase()
          // ...and the text matches the search query...
          .includes(search_query.toLowerCase())
      ) {
        // ...remove the `.is-hidden` class.
        cards[i].classList.remove("is-hidden");
      } else {
        // Otherwise, add the class.
        cards[i].classList.add("is-hidden");
      }
    }
  };
  const logOut = (e) => {
    let response = socket?.emit("logout", user_id);
    hideMenu(e);
    setSelectedChat({ ...selectedChat, chatOpen: false, phone: "" });
    if (!response?.connected) {
      swal("Warning", "you can not logout whilst offline", "warning");
    }
  };
  const hideMenu = (e) => {
    const geneMenus = document.querySelectorAll(".gene_menu");

    geneMenus.forEach((menu) => {
      menu.classList.add("is-hidden");
    });
  };
  const startInsertMenu = (e) => {
    let positionX = e.clientX;
    let positionY = e.clientY;
    setMenuToDisplay({});
    if (e.target.getAttribute("data-target")) {
      var toView = e.target.getAttribute("data-target"),
        value = e.target.getAttribute("data-value");

      switch (toView) {
        case "msg":
          setMenuToDisplay({
            msg: true,
            value,
          });
          break;
        case "file":
          setMenuToDisplay({
            file: true,
            value,
          });
          break;
        case "chats":
          setMenuToDisplay({
            chats: true,
            value,
          });

          break;
        case "contacts":
          setMenuToDisplay({
            contacts: true,
            value,
          });

          break;
      }
    }

    const gene_menu = document.querySelectorAll(".gene_menu");

    gene_menu.forEach((drag) => {
      const rect = drag.getBoundingClientRect();
      drag.style.cursor = "move";
      drag.classList.remove("is-hidden");
      drag.style.left = `${positionX}px`;
      drag.style.top = `${positionY}px`;
      // drag.style.left = `${rect.left - positionX}px`;
      // drag.style.top = `${rect.top - positionY}px`;this is for moving properties

      // drag.addEventListener("mousedown", mousedown);

      // function mousedown(e) {
      //   // window.addEventListener("mousemove", mousemove);
      //   // window.addEventListener("mouseup", mouseup);

      //   let prevX = e.clientX;
      //   let prevY = e.clientY;

      //   const rect = drag.getBoundingClientRect();
      //   drag.style.cursor = "move";
      //   drag.style.left = `${rect.left - prevX}px`;
      //   drag.style.top = `${rect.top - prevY}px`;

      //   function mousemove(e) {
      //     let newX = prevX - e.clientX;
      //     let newY = prevY - e.clientY;

      //     const rect = drag.getBoundingClientRect();
      //     drag.style.cursor = "move";
      //     drag.style.left = `${rect.left - newX}px`;
      //     drag.style.top = `${rect.top - newY}px`;

      //     prevX = e.clientX;
      //     prevY = e.clientY;
      //   }
      //   function mouseup() {
      //     window.removeEventListener("mousemove", mousemove);
      //     window.removeEventListener("mouseup", mouseup);
      //   }
      // }
    });
  };
  const doActionToMenuClick = (action) => {
    let messages_update = messages,
      getStateValue = menuToDisplay.value,
      contacts_update = contacts,
      chatslists_update = chatsLists;
    if (menuToDisplay?.msg) {
      switch (action) {
        case "delete":
          messages_update = messages_update.filter(
            (msg) => msg.now !== getStateValue
          );
          setMessages(messages_update);
          break;
      }
    }
    if (menuToDisplay?.contacts) {
      switch (action) {
        case "delete":
          contacts_update = contacts_update.filter(
            (contact) => contact.phone !== getStateValue
          );
          setContacts(contacts_update);
          break;
      }
    }
    if (menuToDisplay?.chats) {
      switch (action) {
        case "delete":
          chatslists_update = chatslists_update.filter(
            (contact) => contact.phone !== getStateValue
          );
          setChatsLists(chatslists_update);
          break;
      }
    }
  };
  useEffect(() => {
    const menu_items = document.querySelectorAll(".item");
    menu_items.forEach((item) => {
      item.onclick = (e) => {
        var action = e.target.getAttribute("data-target");
        switch (action) {
          case "delete":
            doActionToMenuClick(action);
            break;
          case "unread":
            doActionToMenuClick(action);

            break;
          case "reply":
            doActionToMenuClick(action);

            break;
        }
      };
    });
  }, [menuToDisplay]);
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
        <span style={{ margin: "10px" }} className="btn_main">
          Export Data
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
  const saveContact = async (e) => {
    let response = await addContactFunction(
      contactDetails.name,
      contactDetails.phone
    );
  };
  const sendMessage = (e) => {
    e.preventDefault();
    if (!userMessage) return () => {};
    let msgData = {};
    var now = new Date();
    var hour = now.getHours();
    var minutes = now.getMinutes();
    msgData = {
      msg: userMessage,
      to: selectedChat?.phone,
      from: user_id,
      type: "msg",
      status: "send",
      time: `${hour}:${minutes}`,
      now,
    };

    let response = socket?.emit("sendMessageUser", msgData);
    if (response.connected) {
      msgData = {
        msg: userMessage,
        to: selectedChat?.phone,
        from: user_id,
        type: "msg",
        status: "send",
        time: `${hour}:${minutes}`,
        now,
      };
    } else {
      msgData = {
        msg: userMessage,
        to: selectedChat?.phone,
        from: user_id,
        type: "msg",
        status: "error",
        time: `${hour}:${minutes}`,
        now,
      };
    }
    setMessages((prevData) => {
      return [...prevData, msgData];
    });

    setSelectedChat({
      ...selectedChat,
      name: selectedChat.name,
      phone: selectedChat.phone,
      chatOpen: true,
      msgs: [...selectedChat.msgs, msgData],
    });

    setUserMessage("");
  };

  const resendMsg = (msg) => {
    if (msg?.status == "send") return () => {};
    let response = socket?.emit("sendMessageUser", msg);
    let msgsetValues = document.querySelectorAll(
      ".msg_" + msg?.time?.replace(":", "_").toLowerCase()
    );

    if (response?.connected) {
      msgsetValues.forEach((msg) => {
        msg.innerHTML = "send";
      });
      let msg_update = {
        msg: msg?.msg,
        to: msg?.to,
        from: user_id,
        type: "msg",
        status: "send",
        time: msg?.time,
        now: msg?.now,
      };
      let new_array = messages.filter((msg_get) => msg_get.now !== msg?.now);
      setMessages(new_array);
      setMessages((prevData) => {
        return [...prevData, msg_update];
      });
    } else {
      msgsetValues.forEach((msg) => {
        msg.innerHTML = "resend";
      });
    }
  };
  var sidebar_main_chat = "";
  sidebar_main_chat = (
    <div className="tabs">
      <span
        onClick={(e) =>
          setTabActive({ ...tabActive, contacts: false, chats: true })
        }
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
        {chatsLists?.reverse()?.map((contact, index) => {
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
                  <img
                    data-target="chats"
                    data-value={contact.phone}
                    src={employees_icon_img}
                    className={
                      "user user_" +
                      contact?.phone?.replace("+", "_").toLowerCase()
                    }
                    alt="profile_pic"
                  />
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
                          {contact.phone?.substr(0, 17)}
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
          />
          <input
            type="text"
            className="input"
            onChange={handleContactChange}
            value={contactDetails.phone}
            name="phone"
            placeholder="+263....."
          />
          <button className="btn_main" onClick={saveContact}>
            Add
          </button>
        </div>

        <div className="contacts">
          {contacts.map((contact, index) => {
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
                    <img
                      src={employees_icon_img}
                      className={
                        "user user_" +
                        contact?.phone?.replace("+", "_").toLowerCase()
                      }
                      alt="profile_pic"
                      data-target="contacts"
                      data-value={contact.phone}
                    />
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
                  Reply
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
            <span className="item" onClick={(e) => logOut(e)}>
              logout
            </span>
          </div>
        </div>
      )}
    </>
  );

  const notify = () => {
    const user_ringtone_not = document.querySelectorAll(".notification_audio");
    user_ringtone_not.forEach((ring) => {
      ring?.play();
    });
  };

  return (
    <>
      <audio
        style={{ display: "none" }}
        id="notification_audio"
        className="notification_audio"
        src={notification_music}
      />
      <div className="main_app">
        {menuInserted}
        <div className="flex_end">
          <div>Gene Piki</div>
          <div className="flex">
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
                      />
                      <span>NB: Don't use incognito window...</span>
                      <button
                        style={{ marginTop: "20px" }}
                        className="btn_main"
                      >
                        login
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
                    onClick={(e) => setSelectedChat({ chatOpen: false })}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                    className="cancel"
                    alt="profile_pic"
                  />
                  <img
                    src={employees_icon_img}
                    className="user"
                    alt="profile_pic"
                  />
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
                </div>
                <div className="selected_msgs">
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
                    <input
                      value={userMessage}
                      onChange={handleMsgChange}
                      type="text"
                      placeholder="type to send message"
                    />
                    <button className="btn_main" type="submit">
                      send
                    </button>
                  </div>
                </form>
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
