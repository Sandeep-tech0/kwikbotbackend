const Response = require("../middlewares/response");
const BillingInfoService = require("../services/billingInfoService");

async function getBillingInfoByClientId(req, res) {
  try {
    const clientId = req.query.clientId;
    const userPerformer = req.user;
    const billingInfo = await BillingInfoService.getBillingInfoByClientId(
      userPerformer,
      clientId
    );
    return Response.success(
      res,
      "BillingInfo fetched successfully",
      billingInfo
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updateBillingInfo(req, res) {
  try {
    const userPerformer = req.user;
    const clientId = req.query.clientId;
    const billingInfo = req.body;
    const updatedBillingInfo = await BillingInfoService.updateBillingInfo(
      userPerformer,
      billingInfo,
      clientId
    );
    return Response.success(
      res,
      "Billing Info updated successfully",
      updatedBillingInfo
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  getBillingInfoByClientId,
  updateBillingInfo,
};
