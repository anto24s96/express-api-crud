const express = require("express");
const router = express.Router();
const {
    index,
    store,
    show,
    update,
    destroy,
} = require("../controllers/postsCRUD.js");

//Rotte
router.get("/", index);
router.post("/", store);
router.get("/:slug", show);
router.put("/:slug", update);
router.delete("/:slug", destroy);

module.exports = router;
