import React, {
  createContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import useLocalStorageArray from "../services/useLocalStorageArray";
import useLocalStorage from "../services/useLocalStorage";
import swal from "sweetalert";
import { testPatternPhone } from "../services/functions";
import { getAppTimeAgo } from "../services/timeago";

const AppContext = createContext();

function AppProvider({ children, socket }) {
  // const fileTypeAllowed = /image\/(png|jpg|jpeg)/i;

  const fileTypeAllowed = /(json)/i;
  const [file, setFile] = useState(null);
  const [appData, setAppData] = useState({
    search: "",
    phone: "",
    reply: false,
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
  const [textRows, setTextRows] = useState(1);
  const [textAreavalue, setTextAreavalue] = useState(0);
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
    setTextAreavalue(prevData=>{
      return prevData += 1;
    })
    if((textAreavalue / 67) >= 1){
      setTextRows(prevData=>{
        return prevData += 1;
      }); 
      setTextAreavalue(0);
    }
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

  useEffect(() => {
    if (!file) return () => {};

    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);

    function onReaderLoad(event) {
      var obj = JSON.parse(event.target.result);
      const loadedContacts = obj[0]?.contacts;
      const loadedChatsLists = obj[0]?.chatsLists;
      const loadedMessages = obj[0]?.messages;

      if (loadedContacts?.length > 0) {
        loadedContacts?.map((contact) => {
          if (contacts.some((con) => con.phone === contact?.phone))
            return () => {};
          setContacts((prevData) => {
            return [...prevData, contact];
          });
        });
      }

      if (loadedChatsLists?.length > 0) {
        loadedChatsLists?.map((chats) => {
          if (chatsLists.some((chat) => chat.phone === chats?.phone))
            return () => {};
          setChatsLists((prevData) => {
            return [...prevData, chats];
          });
        });
      }

      if (loadedMessages?.length > 0) {
        loadedMessages?.map((msg) => {
          if (messages.some((msgLocal) => msgLocal.now === msg?.now))
            return () => {};
          setMessages((prevData) => {
            return [...prevData, msg];
          });
        });
      }

      swal("Success", "data imported successfully", "success");
    }
  }, [file]);

  const changeFileHandler = (e) => {
    const files = e.target.files[0];
    if (!files.type.match(fileTypeAllowed)) return () => {};
    setFile(files);
  };

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
  const getAuthanticated = async () => {
    let getAuthResponse = await testPatternPhone(user_id);

    if (getAuthResponse) {
    } else {
      setUser_id(false);
    }
  };

  useEffect(() => {
    // if(!user_id) return () => {}
    getAuthanticated();
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
    setTextRows(1);
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
    setUser_id(appData.phone);
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
          default:
            return () => {};
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
  const loadJsonFile = () => {
    const fileInputs = document.querySelectorAll(".jsonFileInput");

    fileInputs.forEach((input) => {
      input.click();
    });
  };
  const createJsonFile = () => {
    let newArrayTocreate = [];
    let objectData = { contacts, chatsLists, messages };
    var pushedData = newArrayTocreate.push(objectData);
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(newArrayTocreate));
    var createdFile = document.createElement("a");
    createdFile.setAttribute("href", dataStr);
    createdFile.setAttribute("download", "genepiki.json");
    const main_apps = document.querySelectorAll(".main_app");

    main_apps.forEach((app) => {
      app.appendChild(createdFile);
    });
    createdFile.click();
    createdFile.remove();
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
        default:
          return () => {};
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
        case "reply":
          hideMenu();
          setAppData({ ...appData, reply: !appData?.reply });

          document.querySelectorAll(".send_msg_input").forEach((input) => {
            //do some action on send message input
          });
          break;
        default:
          return () => {};
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
        default:
          return () => {};
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
        default:
          return () => {};
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
          default:
            return () => {};
        }
      };
    });
  }, [menuToDisplay]);
  const saveContact = async (e) => {
    let response = await addContactFunction(
      contactDetails.name,
      contactDetails.phone
    );
  };
  const sendMessage = (e) => {
    e.preventDefault();
    if (!userMessage) return () => {};
    setAppData({ ...appData, reply: false });
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
    setTextRows(1);
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
  const notify = () => {
    const user_ringtone_not = document.querySelectorAll(".notification_audio");
    user_ringtone_not.forEach((ring) => {
      ring?.play();
    });
  };

  const values = {
    socket,
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
  };
  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
}

export { AppProvider, AppContext };
