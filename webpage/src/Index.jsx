import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Login from './routes/login';
import App from './routes/app/app';
import JoinRoom from './routes/app/joinRoom'
import CreateRoom from './routes/app/createRoom'
import Room from './routes/app/room'
import Profile from './routes/app/profile'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" key='index'>
      <Route path="/login" element={<Login />} key={'login'} />
      <Route path="/app" element={<App />} key={'app'} 
        children={[
          <Route path="/app/joinRoom/" element={<JoinRoom/>} key={'joinRoom'}/>,
          <Route path="/app/createRoom/" element={<CreateRoom/>} key={'createRoom'}/>,
          <Route path="/app/room/:roomId" element={<Room/>} key={'room'}/>,
          <Route path="/app/profile/" element={<Profile/>} key={'profile'}/>,
          // <Route path="/app/game/" element={} />

        ]}/>
    </Route>
  )
)
// <Route path="/register" element={} />
// <Route path="/" element={} />

// <Route index element={<Home />} />
function Index({routes}) {
  return (
    <div className='flex-1'>
      <RouterProvider router={router}/>
    </div>
  );
}

export default Index;
