import React, { useState } from 'react';
import './Sidebar.css';
import {
    FaTh,
    FaBars,
    FaUser,
    FaUsers,
    FaPeopleRoof,
    FaChalkboard,
    FaGraduationCap,
    FaHome,
    FaUserGroup,
    FaObjectGroup,
    FaLayerGroup
} from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
// import { Tooltip as ReactTooltip } from 'react-tooltip';


const Sidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const userRole = userDetails.role;
    const headers = { 'Authorization': userDetails.token }; // auth header with bearer token
    const [scrollPosition, setScrollPosition] = useState(0);


    
    
    let menuItem;

    if (userRole === 'Admin') {
        menuItem = [
            {
                path: "/home",
                name: "Home",
                icon: <FaHome />,
                tooltip: "Home",
                backgroundColor: "blue"
            },
            {
                path: "/groups",
                name: "Groups",
                icon: <FaLayerGroup/>,
                tooltip: "Groups",

            },
            {
                path: "/users",
                name: "Users",
                icon: <FaUser />,
                tooltip: "Users"
            },
            {
                path: "/quiz",
                name: "Quiz",
                icon: <FaGraduationCap />,
                tooltip: "Quiz"
            },
            {
                path: "/usergroup",
                name: "UserGroup",
                icon: <FaUsers />,
                tooltip: "UserGroup"
            },
            {
                path: "/courses",
                name: "Courses",
                icon: <FaChalkboard />,
                tooltip: "Courses"
            }


        ];
    } else {
        menuItem = [
            {
                path: "/home",
                name: "Home",
                icon: <FaHome />,
                tooltip: "Home"
            },
            {
                path: "/courses",
                name: "Courses",
                icon: <FaChalkboard />,
                tooltip: "Courses"
            }
        ];
    }
    return (

        <div className="cont">

            {/* style={{display: isOpen ? "none" : "block" }} */}
            <div className="bar1" style={{ display: isOpen ? "none" : "", borderRadius: "00%", padding: "1px" }} >
                <FaBars onClick={toggle} style={{ fontSize: '17px', color: 'whitesmoke' }} />
            </div>

            <Tooltip id="my-tooltip" style={{ zIndex: 9999 }} opacity={1} border="1px solid red" />
            <div style={{ width: isOpen ? "200%" : "100%", display: isOpen ? "block" : "" }} className="sideb">
                <div className="top_section">
                    <div className="bar2">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {
                    menuItem.map((item, index) => (

                        <NavLink to={item.path} key={index} className="link" activeclassname="active" title={item.tooltip}>
                            <div className="icon icon-box" onClick={close}>{item.icon} </div>
                            <div style={{ display: isOpen ? "block" : "none" }} className="link_text" onClick={toggle}>{item.name}</div>
                        </NavLink>
                    ))
                }

            </div>

            <main>{children}</main>
        </div>
    );
};

export default Sidebar;