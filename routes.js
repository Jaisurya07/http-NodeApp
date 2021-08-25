
const qs = require('querystring')
const fs = require('fs');
const url = require('url')
// const util = require('util');

// const writeFile = util.promisify(fs.writeFile);


const mockDb = fs.readFileSync('./mockDb.json');
const blogData = JSON.parse(mockDb)

function requestHanlders(req,res) {

    const URL = req.url;
    const METHOD = req.method;
    // const data = [];
//     if(URL === '/addd-post'){
//         res.statusCode = 200;
//         res.setHeader('Content-Type','text/html');
//         res.write(`<!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta http-equiv="X-UA-Compatible" content="IE=edge">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Document</title>
//         </head>
//         <body>
//         <form method="POST" action ="/save-post-data">
//          <label for="blogTitle" >Title:</label>
//          <input type="text" name="blogTitle"><br>
//          <input type="text" name ="blogText"></input>
//          <button type="submit"> Add Post</button>
//          </form>
//         </body>
//         </html>`)
//         // res.setHeader('location','/save-post-data') => find why it failed..
//         return res.end();
//  }
 if(URL === '/add-post' && METHOD === 'POST'){
    //  const blogData = [];
    req.on('error',(error)=>{
        console.log(error);
    })
     req.on('data',(chunks) => {
        const data = JSON.parse(chunks);
        const blogId = Math.floor(Math.random()*9999) + 1000;
        const blogTitle = data.blogTitle;
        const blogText = data.blogText;
         console.log(typeof blogData);
        blogData.push({blogId : blogId,blogTitle : blogTitle,blogText : blogText});
        const writableData = JSON.stringify(blogData);
        return fs.writeFile('./mockDb.json',writableData, (err)=> {
            if(err) throw err;
        });
         
     });
      res.setHeader('location','/view-blog-data');
      return res.end("Blog Added Succesfully!Go To View Blog Page!")
      
 }
 
 
 if(URL === '/view-blog-data'){
     res.setHeader('Cotent-Type','application/json')
     res.write(JSON.stringify(blogData));
     return res.end()
 }
 const searchString = url.parse(req.url,true).search;

 if(URL === `/update-blog-data${searchString}` && METHOD === 'PUT'){
   
     const urlParse = url.parse(req.url,true);
     const search = urlParse.search 
     if(search){
         const query = urlParse.search.split('?')[1];
         const blogId = parseInt(qs.parse(query).blogId);
        //  console.log("blog id is ",id);
     

     if(blogId) {
            req.on('data',(chunks) => {
                const data = JSON.parse(chunks);
                const updateTitle = data.blogTitle;
                const updateText = data.blogText;
               
                blogData.forEach((blog,index)=> {
                    console.log(typeof blog.blogId+ "vs"+typeof blogId)
                    if(blog.blogId === blogId){
                        blogData[index].blogTitle = updateTitle;
                        blogData[index].blogText = updateText;
                        console.log(blogData[index]);
                         }
                });
                const updatedBlogData = JSON.stringify(blogData);
                fs.writeFile('./mockDb.json',updatedBlogData,(err)=>{
                    if(err) throw err;
                })
            })
            return res.end('Updated Successfully!')
     }
    }
     else{
         res.writeHead(404,{statusMessage : "Blog ID Not found!"});
         return res.end( );
     }
    //   return res.end('In build mode!')
 }


 if(URL === `/delete-blog${searchString}` && METHOD === 'DELETE'){
    const query = searchString.split('?')[1];
    const blogId = parseInt(qs.parse(query).blogId);

    const filteredBlogData = blogData.filter(blog => blog.blogId !== blogId);
    if(blogId) {
        
            const finalBlogData = JSON.stringify(filteredBlogData);
            fs.writeFile('./mockDb.json',finalBlogData,(err)=>{
                if(err) throw err;
            })
    
        return res.end('deleted Successfully!')
 }

 else{
     res.writeHead(404,{statusMessage : "Blog ID Not found!"});
     return res.end( );
 }
    
   
 }

 if(URL == '/blog' && METHOD == "GET"){
     res.writeHead(200,{ "Content-Type": "application/json"});
     return res.end(JSON.stringify(blogData,null,2))
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