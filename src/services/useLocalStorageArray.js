import React,{useState,useEffect} from 'react'


const PREFIX = 'dmapp-';
export default function useLocalStorageArray(key, initialValue) {
    const prefixedKey  = PREFIX + key;

    const [value, setValue] = useState(()=>{
        const jsonValue = localStorage.getItem(prefixedKey);
        if(jsonValue !== null) return JSON.parse(jsonValue)
        if(typeof initialValue === 'function'){
          return initialValue()
        }else{
          return initialValue?initialValue:[]
        }
    });

    useEffect(()=>{
      if(value === null) return ()=>{
    //   localStorage.removeItem(prefixedKey);
      }
      localStorage.setItem(prefixedKey, JSON.stringify(value?value:[]));
    }, [prefixedKey,value]);


  return  [value, setValue];
}
