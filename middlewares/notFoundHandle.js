const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: "Rotta non trovata",
    });
};

module.exports = notFoundHandler;
