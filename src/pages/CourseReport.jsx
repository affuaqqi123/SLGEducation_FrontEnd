import React from 'react'
import './CoursesMain.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './CoursesMain.css';
import axios from "axios";
import { Table, Form, FormControl } from 'react-bootstrap';



const CourseReport = () => {
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userDetails.token}`
  }
  const [progressData, setProgressData] = useState([]);
  const [storeLocations, setStoreLocations] = useState({});
  const [filterText, setFilterText] = useState('');
  const [storeOptions, setStoreOptions] = useState([]);

  //Environment variables
  const apiUrl = process.env.REACT_APP_API_URL;

  const [dynamicText, setDynamicText] = useState(lngsltd["Loading...Please wait"]);

  const { id } = useParams();

  const fetchStoreData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/Store`, { headers });
      const storeLocationMap = {};
      const options = response.data.map(store => ({
        id: store.storeID,
        name: store.storeLocation
      }));
      response.data.forEach(store => {
        storeLocationMap[store.storeID] = store.storeLocation;
      });
      setStoreLocations(storeLocationMap);
      setStoreOptions(options);
    } catch (error) {
      // console.error('Error fetching store locations', error);
    }
  };

  useEffect(() => {
    fetchStoreData();
    fetchCourseSteps();
  }, [id]);

  const fetchCourseSteps = async () => {
    try {
      const response = await axios.get(`${apiUrl}/UserCourseStep/GetUser&CourseSteps/${id}`, { headers });
      setProgressData(response.data);
      console.log(response.data);
      if (response.data.length === 0) {
        setTimeout(() => {
          setDynamicText(lngsltd["No Data Found"]);
        }, 2000);
      }

    } catch (error) {
      toast.info(lngsltd['There was an issue to get the data']);
      // console.error('There was an error fetching the course steps', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const handleClearFilter = () => {
    setFilterText('');
  };

  const [filteredProgressData, setFilteredProgressData] = useState('');
  useEffect(() => {
    if (progressData.length != 0) {

      const filteredData = progressData.filter(progress => {
        return (
          progress.userName.toLowerCase().includes(filterText.toLowerCase()) ||
          storeLocations[progress.storeID].toLowerCase().includes(filterText.toLowerCase()) ||
          progress.progressPercentage.toString().toLowerCase().includes(filterText.toLowerCase()) ||
          progress.status.toLowerCase().includes(filterText.toLowerCase()) ||
          String(progress.quizScore).toLowerCase().includes(filterText.toLowerCase())
        );
      });
      setFilteredProgressData(filteredData);
      if (filteredData.length === 0) {
        setDynamicText("No data found");
      } else {
        setDynamicText(lngsltd["Loading...Please wait"]);
      }
    }
  }, [filterText, progressData]);

  return (

    <div className="reportpageContainer reportdiv w-100  d-flex flex-column bg-light m-3" >
      <h2 className="reportpageTitle text-center">{lngsltd["Courses Report"]}</h2>
      <br />
      <div className='w-100 rounded bg-white border shadow p-4 mt-4'>

        <div className="w-100 row rounded bg-white border-bottom p-8 mt-0" >
          <div className="col-md-6">
            <input type="text" className="form-control pb-2 mt-2" placeholder={lngsltd["Search"]} value={filterText} onChange={(e) => setFilterText(e.target.value)} />
          </div>

          <div className='col-md-6'>
            <Button variant="secondary" className='col-md-5' onClick={handleClearFilter}>Clear Filter</Button>
          </div>
        </div>
        <br></br>
        <Table striped bordered hover size="sm" className="text-center" responsive="sm">
          <thead className="thead-dark">
            <tr>
              <th className="text-center col-md-3">{lngsltd["UserName"]}</th>
              <th className="text-center col-md-4">{lngsltd["Progress"]}</th>
              <th className="text-center col-md-2">{lngsltd["Store Location"]}</th>
              <th className="text-center col-md-2">{lngsltd["Status"]}</th>
              <th className="text-center col-md-3">{"Quiz Score"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProgressData.length === 0 ? (
              <tr>
                <td colSpan={"5"}><h4 style={{ paddingTop: "25px", textAlign: "center" }}>{dynamicText}</h4></td>
              </tr>
            ) : (
              filteredProgressData.map((progress, index) => (
                <tr key={index}>
                  <td className="text-center">{progress.userName}</td>
                  <td className="text-center">{progress.progressPercentage}% <br>
                  </br>
                    <div className="progress-bar col-md-6">
                      <div className="progress-bar-fill" style={{ width: `${progress.progressPercentage}%` }}></div>
                    </div>
                  </td>
                  <td className="text-center">{storeLocations[progress.storeID]}</td>
                  <td className="text-center">{progress.status}</td>
                  <td className="text-center">{progress.quizScore}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>

  )
};
export default CourseReport;
