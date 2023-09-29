const ApiError = require("../middlewares/apiError");
const { verifySignature } = require("../middlewares/webhook");
const clientModel = require("../models/Client");
const paypalTokenController = require("../middlewares/paypalToken");
const axios = require("axios");
const invoiceService = require("../services/invoiceService");
const userModel = require("../models/User");

class webhookService {

  async webhookSubscriptionCancelled(data, headers) {
    try {
      console.log("webhookSubscriptionCancelled", data);
      console.log("webhook header", headers);
      const verifiedSignature = await verifySignature(headers, data);

      if (!verifiedSignature) {
        return ApiError.badRequest("Invalid webhook received");
      }
    } catch (error) {
      throw error;
    }
  }


  async webhookSubscriptionExpired(headers, data) {
    try {
      console.log("webhookSubscriptionExpired", data);
      const verifiedSignature = await verifySignature(headers, data);

      if (!verifiedSignature) {
        return ApiError.badRequest("Invalid webhook received");
      }

      const subscription_id = data.resource.id;
    /////====================== when plan expired then is active false and isRenew false and isCancelled true is to be updated in client model inside renewals array  ======================/////
      const updatedClient = await clientModel
        .findOneAndUpdate(
          { "subscriptionPlans.renewals.subscription_id": subscription_id },
          {
            $set: {
              "subscriptionPlans.$.renewals.$[innerRenewal].isCancelled": true,
              "subscriptionPlans.$.renewals.$[innerRenewal].cancellationDate":
                new Date(),
              "subscriptionPlans.$.renewals.$[innerRenewal].isActive": false,
              "renewals.$.isRenew": false,
            },
          },
          { new: true }
        )
        .exec();
      if (!updatedClient) {
        throw new Error("Client not found");
      }
      return updatedClient;

    } catch (error) {
      return ApiError.badRequest("Invalid webhook received", error.message);
    }
  }



  async webhookSubscriptionSuspended(headers, data) {
    try {
      console.log("webhookSubscriptionSuspended", data);
      const verifiedSignature = await verifySignature(headers, data);

      if (!verifiedSignature) {
        return ApiError.badRequest("Invalid webhook received");
      }

      const subscription_id = data.resource.id;

      const updatedClient = await clientModel
      .findOneAndUpdate(
        { "subscriptionPlans.renewals.subscription_id": subscription_id },
        {
          $set: {
            "subscriptionPlans.$.renewals.$[innerRenewal].isCancelled": true,
            "subscriptionPlans.$.renewals.$[innerRenewal].cancellationDate":
              new Date(),
            "subscriptionPlans.$.renewals.$[innerRenewal].isActive": false,
            "renewals.$.isRenew": false,
          },
        },
        { new: true }
      )
      .exec();
      if (!updatedClient) {
        throw new Error("Client not found");
      }
      return updatedClient;
    } catch (error) {
      return ApiError.badRequest("Invalid webhook received", error.message);
    }
  }


