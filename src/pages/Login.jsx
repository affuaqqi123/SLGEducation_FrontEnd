import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import '../App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import englishFlag from '../Assets/United-Kingdom-Flag.png';
import norwegian from '../Assets/NorwegianFlag.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import logger from '../utils/logger';
// import sha256 from 'crypto-js/sha256';




function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [culture, setCulture] = useState('en-US');


    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // const logger = require('../utils/logger.js');


    // const [localizedStrings, setLocalizedStrings] = useState({});
    const [localizedStrings, setLocalizedStrings] = useState({ "Login": "Login", "UserName": "UserName", "Password": "Password", "Enter your username": "Enter your username", "Enter your password": "Enter your password" });
    localStorage.setItem('isLoggedIn', 'null');

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;


    useEffect(() => {
        // Fetch localized strings when component mounts
        fetchLocalizedStrings(culture);
    }, [culture]); // Fetch data only once when component mounts

    const fetchLocalizedStrings = async (culture) => {
        try {
            const response = await axios.get(`${apiUrl}/Localization/${culture}`, {
                headers: {
                    'Accept-Language': culture,
                    // 'Access-Control-Allow-Origin': '*',
                    // 'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    // 'Access-Control-Max-Age': '3600',
                    // 'Access-Control-Allow-Headers': 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With'

                }
            });
            setLocalizedStrings(response.data);
            localStorage.setItem('languageSelected', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            // toast.error('Error fetching data:', error);
            toast.error(localizedStrings['Something went wrong while loading the page'], error);
        }
    };
    const lang = useMemo(() => localizedStrings, [localizedStrings]);

    const handleLogin = e => {
        e.preventDefault();

        // Encrypt the password using SHA-256 hash function
        // const encryptedPassword = sha256(password).toString();
        //     axios.post(`${apiUrl}/Login`, { username, password:encryptedPassword })
        axios.post(`${apiUrl}/Login`, { username, password })
            .then(response => {
                localStorage.setItem('userDetails', JSON.stringify(response.data));
                setLoggedIn(true);
                props.setLoggedIn(true);
                localStorage.setItem('isLoggedIn', JSON.stringify(true));
                navigate('/home');
            })
            .catch(error => {
                if (error.response) {
                toast.error(localizedStrings['Please enter valid UserName and Password']);
                }
                else if (error.request) {
                    // The request was made but no response was received
                    // console.error('No response received from server:', error.request);
                    // toast.error(localizedStrings['No response received from server. Please try again later.']);
                    toast.error('No response received from server. Please try again later.');
                }
                // logger.error('This is an error message');    
                // logger.error('An error occurred');                      
                // toast.error(error);
                //console.error(error);
                props.setLoggedIn(false);
            });
    };



    return (
        <div className="vh-100 d-flex flex-column">
            <div className='loginheader' style={{ color: "red" }}>SKEIDAR LIVING |<span style={{ color: "white",height:'5vh' }}> GROUP</span></div>
            <ToastContainer
                position="bottom-right" // Position at the bottom right corner
                autoClose={2000} // Close after 2 seconds
                // hideProgressBar={false} // Show progress bar
                newestOnTop={false} // Display newer notifications below older ones
                closeOnClick // Close the notification when clicked
            />
            {/* <div className='btncltrs' style={{float:'right'}}>
                <button className='btnenglish' onClick={() => setCulture('en-US')}>English</button>
                <button className='btnnorwagian' onClick={() => setCulture('nb-NO')}>Norwegian</button>
            </div> */}
            <div className='btncltrs' style={{ height:'5vh',minHeight:'40px' }}>
                <div className='button-wrapper' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className='btnenglish' onClick={() => setCulture('en-US')} style={{
                        backgroundImage: `url(${englishFlag})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        width: '60px',
                        height: '30px'
                    }}
                        title="English"
                    >

                    </button>
                    <button className='btnnorwagian' onClick={() => setCulture('nb-NO')}
                        style={{
                            backgroundImage: `url(${norwegian})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            width: '60px',
                            height: '30px'
                        }}  
                        title="Norwegian"
                    ></button>
                </div>
            </div>
            <Container fluid className="cntnr d-flex align-items-center justify-content-center " style={{ backgroundColor: 'white', minHeight: '90vh' }}>
                {/* <h1>{localizedStrings.Welcome}</h1> */}
                {/* <p>{localizedStrings.Sorry}</p> */}

                <Row style={{ maxWidth: '600px' }} className="loginbox justify-content-md-center mt-1 w-100 border border-2">
                    <Col xs={12} md={6} style={{ maxWidth: '600px' }} >
                        {/* <h2 className="logintitle text-center">{lang.Login}</h2> */}
                        <Form onSubmit={handleLogin}>
                            <Form.Group controlId="formUsername">
                                <Form.Label>{lang.UserName}:</Form.Label>
                                <Form.Control
                                    className='border border-4'
                                    type="text"
                                    placeholder={localizedStrings["Enter your username"]}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                // autoComplete='off'
                                />
                            </Form.Group>

                            <Form.Group controlId="formPassword">
                                <Form.Label className='mt-3'>{lang.Password}:</Form.Label>
                                <div className="input-group ">
                                    <Form.Control
                                        className='border border-4 border-end-0'
                                        type={passwordVisible ? 'text' : 'password'}
                                        placeholder={localizedStrings["Enter your password"]}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="off"

                                    />
                                    {/* <div className="input-group-append"> */}
                                    <span className="input-group-text border-4 bg-white" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                    {/* </div> */}
                                </div>
                            </Form.Group>
                            <div className='text-center '>
                                <Button type="submit" variant='none' className='btnlgn btn btn-outline-secondary rounded-pill px-4'>
                                    {localizedStrings.Login}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div >
    );
}

export default Login;