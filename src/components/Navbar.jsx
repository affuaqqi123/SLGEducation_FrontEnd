import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavbarFooter.css';
import companylogo from '../Assets/skeidar-logo_white.webp';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', JSON.stringify(false));
    
    onLogout();
    navigate('/');
    window.location.reload();
  };
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const lngsltd=JSON.parse(localStorage.getItem('languageSelected'));
  const textStyle = {
    textDecoration: 'none !important',
    
    
  };
  return (
    <div className='headerpage'>
      <div className='navbar'>
        {/* <img src="../Assets/skeidar-logo_white.webp" alt="Skeidar" className='logo' /> */}
        {/* <img src={companylogo} alt="Skeidar" className='logo' /> */}
        <h2 style={{color:"white",fontWeight:"800",marginLeft:"20px"}}>S K E I D A R</h2>
        <ul>
          <li>
            <span style={textStyle}> {lngsltd["Welcome"]}</span>
            <span style={{marginLeft: "10px" }}>{userDetails ? userDetails.userName : 'User'}</span>
          </li>
          <li>
            <button className="btn btn-light p-1" onClick={handleLogout}>
            {lngsltd["Logout"]}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
