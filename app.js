let express          = require("express");
let app              = express();
let methodOverride   = require("method-override");
let bodyParser       = require("body-parser");
let mongoose         = require("mongoose");
let expressSanitizer = require("express-sanitizer");

//APP CONFIG
mongoose.connect("mongodb://localhost/blog_app" , {useNewUrlParser : true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//SCHEMA Mongoose/model/config

let blogSchema = new mongoose.Schema({
    title:String ,
    image:String , 
    body:String ,
    created: { type: Date ,  default: Date.now }
});

let blogs = mongoose.model("blogs" , blogSchema);

//ROUTES--
app.get("/" , function(req , res){
    res.redirect("/blogs");
});

app.post('/blogs' , function(req , res){
    
    req.body.blog.body = req.sanitize(req.body.blog.body);
   // console.log(req.body.blog);
    
    blogs.create(req.body.blog , function(err , newBlog){
        if(err){
            console.log(err);
        }else{
            res.redirect('/blogs');
        }
    });
});


app.get('/blogs' , function(req , res){
    blogs.find({} , function(err , dbBlog){
        if(err){
            console.log(err);
        }else{
            res.render("index.ejs" , { dbBlog : dbBlog});
        }
    });
    });

app.get('/blogs/new' , function(req , res){
    res.render("new.ejs");
});

//SHOW ROUTE

app.get('/blogs/:id', function(req , res){
   blogs.findById(req.params.id , function(err , foundBlogs){
    foundBlogs.body = req.sanitize(foundBlogs.body);
      // console.log(req.params);
       if(err){
          // console.log("get if");
           //console.log(err);
           res.redirect('/blogs');
       }else{
           //console.log("get else");
           res.render("show.ejs" , {foundBlogs : foundBlogs});
       }
   });
});

//EDIT ROUTE

app.get('/blogs/:id/edit' , function(req , res){
    blogs.findById(req.params.id , function(err , foundBlogs){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("edit.ejs" , {foundBlogs : foundBlogs});
        }
    });
    
});

//UPDATE ROUTE

app.put('/blogs/:id' , function(req , res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogs.findByIdAndUpdate(req.params.id , req.body.blog , {new: true} , function( err , updatedBlog ){
        //console.log(req.params.id);
        if(err){
           // console.log("put if");
            res.redirect("/blogs");
        }else{
            //res.send("updated");            
            //console.log("put else");
            res.redirect("/blogs/"+req.params.id);
        }
    });

});

//DELETE ROUTE

app.delete("/blogs/:id" , function(req , res){
    //res.send("Delete request called");
    //DESTROY THE BLOG.
    //REDIRECT SOMEWHERE ELSE.
    blogs.findByIdAndRemove(req.params.id , function(err){
        if(err){
            res.redirect("/blogs/"+req.params.id);
        }else{
            res.redirect("/blogs");
        }
    });
});


app.listen(process.env.PORT , process.env.IP , (req, res)=>{
    console.log("BlogApp server STARTED");
});