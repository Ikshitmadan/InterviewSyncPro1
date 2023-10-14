import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export const privateRoutes = () => {

  const UserId=localStorage.getItem('userId')|| true;

    return UserId ? <Outlet/> : <Navigate to="/signin"/>
 
 


}
