import express from "express";
import session from "express-session" 
import flash from "connect-flash"
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport"
import { mainRouter } from "./router";
import { connectToMongoose, connectToMongooseUser } from "./models";
import { create } from "express-handlebars";
import User from "./models/User";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {createServer} from "http";
import {Server} from 'socket.io';
import sockets from "./sockets.js"
//bloque para solucionar "__dirname is not defined"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//

const app = express();


//Express sesiones middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  name: "secret-name"
})
);
app.use(flash())
//
//Passport para sesiones
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done)=>done(null, {id: user._id, userName: user.userName})) //req.user
passport.deserializeUser(async(user, done)=>{
  const userDB = await User.findById(user.id)
  return done(null, {id: userDB._id, userName: userDB.userName})
})
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
mainRouter.use(express.static(__dirname + "../public/"));
app.use(cookieParser());
//motores de Plantilla
const hbs = create({
  extname: ".hbs",
  partialsDir: ["./src/views/components"],
});
  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
  app.set("views", "./src/views");
  //Conexiones asincronas de bdd
  await connectToMongoose();
  await connectToMongooseUser();
  
  
  app.use("/", mainRouter);
  
  const PORT = 3000;
  const server = createServer(app);
  const httpServer = server.listen(PORT, ()=>{
    console.log(`Server on http://localhost:${PORT}`);
  });


  const io = new Server(httpServer)
  sockets(io)
  


  
  

