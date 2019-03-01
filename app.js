// carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require("./routes/admin")
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model("postagens")
    require('./models/Categoria')
    const Categoria = mongoose.model("categorias")
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)
    const db = require('./config/db')


 //Configurações
    //Session
        app.use(session({
            secret: "cursodenode",
            resave:true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //middleware
        app.use((req,res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null;
            next()
        })       
    //body parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI).then(() => {
            console.log("Conectado com mongo")
        }).catch((err) => {
            console.log("Erro ao conectar: "+err)
        })
    //public
        app.use(express.static(path.join(__dirname, "public")))

        app.use((req, res, next) => {
            console.log('Oi EU SOU UM middlewares')
            next()
        })
 //Rotas
    app.get('/',(req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
        req.flash("error_msg", "Houve um erro na postagem")
        res.redirect("/404")
        })
        
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno a listar as categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro interno a 34")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Categoria nao existe 33")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno 32 ")
            res.redirect("/")
        })
    })

    app.get('/404',(req, res) => {
        res.send('Erro 404 (#_@)')
    })

    app.get('/posts', (req, res) => {
        res.send('lista posts')
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
 //Outras
 const PORT = process.env.PORT || 8080
 app.listen(PORT,() => {
     console.log('servidor rodando! ')
 })