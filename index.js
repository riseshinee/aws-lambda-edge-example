"use strict";

const jwt = require("jsonwebtoken");
const secretKey = 'secretkey';

exports.handler = async (event, context, callback) => {
  
  const { request, response } = event.Records[0].cf;
  const { uri } = request;
  const ObjectKey = decodeURIComponent(uri).substring(1);
  
  console.log( "request:"+ request );
  console.log( "response:" + response );
  const returnResponse = {
    status:"401",
    statusDescription: 'Unauthorized',
    headers: {
      'content-type': [{
        key: 'Content-Type',
        value: 'text/html'
      }],
      'access-control-allow-origin':[{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }]
    },
  };
  
  const successResponse = {
    status: "302",
    statusDescription: 'Found',
    headers: {
      location: [{
        key: 'Location',
        value: "s3 adress"+ObjectKey
      }],
      'access-control-allow-origin':[{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }],
      
    },
 };
 if(request.method == 'OPTIONS'){
    
    const optionsResponse = await {
      status: "200",
      statusDescription: 'OK',
      headers: {

      'access-control-allow-origin':[{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }],
            'access-control-allow-headers':[{
        key: 'Access-Control-Allow-Headers',
        value: '*'
      }]
      }
    };
         
    console.log("options response success");
    await callback(null, optionsResponse);
  }
  else if(request.method == 'GET' && request.headers.token?.length > 0){
      
    const token = request.headers.token[0].value;
    console.log("token:"+token);
      
    try{
      
      let decode , fileKey, streamingKey;
        
      if( token != "admin"){
          
        decode = await jwt.verify(token, secretKey);
        fileKey = await decode.key;
        streamingKey = await (ObjectKey.split('/'))[1];

        if( await fileKey == streamingKey){
          console.log("success");
          await callback(null, successResponse);
        }
      }
      else if (token == "admin" ){
        console.log("success");
        await callback(null, successResponse);
      }
        
    }catch (error) {
      console.log("error:" + error);
        await callback(null, returnResponse);
    }

  }else{
    
    console.log("fail");
    await callback(null, returnResponse);
    
  }

};