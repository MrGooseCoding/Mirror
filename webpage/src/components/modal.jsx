import { useState } from 'react'
import './../styles/style.css'
import Icon from './icon'

function Modal({ title, children, hidden, dominant, onCloseBtn }) {
  return (
    <div>
      <div className={!hidden & dominant ? `disable-outside-clicks`: ''}></div>
      <div className={`Modal ${hidden ? 'hidden' : ''} ${dominant ? 'dominant' : ''}`}>
        <div className='top'>
          { title && <div className='title'>{title}</div> }
          { onCloseBtn && <div onClick={onCloseBtn}>
            <Icon name="close" className="icon"/>
          </div> }
        </div>
        <div className="slidesWrapper">
          { children }
        </div>
      </div>
    </div>
  )
}

export default Modal