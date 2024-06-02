import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Pagination.css';

const UserGroups = () => {

    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userDetails.token}`
    }

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showAdd, setShowAdd] = useState(false);
    const handleCloseAdd = () => setShowAdd(false);
    const handleShowAdd = () => setShowAdd(true);

    // For filters option
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState('');

    // For Adding new UserGroup
    const [userID, setUserID] = useState('');
    const [groupID, setGroupID] = useState('');

    // For Updating existing UserGroup
    const [editID, setEditID] = useState('');
    const [editUserID, setEditUserID] = useState('');
    const [editGroupID, setEditGroupID] = useState('');

    const [userData, setUserData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;
    const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [userGroupPerPage] = useState(5); // Adjusted to display 5 groups per page


    useEffect(() => {
        getData();
        fetchUserData();
        fetchGroupData();
    }, []);

    const getData = () => {
        axios.get(`${apiUrl}/UserGroup`, { headers })
            .then((result) => {
                const responseData = result.data;
                if (typeof responseData === 'string') {
                    setDynamicText(responseData);
                } else {
                    setData(result.data);
                    clear();
                }  
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const fetchUserData = () => {
        axios.get(`${apiUrl}/User`, { headers })
            .then((result) => {
                setUserData(result.data);
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const fetchGroupData = () => {
        axios.get(`${apiUrl}/Group`, { headers })
            .then((result) => {
                setGroupData(result.data);
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const getUserById = (userId) => {
        const user = userData.find((user) => user.userID === userId);
        return user ? user.username : lngsltd['No User Found'];
    };

    const getGroupById = (groupId) => {
        const group = groupData.find((group) => group.groupID === groupId);
        return group ? group.groupName : lngsltd['No Group Found'];
    };


    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    useEffect(() => {
        if (data.length != 0) {
        const filteredUserGroups = data.filter((userGroup) => {
            const userName = getUserById(userGroup.userID).toLowerCase();
            const groupName = getGroupById(userGroup.groupID).toLowerCase();
            const searchLower = search.toLowerCase();

            return userName.includes(searchLower) || groupName.includes(searchLower);
        });
        setFilteredData(filteredUserGroups);
        paginate(1);
        if (filteredUserGroups.length === 0) {
            setDynamicText("No data found");
        } else {
            setDynamicText(lngsltd["Loading...Please wait"]);
        }
    }
    }, [search]);



    const handleEdit = (id) => {
        handleShow();
        axios.get(`${apiUrl}/UserGroup/${id}`, { headers })
            .then((result) => {
                setEditUserID(result.data.userID);
                setEditGroupID(result.data.groupID);
                setEditID(id);
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm(lngsltd['Are you sure to delete this UserGroup?'])) {
            axios.delete(`${apiUrl}/UserGroup/${id}`, { headers })
                .then(() => {
                    toast.success(lngsltd['UserGroup has been deleted']);
                    getData();
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };

    const handleUpdate = () => {
        const url = `${apiUrl}/UserGroup/${editID}`;
        const updatedData = {
            userGroupID: editID,
            userID: editUserID,
            groupID: editGroupID,
        };

        axios.put(url, updatedData, { headers })
            .then(() => {
                handleClose();
                getData();
                clear();
                toast.success(lngsltd['UserGroup has been updated']);
            })
            .catch((error) => {
                toast.error(error);
            });
    };

    const handleSave = () => {
        const url = `${apiUrl}/UserGroup`;
        const newData = {
            userID,
            groupID,
        };

        axios.post(url, newData, { headers })
            .then(() => {
                handleCloseAdd();
                getData();
                clear();
                toast.success(lngsltd['UserGroup has been added']);
            })
            .catch((error) => {
                // toast.error(lngsltd["Please make sure User is not assigned to any other Group"]);
                toast.error("Please make sure User is not assigned to any other Group");
            });
    };

    const handleClearFilters = () => {
        setSearch('');
    };

    const clear = () => {
        setUserID('');
        setGroupID('');
        setEditUserID('');
        setEditGroupID('');
        setEditID('');
    };

     // Pagination logic
     const indexOfLastUserGroup = currentPage * userGroupPerPage;
     const indexOfFirstUserGroup = indexOfLastUserGroup - userGroupPerPage;
     const currentUserGroups = filteredData.slice(indexOfFirstUserGroup, indexOfLastUserGroup);
 
     const paginate = pageNumber => setCurrentPage(pageNumber);
 

    return (
        <div className='usergroupdiv d-flex flex-column w-100 align-items-center bg-light m-3'>
            <h1>{lngsltd["List of UserGroups"]}</h1>
            <div className='w-100 rounded bg-white border shadow p-4 align-items-center'>
                <ToastContainer 
                autoClose={2000} // Close after 2 seconds
                />

                {/* Filter inputs */}
                <div className='w-100 row rounded bg-white border-bottom p-8 mt-0'>

                    {/* Filter input row */}
                    

                        <div className='col-md-4' style={{ float: 'left' }}>
                            <button                               
                                className='btn btn-success'
                                onClick={() => handleShowAdd()}
                            >
                                {lngsltd["Add UserGroup"]}
                            </button>
                        </div>

                        {/* Search input column */}
                        <div className='col-md-4 '>
                            <input
                                type='text'
                                className='form-control pb-2 mt-2'
                                placeholder='Search by User or Group'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Clear filters button column */}
                        <div className='col-md-4'>
                            <button className='btn btn-secondary' onClick={handleClearFilters}>
                                {lngsltd["Clear Filters"]}
                            </button>
                        </div>

                    
                </div>
                <br />

                <Table striped bordered hover size='sm' className='text-center' responsive='sm'>
                    <thead className='thead-dark'>
                        <tr>
                            <th className='text-center'>#</th>
                            <th className='text-center'>{lngsltd["User"]}</th>
                            <th className='text-center'>{lngsltd["Group"]}</th>
                            <th className='text-center'>{lngsltd["Actions"]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* change filteredData to currentGroups for pagination  */}
                        {currentUserGroups && currentUserGroups.length > 0 ? (
                            currentUserGroups.map((d, i) => (
                                <tr key={i}>
                                    <td className='text-center'>{indexOfFirstUserGroup + i + 1}</td>
                                    <td className='text-center'>{getUserById(d.userID)}</td>
                                    <td className='text-center'>{getGroupById(d.groupID)}</td>
                                    <td className='text-center'>
                                        <button className='btn btn-outline-secondary rounded-pill px-4 me-2 btn-sm' onClick={() => handleEdit(d.userGroupID)}>
                                            {lngsltd["Edit"]}
                                        </button>
                                        <button className='btn btn-outline-secondary rounded-pill px-4 me-2 btn-sm' onClick={() => handleDelete(d.userGroupID)}>
                                            {lngsltd["Delete"]}
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={'4'}>
                                    <h4 style={{ paddingTop: '25px', textAlign: 'center' }}> {dynamicText}</h4>
                                </td>
                            </tr>
                        )}
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
                        {Array.from({ length: Math.ceil(filteredData.length / userGroupPerPage) }, (_, i) => (
                            <div key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <span className="page-link" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                        <div className={`page-item ${currentPage === Math.ceil(filteredData.length / userGroupPerPage) ? 'disabled' : ''}`}>
                            <span className="page-link" onClick={() => paginate(currentPage + 1)}>
                                &raquo;
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal pop for updating user */}
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                        <Modal.Title>{lngsltd["Update details"]}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <label >{lngsltd["Select User"]}:<span style={{ color: 'red' }}>*</span></label>
                            <br />
                            <select
                                className='form-control mb-3'
                                value={editUserID}
                                onChange={(e) => setEditUserID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select User"]}</option>
                                {userData.map((user) => (
                                    <option key={user.userID} value={user.userID}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>{lngsltd["Select Group"]}:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                value={editGroupID}
                                onChange={(e) => setEditGroupID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Group"]}</option>
                                {groupData.map((group) => (
                                    <option key={group.groupID} value={group.groupID}>
                                        {group.groupName}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' onClick={handleUpdate}>
                            {lngsltd["Save"]}
                        </Button>
                        <Button variant='secondary' onClick={handleClose}>
                            {lngsltd["Cancel"]}
                        </Button>

                    </Modal.Footer>
                </Modal>

                {/* Modal pop for adding new user */}
                <Modal show={showAdd} onHide={handleCloseAdd}>
                    <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                        <Modal.Title>{lngsltd["Add UserGroup"]}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <div>
                            <label>{lngsltd["Select User"]}:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                value={userID}
                                onChange={(e) => setUserID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select User"]}</option>
                                {userData.map((user) => (
                                    <option key={user.userID} value={user.userID}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>{lngsltd["Select Group"]}:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                value={groupID}
                                onChange={(e) => setGroupID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Group"]}</option>
                                {groupData.map((group) => (
                                    <option key={group.groupID} value={group.groupID}>
                                        {group.groupName}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </Modal.Body>
                    <Modal.Footer>

                        <Button variant='success' onClick={handleSave}>
                            {lngsltd["Add"]}
                        </Button>
                        <Button variant='secondary' onClick={handleCloseAdd}>
                            {lngsltd["Cancel"]}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <div style={{ height: "25px", display: "block" }}>

            </div>
        </div>
    );
};

export default UserGroups;
