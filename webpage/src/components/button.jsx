import { useState } from 'react'
import './../styles/style.css'

function Button({ id, text, color, onClick, children, selected }) {
  return (
    <div className={`Button ${color} ${selected ? 'selected': ''}`}>
        <div className='exterior'>
            <div className='interior' id={id} onClick={onClick}>
                { text }
                { children }  
            </div>
        </div>
    </div>
  )
}

export default Button