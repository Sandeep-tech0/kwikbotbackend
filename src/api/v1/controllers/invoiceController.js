const Response = require("../middlewares/response");
const InvoiceService = require("../services/invoiceService");

async function getInvoiceByClientId(req, res) {
  try {
    const clientId = req.query.clientId;
    const userPerformer = req.user;
    const invoice = await InvoiceService.getInvoiceByClientId(
      userPerformer,
      clientId
    );
    return Response.success(res, "Invoice fetched successfully", invoice);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function createInvoice(req, res) {
  try {
    const invoice = req.body;
    const userPerformer = req.user;
    const newInvoice = await InvoiceService.addInvoice(userPerformer, invoice);
    return Response.success(res, "Invoice created successfully", newInvoice);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function deleteInvoice(req, res) {
  try {
    const id = req.params.id;
    const deletedInvoice = await InvoiceService.deleteInvoice(id);
    return Response.success(
      res,
      "Invoice deleted successfully",
      deletedInvoice
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function allInvoices(req, res) {
  try {
    const userPerformer = req.user;
    const invoices = await InvoiceService.allInvoices(userPerformer);
    return Response.success(res, "Invoices fetched successfully", invoices);
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  getInvoiceByClientId,
  createInvoice,
  deleteInvoice,
  allInvoices,
};
