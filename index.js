var AWSXRay = require('aws-xray-sdk');
//const { addSegment } = require("aws-xray-lambda-promise-subsegment");
const express = require('express');
const axios = require('axios');
const path = require('path');
const members = require('./Members');
const logger = require('./middleware/logger')
const app = express();
const PORT = process.env.PORT || 5000;
var AWSXRay = require('aws-xray-sdk');
app.use(AWSXRay.express.openSegment('defaultName'));
app.use(logger);

//get all members
app.get('/api/members', (req, res) => {
    //console.log(AWSXRay.getSegment());
    AWSXRay.captureAsyncFunc('getOneTodo', function (subSegment) {
        console.log(multiply(1)(2)(3));
        console.log(add(10)(50));
        apiSingleTodo().then(response =>{
            console.log("response received!!!");
            console.log(response.data);
            console.log(response.status);
            res.json(response.data);
        }).catch(error =>{
            console.log(error);
        });
        subSegment.close();
    });
    //getAllTodos();
    //res.json(members);
});

//Get single member

app.get('/api/members/:id', (req, res) => {
    const found = members.some(member => member.id === parseInt(req.params.id));
    if (found) {
        res.json(members.filter(member => member.id === parseInt(req.params.id)));
    }
    res.status(400).json({ msg: `member not found with id ${req.params.id}` });
});

app.use(AWSXRay.express.closeSegment());

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`started nodejs app @port ${PORT}`));


//better looking without wrapping the whole block of code
const apiSingleTodo = () => {
    const promise = new Promise(function(resolve, reject){
        axios.get('https://jsonplaceholder.typicode.com/todos/1')
        .then((response) => {
            return resolve(response);
        }).catch(error => {
            return reject(error);
        });
    });

    return AWSXRay.captureAsyncFunc('todoPromise', function(subsegment){
        try{
            return promise;
        }finally{
            //console.log(AWSXRay.getSegment());
            console.log(subsegment);
            subsegment.close();
        }
    });
}

const getAllTodos = () =>{
    AWSXRay.captureAsyncFunc('getAllTodos', function (subSegment) {
        axios.get('https://jsonplaceholder.typicode.com/todos')
        .then((response) => {
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
        }).catch(error => {
            console.log(error);
        });
        subSegment.close();
    });    
}

const apiCall = () => {
    return AWSXRay.captureAsyncFunc('todoPromise', function(subsegment){
        try{
            return new Promise(function(resolve, reject){
                axios.get('https://jsonplaceholder.typicode.com/todos/1')
                .then((response) => {
                    console.log(subSegment);
                    return resolve(response);
                    
                }).catch(error => {
                    return reject(error);
                });
                
            });
        }finally{
            console.log("segment: "+AWSXRay.getSegment());
            subsegment.close();
        }
    });
}

function multiply(a) {
    return (b) =>{
        return (c) =>{
            return a * b * c;
        }
    }
}

const add = a => b => a + b;

// const myPromise = new Promise(function(resolve, reject){
    //     axios.get('https://jsonplaceholder.typicode.com/todos/1')
    //     .then((response) => {
    //         resolve(response);
    //     }).catch(error => {
    //         reject(error);
    //     });
    // });
    // const promiseWrappedInSubsegment = addSegment("oneTodo", myPromise);
    // return promiseWrappedInSubsegment;