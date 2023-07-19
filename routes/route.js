const router = require("express").Router();

const { sendGmailTest, send } = require("../controller/appController.js");

/** HTTP Reqeust */
// router.post("/send", sendGmailTest);
router.post("/send", send);
// router.post("/product/getbill", getbill);

module.exports = router;
