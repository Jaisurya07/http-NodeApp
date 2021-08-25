const http = require('http');
require('dotenv').config();

const routes = require('./routes')

const PORT = process.env.PORT


const server = http.createServer(routes.handler);

server.listen(PORT,()=>{
    console.log(`Server running on http://localhost/${PORT}`);
});