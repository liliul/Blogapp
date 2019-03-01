if(process.env.NODE_ENV == "production"){
    module.exports  = {mongoURI: "mongodb+srv://liliu:<#liliuchiha3a>@cluster0-nbec3.mongodb.net/test?retryWrites=true"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}