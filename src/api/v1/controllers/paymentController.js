const Response = require("../middlewares/response");
const PaymentService = require("../services/paymentService");

async function createPayPalPayment(req, res) {
  try {
    const userPerformer = req.user;
    const subscription = req.body;
    const newPayment = await PaymentService.createPayPalPayment(
      userPerformer,
      subscription.subscriptionId
    );
    return Response.success(res, "Payment created successfully", newPayment);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function completeOrder(req, res) {
  try {
    const userPerformer = req.user;
    const subcriptionId = req.body.subscriptionId;
    const payment = req.body;
    const newPayment = await PaymentService.completeOrder(
      userPerformer,
      subcriptionId,
      payment
    );
    return Response.success(res, "Payment created successfully", newPayment);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function cancelOrder(req, res) {
  try {
    const userPerformer = req.user;
    const renewal_id = req.query.renewal_id;
    const payment = req.body;
    const newPayment = await PaymentService.cancelOrder(
      userPerformer,
      renewal_id,
      payment
    );
    return Response.success(res, "Payment created successfully", newPayment);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getAllTransactions(req, res) {
  try {
    const userPerformer = req.user;
    const search_by = req.query.search_by;
    const period = req.query.period;
    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    const transactions = await PaymentService.getAllTransactions(
      userPerformer,
      search_by,
      period,
      from_date,
      to_date
    );
    return Response.success(
      res,
      "Transactions fetched successfully",
      transactions
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getAllTransactionsByClientId(req, res) {
  try {
    const userPerformer = req.user;
    const clientId = req.params.client_id;
    const transactions = await PaymentService.getAllTransactionsByClientId(
      userPerformer,
      clientId
    );
    return Response.success(
      res,
      `Transactions fetched successfully`,
      transactions
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  createPayPalPayment,
  completeOrder,
  cancelOrder,
  getAllTransactions,
  getAllTransactionsByClientId,
};
