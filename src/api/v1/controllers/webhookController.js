const webhookService = require("../services/webhookService");
const Response = require("../middlewares/response");


const webhookSubscriptionCancelled = async (req, res) => {
  try {
    const data = req.body;
    const webhookHeaders = req.headers;
    const webhookSubscriptionCancelledResponse = await webhookService.webhookSubscriptionCancelled(data, webhookHeaders);
    return Response.success(res, "Subscription cancelled successfully", {
      webhookSubscriptionCancelledResponse,
    });
  } catch (error) {
    return Response.error(res, error);
  }
};

const webhookSubscriptionExpired = async (req, res) => {
    try {
        const data = req.body;
        const webhookHeaders = req.headers;
        const webhookSubscriptionExpiredResponse = await webhookService.webhookSubscriptionExpired(data, webhookHeaders);
        return Response.success(res, "Subscription expired successfully", {
        webhookSubscriptionExpiredResponse,
        });
    } catch (error) {
        return Response.error(res, error);
    }
    };




const webhookSubscriptionSuspended = async (req, res) => {
    try {
        const data = req.body;
        const webhookHeaders = req.headers;
        const webhookSubscriptionSuspendedResponse = await webhookService.webhookSubscriptionSuspended(data, webhookHeaders);
        return Response.success(res, "Subscription suspended successfully", {
        webhookSubscriptionSuspendedResponse,
        });
    } catch (error) {
        return Response.error(res, error);
    }
    };

    const webhookSubscriptioncompleted = async (req, res) => {
        try {
            const data = req.body;
            const webhookHeaders = req.headers;
            const webhookSubscriptionReactivatedResponse = await webhookService.webhookSubscriptionComplete(data, webhookHeaders);
            return Response.success(res, "Subscription reactivated successfully", {
            webhookSubscriptionReactivatedResponse,
            });
        } catch (error) {
            return Response.error( error);
        }
        };

        const webhookSubscriptionPaymentFailed = async (req, res) => {
            try {
                const data = req.body;
                const webhookHeaders = req.headers;
                const webhookSubscriptionPaymentFailedResponse = await webhookService.webhookSubscriptionPaymentFailed(data, webhookHeaders);
                return Response.success(res, "Subscription payment failed successfully", {
                webhookSubscriptionPaymentFailedResponse,
                });
            } catch (error) {
                return Response.error( error);
            }
            };




module.exports = {
    webhookSubscriptionCancelled,
    webhookSubscriptionExpired,
    webhookSubscriptionSuspended,
    webhookSubscriptioncompleted,
    webhookSubscriptionPaymentFailed,
};
