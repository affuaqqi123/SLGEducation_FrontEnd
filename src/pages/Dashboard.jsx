import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import Card from 'react-bootstrap/Card';
import { useState, useEffect, useRef } from "react";
import Accordion from 'react-bootstrap/Accordion';
import './CoursesMain.css';


const Dashboard = () => {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const lngsltd = JSON.parse(localStorage.getItem('languageSelected'));
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userDetails.token}`
    }



    useEffect(() => {        
         window.scrollTo({
          top: 7,
          left: 7,
          behavior: "smooth"
        });
    }, []);
    //Environment variables
    const apiUrl = process.env.REACT_APP_API_URL;

    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className='maindashboarddiv m-3 w-100'>
            <h1 className='text-center'>{lngsltd["About Skeidar"]}</h1>
            <Accordion defaultActiveKey="0">
            {/* <Accordion> */}
                <Accordion.Item style={{ margin: '5px' }} eventKey="0">
                    <Accordion.Header><h3>{lngsltd["This is Skeidar"]}</h3></Accordion.Header>
                    <Accordion.Body>
                        {lngsltd["Since 1912, Skeidar has helped Norwegians to have a good time at home. We offer a wide range of modern quality furniture and stylish interior solutions, and are a specialist company that assists thousands of customers every day by being helpful, professional and available."]}
                        <br></br>
                        <br></br>

                        {lngsltd["Skeidar designs and develops a wide range of own products and brands, while at the same time we work closely with several of the Nordics' leading furniture and mattress brands such as Stressless, Jensen, Svane, Formfin, Brunstad, Conform, Hjellegjerde, Fagerheim, Wonderland, Hødnebø, HÅG, Flexlux, XOV, Kleppe, Furninova, Dynoform and Sacco."]}
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item style={{ margin: '5px' }} eventKey="1">
                    <Accordion.Header><h3>{lngsltd["This is our story"]}</h3></Accordion.Header>
                    <Accordion.Body>
                        {lngsltd["There was quickly talk of the clever cabinet maker who had opened his own workshop in Ski. Customers came from far and wide to buy modern and solid furniture from A. Andresen and his small family business. This was in 1912, and slowly but surely he expanded the workshop as the orders and customers increased."]}
                    </Accordion.Body>
                </Accordion.Item>


                <Accordion.Item style={{ margin: '5px' }} eventKey="2">
                    <Accordion.Header><h3>{lngsltd["Design and quality"]}</h3></Accordion.Header>
                    <Accordion.Body>
                        {lngsltd["We design for better homes. This means that we set high standards for the entire value chain. To our own design, to the materials, to colors and shades, to manufacturing and production. In addition, we are almost morbidly concerned with how our furniture looks in context - in Norwegian homes, in the cabin, together with other furniture and objects. What fits together? What trends are coming, what are fads and what are enduring styles and values? What exciting combinations, and what are smart solutions? We spend our entire working day on this. We simply design for you to have an even better life where you live it. At home."]}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

        </div>

    );
};
export default Dashboard;