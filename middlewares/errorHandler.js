const errorHandler = (err, req, res, next) => {
    if (err.message.includes("Prisma")) {
        return res.status(500).json({
            error: "Errore del server. Problema con il database.",
        });
    }
    next(err);
};

module.exports = errorHandler;
