const Response = require("../middlewares/response");
const SubscriptionPlanService = require("../services/subscriptionPlanService");
const SubcriptionService = require("../services/subscriptionPlanService");

async function getClientSubscriptionByClientId(req, res) {
  try {
    const clientId = req.query.clientId;
    const userPerformer = req.user;
    const subscription =
      await SubcriptionService.getClientSubscriptionByClientId(
        userPerformer,
        clientId
      );
    return Response.success(
      res,
      "Subscription fetched successfully",
      subscription
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updateClientSubscription(req, res) {
  try {
    const userPerformer = req.user;
    const clientId = req.params.client_id;
    const subscription = req.body;
    const updatedSubscription =
      await SubcriptionService.updateClientSubscription(
        userPerformer,
        subscription,
        clientId
      );
    return Response.success(
      res,
      "Subscription updated successfully",
      updatedSubscription
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function CancelClientSubscription(req, res) {
  try {
    const userPerformer = req.user;
    const clientId = req.query.clientId;
    const subcription = req.body;
    const updatedSubscription =
      await SubscriptionPlanService.CancelClientSubscription(
        userPerformer,
        subcription,
        clientId
      );
    return Response.success(
      res,
      "Subscription updated successfully",
      updatedSubscription
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  getClientSubscriptionByClientId,
  updateClientSubscription,
  CancelClientSubscription,
};
