const axios = require("axios");
const ApiError = require("../middlewares/apiError");
const { createToken } = require("../middlewares/paypalToken");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer ECvJ_yBNz_UfMmCvWEbT_2ZWXdzbFFQZ-1Y5K2NGgeHn",
  },
};

const verifySignature = async (headers, body) => {
  try {
    const signatureBody = JSON.stringify(body);
    const authString = `Bearer ${await createToken()}`;
    const bodydata = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: "9B301304YN7082840",
        webhook_event: JSON.parse(signatureBody),
    };

    console.log("body data in signature api ", bodydata);

    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature`,
      bodydata,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authString,
        },
      }
    );
    if (response.status !== 200) {
      return ApiError.badRequest("Invalid signature");
    }
    return response.data;
  } catch (error) {
    return ApiError.badRequest("Invalid signature", error);
  }
};

module.exports = {
  verifySignature,
};
