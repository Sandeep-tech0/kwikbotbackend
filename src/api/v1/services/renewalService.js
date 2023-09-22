const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");
const smtpEmailService = require("./smtpEmailService");

class RenewalService {
  async renewalRemainderOfAllClients() {
    const clients = await Client.find({
      isDeleted: false,
      isActive: true,
      "subscriptionPlans.isActive": true,
      "subscriptionPlans.isCancelled": false,
    })
      .select("email users subscriptionPlans")
      .populate("users", "email")
      .lean();

    for (const client of clients) {
      //filter subscription having isCancelled false and isActive true
      const activeSubscriptions = client.subscriptionPlans.filter(
        (subscription) =>
          subscription.isActive === true && subscription.isCancelled === false
      );
      //for (const subscription of activeSubscriptions) {
      const renewals = activeSubscriptions[0].renewals.filter(
        (renewal) =>
          renewal.isActive === true &&
          renewal.isDeleted === false &&
          renewal.isCancelled === false
      );
      for (const renewal of renewals) {
        if (
          renewal &&
          renewal.isSendMailWeekBefore === false &&
          renewal.nextRenewalDate - Date.now() > 0 &&
          renewal.nextRenewalDate - Date.now() <= 7 * 24 * 60 * 60 * 1000
        ) {
          // 7 days in milliseconds
          // Send email to the client
          //update isSendMailWeekly to true
          await Client.findOneAndUpdate(
            {
              _id: client._id,
              isDeleted: false,
              "subscriptionPlans._id": activeSubscriptions[0]._id,
              "subscriptionPlans.renewals._id": renewal._id,
            },
            {
              $set: {
                "subscriptionPlans.$.renewals.$[innerRenewal].isSendMailWeekly": true,
              },
            },
            {
              new: true,
              arrayFilters: [{ "innerRenewal._id": renewal._id }],
            }
          );
          const clientEmail = client.users[0].email;
          const subject = "Subscription Renewal Reminder";
          const text = `Your subscription will expire on ${new Date(
            renewal.nextRenewalDate
          )}. Please renew your subscription.`;
          smtpEmailService.sendMail(clientEmail, subject, text);
        }
      }

      //}
    }
  }

  async renewalRemainderOfAllClients1() {
    const currentDate = new Date();
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(currentDate.getDate() + 7);

    const clients = await Client.find({
      isDeleted: false,
      isActive: true,
      "subscriptionPlans.isActive": true,
      "subscriptionPlans.isCancelled": false,
      "subscriptionPlans.renewals.isCancelled": false,
      "subscriptionPlans.renewals.nextRenewalDate": {
        $gte: currentDate, // Next renewal date is in the future
        $lte: nextWeekDate, // Within the next 7 days
      },
    })
      .select("users subscriptionPlans.renewals")
      .populate("users", "email")
      .lean();

    //filtering clients whose subscription is going to expire in next 7 days and  subscriptionPlans.renewals.isCancelled is false

    for (const client of clients) {
      const renewal = client.subscriptionPlans[0].renewals[0];

      //if (renewal && (renewal.nextRenewalDate - Date.now()) > 0 && (renewal.nextRenewalDate - Date.now()) <= 7 * 24 * 60 * 60 * 1000) {
      // Send an email to the client
      const clientEmail = client.users[0].email;
      const subject = "Subscription Renewal Reminder";
      const text = `Your subscription will expire on ${new Date(
        renewal.nextRenewalDate
      )}. Please renew your subscription.`;
      smtpEmailService.sendMail(clientEmail, subject, text);
      //}
    }
  }

  async cancelRenewal(userPerformer, renewalId, clientId) {
    const client_id = clientId || userPerformer.clientId;
    const cancelledSubcription = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "subscriptionPlans.renewals._id": renewalId,
      },
      {
        $set: {
          "subscriptionPlans.$.renewals.$[innerRenewal].isCancelled": true,
          "subscriptionPlans.$.renewals.$[innerRenewal].cancellationDate":
            new Date(),
        },
      },
      {
        new: true,
        arrayFilters: [{ "innerRenewal._id": renewalId }],
      }
    )
      .select("subscriptionPlans")
      .lean();

    if (!cancelledSubcription) {
      throw ApiError.badRequest("Renewal not found");
    }

    return cancelledSubcription.subscriptionPlans;
  }
}
module.exports = new RenewalService();
