/*
* Primary file of the API
*
*/


// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = {};

// instantiate the HTTP server
const httpServer = http.createServer(function(request, respond) {
    unifiedServer(request, respond);
});
httpServer.listen(config.httpPort, function(){
    console.log("The HTTP server: ",config.httpPort);
    console.log("in: ",config.envName);
})

// instatitate the https server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function(request, respond) {
    unifiedServer(request, respond);
});
httpsServer.listen(config.httpsPort, function(){
    console.log("The HTTPS server: ",config.httpsPort);
    console.log("in: ",config.envName);
})


// all the server logic for both the http and https server
const unifiedServer = function (request, respond) {
    // get the url and parse it
    let parsedUrl = url.parse(request.url, true);
    
    // get the path of the url
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    let queryStringObject = parsedUrl.query;

    // get the http method
    let method = request.method.toLowerCase();
    
    // get the headers as an object
    let headers = request.headers;

    // get the paypload, when handling stream, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    request.on('data', function(data){
        buffer += decoder.write(data);
    });

    request.on('end', function() {
        buffer += decoder.end();

        // choose the handler request to go to
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct data object to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        //route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // use the status code called back by the handler, define default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler, or the default empty
            payload = typeof(payload) == 'object' ? payload : '';

            // convert to payload to a string
            let payloadString = JSON.stringify(payload);

            // return the response
            respond.setHeader('Content-Type','application/json');
            respond.writeHead(statusCode);
            respond.end(payloadString);
            console.log('\nReturning this reponse',statusCode,payloadString);
        });
        
    });
}

// define the handlers
// https://httpstatuses.com/
handlers.hello = (data, callback) => callback(200, {'message': 'Hello World'})

// not found handler
handlers.notFound = (data, callback) =>  callback(404)

// define a request router
const router = {
    'hello' : handlers.hello
};