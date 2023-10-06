const paypalService = require("../services/paypalSubscriptionService");
const Response = require("../middlewares/response");

const performPayPalActions = async (req, res) => {
  try {
    const { clientId } = req.body;
    const paypalCreatePlanResponse = await paypalService.createPlan(clientId);
    return Response.success(res, "All PayPal actions completed successfully", {
      paypalCreatePlanResponse,
    });
  } catch (error) {
    return Response.error(res, error);
  }
};

const completeSubscription = async (req, res) => {
  try {
    const userPerformer = req.user;
    const { subscriptionID, orderID, clientId } = req.body;
    const paypalCompleteSubscriptionResponse =
      await paypalService.completeSubscription({
        subscriptionID,
        orderID,
        clientId,
        userPerformer,
      });
    return Response.success(
      res,
      "Subscription completed successfully",
      paypalCompleteSubscriptionResponse
    );
  } catch (error) {
    return Response.error(res, error);
  }
};






module.exports = {
  performPayPalActions,
  completeSubscription,
};
