import React, { useState } from "react";
import { contacts_icon_img, messages_icon_img, settings_icon_img, websites_icon_img } from "../services/icons";

export default function Main() {
  const [appData, setAppData] = useState({
    search: "",
  });
  const [settings,setSettings] = useState(false);

  const handleChange = (e) => {
    setAppData({ ...appData, [e.target.name]: e.target.value });
  };




  var sidebar_main_profile = "";
  sidebar_main_profile = (
    <>
    <h3>Profile</h3>
    </>
  )


  var sidebar_main_chat = "";
  sidebar_main_chat = (
    <div className="tabs">
    <span className="tab active">
      <img src={messages_icon_img} className="chats icon" alt="messages" />
      <p>Chats</p>
    </span>
    <span className="tab">
      <img src={contacts_icon_img} className="contacts icon" alt="contacts" />
      <p>Contacts</p>

    </span>
  </div>
  );




  return (
    <div className="main_app">
      <div className="flex_end">
        <div>Direct Message</div>
        <div>minimize,full</div>
      </div>
      <div className="gridTwo">
        <div className="sidebar">
          <div className="search_head">
            <div className="search_input">
              <input
                type="text"
                value={appData?.search}
                onChange={handleChange}
                name="search"
                placeholder="search"
              />
              <img src={websites_icon_img} className="website icon" alt="search" />
              <span></span>
            </div>
            <div className="head_settings" onClick={(e)=>setSettings(!settings)}>
              <img src={settings_icon_img} className="settings" alt="settings" />
            </div>
          </div>
          <div className="sidebar_main">
         {settings && (
            <>
            {sidebar_main_profile}
            </>
         )}
         {!settings && (
            <>
            {sidebar_main_chat}
            </>
         )}

          </div>
        </div>
        <div className="dm_msgs">Messages Wrapper</div>
      </div>
    </div>
  );
}
