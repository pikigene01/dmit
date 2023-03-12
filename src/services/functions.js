
import useLocalStorageArray from "./useLocalStorage";


export const AddMessageFunction = async(msg,type,user_id) =>{
   const [messages,setMessages] = useLocalStorageArray('messages');

if(!msg || !type) return ()=>{}

let messageData = {msg,type,user_id,created_at: ''};

    let setData = await setMessages((prevData)=>{
            return [...prevData,messageData];
        });
 return messages;

}