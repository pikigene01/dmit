import React from 'react'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'

export default function WholeApp({socket}) {
  return (
    <div className='dm_wrapper'>
        <Header socket={socket} />
        <Main socket={socket}/>
        <Footer socket={socket}/>
    </div>
  )
}
