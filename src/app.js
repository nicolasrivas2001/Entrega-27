import express from "express";
import { engine } from "express-handlebars";
import { __dirname } from "./utils.js";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/cart.router.js"
import usersRouter from "./routes/users.router.js"
import sessionsRouter from "./routes/sessions.router.js"
import { messagesManager } from "./db/managers/messagesManager.js";
import { productsManager } from "./db/managers/productsManager.js";
import session from "express-session";
import { Server } from "socket.io";
import "./db/configDB.js";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";


const app = express();
const URI = `mongodb+srv://nicolasrivass2001:oKiRuu3uaSSVpxgc@cluster0.edas4ca.mongodb.net/ecommerce?retryWrites=true&w=majority`
app.use(session({
  store: new MongoStore({
    mongoUrl:URI
  }),
  secret: "secretSession",
  cookie: {maxAge:60000},
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser("SecretCookie"))

// handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use("/api/products", productsRouter);
app.use("/", viewsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);






const httpServer = app.listen(8088, () => {
  console.log("Server is listening on port 8080");
});

const socketServer = new Server(httpServer);
socketServer.on("connection", (socket) => {
  socket.on("newMessage", async(message) => {
    await messagesManager.createOne(message)
    const messages = await messagesManager.findAll()
    socketServer.emit("sendMessage", messages);
  });

  socket.on("showProducts", async() => {
    const products = await productsManager.findAll({limit:10, page:1, sort:{}, query:{} })
    socketServer.emit("sendProducts", products);
  });


  /*socket.on("newPrice", (value) => {
    socket.broadcast.emit("priceUpdated", value);
  });

  socket.on("showProducts", async(req,res) => {
    const products = await manager.getProducts({})
    socket.emit("sendProducts", products);
  });

  socket.on("addProduct", async(product) => {
    await manager.addProduct(product.title,product.description,product.price,product.thumbnail,product.code,product.stock)
    const products = await manager.getProducts({})
    socketServer.emit("productUpdated", products);
  });

  socket.on("deleteProduct", async(id) => {
    await manager.deleteProduct(+id)
    const products = await manager.getProducts({})
    socketServer.emit("productUpdated", products);
  });*/
});