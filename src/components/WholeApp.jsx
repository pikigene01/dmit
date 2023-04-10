import React from 'react'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'
import { AppProvider } from '../contexts/AppProvider'

export default function WholeApp({socket}) {
 
  return (
    <AppProvider socket={socket}>
    <div className='dm_wrapper'>
        <Header />
        <Main/>
        <Footer/>
    </div>
    </AppProvider>
  )
}
