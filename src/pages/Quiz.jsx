import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './CoursesMain.css';
import './Pagination.css';

const Quiz = () => {

    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));

    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${userDetails.token}`
    }; // auth header with bearer token

    const headerjsondata = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userDetails.token}`
    }; // auth header with bearer token

    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [showAdd, setShowAdd] = useState(false);
    const handleCloseAdd = () => {
        setShowAdd(false);
        clear();
        clearErrors();
    };
    const handleShowAdd = () => setShowAdd(true);

    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [editID, setEditID] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCourseID, setEditCourseID] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCourseID, setNewCourseID] = useState('');
    const [courseData, setCourseData] = useState([]);
    const [courseID, setCourseID] = useState('');
    const [courseName, setCourseName] = useState('');


    //Error Handling
    const [courseNameError, setCourseNameError] = useState('');
    const [quizTitleError, setQuizTitleError] = useState('');

    const [editCourseNameError, setEditCourseNameError] = useState('');
    const [editQuizTitleError, setEditQuizTitleError] = useState('');

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;
    const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [quizsPerPage] = useState(5); // Adjusted to display 5 groups per page


    useEffect(() => {
        getData();
        fetchCourseData();
         window.scrollTo({
          top: 10,
          left: 10,
          behavior: "smooth"
        });
    }, []);

    const getData = () => {
        axios.get(`${apiUrl}/Quiz`, { headerjsondata })
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

    const fetchCourseData = () => {
        axios.get(`${apiUrl}/Course`, { headers })
            .then((result) => {
                setCourseData(result.data);

            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const handleEdit = (id) => {
        axios.get(`${apiUrl}/Quiz/${id}`, { headerjsondata })
            .then((result) => {
                setEditID(id);
                setEditTitle(result.data.title);
                setEditDescription(result.data.description);
                setEditCourseID(result.data.courseID);
                handleShow();
            })
            .catch((error) => {
                // console.log(error);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm(lngsltd['Are you sure you want to delete this quiz?'])) {
            axios.delete(`${apiUrl}/Quiz/${id}`, { headerjsondata })
                .then((result) => {
                    toast.success(lngsltd['Quiz has been deleted']);
                    getData();
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };

    const handleUpdate = () => {

        let formIsValid = true;


        if (!editCourseID) {
            setEditCourseNameError(lngsltd['Please select a CourseName']);
            formIsValid = false;
        } else {
            setEditCourseNameError('');
        }

        if (!editTitle) {
            setEditQuizTitleError(lngsltd['Quiz Title is required']);
            formIsValid = false;
        } else {
            setEditQuizTitleError('');
        }

        if (formIsValid) {
            const url = `${apiUrl}/Quiz/${editID}`;
            const data = {
                "quizID": editID,
                "courseID": editCourseID,
                "title": editTitle,
                "description": editDescription

            };
            axios.put(url, data, { headerjsondata })
                .then((result) => {
                    handleClose();
                    getData();
                    clear();
                    toast.success(lngsltd['Quiz has been updated']);
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };

    const handleSave = () => {
        let formIsValid = true;


        if (!newCourseID) {
            setCourseNameError(lngsltd['Please select a CourseName']);
            formIsValid = false;
        } else {
            setCourseNameError('');
        }

        if (!newTitle) {
            setQuizTitleError(lngsltd['Quiz Title is required']);
            formIsValid = false;
        } else {
            setQuizTitleError('');
        }

        if (formIsValid) {
            const url = `${apiUrl}/Quiz`;
            const data = {
                "quizID": 0,
                "courseID": newCourseID,
                "title": newTitle,
                "description": newDescription

            };
            axios.post(url, data, { headerjsondata })

                .then((result) => {
                    handleCloseAdd();
                    getData();
                    clear();
                    toast.success(lngsltd['New quiz has been added']);
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };
    const handleAddQuestions = (quizid) => {

        navigate(`/questions/${quizid}`);
    }

    const getCourseNameById = (courseId) => {
        const crs = courseData.find((crsdt) => crsdt.courseID === courseId);
        return crs ? crs.courseName : 'No Course';
    };

    const clearErrors = () => {
        setCourseNameError('');
        setQuizTitleError('');
        setEditCourseNameError('');
        setEditQuizTitleError('');

    };

    const clear = () => {
        setEditID('');
        setEditTitle('');
        setEditDescription('');
        setEditCourseID('');
        setNewTitle('');
        setNewDescription('');
        setNewCourseID('');
    };

    // Pagination logic
    const indexOfLastQuiz = currentPage * quizsPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizsPerPage;
    const currentQuizs = data.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    return (
        <div className='quizdiv d-flex flex-column w-100 align-items-center bg-light'>
            <br />
            <h1>{lngsltd["List of Quizzes"]}</h1>
            <div className='w-100 rounded bg-white border shadow p-4'>
                <ToastContainer 
                autoClose={2000} // Close after 2 seconds
                />

                <button className='btn btn-success' onClick={handleShowAdd}>Add</button>

                <Table striped bordered hover size='sm' responsive="sm" style={{ marginTop: '15px' }}>
                    <thead className="thead-dark">
                        <tr>
                            <th className='text-center'>#</th>
                            <th className='text-center'>{lngsltd["CourseName"]}</th>
                            <th className='text-center'>{lngsltd["Quiz Title"]}</th>
                            <th className='text-center'>{lngsltd["Description"]}</th>
                            <th className='text-center'>{lngsltd["Actions"]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* change data to currentQuizs for pagination  */}
                        {currentQuizs.length === 0 ? (
                            <tr>
                                <td colSpan={"5"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}>{dynamicText}</h4></td>
                            </tr>
                        ) : (
                            currentQuizs.map((d, i) => (
                            <tr key={i}>
                                    <td className='text-center'>{indexOfFirstQuiz + i + 1}</td>
                                    <td className='text-center'>{
                                        getCourseNameById(d.courseID)
                                    }</td>
                                    <td className='text-center'>{d.title}</td>
                                    <td className='text-center'>{d.description}</td>
                                    <td className='text-center'>
                                        {/* <button className='btn btn-sm btn-primary me-2 px-3' onClick={() => handleEdit(d.quizID)}>{lngsltd["Edit"]}</button>
                                    <button className='btn btn-sm btn-danger' onClick={() => handleDelete(d.quizID)}>{lngsltd["Delete"]}</button>
                                    <button className='btn btn-sm btn-info' onClick={() => handleAddQuestions(d.quizID)}>{lngsltd["Add Questions"]}</button> */}

                                        <button className='btn btn-outline-secondary rounded-pill px-3 me-2 btn-sm' onClick={() => handleEdit(d.quizID)}>{lngsltd["Edit"]}</button>
                                        <button className='btn btn-outline-secondary rounded-pill px-3 me-2 btn-sm' onClick={() => handleDelete(d.quizID)}>{lngsltd["Delete"]}</button>
                                        <button className='btn btn-outline-secondary rounded-pill px-3 me-2 btn-sm' onClick={() => handleAddQuestions(d.quizID)}>{lngsltd["Add Questions"]}</button>
                                    </td>
                                </tr>
                            ))
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
                        {Array.from({ length: Math.ceil(data.length / quizsPerPage) }, (_, i) => (
                            <div key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <span className="page-link" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                        <div className={`page-item ${currentPage === Math.ceil(data.length / quizsPerPage) ? 'disabled' : ''}`}>
                            <span className="page-link" onClick={() => paginate(currentPage + 1)}>
                                &raquo;
                            </span>
                        </div>
                    </div>
                </div>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                        <Modal.Title>{lngsltd["Edit Quiz"]}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div >
                            <label >{lngsltd["Select Course"]}<span style={{ color: 'red' }}>*</span></label>
                            <br />
                            <select
                                className='form-control mb-3'
                                value={editCourseID}
                                onChange={(e) => setEditCourseID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Course Name"]}</option>
                                {courseData.map((data) => (
                                    <option key={data.courseID} value={data.courseID}>
                                        {data.courseName}
                                    </option>
                                ))}
                            </select>

                            {/* <label htmlFor="editCourseID" className="form-label">Course ID</label>
                            <input type="text" className="form-control" id="editCourseID" value={editCourseID} onChange={(e) => setEditCourseID(e.target.value)} />
                        */}
                            <div className="text-danger">{editCourseNameError}</div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="editTitle" className="form-label">{lngsltd["Title"]}<span style={{ color: 'red' }}>*</span></label>
                            <input type="text" className="form-control" id="editTitle" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            <div className="text-danger">{editQuizTitleError}</div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="editDescription" className="form-label">{lngsltd["Description"]}</label>
                            <textarea className="form-control" id="editDescription" rows="3" value={editDescription} onChange={(e) => setEditDescription(e.target.value)}></textarea>
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

                <Modal show={showAdd} onHide={handleCloseAdd}>
                    <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                        <Modal.Title>{lngsltd["Add Quiz"]}  </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div >
                            <label htmlFor="coursename" className="form-label">{lngsltd["Select Course"]}<span style={{ color: 'red' }}>*</span></label>
                            <select
                                className='form-control mb-3'
                                id='coursename'
                                value={newCourseID}
                                onChange={(e) => setNewCourseID(e.target.value)}
                            >
                                <option value='' disabled>{lngsltd["Select Course Name"]}</option>
                                {courseData.map((data) => (
                                    <option key={data.courseID} value={data.courseID}>
                                        {data.courseName}
                                    </option>
                                ))}
                            </select>
                            <div className="text-danger">{courseNameError}</div>
                            {/* <label htmlFor="newCourseID" className="form-label">Course ID</label>
                            <input type="text" className="form-control" id="newCourseID" value={newCourseID} onChange={(e) => setNewCourseID(e.target.value)} /> */}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newTitle" className="form-label">{lngsltd["Title"]}<span style={{ color: 'red' }}>*</span></label>
                            <input type="text" className="form-control" id="newTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                            <div className="text-danger">{quizTitleError}</div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newDescription" className="form-label">{lngsltd["Description"]}</label>
                            <textarea className="form-control" id="newDescription" rows="3" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}></textarea>
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
    );
};

export default Quiz;
