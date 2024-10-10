const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const postsRouter = require("./routers/postsRouter.js");
const notFoundHandler = require("./middlewares/notFoundHandle.js");
const errorHandler = require("./middlewares/errorHandler.js");

//Middlewares generici
app.use(express.json());

//Rotte
app.get("/", (req, res) => {
    res.send("<h1>Benvenuto nel blog!</h1>");
});

app.use("/posts", postsRouter);

//Middlewares per la gestione degli errori
app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
});
