import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './StartCoursePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightLong,
  faLeftLong,
  faRightFromBracket,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPlayer from 'react-player';





const StartCoursePage = () => {

  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userDetails.token}`
  }
  const navigate = useNavigate();
  const { id } = useParams();
  const userID = userDetails.userID;

  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState([]);
  const [userCourseSteps, setUserCourseSteps] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');

  const [videoWatched, setVideoWatched] = useState(false);

  const scrollableDivRef = useRef(null);

  //Environment variables
  const apiUrl = process.env.REACT_APP_API_URL;


  const fetchCourseData = async () => {
    try {
      //debugger;
      const response = await axios.get(`${apiUrl}/CourseStep/Course/${id}`, { headers });
      if (response) {
        const sortedData = response.data.slice().sort((a, b) => a.stepNo - b.stepNo);

        let userCourseStepsResponse = await axios.get(`${apiUrl}/UserCourseStep/ByCourseAndUser/${id}/${userID}`, { headers });
        let userSteps = userCourseStepsResponse.data;
        if (userSteps.length === 0) {

          createUserCourse(userID, id);
          userSteps = sortedData.map((step) => ({
            courseStepID: 0,
            userID: userID,
            courseID: step.courseID,
            stepNumber: step.stepNo,
            status: "InComplete",
          }));
          createuserCourseStep(userSteps);
        }


        const firstIncompleteStep = userSteps.find(step => step.status !== 'Completed') || userSteps[0];

        if (firstIncompleteStep) {
          setCurrentStep(firstIncompleteStep.stepNumber);
          setCourseData(sortedData);
          // videoRef.current.currentTime = firstIncompleteStep.status;
        } else {
          setCurrentStep(0);
          setCourseData(sortedData);
        }

        if (response.data.length > 0 && response.data[0].description && response.data[0].description.endsWith('.html')) {
          const res = await axios.get(
              `${apiUrl}/CourseStep/filecontent?CourseID=${response.data[0].courseID}&StepNo=${response.data[0].stepNo}&ContentType=HTML&FileName=${response.data[0].description}`,
              { responseType: 'text', headers }
          );
          setHtmlContent(res.data);
      }else{
        setHtmlContent(response.data[0].description);
      }

        if (response.data.length > 0 && response.data[0].contentType === 'Video' && response.data[0].stepNo === firstIncompleteStep.stepNumber) {
          const res = await axios.get(
            `${apiUrl}/CourseStep/filecontent?CourseID=${response.data[0].courseID}&StepNo=${response.data[0].stepNo} &ContentType=${response.data[0].contentType}&FileName=${response.data[0].stepContent}`,
            { responseType: 'arraybuffer', headers }
          );
          setVideoUrl(res.request.responseURL);
        }
        else {
          const fileNames = response.data[0].stepContent.split(',');
          const responses = await Promise.all(
            fileNames.map(async (fileName) => {
              return await axios.get(
                `${apiUrl}/CourseStep/filecontent?CourseID=${response.data[0].courseID}&StepNo=${response.data[0].stepNo}&ContentType=${response.data[0].contentType}&FileName=${fileName}`,
                { responseType: 'arraybuffer', headers }
              );
            })
          );

          const imageBlobUrls = Array.isArray(responses)
            ? responses.map((response) => {
              const blob = new Blob([response.data], { type: 'image/jpeg' });
              return URL.createObjectURL(blob);
            })
            : [];

          setImageUrls(imageBlobUrls);
        }
      }


    } catch (error) {
      // console.error('Error fetching course data:', error);
    }

  };

  //calling usercourse table to create record
  const createUserCourse = async (userID, courseID) => {
    //console.log("entered create user course");
    try {
      const userCourseData = {
        UserID: userID,
        CourseID: courseID,
        IsCourseCompleted: false,
        StartTime: new Date(),
        EndTime: new Date(),
      };
      const response = await axios.post(`${apiUrl}/UserCourse`, userCourseData, { headers });
      //console.log('UserCourse controller method called successfully:', response.data);
    } catch (error) {
      //console.error('Error calling UserCourse controller method:', error);
    }
  };

  const createuserCourseStep = async (userSteps) => {
   // console.log(" entered createusercoursestep");
    try {
      for (const Step of userSteps) {
        await axios.post(`${apiUrl}/UserCourseStep`, Step, { headers });
      }
      let userCourseStepsResponse = await axios.get(`${apiUrl}/UserCourseStep/ByCourseAndUser/${id}/${userID}`, { headers });
    } catch (error) {
      //console.error('Error creating user course steps:', error);
    }
  }

  // const createuserCourseStep = async (userSteps) => {
  //   try {
  //     for (const Step of userSteps) {
  //       await axios.post(`${apiUrl}/UserCourseStep`, Step, { headers });
  //     }
  //     const userCourseStepsInput = {
  //       courseId: id,
  //       userId: userID
  //     }
  //     const userCourseStepsResponse = await axios.post(`${apiUrl}/UserCourseStep/ByCourseAndUser`, userCourseStepsInput, { headers });
  //   } catch (error) {
  //     // console.error('Error creating user course steps:', error);
  //   }
  // }

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (courseData.length > 0) {
      updateVideoUrl();
      updateImageUrl();
      updateHtmlContent();
    }
  }, [currentStep]);

  const updateVideoUrl = async () => {

    if (courseData[currentStep - 1]?.contentType === 'Video') {
      try {
        setVideoUrl('');
        const response = await axios.get(
          `${apiUrl}/CourseStep/filecontent?CourseID=${courseData[currentStep - 1].courseID}&StepNo=${courseData[currentStep - 1].stepNo}&ContentType=${courseData[currentStep - 1].contentType}&FileName=${courseData[currentStep - 1].stepContent}`,
          { responseType: 'arraybuffer', headers }
        );

        const blob = new Blob([response.data], { type: 'video/mp4' });
        const bloburl = URL.createObjectURL(blob);
        setVideoUrl(bloburl);


      } catch (error) {

        // console.error('Error fetching video data:', error);
        setVideoUrl('');
      }
    } else {
      setVideoUrl('');
    }
  };
  const updateImageUrl = async () => {


    if (courseData[currentStep - 1]?.contentType === 'Image') {
      try {

        setImageUrls('');
        const fileNames = courseData[currentStep - 1].stepContent.split(',');
        const responses = await Promise.all(
          fileNames.map(async (fileName) => {
            return await axios.get(`${apiUrl}/CourseStep/filecontent?CourseID=${courseData[currentStep - 1].courseID}&StepNo=${courseData[currentStep - 1].stepNo}&ContentType=${courseData[currentStep - 1].contentType}&FileName=${fileName}`
              , { responseType: 'arraybuffer', headers });
          })
        );

        const imageBlobUrls = Array.isArray(responses)
          ? responses.map((response) => {
            const blob = new Blob([response.data], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
          })
          : [];

        setImageUrls(imageBlobUrls);


      } catch (error) {

        // console.error('Error fetching Image data:', error);
        setImageUrls('');
      }
    } else {
      setImageUrls('');
    }
  };

  const updateHtmlContent = async () => {
    const stepData = courseData[currentStep - 1];
    if (stepData && stepData.description && stepData.description.endsWith('.html')) {
        try {
            setHtmlContent('');
            const response = await axios.get(
                `${apiUrl}/CourseStep/filecontent?CourseID=${stepData.courseID}&StepNo=${stepData.stepNo}&ContentType=HTML&FileName=${stepData.description}`,
                { responseType: 'text', headers }
            );
            setHtmlContent(response.data);
        } catch (error) {
            console.error('Error fetching HTML content:', error);
            setHtmlContent('<p>Error loading content.</p>');
        }
    } else {
        setHtmlContent(stepData.description);
    }
};


  const handleExit = async () => {

    navigate('/courses');

  };

  const handleNext = async () => {
    if (courseData[currentStep - 1]?.contentType === 'Video' && !videoWatched) {
      toast.info(lngsltd["Please complete the video before proceeding to the next step"]);
    } else {
      try {
        let status = "Completed";
        const courseId = courseData[currentStep - 1].courseID;
        const stepNo = courseData[currentStep - 1].stepNo;

        const response = await fetch(`${apiUrl}/UserCourseStep/UpdateStatus?courseId=${courseId}&userId=${userID}&stepNumber=${stepNo}&status=${status}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userDetails.token}`,
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
            'Access-Control-Max-Age': '3600',
            'Access-Control-Allow-Headers': 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With'
          },

          //  mode:'cors'
        });

        if (!response.ok) {
          throw new Error(lngsltd['Network response was not ok']);
        }

        setCurrentStep((prevStep) => Math.min(prevStep + 1, courseData.length));
        setVideoWatched(false);
        // window.scrollTo({
        //   top: 60,
        //   left: 60,
        //   behavior: "smooth"
        // });

        if (scrollableDivRef.current) {
          scrollableDivRef.current.scrollTop = 10;
        }
      } catch (error) {
        // console.error('Error updating status:', error);
      }
    }
  };


  const handlePrevious = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
    // window.scrollTo({
    //   top: 60,
    //   left: 60,
    //   behavior: "smooth"
    // });

    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = 10;
    }
  };

  const handleSubmission = async () => {
    if (courseData[currentStep - 1]?.contentType === 'Video' && !videoWatched) {
      toast.info(lngsltd["Please complete the video before submitting"]);
    } else {
      try {
        let status = "Completed";
        const courseId = courseData[currentStep - 1].courseID;
        const stepNo = courseData[currentStep - 1].stepNo;

        // Send PUT request to update UserCourseStep status
        await axios.put(`${apiUrl}/UserCourseStep/UpdateStatus?courseId=${courseId}&userId=${userID}&stepNumber=${stepNo}&status=${status}`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userDetails.token}`
          }
        });

        const userCourseData = {
          UserID: userID,
          CourseID: courseId,
          IsCourseCompleted: true,
          EndTime: new Date().toISOString()
        };

        const response = await axios.put(`${apiUrl}/UserCourse/UpdateUserCourse?userId=${userCourseData.UserID}&courseId=${userCourseData.CourseID}&isCourseCompleted=${userCourseData.IsCourseCompleted}&endTime=${userCourseData.EndTime}`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userDetails.token}`
          }
        });

        toast.success('Course submitted successfully');
        // navigate('/courses');
        setTimeout(() => {
          navigate('/courses');
        }, 2000);
      } catch (error) {
        toast.error(lngsltd['Failed to submit course']);
      }
    }
  }

  // SENDING PARAMETERS AS AN OBJECT IN REQUESTBODY

  // const handleExit = async () => {
  //   if (courseData[currentStep - 1]?.contentType === 'Video' && !videoWatched) {
  //     try {
  //       let status = 'InComplete';
  //       const courseId = courseData[currentStep - 1].courseID;
  //       const stepNo = courseData[currentStep - 1].stepNo;

  //       const requestBody = {
  //         courseId: courseId,
  //         userId: userID,
  //         stepNumber: stepNo,
  //         status: status
  //     };

  //      await axios.put(`${apiUrl}/UserCourseStep/UpdateStatus`, requestBody, { headers }
  //       );
  //       navigate('/courses');
  //     } catch (error) {
  //       console.error('Error updating status and video time:', error);
  //     }
  //   }
  //   navigate('/courses');
  // };

  // const handleNext = async () => {
  //   if (courseData[currentStep - 1]?.contentType === 'Video' && !videoWatched) {
  //     toast.info(lngsltd["Please complete the video before proceeding to the next step"]);
  //   } else {
  //     try {
  //       let status = "Completed";
  //       const courseId = courseData[currentStep - 1].courseID;
  //       const stepNo = courseData[currentStep - 1].stepNo;

  //       const requestBody = {
  //         courseId: courseId,
  //         userId: userID,
  //         stepNumber: stepNo,
  //         status: status
  //       };

  //       const response = await fetch(`${apiUrl}/UserCourseStep/UpdateStatus`, {
  //         method: 'PUT',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${userDetails.token}`,
  //           'Content-Type': 'application/json;charset=utf-8',
  //           'Access-Control-Allow-Origin': '*',
  //           'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  //           'Access-Control-Max-Age': '3600',
  //           'Access-Control-Allow-Headers': 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With'
  //         },
  //         body: JSON.stringify(requestBody)
  //       });

  //       if (!response.ok) {
  //         throw new Error(lngsltd['Network response was not ok']);
  //       }

  //       setCurrentStep((prevStep) => Math.min(prevStep + 1, courseData.length));
  //       setVideoWatched(false);
  //       window.scrollTo({
  //         top: 60,
  //         left: 60,
  //         behavior: "smooth"
  //       });
  //     } catch (error) {
  //       console.error('Error updating status:', error);
  //     }
  //   }
  // };


  // const handlePrevious = () => {
  //   setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  //   window.scrollTo({
  //     top: 60,
  //     left: 60,
  //     behavior: "smooth"
  //   });
  // };

  // const handleSubmission = async () => {
  //   if (courseData[currentStep - 1]?.contentType === 'Video' && !videoWatched) {
  //     toast.info(lngsltd["Please complete the video before submitting"]);
  //   } else {
  //     try {
  //       let status = "Completed";
  //       const courseId = courseData[currentStep - 1].courseID;
  //       const stepNo = courseData[currentStep - 1].stepNo;

  //       const requestBody = {
  //         courseId: courseId,
  //         userId: userID,
  //         stepNumber: stepNo,
  //         status: status
  //     };

  //        await axios.put(`${apiUrl}/UserCourseStep/UpdateStatus`, requestBody, {
  //               headers: {
  //                   'Content-Type': 'application/json',
  //                   'Authorization': `Bearer ${userDetails.token}`
  //               }
  //           });

  //           toast.success(lngsltd['Course submitted successfully']);
  //           navigate('/courses');
  //       } catch (error) {
  //           console.error('Error updating status and video time:', error);
  //           toast.error(lngsltd['Failed to submit course']);
  //       }
  //   }
  // }



  // Function to generate image URL with headers
  // const getImageUrl = (courseID, stepNo, contentType, fileName) => {
  //   const url = `${COURSE_API_URL}/CourseStep/filecontent?CourseID=${courseID}&StepNo=${stepNo}&ContentType=${contentType}&FileName=${fileName}`;
  //   return `${url}&headers=${headers}`;
  // }


  return (
    <div className='startcoursepagediv w-100 m-3' ref={scrollableDivRef}>
      <ToastContainer
        position="top-center" // Position at the bottom right corner
        autoClose={2000} // Close after 2 seconds
        // hideProgressBar={false} // Show progress bar
        newestOnTop={false} // Display newer notifications below older ones
        closeOnClick // Close the notification when clicked
      />
      {/* Stepper */}
      <div className="stepper-container mb-5 mt-3 p-3 rounded">
        {courseData.map((courseStep, index) => (
          <div key={index} className="stepper-step">
            <div
              className={`step ${courseStep.stepNo <= currentStep ? 'active' : ''}`}
            >
              {courseStep.stepNo}
            </div>
            {index < currentStep - 1 && (
              <div className="progress-line"></div>
            )}
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="content-section">
        {courseData[currentStep - 1] && (
          <>
            {courseData[currentStep - 1].contentType === 'Image' && (
              <>
                {imageUrls.length > 0 && (
                  <div >
                    {imageUrls.map((imageUrl, index) => (
                      <div key={index} className='media-item'>
                        <div>
                          <img src={imageUrl} className='uploaded-image m-3' style={{ width: '90%', height: 'auto' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {courseData[currentStep - 1].contentType === 'Video' && (
              <div className='d-flex justify-content-center w-100'>
                {videoUrl ? (
                  <>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      preload="none"
                      poster="thumbnail.png"
                      type='video/mp4'
                      headers={'range:byte=0-'}
                      muted
                      width="80%"
                      onEnded={() => setVideoWatched(true)}
                    >
                       {/* <source src={videoUrl} type="video/mp4"/>  //comment this if you are using src in the video tag itself.    */}
                      {lngsltd["Your browser does not support the video tag"]}
                    </video>

                    {/* <video
                      src={videoUrl}
                      controls
                      autoPlay
                      type="video/mp4"                      
                      muted
                      width="80%"
                      onEnded={() => setVideoWatched(true)}
                    >
                        <source src={videoUrl} type="video/mp4"/>  //comment this if you are using src in the video tag itself.    
                      {lngsltd["Your browser does not support the video tag"]}
                    </video> */}
                    
                    {/* <iframe allow="autoplay" className='videoframe' src="https://vimeo.com/948636042?share=copy" frameborder="0" title="summer sale mobile video"></iframe> */}

                    {/* <Player
                      src={videoUrl}
                      controls
                      autoPlay
                      preload="none"
                      poster="thumbnail.png"
                      type='mp4'
                      headers={'range:byte=0-'}
                      muted
                      width="80%"                     
                      onEnded={() => setVideoWatched(true)}
                    >
                    </Player> */}

                    {/* <ReactHlsPlayer
                        src={videoUrl}
                        autoPlay={false}
                        controls={true}
                        width="100%"
                        height="auto"
                      /> */}

                    {/* <ReactPlayerurl={url}controlsplayingwidth="100%"height="100%"config={{file: { attributes: { controlsList: 'nodownload', // Disable download buttonpreload: 'auto', // Preload the video } } }} /> */}
                    {/* <ReactPlayer
                      // url="https://youtu.be/X7tgPfhDs0g"
                      url="https://vimeo.com/948636042?share=copy"
                      controls={true}      
                      preload="none"
                      autoPlay   
                      className='videoframe'                                                        
                      onEnded={() => setVideoWatched(true)}
                    /> */}
                  </>
                ) : (
                  <p><b>{lngsltd["Loading...Please wait"]}</b></p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* <hr className='border border-danger h-1'></hr> */}

      {/* Description Section */}
      <div className="description-section m-2 border border-secondary p-3 " dangerouslySetInnerHTML={{ __html: htmlContent  }}></div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button className="btn btn-danger" onClick={handleExit}>
          <FontAwesomeIcon className='iconstyle' icon={faRightFromBracket} />{lngsltd["Exit"]}
        </button>
        <div style={{ float: "right" }}>
          {/* <button className="btn btn-info" onClick={handlePrevious} onTouchStart={handlePrevious} disabled={currentStep === 1}>
            <FontAwesomeIcon className='iconstyle' icon={faLeftLong} /> {lngsltd["Previous"]}
          </button>
          <button className="btn btn-info" onClick={handleNext} onTouchStart={handleNext} hidden={currentStep === courseData.length}>
            <FontAwesomeIcon className='iconstyle' icon={faRightLong} /> {lngsltd["Next"]}
          </button> */}
          <button className="btn btn-info" onClick={handlePrevious} disabled={currentStep === 1}>
            <FontAwesomeIcon className='iconstyle' icon={faLeftLong} /> {lngsltd["Previous"]}
          </button>
          <button className="btn btn-info" onClick={handleNext} hidden={currentStep === courseData.length}>
            <FontAwesomeIcon className='iconstyle' icon={faRightLong} /> {lngsltd["Next"]}
          </button>
          <button className="btn btn-outline-success border " hidden={currentStep < courseData.length} onClick={handleSubmission}>
            Submit <FontAwesomeIcon className='iconstyle px-1' icon={faPaperPlane} />
          </button>
        </div>
      </div>
      <div style={{ height: "25px", display: "block" }}>

      </div>
    </div>
  );
};

export default StartCoursePage;
