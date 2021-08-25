
const qs = require('querystring')
const fs = require('fs');
const url = require('url')
// const util = require('util');

// const writeFile = util.promisify(fs.writeFile);

function generateRandomId() {return Math.floor(Math.random() *9000) + 1000 };

function getJsonifiedData(data) {
    return JSON.parse(data);
}

function getStringifiedData(data){
    return JSON.stringify(data);
}
const mockDb = fs.readFileSync('./mockDb.json');
const blogData = getJsonifiedData(mockDb)

function requestHanlders(req,res) {

    const URL = req.url;
    const METHOD = req.method;
 
 if(URL === '/add-post' && METHOD === 'POST'){
    //  const blogData = [];
    req.on('error',(error)=>{
        console.log(error);
    })
     req.on('data',(chunks) => {
        const data = getJsonifiedData(chunks);
        const blogId = generateRandomId();
        const blogTitle = data.blogTitle;
        const blogText = data.blogText;
        if(blogTitle === undefined|| blogText === undefined) {
           res.writeHead(400,'Content-Type','application/json');
           return res.end({message : "no blog details found!",sucess : false})
        }
        blogData.push({blogId : blogId,blogTitle : blogTitle,blogText : blogText});
        
        const writableData = getStringifiedData(blogData);
       
        return fs.writeFile('./mockDb.json',writableData, (err)=> {
            if(err) throw err;
        });
         
     });
      res.setHeader('location','/view-blog-data');
      return res.end("Blog Added Succesfully!Go To View Blog Page!")
      
 }
 
 
 if(URL === '/view-blog-data' && METHOD === 'GET'){
     res.setHeader('Cotent-Type','application/json')
     res.write(JSON.stringify(blogData));
     return res.end()
 }
 const searchString = url.parse(req.url,true).search;

 if(URL === `/update-blog-data${searchString}` && METHOD === 'PUT'){
   
     
    if(searchString){
         const query = searchString.split('?')[1];
         const blogId = qs.parse(query).blogId;
        
     
        console.log(blogId, typeof blogId)
      
     if( blogId) {
            req.on('data',(chunks) => {
                const data = getJsonifiedData(chunks);
                const updateTitle = data.blogTitle;
                const updateText = data.blogText;
               
                blogData.forEach((blog,index)=> {
                   
                    if(blog.blogId == blogId){
                        blogData[index].blogTitle = updateTitle;
                        blogData[index].blogText = updateText;
                         }
                });
                const updatedBlogData = getStringifiedData(blogData);
                fs.writeFile('./mockDb.json',updatedBlogData,(err)=>{
                    if(err) throw err;
                })
            })
            return res.end('Updated Successfully!')
     }
     return res.end("Blog details unavailable for the this id!");
    }
     else{
         res.writeHead(404,{statusMessage : "Blog ID Not found!"});
         return res.end("Blog details unavailable for the this id!");
     }
    //   return res.end('In build mode!')
 }


 if(URL === `/delete-blog${searchString}` && METHOD === 'DELETE'){
    const query = searchString.split('?')[1];
    const blogId = qs.parse(query).blogId;

    const filteredBlogData = blogData.filter(blog => blog.blogId != blogId);
    if(blogId) {
        
            const finalBlogData = JSON.stringify(filteredBlogData);
            fs.writeFile('./mockDb.json',finalBlogData,(err)=>{
                if(err) throw err;
            })
    
        return res.end('deleted Successfully!')
        }

    else{
     res.writeHead(404,{statusMessage : "Blog ID Not found!"});
     return res.end( "Cannot delete the blog post for unknown id");
        }
    
   
 }

 if(URL == '/blog' && METHOD == "GET"){
     res.writeHead(200,{ "Content-Type": "application/json"});
     return res.end(getJsonifiedData(blogData,null,2))
 }
    res.setHeader("Conten-Type","text/html")
    res.statusCode = 200;
    res.write(`<html>
            <head><title> Landing Page </title></head>
            <body>
            <h1> Hello! Welcome to Learn dev Landing Page! Let's learn node.</h1>
            </body>
        </html>`)
    res.end();

}

exports.handler = requestHanlders;