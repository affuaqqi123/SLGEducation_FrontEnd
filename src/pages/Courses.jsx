import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, Link, useNavigate } from 'react-router-dom';
import ReactDOM from "react-dom/client";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Container from 'react-bootstrap/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CoursesMain from "./CoursesMain";
import './CoursesMain.css';
import './Pagination.css';
//  import CoursesMain from './pages/CoursesMain.jsx';

const Courses = () => {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
    const userRole = userDetails.role;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userDetails.token}`
    };
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showadd, setShowAdd] = useState(false);
    const handleCloseAdd = () => {
        setShowAdd(false);
        clear();
        clearErrors();
    }
    const handleShowAdd = () => setShowAdd(true);

    //For filters option
    const [search, setSearch] = useState('');
    const [filteredData, setFilteredData] = useState('');

    //For Adding new Course
    const [courseID, setCourseID] = useState('')
    const [coursename, setCourseName] = useState('')
    const [coursedes, setCourseDes] = useState('')
    const [coursegrpname, setCoursegrpname] = useState('')

    //For Updating existing Course
    const [editID, setEditId] = useState('')
    const [editCourseName, setEditCourseName] = useState('')
    const [editCourseDes, setEditCourseDes] = useState('')
    const [editCoursegrpname, setEditCoursegrpname] = useState('')
    const [editGrpName, setEditGrpName] = useState('')
    const [values, setValues] = useState([])

    //For binding Group as a dropdown list
    const [groupID, setGroupID] = useState('');

    //For updating group from the dropdown list
    const [editGroupID, setEditGroupID] = useState('');

    const [data, setData] = useState([]);
    const [userGroupData, setUserGroupData] = useState([]);
    const [userGroupName, setUserGroupName] = useState('');
    const [grpName, setGrpName] = useState('');
    const [groupData, setGroupData] = useState([]);
    const [error, setError] = useState(null);

    //Validation Variable
    const [courseNameError, setCourseNameError] = useState('');
    const [grpNameError, setGrpNameError] = useState('');

    const buttonRef = useRef(null);

    const [editGrpNameError, setEditGrpNameError] = useState('');
    const [editCourseNameError, setEditCourseNameError] = useState('');

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;
    const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage] = useState(5); // Adjusted to display 5 groups per page


    useEffect(() => {
        getData();
        fetchGroupData();
    }, []);


    const getData = () => {
        const userDetails = JSON.parse(localStorage.getItem('userDetails'));
        const userRole = userDetails.role;
        if (userRole === 'Admin') {
            axios.get(`${apiUrl}/Course`, { headers })
                .then((result) => {
                    const responseData = result.data;
                    if (typeof responseData === 'string') {
                        setDynamicText(responseData);
                    } else {
                        setData(result.data);
                    }
                })
        } else {
            axios.get(`${apiUrl}/Course/GetCoursesForUser/${userDetails.userID}`, { headers })
                .then((result) => {
                    const responseData = result.data;
                    if (typeof responseData === 'string') {
                        setDynamicText(responseData);
                    } else {
                        setData(result.data);
                    }
                })
        }
        clear();
    }

    const fetchGroupData = () => {
        axios.get(`${apiUrl}/Group`, { headers })
            .then((result) => {
                setGroupData(result.data);
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const getGroupById = (groupId) => {
        const group = groupData.find((group) => group.groupID === groupId);
        return group ? group.groupName : lngsltd['No Group Found'];
    };

    useEffect(() => {
        if (data.length != 0) {
            const filteredUsers = data.filter(user => {
                const coursenameMatch = user.courseName.toLowerCase().includes(search.toLowerCase());
                return coursenameMatch;
            });
            setFilteredData(filteredUsers);
            paginate(1);
            if (filteredUsers.length === 0) {
                setDynamicText("No data found");
            } else {
                setDynamicText(lngsltd["Loading...Please wait"]);
            }
        }
    }, [search, data]);

    const handleEdit = (id) => {
        handleShow();
        axios.get(`${apiUrl}/Course/${id}`, { headers })
            .then((result) => {
                setEditCourseName(result.data.courseName);
                setEditCourseDes(result.data.description);
                setEditGrpName(result.data.groupName);
                setEditGroupID(result.data.groupID);
                setEditId(id);
            })
            .catch((error) => {
                // console.log(error);
            })
    }

    const handleDelete = (id) => {
        if (window.confirm(lngsltd["Are you sure to delete this Course?"]) == true) {
            axios.delete(`${apiUrl}/Course/${id}`, { headers })
                .then((result) => {
                    toast.success(lngsltd['Course has been deleted']);
                    getData();
                })
                .catch((error) => {
                    toast.error(error);
                })
        }
    }

    const handleDetails = (id) => {
        navigate(`/coursesmain/${id}`);

    }
    const handleReport = (id) => {
        navigate(`/coursereport/${id}`);
    }

    const handleStart = async (id) => {
        try {
            navigate(`/startcoursepage/${id}`);
            // try {
            //     const response = await axios.get(`${apiUrl}/UserCourseStep/IsCourseCompleted?userId=${userDetails.userID}&courseId=${id}`, { headers });

            //     const isCompleted = response.data;
            //     if (!isCompleted) {
            //         navigate(`/startcoursepage/${id}`);
            //     } else {
            //         toast.info(lngsltd["You have already completed the course"]);
            //         // toast.info("You have already completed the course");
            //     }
        } catch (error) {
        }
    };


    const handleAttend = async (courseid) => {


        const response = await axios.get(`${apiUrl}/UserCourseStep/IsCourseCompleted?userId=${userDetails.userID}&courseId=${courseid}`, { headers });

        const isCourseCompleted = response.data;

        // console.log("called attend", isCourseCompleted)
        if (isCourseCompleted) {
            // Check if the quiz is already completed by the user
            const quizResponse = await axios.get(`${apiUrl}/Quiz/IsQuizCompleted?userId=${userDetails.userID}&courseId=${courseid}`, { headers });
            const responseData = quizResponse.data;

            // console.log("called", responseData)

            if (responseData.errorMessage) {
                // Handle error message
                // console.error("Error:", responseData.errorMessage);
                toast.info(responseData.errorMessage);
                return;
            }

            const isCompleted = responseData.isCompleted;

            if (isCompleted) {
                window.alert("You have already completed the quiz.");
            } else

                {

                    const confirmquizstart = window.confirm("Note: You can attend the Quiz only once, and cut-off score is 75%.\n Click OK to start the Quiz");
                    if (confirmquizstart) {
                        navigate(`/startquiz/${courseid}`);
                    }
                }
        }
        else {
            const confirmResponse = window.confirm(lngsltd["You have to complete the Course before start the Quiz"]);
            if (confirmResponse) {
                navigate(`/startcoursepage/${courseid}`);
            } else {
            }
        }

    }

    const handleUpdate = () => {
        let formIsValid = true;

        if (!editCourseName) {
            setEditCourseNameError('Name is required');
            formIsValid = false;
        } else {
            setEditCourseNameError('');
        }

        if (!editGrpName) {
            setEditGrpNameError('');
            formIsValid = false;
        } else {
            setEditGrpNameError('');
        }
        if (formIsValid) {
            const url = `${apiUrl}/Course/${editID}`;
            const data = {
                "courseID": editID,
                "courseName": editCourseName,
                "description": editCourseDes,
                "groupName": editGrpName
            }

            axios.put(url, data, { headers })
                .then((result) => {
                    handleClose();
                    getData();
                    clear();
                    toast.success(lngsltd['Course has been updated']);
                }).catch((error) => {
                    toast.error(error);
                })
        }
    }
    const handleSave = () => {
        let formIsValid = true;

        if (!coursename) {
            setCourseNameError('CourseName is required');
            formIsValid = false;
        } else {
            setCourseNameError('');
        }
        if (!grpName) {
            setGrpNameError('GroupName is required');
            formIsValid = false;
        } else {
            setGrpNameError('');
        }


        if (formIsValid) {
            const url = `${apiUrl}/Course`;
            const data = {
                "courseID": 0,
                "courseName": coursename,
                "description": coursedes,
                "groupName": grpName
            }
            axios.post(url, data, { headers })
                .then((result) => {
                    handleCloseAdd();
                    getData();
                    clear();
                    toast.success(result.data);
                }).catch((error) => {
                    toast.error(error);
                })
        }
    }
    const handleClearFilters = () => {
        setSearch('');

    }

    const validateCourseName = (value) => {
        if (!value.trim()) {
            return lngsltd['Coursename is required'];
        }
        return '';
    };

    const handleCourseNameChange = (e) => {
        const value = e.target.value;
        const errorMessage = validateCourseName(value);
        setCourseNameError(errorMessage);
        setCourseName(value);
    };

    const clearErrors = () => {
        setCourseNameError('');
        setGrpNameError('');
        setEditGrpNameError('');
        setEditCourseNameError('');
    };


    const clear = () => {
        setCourseName('');
        setCourseDes('');
        setGrpName('');
        setGroupID('');
        setEditCourseName('');
        setEditCourseDes('');
        setEditGroupID('');
        setEditGrpName('');
        setEditId('');
    }

    // Pagination logic
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredData.slice(indexOfFirstCourse, indexOfLastCourse);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    return (
        <div className='maincntn d-flex flex-column w-100 align-items-center bg-light m-2'>
            <h1>{lngsltd["List of Courses"]}</h1>
            <div className='w-100 rounded bg-white border shadow p-4 align-items-center'>
                <ToastContainer
                    position="top-center" // Position at the bottom right corner
                    autoClose={2000} // Close after 2 seconds
                    // hideProgressBar={false} // Show progress bar
                    newestOnTop={false} // Display newer notifications below older ones
                    closeOnClick // Close the notification when clicked
                />

                <br></br>

                {/* Filter inputs */}
                <div className="w-100 row rounded bg-white border-bottom p-8 mt-0" >
                    <div className="col-md-4" style={{ float: "left" }}>
                        {userRole === 'Admin' && (
                            <button className='btn btn-success' onClick={() => handleShowAdd()}>{lngsltd["Add Course"]}</button>
                        )}
                    </div>
                    {/* Filter input row */}
                    {/* <div className="row mb-2 " > */}
                    {/* Search input column */}
                    <div className="col-md-4">
                        <input type="text" className="form-control pb-2 mt-2" placeholder={lngsltd["Search by CourseName"]} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {/* Clear filters button column */}
                    <div className="col-md-4">
                        <button className="btn btn-secondary" onClick={handleClearFilters}>{lngsltd["Clear Filters"]}</button>
                    </div>

                    {/* </div> */}
                </div>
                <br></br>

                <Table striped bordered hover size="sm" className="text-center" responsive="sm" >
                    <thead className="thead-dark">
                        <tr>
                            <th className="text-center">#</th>
                            <th className="text-center">{lngsltd["Course Name"]}</th>
                            <th className="text-center">{lngsltd["Course Description"]}</th>
                            <th className="text-center">
                                {userRole === 'Admin' && (
                                    <>{lngsltd["Course Group"]} </>
                                )}
                            </th>
                            <th className="text-center">{lngsltd["Actions"]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* change filteredData to currentGroups for pagination  */}
                        {
                            currentCourses && currentCourses.length > 0 ?
                            currentCourses.map((d, i) => (
                                    <tr key={i}>
                                        <td className="text-center">{indexOfFirstCourse + i + 1}</td>
                                        {/* <td className="text-center">{d.courseID}</td> */}
                                        <td className="text-center">{d.courseName}</td>
                                        <td className="text-center">{d.description}</td>
                                        <td className="text-center">
                                            {userRole === 'Admin' && (
                                                <>
                                                    {d.groupName}
                                                </>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {userRole === 'Admin' && (
                                                <>
                                                    {/* <button className='btn btn-sm btn-primary me-2 px-3' onClick={() => handleEdit(d.courseID)}>{lngsltd["Edit"]} </button>
                                                    <button className='btn btn-sm btn-danger me-2' onClick={() => handleDelete(d.courseID)}>{lngsltd["Delete"]} </button>
                                                    <button className='btn btn-sm btn-info me-2 px-2' onClick={() => handleDetails(d.courseID)}>{lngsltd["Details"]} </button>
                                                    <button className='btn btn-sm btn-secondary me-2 px-2' onClick={() => handleReport(d.courseID)}>{lngsltd["Report"]} </button> */}

                                                    <button className='btn btn-outline-secondary rounded-pill px-3 me-2' onClick={() => handleEdit(d.courseID)}>{lngsltd["Edit"]} </button>
                                                    <button className='btn btn-outline-secondary rounded-pill px-3 me-2' onClick={() => handleDelete(d.courseID)}>{lngsltd["Delete"]} </button>
                                                    <button className='btn btn-outline-secondary rounded-pill px-3 me-2' onClick={() => handleDetails(d.courseID)}>{lngsltd["Details"]} </button>
                                                    <button className='btn btn-outline-secondary rounded-pill px-3 me-2' onClick={() => handleReport(d.courseID)}>{lngsltd["Report"]} </button>
                                                </>
                                            )}
                                            {userRole !== 'Admin' && (
                                                <>

                                                    {/* <button className='btn btn-sm btn-primary me-2 px-3' ref={buttonRef} onClick={() => handleStart(d.courseID)}>{lngsltd["StartCourse"]} </button>
                                                    <button className='btn btn-sm btn-info me-2 px-3' onClick={() => handleAttend(d.courseID)}>{lngsltd["Quiz"]} </button> */}

                                                    <button className='btn btn-outline-secondary rounded-pill px-4 me-2' ref={buttonRef} onClick={() => handleStart(d.courseID)}>{lngsltd["StartCourse"]} </button>
                                                    <button className='btn btn-outline-secondary rounded-pill px-4 me-2' onClick={() => handleAttend(d.courseID)}>{lngsltd["Quiz"]} </button>

                                                    {/* <button className='btn btn-outline-secondary rounded-pill' ref={buttonRef} onClick={() => handleStart(d.courseID)}>{lngsltd["StartCourse"]} </button>
                                                    <button className='btn btn-outline-secondary rounded-pill' onClick={() => handleAttend(d.courseID)}>{lngsltd["Quiz"]} </button> */}
                                                </>
                                            )}
                                        </td>


                                    </tr>
                                )

                                )
                                :
                                <tr><td colSpan={"5"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}> {dynamicText}</h4></td></tr>
                            // <tr><td colSpan={"5"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}> {lngsltd["Loading...Please wait"]}</h4></td></tr>
                        }
                    </tbody>
                </Table>
                {/* <div style={{height:'50px',backgroundColor:'lightgrey'}}>

                </div> */}


                {/* pagination code */}

                <div className="paginat-container">
                    <div className="paginat justify-content-center">
                        <div className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <span className="page-link" onClick={() => paginate(currentPage - 1)}>
                                &laquo;
                            </span>
                        </div>
                        {Array.from({ length: Math.ceil(filteredData.length / coursesPerPage) }, (_, i) => (
                            <div key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <span className="page-link" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                        <div className={`page-item ${currentPage === Math.ceil(filteredData.length / coursesPerPage) ? 'disabled' : ''}`}>
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
                            <label>{lngsltd["Course Name"]}:<span style={{ color: 'red' }}>*</span></label>
                            <input type="text" className="form-control mb-3" placeholder={lngsltd["Enter Course Name"]}
                                value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} />
                        </div>
                        <div className="text-danger">{editCourseNameError}</div>
                        <div>
                            <label>{lngsltd["Description"]}:</label>
                            <input type="text" className="form-control mb-3" placeholder={lngsltd["Enter Course Description"]}
                                value={editCourseDes} onChange={(e) => setEditCourseDes(e.target.value)} />
                        </div>

                        <div>
                            <label>{lngsltd["Select Group"]}:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                value={editGrpName}
                                onChange={(e) => setEditGrpName(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Group"]}</option>
                                {groupData.map((group) => (
                                    <option key={group.groupID} value={group.groupName}>
                                        {group.groupName}
                                    </option>
                                ))}
                            </select>
                            <div className="text-danger">{editGrpNameError}</div>
                        </div>
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
                <Modal show={showadd} onHide={handleCloseAdd} >
                    <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                        <Modal.Title>{lngsltd["Add Course"]} </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <label>{lngsltd["Course Name"]}:<span style={{ color: 'red' }}>*</span></label>
                            <input type="text" className="form-control mb-3" placeholder={lngsltd["Enter Course Name"]}
                                value={coursename} onChange={handleCourseNameChange} />
                            {courseNameError && <p className="text-danger">{courseNameError}</p>}
                        </div>
                        <div>
                            <label>{lngsltd["Description"]}:</label>
                            <input type="text" className="form-control mb-3" placeholder={lngsltd["Enter Course Description"]}
                                value={coursedes} onChange={(e) => setCourseDes(e.target.value)} />
                        </div>
                        <div>
                            <label>{lngsltd["Select Group"]}:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                value={grpName}
                                onChange={(e) => setGrpName(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Group"]}</option>
                                {groupData.map((group) => (
                                    <option key={group.groupID} value={group.groupName}>
                                        {group.groupName}
                                    </option>
                                ))}
                            </select>
                            {grpNameError && <p className="text-danger">{grpNameError}</p>}
                        </div>
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
            </div>
            <div style={{ height: "25px", display: "block" }}>

            </div>
        </div>
    )

}

export default Courses