const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");
const paypalTokenController = require("../middlewares/paypalToken");
const axios = require("axios");

class SubscriptionPlanService {
  async getClientSubscriptionByClientId(userPerformer, clientId) {
    const finalClientId = clientId || userPerformer.clientId;

    const client = await Client.findOne({
      _id: finalClientId,
      isDeleted: false,
      "subscriptionPlans.isActive": true,
    })
      .select("subscriptionPlans")
      .lean();

    if (!client) {
      throw ApiError.badRequest("Client Subscription not found");
    }

    // if (
    //   client.subscriptionPlans.length > 0 &&
    //   client.subscriptionPlans[client.subscriptionPlans.length - 1].renewals
    //     .length > 0
    // ) {
   

    //   //for checking subscription is renew or not
    //   const renewals =
    //     client.subscriptionPlans[client.subscriptionPlans.length - 1].renewals[
    //       client.subscriptionPlans[client.subscriptionPlans.length - 1].renewals
    //         .length - 1
    //     ];
    //   if (renewals.nextRenewalDate < new Date()) {
    //     client.subscriptionPlans[
    //       client.subscriptionPlans.length - 1
    //     ].isRenew = true;
    //   }
    // }

    return client.subscriptionPlans[client.subscriptionPlans.length - 1];
  }

  async createClientSubscription(userPerformer, clientId, subscription, renewals) {

console.log("subscription",renewals)
    const subscriptionPlan = {
      planName: subscription.planName,
      frequency: subscription.frequency,
      currency: subscription.currency,
      amount: subscription.amount,
      applicableTaxPercentage: subscription.applicableTaxPercentage,
      setUpAmount: subscription.setUpAmount,
      isSetUpAmountApplicable: subscription.isSetUpAmountApplicable,
      applicableTaxPercentage: subscription.applicableTaxPercentage,
      isTaxApplicable: subscription.isTaxApplicable,
      description: subscription.description,
      renewals: [renewals],
    };

console.log("subscriptionPlan",subscriptionPlan)
 



    //push new  subscription plan in client subscription plan array
    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: clientId,
        isDeleted: false,
      },
      {
        $push: { subscriptionPlans: subscriptionPlan },
      },
      { new: true }
    )
      .select("subscriptionPlans")
      .lean();

    if (!updatedClient) {
      throw new Error("Client not found");
    }
    return updatedClient.subscriptionPlans[
      updatedClient.subscriptionPlans.length - 1
    ];
  }

  async updateClientSubscription(userPerformer, subscriptionPlan, clientId) {
    if (userPerformer.userType !== "SuperAdmin") {
      throw ApiError.badRequest("Only Super Admin can update subscription");
    }
    if (!clientId) {
      throw ApiError.badRequest("Client Id is required");
    }
//=== i want to take out the data of the client subscription which is latest and active and full renewalarry of the client latest subscription plan=============
 const client = await Client.findOne({
      _id: clientId,
      isDeleted: false,
      "subscriptionPlans.isActive": true,
    })
      .select("subscriptionPlans")
      .lean();

  if (!client) {
    throw ApiError.badRequest("Client not found");
  }

///===== renewalarry of the client latest subscription plan=============
  const renewals =
  client.subscriptionPlans[client.subscriptionPlans.length - 1].renewals[
    client.subscriptionPlans[client.subscriptionPlans.length - 1].renewals
      .length - 1
  ];



    //for creating new subcription
    const newSubcription = await this.createClientSubscription(
      userPerformer,
      clientId,
      subscriptionPlan,
      renewals
    );

    return newSubcription;
  }




  
  async CancelClientSubscription(userPerformer, subcription, clientId ) {
    const client_id = clientId || userPerformer.clientId;

    const token = await paypalTokenController.createToken();
    const subscriptionApiResponse = await axios.get(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subcription.subscriptionID}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );


    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "subscriptionPlans.isActive": true,
        "subscriptionPlans.renewals._id": subcription.renewal_id,
      },
      {
        $set: {
          "subscriptionPlans.$[elem].renewals.$[innerRenewal].isCancelled": true,
          "subscriptionPlans.$[elem].renewals.$[innerRenewal].cancellationDate": new Date(),
          "subscriptionPlans.$[elem].cancellationReason": subcription.cancellationReason,
          "subscriptionPlans.$[elem].fullReason": subcription.fullReason,
          "subscriptionPlans.$[elem].isRenew": false,
        },
      },
      {
        new: true,
        arrayFilters: [
          { "elem": { $exists: true } },
          { "innerRenewal._id": subcription.renewal_id },
        ],
      }
    )
    .select("subscriptionPlans")
    .lean();

    if (!updatedClient) {
      throw ApiError.badRequest("Subscription not found");
    }

    return {  cancelSubscriptionResponse: subscriptionApiResponse.data };
  }

  async addRenewalafterPayment(userPerformer, subcriptionId, paymentAmount) {
    const client_id = userPerformer.clientId;
    if (!subcriptionId) {
      throw ApiError.badRequest("Subscription Id is required");
    }

    const foundSubscription = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "subscriptionPlans.isActive": true,
        "subscriptionPlans._id": subcriptionId,
      },
      {
        $set: {
          "subscriptionPlans.$.isCancelled": false,
        },
      },
      { new: true }
    )
      .select("subscriptionPlans")
      .lean();

    if (!foundSubscription) {
      throw ApiError.badRequest("Client Subcription is not Active");
    }
    const subscription =
      foundSubscription.subscriptionPlans[
        foundSubscription.subscriptionPlans.length - 1
      ];

    const renewal = {};

    if (subscription.frequency === "Monthly") {
      const currentDate = new Date();
      renewal.startDate = currentDate;

      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(currentDate.getMonth() + 1);

      renewal.endDate = new Date(nextMonthDate);

      const nextRenewalDate = new Date(currentDate);
      nextRenewalDate.setMonth(currentDate.getMonth() + 1);

      renewal.nextRenewalDate = new Date(nextRenewalDate);
    } else if (subscription.frequency == "Yearly") {
      const currentDate = new Date();

      renewal.startDate = currentDate;

      const nextYearDate = new Date(currentDate);
      nextYearDate.setFullYear(currentDate.getFullYear() + 1);
      renewal.endDate = new Date(nextYearDate);

      const nextRenewalDate = new Date(currentDate);
      nextRenewalDate.setFullYear(currentDate.getFullYear() + 1);
      renewal.nextRenewalDate = new Date(nextRenewalDate);
    }

    renewal.amount = subscription.amount;
    renewal.GST =
      (
        (subscription.amount * subscription.applicableTaxPercentage) /
        100
      ).toFixed(2) || 0;
    renewal.payableAmount = paymentAmount;
    renewal.isPaid = true;

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "subscriptionPlans.isActive": true,
      },
      {
        $addToSet: { "subscriptionPlans.$.renewals": renewal },
      },
      { new: true }
    ).select("subscriptionPlans");

    if (!updatedClient)
      throw ApiError.badRequest("Client Subcription not found");

    return updatedClient.subscriptionPlans[
      updatedClient.subscriptionPlans.length - 1
    ];
  }
}


module.exports = new SubscriptionPlanService();
