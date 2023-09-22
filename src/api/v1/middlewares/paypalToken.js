

const axios = require("axios");
const qs = require("qs");
const ApiError = require("../middlewares/apiError");
require("dotenv").config();



const config = {
    clientId:
      process.env.PAYPAL_CLIENT_ID,
    clientSecret:
      process.env.PAYPAL_CLIENT_SECRET 
  };
  


const  createToken = async () => {
    try {
      // Set up PayPal API request with authentication
      const authString = `Basic ${Buffer.from(
        `${config.clientId}:${config.clientSecret}`
      ).toString("base64")}`;
  
      const data = qs.stringify({
        grant_type: "client_credentials",
        ignoreCache: "true",
        return_authn_schemes: "true",
        return_client_metadata: "true",
        return_unconsented_scopes: "true",
      });
  
      const response = await axios.post(
        `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
        data,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authString,
          },
        }
      );
      if (response.status !== 200) {
        throw ApiError.badRequest("Invalid credentials");
      }
  
      return response.data.access_token;
    } catch (error) {
      console.error("Error creating OAuth token:", error);
      throw ApiError.badRequest(error.message);
    }
  };

  module.exports = {
    createToken,
  }