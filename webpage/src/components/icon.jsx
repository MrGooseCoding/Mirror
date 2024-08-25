import './../styles/style.css'
import Logo from './../assets/icons/logo.svg?react'
import Logowithname from './../assets/icons/logowithname.svg?react'
import AddCircleFilled from './../assets/icons/add-circle-filled.svg?react'
import AddCircleOutline from './../assets/icons/add-circle-outline.svg?react'
import JoinFilled from './../assets/icons/join-filled.svg?react'
import JoinOutline from './../assets/icons/join-outline.svg?react'
import PersonFilled from './../assets/icons/person-filled.svg?react'
import PersonOutline from './../assets/icons/person-outline.svg?react'

function Icon({ name, color, className}) {
  switch (name) {
    case "logo":
      return <Logo className={`logo ${className}`}/>
    case "logowithname":
      return <Logowithname className={`logo ${className}`}/>
    case "add-circle-filled":
      return <AddCircleFilled className={`${className}`}/>
    case "add-circle-outline":
      return <AddCircleOutline className={`${className}`}/> 
    case "join-filled":
      return <JoinFilled className={`${className}`}/>
    case "join-outline":
      return <JoinOutline className={`${className}`}/>
    case "person-filled": 
      return <PersonFilled className={`${className}`}/>
    case "person-outline":
      return <PersonOutline className={`${className}`}/>
  }
}

/* v2
const icons  = {
  "logo": Logo,
  "logowithname": Logowithname,
  "add-circle-filled": AddCircleFilled,
  "add-circle-outline": AddCircleOutline,
  "download-filled": DownloadFilled,
  "download-outline": DownloadOutline,
  "person-filled": PersonFilled,
  "person-outline": PersonOutline,
}

function Icon({ name, color, className}) {
  const Component = icons[name]

  return <Component/>
}
*/

export default Icon