import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import './Questions.css'
import './CoursesMain.css';

const Questions = () => {
    const { quizid } = useParams();

    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
    const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': userDetails.token
    };

    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;
    const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);

    const [questions, setQuestions] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        id: 0,
        quizID: quizid,
        questionText: '',
        questionNo: '',
        imageName: 'No Image',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOption: 0,
        imageFile: null
    });

    const [showEdit, setShowEdit] = useState(false);
    const [editQuestion, setEditQuestion] = useState({
        id: 0,
        quizID: quizid,
        questionText: '',
        questionNo: '',
        imageName: 'No Image',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOption: 0,
        imageFile: null
    });
    const [editQuestionId, setEditQuestionId] = useState(null);

    //Validation Variable
    const [questionTextError, setQuestionTextError] = useState('');
    const [option1Error, setOption1Error] = useState('');
    const [option2Error, setOption2Error] = useState('');
    const [option3Error, setOption3Error] = useState('');
    const [option4Error, setOption4Error] = useState('');
    const [correctOptionError, setCorrectOptionError] = useState('');
    const [editQuestionTextError, setEditQuestionTextError] = useState('');
    const [editOption1Error, setEditOption1Error] = useState('');
    const [editOption2Error, setEditOption2Error] = useState('');
    const [editOption3Error, setEditOption3Error] = useState('');
    const [editOption4Error, setEditOption4Error] = useState('');
    const [editCorrectOptionError, setEditCorrectOptionError] = useState('');

    const [questionNumberError, setQuestionNumberError] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, [quizid]);

    const fetchQuestions = async () => {
        try {
            const result = await axios.get(`${apiUrl}/Question/QuizID/${quizid}`, { headers });
            const responseData = result.data;
            if (typeof responseData === 'string') {
                setDynamicText(responseData);
            } else {
                const sortedData = responseData.slice().sort((a, b) => a.questionNo - b.questionNo);
                setQuestions(sortedData);
            }

        } catch (error) {
            // console.error('Error fetching questions: ', error)
        }
    };

    const handleAdd = () => {
        clearErrors();
        let formIsValid = true;
        if (!newQuestion.questionText) {
            setQuestionTextError(lngsltd['Question Text is required']);
            formIsValid = false;
        } else {
            setQuestionTextError('');
        }
        if (!newQuestion.option1) {
            setOption1Error(lngsltd['Option1 is required']);
            formIsValid = false;
        } else {
            setOption1Error('');
        }
        if (!newQuestion.option2) {
            setOption2Error(lngsltd['Option2 is required']);
            formIsValid = false;
        } else {
            setOption2Error('');
        }
        if (!newQuestion.option3) {
            setOption3Error(lngsltd['Option3 is required']);
            formIsValid = false;
        } else {
            setOption3Error('');
        }
        if (!newQuestion.option4) {
            setOption4Error(lngsltd['Option4 is required']);
            formIsValid = false;
        } else {
            setOption4Error('');
        }
        if (!newQuestion.correctOption) {
            setCorrectOptionError(lngsltd['Correct Option is required']);
            formIsValid = false;
        } else {
            setCorrectOptionError('');
        }

        // Check if question number is empty or zero
        if (!newQuestion.questionNo || parseInt(newQuestion.questionNo) === 0) {
            setQuestionNumberError(lngsltd['Question Number is required and cannot be zero']);
            toast.error("Question Number is required and cannot be zero")
            formIsValid = false;
        } else {
            setQuestionNumberError('');
        }

        if (formIsValid) {
            const formData = new FormData();
            formData.append('quizID', newQuestion.quizID);
            formData.append('questionText', newQuestion.questionText);
            formData.append('questionNo', newQuestion.questionNo);
            formData.append('option1', newQuestion.option1);
            formData.append('option2', newQuestion.option2);
            formData.append('option3', newQuestion.option3);
            formData.append('option4', newQuestion.option4);
            formData.append('correctOption', newQuestion.correctOption);

            if (newQuestion.imageFile) {
                formData.append('imageFile', newQuestion.imageFile);
                formData.append('imageName', "Image");
            } else {
                formData.append('imageName', "No Image");
            }

            axios.post(`${apiUrl}/Question`, formData, { headers })
                .then((result) => {
                    setShowAdd(false);
                    fetchQuestions();
                    clear();
                    toast.success(lngsltd['New question has been added']);
                })
                .catch((error) => {
                    toast.error(error);
                });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const errorMessage = validateQuestionNumber(value);
        setQuestionNumberError(errorMessage);
        setNewQuestion(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateQuestionNumber = (value) => {
        if (!/^\d+$/.test(value)) {
            return lngsltd['Please enter only numbers'];
        }

        // else if (parseInt(value) < 1 || parseInt(value) > 1000) {
        //   return "Question Number should be more than 0";          
        // }

        const numValue = parseInt(value);

        // Check if value is less than 1 or greater than 1000
        if (numValue < 1 || numValue > 1000) {
            return "Question Number should be between 1 and 1000";
        }
        return '';
    };

    const handleEditInputChange = (e) => {

        const { name, value } = e.target;
        setEditQuestion(prevState => ({
            ...prevState,
            [name]: value
        }));

    };

    const handleEditClick = async (question) => {


        if (question.imageName !== "No Image") {
            try {
                const response = await axios.get(`${apiUrl}/Question/Image/${question.quizID}/${question.questionNo}/${question.imageName}`, {
                    responseType: 'arraybuffer', headers
                });

                const blob = new Blob([response.data], { type: 'image/jpeg' });
                const imageFile = new File([blob], question.imageName, { type: 'image/jpeg' });

                setEditQuestion({
                    id: question.id,
                    quizID: question.quizID,
                    questionText: question.questionText,
                    questionNo: question.questionNo,
                    imageName: question.imageName,
                    option1: question.option1,
                    option2: question.option2,
                    option3: question.option3,
                    option4: question.option4,
                    correctOption: question.correctOption,
                    imageFile: imageFile
                });

            } catch (error) {
                // console.error('Error fetching image:', error);
            }
        }
        else {
            setEditQuestion({
                id: question.id,
                quizID: question.quizID,
                questionText: question.questionText,
                questionNo: question.questionNo,
                imageName: question.imageName,
                option1: question.option1,
                option2: question.option2,
                option3: question.option3,
                option4: question.option4,
                correctOption: question.correctOption
            });
        }
        setEditQuestionId(question.id);
        setShowEdit(true);

    };

    const handleEdit = () => {
        clearErrors();
        let formIsValid = true;
        if (!editQuestion.questionText) {
            setEditQuestionTextError(lngsltd['Question Text is required']);
            formIsValid = false;
        } else {
            setEditQuestionTextError('');
        }
        if (!editQuestion.option1) {
            setEditOption1Error(lngsltd['Option1 is required']);
            formIsValid = false;
        } else {
            setEditOption1Error('');
        }
        if (!editQuestion.option2) {
            setEditOption2Error(lngsltd['Option2 is required']);
            formIsValid = false;
        } else {
            setEditOption2Error('');
        }
        if (!editQuestion.option3) {
            setEditOption3Error(lngsltd['Option3 is required']);
            formIsValid = false;
        } else {
            setEditOption3Error('');
        }
        if (!editQuestion.option4) {
            setEditOption4Error(lngsltd['Option4 is required']);
            formIsValid = false;
        } else {
            setEditOption4Error('');
        }
        if (!editQuestion.correctOption) {
            setEditCorrectOptionError(lngsltd['Correct Option is required']);
            formIsValid = false;
        } else {
            setEditCorrectOptionError('');
        }
        if (formIsValid) {
            const formData = new FormData();
            formData.append('id', editQuestion.id);
            formData.append('quizID', editQuestion.quizID);
            formData.append('questionText', editQuestion.questionText);
            formData.append('questionNo', editQuestion.questionNo);
            formData.append('option1', editQuestion.option1);
            formData.append('option2', editQuestion.option2);
            formData.append('option3', editQuestion.option3);
            formData.append('option4', editQuestion.option4);
            formData.append('correctOption', editQuestion.correctOption);

            if (editQuestion.imageFile) {
                formData.append('imageFile', editQuestion.imageFile);
                formData.append('imageName', "Image");
            } else {

                formData.append('imageName', "No Image");
            }

            axios.put(`${apiUrl}/Question/${editQuestionId}`, formData, { headers })
                .then((result) => {
                    fetchQuestions();
                    clearEdit();
                    setShowEdit(false);
                    toast.success(lngsltd['Question has been updated']);
                })
                .catch((error) => {
                    toast.error(lngsltd['Failed to update question']);
                    // console.error('Error updating question: ', error);
                });
        }
    };


    const handleDelete = (questionId) => {
        if (window.confirm(lngsltd['Are you sure you want to delete this question?'])) {
            axios.delete(`${apiUrl}/Question/${questionId}`, { headers })
                .then((result) => {
                    fetchQuestions();
                    toast.success(lngsltd['Question has been deleted']);
                })
                .catch((error) => {
                    toast.error(lngsltd['Failed to delete question']);
                    // console.error('Error deleting question: ', error);
                });
        }
    };


    const clear = () => {
        setNewQuestion({
            quizID: quizid,
            questionText: '',
            questionNo: '',
            imageName: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctOption: '',
            imageFile: ''
        });
    };

    const clearEdit = () => {
        setEditQuestion({
            id: '',
            quizID: '',
            questionText: '',
            questionNo: '',
            imageName: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctOption: '',
            imageFile: ''
        });
    };

    const clearErrors = () => {
        setQuestionTextError('');
        setOption1Error('');
        setOption2Error('');
        setOption3Error('');
        setOption4Error('');
        setCorrectOptionError('');
        setEditQuestionTextError('');
        setEditOption1Error('');
        setEditOption2Error('');
        setEditOption3Error('');
        setEditOption4Error('');
        setEditCorrectOptionError('');

    };

    const handleRemoveImage = () => {
        setNewQuestion(prevState => ({
            ...prevState,
            imageFile: null,
            imageName: "No Image"
        }));
        setEditQuestion(prevState => ({
            ...prevState,
            imageFile: null,
            imageName: "No Image"
        }));
    };

    return (
        <div className='questions-container d-flex flex-column w-100 align-items-center bg-light m-1'>
            <ToastContainer
                autoClose={2000} // Close after 2 seconds
            />
            <h1>{lngsltd["List of Questions"]}</h1>
            <div className='w-100 rounded bg-white border shadow p-4 align-items-center'>
                <div className='w-100 rounded bg-white border-bottom p-8 mt-0'>
                    <Button className='btn btn-success' onClick={() => setShowAdd(true)}>{lngsltd["Add Question"]}</Button>
                </div>
                <Table className='text-center' striped bordered hover responsive='sm'>
                    <thead className='thead-dark'>
                        <tr>
                            <th>{lngsltd["QuestionNo"]}</th>
                            <th>{lngsltd["Question Text"]}</th>
                            <th>{lngsltd["Options"]}</th>
                            <th>{lngsltd["Correct Option"]}</th>
                            <th>{lngsltd["Image"]}</th>
                            <th>{lngsltd["Actions"]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.length === 0 ? (
                            <tr>
                                {/* <td colSpan={"6"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}>{dynamicText}</h4></td> */}
                                <td colSpan={"6"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}>{dynamicText}</h4></td>
                            </tr>
                        ) : (
                            questions.map((question, index) => (
                                <tr key={index}>
                                    <td>{question.questionNo}</td>
                                    <td>{question.questionText}</td>
                                    <td>{question.option1}, {question.option2}, {question.option3}, {question.option4}</td>
                                    <td>{question.correctOption}</td>
                                    <td>
                                        {question.imageName !== 'No Image' && (
                                            <img src={`${apiUrl}/Question/Image/${quizid}/${question.questionNo}/${question.imageName}`} alt="Question Image" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                                        )}
                                    </td>

                                    <td>
                                        {/* <Button variant="primary" onClick={() => handleEditClick(question)}>{lngsltd["Edit"]}</Button>
                                    <Button variant="danger" onClick={() => handleDelete(question.id)}>{lngsltd["Delete"]}</Button> */}

                                        <Button variant="btn btn-outline-secondary rounded-pill px-3 me-2" onClick={() => handleEditClick(question)}>{lngsltd["Edit"]}</Button>
                                        <Button variant="btn btn-outline-secondary rounded-pill px-3 me-2" onClick={() => handleDelete(question.id)}>{lngsltd["Delete"]}</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            <Modal show={showAdd} onHide={() => setShowAdd(false)}>
                <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                    <Modal.Title>{lngsltd["Add Question"]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group mb-3">
                        <label htmlFor="questionNo">{lngsltd["Question Number"]}:</label>
                        <input type="text" className="form-control" placeholder="Enter Question No" name="questionNo" value={newQuestion.questionNo} onChange={handleInputChange} />
                        {questionNumberError && <p className="text-danger">{questionNumberError}</p>}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="questionText">{lngsltd["Question Text"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Question Text" name="questionText" value={newQuestion.questionText} onChange={handleInputChange} />
                        {questionTextError && <p className="text-danger">{questionTextError}</p>}
                    </div>

                    {newQuestion.imageFile && (
                        <div className="form-group mb-3">
                            <label>{lngsltd["Selected Image Preview"]}:</label><br />
                            <img src={URL.createObjectURL(newQuestion.imageFile)} alt="Selected Image Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                            <button className="btn btn-danger" onClick={() => handleRemoveImage()}>{lngsltd["Remove Image"]}</button>
                        </div>
                    )}
                    <div className="form-group mb-3">
                        <label htmlFor="imageFile">{lngsltd["Image File"]}:</label>
                        <input type="file" className="form-control-file" name="imageFile" onChange={(e) => setNewQuestion({ ...newQuestion, imageFile: e.target.files[0] })} />
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="option1">{lngsltd["Option 1"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 1" name="option1" value={newQuestion.option1} onChange={handleInputChange} />
                        {option1Error && <p className="text-danger">{option1Error}</p>}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option2">{lngsltd["Option 2"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 2" name="option2" value={newQuestion.option2} onChange={handleInputChange} />
                        {option2Error && <p className="text-danger">{option2Error}</p>}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option3">{lngsltd["Option 3"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 3" name="option3" value={newQuestion.option3} onChange={handleInputChange} />
                        {option3Error && <p className="text-danger">{option3Error}</p>}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option4">{lngsltd["Option 4"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 4" name="option4" value={newQuestion.option4} onChange={handleInputChange} />
                        {option4Error && <p className="text-danger">{option4Error}</p>}
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="correctOption">{lngsltd["Correct Option"]}:<span style={{ color: 'red' }}>*</span></label>
                        <select id="correctOption" className="form-control" name="correctOption" value={newQuestion.correctOption} onChange={handleInputChange}>
                            <option value="" disabled>{lngsltd["Select Correct Option"]}</option>
                            <option value="1">{lngsltd["Option 1"]}</option>
                            <option value="2">{lngsltd["Option 2"]}</option>
                            <option value="3">{lngsltd["Option 3"]}</option>
                            <option value="4">{lngsltd["Option 4"]}</option>
                        </select>
                        {correctOptionError && <p className="text-danger">{correctOptionError}</p>}
                    </div>

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={handleAdd}>{lngsltd["Add"]}</Button>
                    <Button variant="secondary" onClick={() => setShowAdd(false)}>{lngsltd["Cancel"]}</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton style={{ backgroundColor: '#efedf0' }}>
                    <Modal.Title>{lngsltd["Edit Question"]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group mb-3">
                        <label htmlFor="questionNo">{lngsltd["Question Number"]}:</label>
                        <input type="text" className="form-control" placeholder="Enter Question No" name="questionNo" value={editQuestion.questionNo} onChange={handleEditInputChange} />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="questionText">{lngsltd["Question Text"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Question Text" name="questionText" value={editQuestion.questionText} onChange={handleEditInputChange} />
                        <div className="text-danger">{editQuestionTextError}</div>
                    </div>

                    {editQuestion.imageFile && (
                        <div className="form-group mb-3">
                            <label>{lngsltd["Selected Image Preview"]}:</label><br />
                            <img src={URL.createObjectURL(editQuestion.imageFile)} alt="Selected Image Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                            <button className="btn btn-danger" onClick={() => handleRemoveImage()}>{lngsltd["Remove Image"]}</button>
                        </div>
                    )}

                    <div className="form-group mb-3">
                        <label htmlFor="imageFile">{lngsltd["Image File"]}:</label>
                        <input type="file" className="form-control-file" name="imageFile" onChange={(e) => setEditQuestion({ ...editQuestion, imageFile: e.target.files[0] })} />
                    </div>

                    <div className="form-group mb-3">
                        <label htmlFor="option1">{lngsltd["Option 1"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 1" name="option1" value={editQuestion.option1} onChange={handleEditInputChange} />
                        <div className="text-danger">{editOption1Error}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option2">{lngsltd["Option 2"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 2" name="option2" value={editQuestion.option2} onChange={handleEditInputChange} />
                        <div className="text-danger">{editOption2Error}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option3">{lngsltd["Option 3"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 3" name="option3" value={editQuestion.option3} onChange={handleEditInputChange} />
                        <div className="text-danger">{editOption3Error}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="option4">{lngsltd["Option 4"]}:<span style={{ color: 'red' }}>*</span></label>
                        <input type="text" className="form-control" placeholder="Enter Option 4" name="option4" value={editQuestion.option4} onChange={handleEditInputChange} />
                        <div className="text-danger">{editOption4Error}</div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="correctOption">{lngsltd["Correct Option"]}:<span style={{ color: 'red' }}>*</span></label>
                        <select id="correctOption" className="form-control" name="correctOption" value={editQuestion.correctOption} onChange={handleEditInputChange}>
                            <option value="" disabled hidden>{lngsltd["Select Correct Option"]}</option>
                            <option value="1">{lngsltd["Option 1"]}</option>
                            <option value="2">{lngsltd["Option 2"]}</option>
                            <option value="3">{lngsltd["Option 3"]}</option>
                            <option value="4">{lngsltd["Option 4"]}</option>
                        </select>
                        <div className="text-danger">{editCorrectOptionError}</div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={handleEdit}>{lngsltd["Save"]}</Button>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>{lngsltd["Cancel"]}</Button>
                </Modal.Footer>
            </Modal>
            <div style={{ height: "25px", display: "block" }}>

            </div>

        </div>

    );
};

export default Questions;
