import './../styles/style.css'
import Button from './button'
import Icon from './icon'

import { useState } from 'react'

function Header() {
    const [sideBarVisible, setSideBarVisible] = useState(false)

    function redirectTo(path) {
        window.location.replace(path)
    }
    return <div>
        <div className='Header'>
            <div className="logoContainer" onClick={() => redirectTo('/')}>
                <Icon className="h-50 logo" name={"logowithname"}/>
            </div>
            <div className="items">
                <div className='item' onClick={() => redirectTo('/news')}>News</div>
                <div className='item' onClick={() => redirectTo('/about')}>About</div>
                <div className='item' onClick={() => redirectTo('/help')}>Help</div>
            </div>
            <div className="menuBtnContainer" onClick={()=> setSideBarVisible(!sideBarVisible)}>
                <Icon className="menuBtn" name="menu"/>
            </div>
            <Button text="Go to app" notransform color="red" className="gotoappButton"/>
        </div>
        <div className={`sideBar ${sideBarVisible ? 'active' : ''}`}>
            <div className='item' onClick={() => redirectTo('/news')}>News</div>
            <div className='item' onClick={() => redirectTo('/about')}>About</div>
            <div className='item' onClick={() => redirectTo('/help')}>Help</div>
        </div>
    </div>
}

export default Header