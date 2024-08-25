import { useState } from 'react'
import './../styles/style.css'
import { useNavigate } from "react-router-dom";
import Icon from './icon'

function NavBar({ items }) {
    const [ selected, setSelected ] = useState()

    const navigate = useNavigate()

    function onClick(e) {
        e.preventDefault()
        const element = e.currentTarget
        const path = element.id
        setSelected(path)
        navigate(path)
    }

    return <div className='NavBar'>
        {
            items.map((v, i, arr) => {
                const iconType = selected == v[2] ? 'filled' : 'outline'
                return <div className='item' key={v[2]} id={v[2]} onClick={onClick}>
                    <Icon className='icon' name={`${v[0]}-${iconType}`}/>
                    <div className='name'>{v[1]}</div>
                </div>
            })
        }
    </div>
}

export default NavBar