import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Login from './routes/login';
import App from './routes/app';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<App />} />
    </Route>
  )
)
// <Route path="/register" element={} />
// <Route path="/app/room/:roomID" element={} />
// <Route path="/app/game/" element={} />
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
