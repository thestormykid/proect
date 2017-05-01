var express               = require('express'),
app                       = express(),
mongoose                  = require("mongoose"),
passport                  = require("passport"),
LocalStrategy             = require("passport-local"),
passportLocalMongoose     = require("passport-local-mongoose"),
bodyParser                = require("body-parser");
   
mongoose.connect("mongodb://localhost/blogs");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

var blogsSchema = mongoose.Schema({
    title: String,
    url : String,
    text : String
});

var UserSchema = mongoose.Schema({
    username: String,
    password: String
});
UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",UserSchema);
var blogs = mongoose.model("val",blogsSchema);

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

app.get("/",function (req,res){
    res.render("landing");
});


app.get('/blogs', isLoggedIn , function (req,res){
    blogs.find({},function(err, data){
       if (err){
           console.log(err);
       }else{
           res.render("index",{data: data});    
       }
    });
});



app.get('/blogs/new', function(req,res) {
   res.render("forms"); 
});

app.post('/blogs', isLoggedIn, function(req,res){
    blogs.create(req.body.blogs,function(err, data){
       if (err){
           console.log(err);
       } else{  
        res.redirect('/blogs');
       }
    });
});

app.get('/blogs/:id',function(req, res) {
    var show = req.params.id;
    
    blogs.findById(show,function(err,data){
       if (err){
           console.log(err);
       } else{
           res.render("show",{blogs: data});
       }
    });
});


app.get("/register", function(req, res){
   res.render("register"); 
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secret");
        });
    });
});

app.get("/login", function(req, res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
        res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("server is listening .... "); 
});