  async webhookSubscriptionComplete(headers, data) {
    try {
  
      const verifiedSignature = await verifySignature(headers, data);
      if (!verifiedSignature) {
        return ApiError.badRequest("Invalid webhook received");
      }

      const subscriptionID = data.resource.billing_agreement_id ;  
      // const subscriptionID = "I-Y01DVJUBY8EW"  ;
      // const amount = data.resource.amount.total;
      const orderID = data.resource.id  ;
      // const orderID = "1JP832788F798320U" ;

      const token = await paypalTokenController.createToken();

      const orderApiResponse = await axios.get(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
console.log("orderApiResponse",orderApiResponse);
      const subscriptionApiResponse = await axios.get(
        `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const subscriptionPlanDetail = await axios.get(
        `https://api-m.sandbox.paypal.com/v1/billing/plans/${subscriptionApiResponse.data.plan_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const frequency =
        subscriptionPlanDetail?.data?.billing_cycles[0]?.frequency
          ?.interval_unit;
      const nextBillingTime = new Date(
        subscriptionApiResponse?.data?.billing_info?.next_billing_time
      );
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds

      let endDate;

      if (frequency === "MONTH") {
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      } else if (frequency === "YEAR") {
        nextBillingTime.setFullYear(nextBillingTime.getFullYear() + 1);
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      }

      const renewalData = {
        amount:
          subscriptionPlanDetail?.data?.billing_cycles[0]?.pricing_scheme
            ?.fixed_price?.value,
        payableAmount:
          subscriptionPlanDetail?.data?.billing_cycles[0]?.pricing_scheme
            ?.fixed_price?.value,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        plan_id: subscriptionPlanDetail?.data?.id,
        planName: subscriptionPlanDetail?.data?.name,
        renewalDate:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        startDate:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        endDate: endDate,
        nextRenewalDate:
          subscriptionApiResponse?.data?.billing_info?.next_billing_time,
        subscription_id: subscriptionApiResponse?.data?.id,
        isPaid: true,
        isCancelled: false,
      };
      const updatedClient = await clientModel
        .findOneAndUpdate(
          {
            "subscriptionPlans.renewals.subscription_id": subscriptionID,
            isDeleted: false,
          },
          {
            $push: { "subscriptionPlans.0.renewals": renewalData },
            $set: { "subscriptionPlans.0.isRenew": true },
          },
          { new: true }
        )
        .populate("users")
        .select("subscriptionPlans users")
        .lean();

        console.log("updatedClient",updatedClient);
      if (!updatedClient) {
        throw new Error("Client not found");
      }

      ///////////////=============adding payment data ==========================////////////////////
      const payment = {
        _renewalId:
          updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
        paymentId: orderApiResponse?.data?.id,
        paymentStatus: orderApiResponse?.data?.status,
        paymentMethod: "PayPal",
        paymentDate: orderApiResponse?.data?.create_time,
        amount:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.amount
            ?.value,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        currency:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.amount
            ?.currency_code,
        paymentMode: "Online",
        paymentGateway: "PayPal",
        feeType: "Subscription",
      };
 await clientModel
        .findOneAndUpdate(
          {  "subscriptionPlans.renewals.subscription_id": subscriptionID
            , isDeleted: false },
          {
            $push: { payments: payment },
          },
          { new: true }
        )
        .lean();
        console.log("payment",payment);

      //////////////////////////////////=================invoice===================///////////////////////////
      const clientId = updatedClient._id.toString();
      const userPerformer = updatedClient.users[0];
  
      if (!userPerformer) {
        throw new Error("Performer not found");
      }

      const invoiceData = {
        client_id: clientId,
        renewal_id:
          updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
        title: "Subscription Plan",
        ///=== create uniqe invoice number for every invoice  ===///
   invoiceNumber:
          "INV-" +
          new Date().getFullYear() +
          "-" +
          "00" + new Date().getTime(),

        invoiceDate: new Date(),
        paymentDate: new Date(),
        amount:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.amount
            ?.value,
        paidStatus: true,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        email: subscriptionApiResponse?.data?.subscriber?.email_address,
      };

      console.log("invoiceData", invoiceData);

     
      await invoiceService.addInvoice(userPerformer, invoiceData);

      return {
        order: orderApiResponse?.data,
        subscription: subscriptionApiResponse?.data,
        PlanDetails: subscriptionPlanDetail?.data,
      };
    } catch (error) {
      return ApiError.badRequest("Invalid webhook received", error.message);
    }
  }



  async webhookSubscriptionPaymentFailed(headers, data) {
    try {
      console.log("webhookSubscriptionPaymentFailed", data);
      const verifiedSignature = await verifySignature(headers, data);
      if (!verifiedSignature) {
        return ApiError.badRequest("Invalid webhook received");
      }
      const subscription_id = data.resource.id;

    } catch (error) {
      return ApiError.badRequest("Invalid webhook received", error.message);
    }
  }
}

module.exports = new webhookService();
