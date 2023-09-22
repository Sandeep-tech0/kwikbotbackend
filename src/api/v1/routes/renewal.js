const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const RenewalController = require("../controllers/subscriptionPlanController");

router.put("/", auth, RenewalController.CancelClientSubscription);


module.exports = router;