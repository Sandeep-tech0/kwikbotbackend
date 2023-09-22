const express = require("express");
const adminEmailService = require("../services/adminEmailService");
const ENDPOINT = "/api/v1";

const upload = require("./upload");
const auth = require("./auth");
const user = require('./user')
const subscriptionPlan = require('./subscriptionPlan')
const client = require('./client')
const invoice = require('./invoice')
const content = require('./content')
const billingInfo = require('./billingInfo')
const renewal = require('./renewal')
const payment = require('./payment')
const leadCapture = require('./leadCapture')
const paypal = require('./payPal')


module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //Routes for uploaded files 
  app.use("/resources", express.static("uploads"));

  app.use(adminEmailService);

  app.use(ENDPOINT + `/upload`, upload);

  app.use(ENDPOINT + `/auth`, auth);
  app.use(ENDPOINT + `/users`, user);
  app.use(ENDPOINT + `/subscription-plans`, subscriptionPlan);
  app.use(ENDPOINT + `/clients`, client);
  app.use(ENDPOINT + `/invoices`, invoice);
  app.use(ENDPOINT + `/contents`, content);
  app.use(ENDPOINT + `/billing-info`, billingInfo);
  app.use(ENDPOINT + `/renewal`, renewal);
  app.use(ENDPOINT + `/payments`, payment);
  app.use(ENDPOINT + `/lead-captures`, leadCapture);
  app.use(ENDPOINT + `/pay-pal`, paypal);

};
