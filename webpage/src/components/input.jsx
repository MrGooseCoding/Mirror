import { useState } from 'react'
import './../styles/style.css'

function Input({ label, placeholder, onChange, type, error }) {
  if (type == "text" || type == "password") {
    return (
      <div>
        <div className='label'>{label}</div>
        <div className={`errorWrapper ${error ? 'errorActive' : ''}`}>
          <div className='inputWrapper'>
              <input placeholder={placeholder} type={type}
                onChange={onChange}/>
          </div>
          <div className={`error ${error ? 'visible' : ''}`}>{error ? error : '.'}</div>
        </div>
      </div>
    )

  } 
  if ( type == "textarea" ) {
    return <div>
      <div className='label'>{label}</div>
      <div className={`errorWrapper ${error ? 'errorActive' : ''}`}>
          <div className='inputWrapper'>
              <textarea placeholder={placeholder} onChange={onChange}/>
          </div>
          <div className={`error ${error ? 'visible' : ''}`}>{error ? error :
            <div>
              .
              <br/>
              .
            </div>
          }</div>
      </div>
    </div>
  }
}

export default Input