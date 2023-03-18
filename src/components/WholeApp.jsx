import React from 'react'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'

export default function WholeApp() {
  return (
    <div className='dm_wrapper'>
        <Header />
        <Main/>
        <Footer/>
    </div>
  )
}
