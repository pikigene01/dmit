import React, { useState, useEffect,useCallback } from "react";
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

export default function Main({socket}) {
  const [appData, setAppData] = useState({
    search: "",
    phone: "",
  });
  const [me,setMe] = useState();
  const setRefLast = useCallback((node)=>{
    if(node){
     node.scrollIntoView({smooth:true})
    }
   },[]);
  const [userMessage, setUserMessage] = useState("");
  const [contacts, setContacts] = useLocalStorageArray("contacts");
  const [messages, setMessages] = useLocalStorageArray("messages");
  const [chatsLists, setChatsLists] = useLocalStorageArray("chatslist");
  const [settings, setSettings] = useLocalStorage("settings");
  const [user_id, setUser_id] = useLocalStorage("user_id");
  const [onlineUsers,setOnlineUsers] = useState([]);
  const [profileImgs,setProfileImgs] = useState([]);//we push user id and url for the image
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
    if (!phone.includes("+")) {
      swal("Warning", "phone must include +", "warning");
      return () => {};
    }

    let contactData = { name, phone };

    let setData = await setContacts((prevData) => {
      return [...prevData, contactData];
    });
    setContactDetails({ ...contactDetails, name: "", phone: "" });
    return contacts;
  };
   useEffect(()=>{ 
    if(selectedChat.chatOpen){
        let dataFind = [];
        let dataFindarray = [];

        messages.map((msgmap)=>{
            dataFind.push(msgmap);
          var getFind = dataFind.find((msg)=>{
            return msg.to === selectedChat.phone || msg.from === selectedChat.phone
         });
         if(getFind !== undefined){
            dataFindarray.push(getFind);
            let new_array = dataFind.filter((msg) => msg.msg !== getFind?.msg);
            dataFind = new_array;//l did filter data to remove added messages

         }
        });

         setSelectedChat({
            ...selectedChat, 
        name:selectedChat.name,phone:selectedChat.phone,chatOpen:true,msgs:dataFindarray});
    
    }
   },[selectedChat.chatOpen,selectedChat.name,messages]);

   useEffect(()=>{
    // if(!user_id) return () => {}
    socket?.on("me", (id) => setMe(id));
    socket?.emit('newUser', user_id);

  },[socket,user_id]);

  useEffect(()=>{
     socket?.on('online_users', (data)=>{
        setOnlineUsers(data);
     });
     socket?.on('getMessage', (data)=>{
        setMessages((prevData)=>{
            return [...prevData, data];
        });
     });

     return ()=>{
        socket?.off('getMessage');
     }
  },[socket]);
  useEffect(()=>{
     
     socket?.on('getProfiles', (data)=>{
        setProfileImgs((prevData)=>{
            return [...prevData, data];
        });
     });

     return ()=>{
        socket?.off('getProfiles');
     }
  },[socket]);

  useEffect(()=>{
    onlineUsers.forEach((user)=>{
        const users = document.querySelectorAll('.user_'+user?.username.replace('+',"_").toLowerCase());
        const status = document.querySelectorAll('.status');
        status.forEach((status)=>{
            status.innerHTML = "";
        })
        users.forEach((user)=>{
            user.innerHTML = "online";
        });
    });
  },[onlineUsers, selectedChat.msgs]);
   useEffect(()=>{
        if(messages){

            let dataFind = [];
            let dataFindarray = [];
            let msg_user_from = "";
    
            messages.map((msgmap)=>{
                msg_user_from = msgmap?.from;
                dataFind.push(msgmap);
              var getFind = chatsLists.find((chat)=>{
                return chat.phone === msgmap.from
             });
             if(!user_id === msgmap.from){
             if(getFind === undefined){
                dataFindarray.push({phone:dataFind?.from,name: '',msgs: []});
                let new_array = dataFind.filter((contact) => contact.from !== getFind?.phone);
                dataFind = new_array;//l did filter data to remove added messages
             }
            }
            });
            if(!user_id == msg_user_from){
               setChatsLists((prevData)=>{
               return [...prevData, dataFindarray];
               });
            }
            //set chatList if received messages
        }
   },[messages]);
  const addToChat = (contact) => {
    //add chat to side bar
    let combinedData = { name: contact.name, phone: contact.phone, msgs: [] };
    setChatsLists((prevData) => {
      return [...prevData, combinedData];
    });
    swal("Success", "contact added to chat", "success");
  }; //this function add contact to chat

  const selectThisChat = (contact) => {
    //set selected conversation to true and array of messages

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

  const loginForm = (e) => {
    e.preventDefault();
    if (!appData.phone.includes("+")) {
      swal("Warning", "phone must include +", "warning");
      return () => {};
    }

    setUser_id(appData.phone);
  };
  const liveSearch=(e)=> {
    
    // Locate the card elements
    const cards = document.querySelectorAll('.data_tosearch')
    // Locate the search input
    let search_query = e.target.value;
    // Loop through the cards
    for (var i = 0; i < cards.length; i++) {
    // If the text is within the card...
    if(cards[i].innerText.toLowerCase()
    // ...and the text matches the search query...
    .includes(search_query.toLowerCase())) {
    // ...remove the `.is-hidden` class.
    cards[i].classList.remove("is-hidden");
    } else {
    // Otherwise, add the class.
    cards[i].classList.add("is-hidden");
    }
    }
    }
const logOut = (e) =>{
    setUser_id(false);
}
  var sidebar_main_profile = "";
  sidebar_main_profile = (
    <>
      <div className="profile_wrapper">
      <img
                      src={employees_icon_img}
                      className={"user user_"+user_id.replace('+',"_").toLowerCase()}
                      alt="profile_pic"
                    />
      <span>{user_id}</span>
      <span className="btn_main" onClick={logOut}>logout</span>
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

    let msgData = {msg:userMessage,to:selectedChat?.phone,from:user_id,type: 'msg'};
    setMessages((prevData)=>{
        return [...prevData, msgData];
    });

    setSelectedChat({
            ...selectedChat, 
        name:selectedChat.name,phone:selectedChat.phone,chatOpen:true,msgs:[...selectedChat.msgs,msgData]});
    socket?.emit('sendMessageUser', msgData);
        setUserMessage('');
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
        {chatsLists.map((contact, index) => {
          return (
            <>
              <div className="contact_wrapper data_tosearch">
                <div
                  className="contact"
                  key={index}
                  onClick={(e) => selectThisChat(contact)}
                  title="add this to conversation"
                >
                  <img
                    src={employees_icon_img}
                    className={"user user_"+contact?.phone.replace('+',"_").toLowerCase()}
                    alt="profile_pic"
                  />
                  <span className="contact_details">
                    <h3>{contact?.name}</h3>
                    <p>{contact.phone}</p>
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
                <div className="contact_wrapper data_tosearch">
                  <div
                    className="contact"
                    key={index}
                    onClick={(e) => addToChat(contact)}
                    title="add this contact to chat"
                  >
                    <img
                      src={employees_icon_img}
                      className={"user user_"+contact?.phone.replace('+',"_").toLowerCase()}
                      alt="profile_pic"
                    />
                    <span className="contact_details">
                      <h3>{contact.name}</h3>
                      <p>{contact.phone}</p>
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

  return (
    <div className="main_app">
      <div className="flex_end">
        <div>Direct Message</div>
        <div>minimize,full</div>
      </div>
      <div className="gridTwo">
        <div className={selectedChat.chatOpen?"sidebar hide":"sidebar"}>
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

                      {tabActive.contacts && <>{sidebar_main_contacts_data}</>}
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
                    <button style={{ marginTop: "20px" }} className="btn_main">
                      login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
        <div className={selectedChat.chatOpen?"dm_msgs":"dm_msgs hide"}>
          {selectedChat.chatOpen && (
            <>
              <div className="selected_user">
                <img
                  src={cancel_chat_icon}
                  onClick={(e)=>setSelectedChat({chatOpen:false})}
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
                  <h3>{selectedChat.name}</h3>
                  <span className={"status user_"+selectedChat?.phone.replace('+',"_").toLowerCase()}>last seen: 1min ago</span>
                </div>
              </div>
              <div className="selected_msgs">
                {selectedChat.msgs?.map((msg, index)=>{
                 const lastMessage = selectedChat.msgs.length - 1 === index;

                    return (
                        <>
                       <div ref={lastMessage?setRefLast:null} className={msg.from == user_id?"msgs_wrapper fromMe data_tosearch":"msgs_wrapper data_tosearch"}>
                        <span key={index} className={msg.from == user_id?"msg fromMeMsg":"msg fromOther"}>{msg.msg}</span>
                        </div>
                        </>
                    )
                })}
              </div>
              <form onSubmit={sendMessage}>
                <div className="selected_msgs_input_send">
                  <span>file</span>
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
  );
}
