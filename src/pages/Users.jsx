import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Modal, Button, Col, Form, FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
// import Container from 'react-bootstrap/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CoursesMain.css';

import './Pagination.css';

const Users = () => {

    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userDetails.token}`
    }

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showadd, setShowAdd] = useState(false);
    const handleCloseAdd = () => {
        setShowAdd(false);
        clear();
        clearErrors();
    };
    const handleShowAdd = () => setShowAdd(true);

    const [eName, setEName] = useState('');
    const [ePassword, setEPassword] = useState('');
    const [eEmail, setEEmail] = useState('');


    //For filters option
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [filteredData, setFilteredData] = useState('');

    //For Adding new User
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [store, setStore] = useState('')

    //Error Handling
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [roleError, setRoleError] = useState('');
    const [storeError, setStoreError] = useState('');

    const [editNameError, setEditNameError] = useState('');
    const [editEmailError, setEditEmailError] = useState('');
    const [editPasswordError, setEditPasswordError] = useState('');
    const [editRoleError, setEditRoleError] = useState('');
    const [editStoreError, setEditStoreError] = useState('');

    //For Updating existing User
    const [editID, setEditId] = useState('')
    const [editName, setEditName] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editPassword, setEditPassword] = useState('')
    const [editRole, setEditRole] = useState('')
    const [editStore, setEditStore] = useState('')

    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    //for dropdown list
    // const [rolelist, setRolelist] = useState([{}])

    const [storeLocations, setStoreLocations] = useState({});

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;

    const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [userPerPage] = useState(5); // Adjusted to display 5 groups per page


    useEffect(() => {
        getData();
        getStoreData();
    }, []);

    const getStoreData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/Store`, { headers });
            const storeLocationMap = {};
            response.data.forEach(store => {
                storeLocationMap[store.storeID] = store.storeLocation;
            });
            setStoreLocations(storeLocationMap);
        } catch (error) {
            // console.error('Error fetching store locations', error);
        }
    }

    const getData = () => {
        axios.get(`${apiUrl}/User`, { headers })
            .then((result) => {
                const responseData = result.data;
                if (typeof responseData === 'string') {
                    setDynamicText(responseData);
                } else {
                    setData(result.data);
                }
            })
            .catch((error) => {
                // console.log(error)
            })
    }


    useEffect(() => {
        // console.log("Use effect of data");
        setFilteredData(data);
    }, [data]);

    useEffect(() => {
        if (data.length != 0) {
            // console.log("Use effect of filter");
            //update filtered data whenever search or rolefilter changes
            const filteredUsers = data.filter(user => {
                const usernameMatch = user.username.toLowerCase().includes(search.toLowerCase());
                const roleMatch = user.role.toLowerCase().includes(roleFilter.toLowerCase());

                return usernameMatch && roleMatch;
            });

            //set the filtered data
            setFilteredData(filteredUsers);
            paginate(1);
            if (filteredUsers.length === 0) {
                setDynamicText("No data found");
            } else {
                setDynamicText(lngsltd["Loading...Please wait"]);
            }
        }
    }, [search, roleFilter]);


    const handleEdit = (id) => {
        //alert(id);
        handleShow();
        axios.get(`${apiUrl}/User/${id}`, { headers })
            .then((result) => {
                setEditName(result.data.username);
                setEditEmail(result.data.userEmail);
                setEditPassword(result.data.password);
                setEditRole(result.data.role);
                setEditStore(result.data.storeID);
                setEditId(id);

            })
            .catch((error) => {
                // console.log(error)
            })

    }

    const handleDelete = (id) => {
        if (window.confirm(lngsltd["Are you sure to delete this User"] + "?") == true) {
            axios.delete(`${apiUrl}/User/${id}`, { headers })
                .then((result) => {
                    toast.success(lngsltd['User has been deleted']);
                    getData();
                    /*  if(result.status === 200)
                     {
                         alert(id);
                         toast.success('User has been deleted');
                         getData();
                     } */
                })
                .catch((error) => {
                    toast.error(error);
                })
        }
    }
    const handleUpdate = () => {
        let formIsValid = true;

        if (!editName) {
            setEditNameError(lngsltd['Name is required']);
            formIsValid = false;
        } else {
            setEditNameError('');
        }

        if (!editEmail) {
            setEditEmailError(lngsltd['Email is required']);
            formIsValid = false;
        } else if (!validateEmail(editEmail)) {
            setEditEmailError(lngsltd['Invalid email format']);
            formIsValid = false;
        } else {
            setEditEmailError('');
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;
        if (!editPassword) {
            setEditPasswordError(lngsltd['Password is required']);
            formIsValid = false;
        } else if (!passwordRegex.test(editPassword)) {
            setEditPasswordError(lngsltd['Password must contain at least 8 characters, including one uppercase, one number, and one symbol']);
            formIsValid = false;
        } else {
            setEditPasswordError('');
        }

        if (!editRole) {
            setEditRoleError(lngsltd['Role is required']);
            formIsValid = false;
        } else {
            setEditRoleError('');
        }

        if (!editStore) {
            setEditStoreError(lngsltd['StoreID is required']);
            formIsValid = false;
        } else {
            setEditStoreError('');
        }

        if (formIsValid) {
            const url = `${apiUrl}/User/${editID}`;
            const data = {
                "userID": editID,
                "username": editName,
                "userEmail": editEmail,
                "password": editPassword,
                "role": editRole,
                "storeID": editStore
            };

            axios.put(url, data, { headers })
                .then((result) => {
                    handleClose();
                    getData();
                    clear();
                    toast.success(lngsltd['User has been updated']);
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };


    const handlesend = async (id) => {
        try {
            const result = await axios.get(`${apiUrl}/User/${id}`, { headers });
            // debugger;

            setEName(result.data.username);
            setEPassword(result.data.password);
            setEEmail(result.data.userEmail);

            const emailInputs = {
                recipientEmail: result.data.userEmail,
                username: result.data.username,
                password: result.data.password
            };
            await axios.post(`${apiUrl}/User/slgemail`, emailInputs, { headers });
            toast.success(lngsltd['Email has been sent']);
        } catch (error) {
            // console.log(error);
            toast.error(lngsltd['Error sending email']);
            //toast.error(error);
        }
    }


    // const handlesend = async (id) => {
    //     try {
    //         // Fetch user data using GET request
    //         const { data: userData } = await axios.get(`${apiUrl}/User/${id}`, { headers });
    //         debugger;
    //         // Set user details to state
    //         setEName(userData.username);
    //         setEPassword(userData.password);
    //         setEEmail(userData.userEmail);

    //         // Prepare data for sending in the request body
    //         const emailData = {
    //             recipientEmail: userData.userEmail,
    //             username: userData.username,
    //             password: userData.password
    //         };

    //          // Check if all required fields are present
    //          if (!emailData.recipientEmail || !emailData.username || !emailData.password) {
    //             throw new Error("Required fields are missing in email data.");
    //         }

    //         // Send POST request with data in the request body
    //         await axios.post(`${apiUrl}/User/slgemail`, emailData, { headers });

    //         // Email sent successfully
    //         toast.success(lngsltd['Email has been sent']);
    //     } catch (error) {
    //         // Handle errors
    //         toast.error(lngsltd["Failed to send email, Please check if email address is correct"]);
    //         console.error("Failed to send email:", error);
    //     }
    // }
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };


    const handleSave = () => {
        let formIsValid = true;
        // debugger;
        if (!name) {
            setNameError(lngsltd['Name is required']);
            formIsValid = false;
        } else {
            setNameError('');
        }

        if (!email) {
            setEmailError(lngsltd['Email is required']);
            formIsValid = false;
        } else if (!validateEmail(email)) {
            setEmailError(lngsltd['Invalid email format']);
            formIsValid = false;
        } else {
            setEmailError('');
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]{8,}$/;
        if (!password) {
            setPasswordError(lngsltd['Password is required']);
            formIsValid = false;
        } else if (!passwordRegex.test(password)) {
            setPasswordError('Password must contain at least 8 characters, including one capital letter, one number, and one symbol');
            formIsValid = false;
        } else {
            setPasswordError('');
        }

        if (!role) {
            setRoleError(lngsltd['Role is required']);
            formIsValid = false;
        } else {
            setRoleError('');
        }

        if (!store) {
            setStoreError(lngsltd['StoreID is required']);
            formIsValid = false;
        } else {
            setStoreError('');
        }

        if (formIsValid) {
            // Proceed with saving the user
            const url = `${apiUrl}/User`;
            const data = {
                "userID": 0,
                "username": name,
                "userEmail": email,
                "password": password,
                "role": role,
                "StoreID": store
            };
            axios.post(url, data, { headers })
                .then((result) => {
                    handleCloseAdd();
                    getData();
                    clear();
                    toast.success(result.data);
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setRoleFilter('');
    }

    const clearErrors = () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setRoleError('');
        setStoreError('');
    };

    const clear = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setStore('');
        setEditName('');
        setEditEmail('');
        setEditPassword('');
        setEditRole('');
        setStore('');
        setEditId('');

    }

    // Pagination logic
    const indexOfLastUser = currentPage * userPerPage;
    const indexOfFirstUser = indexOfLastUser - userPerPage;
    const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    return (
        <div className='userdiv d-flex flex-column w-100 align-items-center bg-light m-2'>
            <h1>{lngsltd["List of Users"]}</h1>
            <ToastContainer 
            autoClose={2000} // Close after 2 seconds
            />

            <div className='w-100 rounded bg-white border shadow p-4 aligh-items-enter'>

                {/* Filter inputs */}
                <div className="row rounded bg-white border-bottom" >

                    <div className="col-md-3">
                        <button className='btn btn-success' onClick={() => handleShowAdd()}>{lngsltd["Add User"]}</button>
                    </div>


                    {/* Search input column */}
                    <div className="col-md-3">
                        <input type="text" className="form-control pb-2 mt-2" placeholder={lngsltd["Search by Username"]} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {/* Role filter input column */}
                    <div className="col-md-3">
                        <select className="form-control pb-2 mt-2" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="" disabled>--{lngsltd["Search by Role"]}--</option>
                            {/* <option value=""> --{lngsltd["Search by Role"]}--</option> */}
                            <option value="Account Manager">Account Manager</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Admin">Admin</option>
                            <option value="Administrative Assistant">Administrative Assistant</option>
                            <option value="Auditor">Auditor</option>
                            <option value="Benefits Administrator">Benefits Administrator</option>
                            <option value="Bookkeeper">Bookkeeper</option>
                            <option value="Brand Manager">Brand Manager</option>
                            <option value="Call Center Agent">Call Center Agent</option>
                            <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                            <option value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</option>
                            <option value="Chief Human Resources Officer (CHRO)">Chief Human Resources Officer (CHRO)</option>
                            <option value="Chief Information Officer (CIO)">Chief Information Officer (CIO)</option>
                            <option value="Chief Marketing Officer (CMO)">Chief Marketing Officer (CMO)</option>
                            <option value="TeamChief Operating Officer (COO)Lead">Chief Operating Officer (COO)</option>
                            <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                            <option value="Compensation Analyst">Compensation Analyst</option>
                            <option value="Compliance Officer">Compliance Officer</option>
                            <option value="Contract Administrator">Contract Administrator</option>
                            <option value="Controller">Controller</option>
                            <option value="Customer Service Representative">Customer Service Representative</option>
                            <option value="Customer Success Manager">Customer Success Manager</option>
                            <option value="Data Entry Clerk">Data Entry Clerk</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Database Administrator">Database Administrator</option>
                            <option value="Designer">Designer</option>
                            <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                            <option value="Director">Director</option>
                            <option value="Executive Assistant">Executive Assistant</option>
                            <option value="Financial Analyst">Financial Analyst</option>
                            <option value="Help Desk Technician">Help Desk Technician</option>
                            <option value="HR Generalist">HR Generalist</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Human Resources Assistant">Human Resources Assistant</option>
                            <option value="Inventory Manager">Inventory Manager</option>
                            <option value="TeamLegal CounselLead">Legal Counsel</option>
                            <option value="Logistics Coordinator">Logistics Coordinator</option>
                            <option value="Manager">Manager</option>
                            <option value="Marketing Coordinator">Marketing Coordinator</option>
                            <option value="Network Administrator">Network Administrator</option>
                            <option value="Office Manager">Office Manager</option>
                            <option value="Operations Manager">Operations Manager</option>
                            <option value="Paralegal">Paralegal</option>
                            <option value="Procurement Specialist">Procurement Specialist</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Recruiter">Recruiter</option>
                            <option value="Regulatory Affairs Specialist">Regulatory Affairs Specialist</option>
                            <option value="Risk Manager">Risk Manager</option>
                            <option value="Sales Manager">Sales Manager</option>
                            <option value="Sales Representative">Sales Representative</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Supply Chain Analyst">Supply Chain Analyst</option>
                            <option value="Systems Analyst">Systems Analyst</option>
                            <option value="Tax Specialist">Tax Specialist</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Technical Support Specialist">Technical Support Specialist</option>
                            <option value="Training Coordinator">Training Coordinator</option>
                            <option value="Vice President (VP)">Vice President (VP)</option>
                            <option value="Warehouse Supervisor">Warehouse Supervisor</option>
                            <option value="TeamLead">TeamLead</option>
                            <option value="User">User</option>
                            <option value="Web Developer">Web Developer</option>
                        </select>
                    </div>
                    {/* Clear filters button column */}
                    <div className="col-md-3">
                        <button className="btn btn-secondary" onClick={handleClearFilters}>{lngsltd["Clear Filters"]}</button>
                    </div>

                </div>
                <br></br>

                <Table striped bordered hover size="sm" className="text-center" responsive="sm" >
                    <thead className="thead-dark">
                        <tr>
                            <th className="text-center">#</th>
                            {/* <th className="text-center">User ID</th> */}
                            <th className="text-center">{lngsltd["User Name"]}</th>
                            <th className="text-center">{lngsltd["User Email"]}</th>
                            {<th className="text-center">{lngsltd["User Password"]}</th>}
                            <th className="text-center">{lngsltd["User Role"]}</th>
                            <th className="text-center">{lngsltd["Store Location"]}</th>
                            <th className="text-center">{lngsltd["Actions"]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* change filteredData to currentUsers for pagination  */}
                        {
                           currentUsers && currentUsers.length > 0 ?
                           currentUsers.map((d, i) => (
                               <tr key={i}>
                                        <td className="text-center">{indexOfFirstUser + i + 1}</td>
                                        {/* <td className="text-center">{d.username}</td> */}
                                        <td className="text-center">{d.username}</td>
                                        <td className="text-center">{d.userEmail}</td>
                                        <td className="text-center">{d.password}</td>
                                        <td className="text-center">{d.role}</td>
                                        <td className="text-center">{storeLocations[d.storeID]}</td>
                                        <td className="text-center">
                                            {/* <button className='btn btn-sm btn-primary' onClick={() => handleEdit(d.userID)}>{lngsltd["Edit"]}</button>
                                            <button className='btn btn-sm btn-danger ' onClick={() => handleDelete(d.userID)}>{lngsltd["Delete"]}</button>
                                            <button className='btn btn-sm btn-info ' onClick={() => handlesend(d.userID)}>{lngsltd["Send"]}</button> */}

                                            <button className='btn btn-outline-secondary rounded-pill px-2 me-2 btn-sm' onClick={() => handleEdit(d.userID)}>{lngsltd["Edit"]}</button>
                                            <button className='btn btn-outline-secondary rounded-pill px-2 me-2 btn-sm' onClick={() => handleDelete(d.userID)}>{lngsltd["Delete"]}</button>
                                            <button className='btn btn-outline-secondary rounded-pill px-2 me-2 btn-sm' onClick={() => handlesend(d.userID)}>{lngsltd["Send"]}</button>
                                        </td>
                                    </tr>
                                )

                                )
                                :
                                <tr><td colSpan={"7"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}>{dynamicText}</h4></td></tr>
                        }
                    </tbody>
                </Table>


                {/* pagination code */}
                
                <div className="paginat-container">
                    <div className="paginat justify-content-center">
                        <div className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <span className="page-link" onClick={() => paginate(currentPage - 1)}>
                                &laquo;
                            </span>
                        </div>
                        {Array.from({ length: Math.ceil(filteredData.length / userPerPage) }, (_, i) => (
                            <div key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <span className="page-link" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                        <div className={`page-item ${currentPage === Math.ceil(filteredData.length / userPerPage) ? 'disabled' : ''}`}>
                            <span className="page-link" onClick={() => paginate(currentPage + 1)}>
                                &raquo;
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Modal pop for updating user */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                    <Modal.Title>{lngsltd["Update details"]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <FormGroup>
                            <FormLabel>{lngsltd["Name"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="text"
                                placeholder={lngsltd["Enter Name"]}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled
                            />
                            <div className="text-danger">{editNameError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Email"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="text"
                                placeholder={lngsltd["Enter UserEmail"]}
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                disabled

                            />
                            <div className="text-danger">{editEmailError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Password"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="text"
                                placeholder={lngsltd["Enter Password"]}
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                            />
                            <div className="text-danger">{editPasswordError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Role"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                as="select"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                            >



                                {/* <option value=""> --Select Role--</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Information Officer">Information Officer</option>
                                    <option value="User">User</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR">HR</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="TeamLead">TeamLead</option> */}



                                <option value=""> --{lngsltd["Select Role"]}--</option>
                                <option value="Account Manager">Account Manager</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Admin">Admin</option>
                                <option value="Administrative Assistant">Administrative Assistant</option>
                                <option value="Auditor">Auditor</option>
                                <option value="Benefits Administrator">Benefits Administrator</option>
                                <option value="Bookkeeper">Bookkeeper</option>
                                <option value="Brand Manager">Brand Manager</option>
                                <option value="Call Center Agent">Call Center Agent</option>
                                <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                                <option value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</option>
                                <option value="Chief Human Resources Officer (CHRO)">Chief Human Resources Officer (CHRO)</option>
                                <option value="Chief Information Officer (CIO)">Chief Information Officer (CIO)</option>
                                <option value="Chief Marketing Officer (CMO)">Chief Marketing Officer (CMO)</option>
                                <option value="TeamChief Operating Officer (COO)Lead">Chief Operating Officer (COO)</option>
                                <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                                <option value="Compensation Analyst">Compensation Analyst</option>
                                <option value="Compliance Officer">Compliance Officer</option>
                                <option value="Contract Administrator">Contract Administrator</option>
                                <option value="Controller">Controller</option>
                                <option value="Customer Service Representative">Customer Service Representative</option>
                                <option value="Customer Success Manager">Customer Success Manager</option>
                                <option value="Data Entry Clerk">Data Entry Clerk</option>
                                <option value="Data Scientist">Data Scientist</option>
                                <option value="Database Administrator">Database Administrator</option>
                                <option value="Designer">Designer</option>
                                <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                                <option value="Director">Director</option>
                                <option value="Executive Assistant">Executive Assistant</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                                <option value="Help Desk Technician">Help Desk Technician</option>
                                <option value="HR Generalist">HR Generalist</option>
                                <option value="HR Manager">HR Manager</option>
                                <option value="Human Resources Assistant">Human Resources Assistant</option>
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="TeamLegal CounselLead">Legal Counsel</option>
                                <option value="Logistics Coordinator">Logistics Coordinator</option>
                                <option value="Manager">Manager</option>
                                <option value="Marketing Coordinator">Marketing Coordinator</option>
                                <option value="Network Administrator">Network Administrator</option>
                                <option value="Office Manager">Office Manager</option>
                                <option value="Operations Manager">Operations Manager</option>
                                <option value="Paralegal">Paralegal</option>
                                <option value="Procurement Specialist">Procurement Specialist</option>
                                <option value="Receptionist">Receptionist</option>
                                <option value="Recruiter">Recruiter</option>
                                <option value="Regulatory Affairs Specialist">Regulatory Affairs Specialist</option>
                                <option value="Risk Manager">Risk Manager</option>
                                <option value="Sales Manager">Sales Manager</option>
                                <option value="Sales Representative">Sales Representative</option>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Supply Chain Analyst">Supply Chain Analyst</option>
                                <option value="Systems Analyst">Systems Analyst</option>
                                <option value="Tax Specialist">Tax Specialist</option>
                                <option value="Team Lead">Team Lead</option>
                                <option value="Technical Support Specialist">Technical Support Specialist</option>
                                <option value="Training Coordinator">Training Coordinator</option>
                                <option value="Vice President (VP)">Vice President (VP)</option>
                                <option value="Warehouse Supervisor">Warehouse Supervisor</option>
                                <option value="TeamLead">TeamLead</option>
                                <option value="User">User</option>
                                <option value="Web Developer">Web Developer</option>
                            </FormControl>
                            <div className="text-danger">{editRoleError}</div>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>{lngsltd["Store Location"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                as="select"
                                value={editStore}
                                onChange={(e) => setEditStore(e.target.value)}
                            >
                                {/* <option value=""> --Select Store Location--</option> */}
                                {Object.keys(storeLocations).map((storeID) => (
                                    <option key={storeID} value={storeID}>{storeLocations[storeID]}</option>
                                ))}

                            </FormControl>
                            <div className="text-danger">{editStoreError}</div>
                        </FormGroup>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleUpdate}>
                        {lngsltd["Save"]}
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        {lngsltd["Cancel"]}
                    </Button>

                </Modal.Footer>
            </Modal>



            {/* Modal pop for adding new user */}
            <Modal show={showadd} onHide={handleCloseAdd}>
                <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                    <Modal.Title>{lngsltd["Add User"]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <FormGroup>
                            <FormLabel>{lngsltd["Name"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="text"
                                placeholder={lngsltd["Enter Name"]}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div className="text-danger">{nameError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Email"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="text"
                                placeholder={lngsltd["Enter Email"]}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="text-danger">{emailError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Password"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                type="password"
                                placeholder={lngsltd["Enter Password"]}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="text-danger">{passwordError}</div>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>{lngsltd["Role"]}<span style={{ color: 'red' }}>*</span></FormLabel>
                            <FormControl
                                as="select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}

                            >
                                <option value=""> --{lngsltd["Select Role"]}--</option>
                                <option value="Account Manager">Account Manager</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Admin">Admin</option>
                                <option value="Administrative Assistant">Administrative Assistant</option>
                                <option value="Auditor">Auditor</option>
                                <option value="Benefits Administrator">Benefits Administrator</option>
                                <option value="Bookkeeper">Bookkeeper</option>
                                <option value="Brand Manager">Brand Manager</option>
                                <option value="Call Center Agent">Call Center Agent</option>
                                <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                                <option value="Chief Financial Officer (CFO)">Chief Financial Officer (CFO)</option>
                                <option value="Chief Human Resources Officer (CHRO)">Chief Human Resources Officer (CHRO)</option>
                                <option value="Chief Information Officer (CIO)">Chief Information Officer (CIO)</option>
                                <option value="Chief Marketing Officer (CMO)">Chief Marketing Officer (CMO)</option>
                                <option value="TeamChief Operating Officer (COO)Lead">Chief Operating Officer (COO)</option>
                                <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                                <option value="Compensation Analyst">Compensation Analyst</option>
                                <option value="Compliance Officer">Compliance Officer</option>
                                <option value="Contract Administrator">Contract Administrator</option>
                                <option value="Controller">Controller</option>
                                <option value="Customer Service Representative">Customer Service Representative</option>
                                <option value="Customer Success Manager">Customer Success Manager</option>
                                <option value="Data Entry Clerk">Data Entry Clerk</option>
                                <option value="Data Scientist">Data Scientist</option>
                                <option value="Database Administrator">Database Administrator</option>
                                <option value="Designer">Designer</option>
                                <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                                <option value="Director">Director</option>
                                <option value="Executive Assistant">Executive Assistant</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                                <option value="Help Desk Technician">Help Desk Technician</option>
                                <option value="HR Generalist">HR Generalist</option>
                                <option value="HR Manager">HR Manager</option>
                                <option value="Human Resources Assistant">Human Resources Assistant</option>
                                <option value="Inventory Manager">Inventory Manager</option>
                                <option value="TeamLegal CounselLead">Legal Counsel</option>
                                <option value="Logistics Coordinator">Logistics Coordinator</option>
                                <option value="Manager">Manager</option>
                                <option value="Marketing Coordinator">Marketing Coordinator</option>
                                <option value="Network Administrator">Network Administrator</option>
                                <option value="Office Manager">Office Manager</option>
                                <option value="Operations Manager">Operations Manager</option>
                                <option value="Paralegal">Paralegal</option>
                                <option value="Procurement Specialist">Procurement Specialist</option>
                                <option value="Receptionist">Receptionist</option>
                                <option value="Recruiter">Recruiter</option>
                                <option value="Regulatory Affairs Specialist">Regulatory Affairs Specialist</option>
                                <option value="Risk Manager">Risk Manager</option>
                                <option value="Sales Manager">Sales Manager</option>
                                <option value="Sales Representative">Sales Representative</option>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Supply Chain Analyst">Supply Chain Analyst</option>
                                <option value="Systems Analyst">Systems Analyst</option>
                                <option value="Tax Specialist">Tax Specialist</option>
                                <option value="Team Lead">Team Lead</option>
                                <option value="Technical Support Specialist">Technical Support Specialist</option>
                                <option value="Training Coordinator">Training Coordinator</option>
                                <option value="Vice President (VP)">Vice President (VP)</option>
                                <option value="Warehouse Supervisor">Warehouse Supervisor</option>
                                <option value="TeamLead">TeamLead</option>
                                <option value="User">User</option>
                                <option value="Web Developer">Web Developer</option>
                            </FormControl>
                            <div className="text-danger">{roleError}</div>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>{lngsltd["Store Location"]}</FormLabel>
                            <FormControl
                                as="select"
                                value={store}
                                onChange={(e) => setStore(e.target.value)}
                            >
                                <option value="" disabled> --Select Store Location--</option>
                                {Object.keys(storeLocations).map((storeID) => (
                                    <option key={storeID} value={storeID}>{storeLocations[storeID]}</option>
                                ))}
                            </FormControl>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleSave}>
                        {lngsltd["Add"]}
                    </Button>
                    <Button variant="secondary" onClick={handleCloseAdd}>
                        {lngsltd["Cancel"]}
                    </Button>
                </Modal.Footer>
            </Modal>
            <div style={{ height: "25px", display: "block" }}>

            </div>
        </div>
    )

}

export default Users