const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");
const pdfConverter = require('../utils/pdfConverter');
const invoiceFormatUtils = require('../utils/invoiceFormatUtils');

class InvoiceService {
  async getInvoiceById(userPerformer, id) {
    const client = await Client.findOne({
      _id: userPerformer.clientId,
      isDeleted: false,
      "invoices._id": id,
    }).select("invoices");
    if (!client) throw ApiError.badRequest("Client not found");
    
    const invoice = client.invoices.find(
      (invoice) => invoice._id.toString() === id
    );
    return invoice;
  }

  async addInvoice(userPerformer, invoice) {
    const finalClientId = invoice.client_id || userPerformer.clientId;

     const html = invoiceFormatUtils.InvoiceUtils.getHtml(invoice, userPerformer)
        const filePath = await pdfConverter.convertToPDF(html);
        invoice.invoicePdfPath = filePath; 

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: finalClientId,
        isDeleted: false,
      },
      {
        $addToSet: { invoices: invoice },
      },
      { new: true, upsert: true }
    ).select("invoices");

    if (!updatedClient) throw ApiError.badRequest("Client not found");
    //return the newly last added invoice
    const addedInvoice =
      updatedClient.invoices[updatedClient.invoices.length - 1];

    return addedInvoice;
  }

  async updateInvoiceByRenewalId(userPerformer, renewalId, invoice) {
    const finalClientId = invoice.client_id || userPerformer.clientId;

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: finalClientId,
        isDeleted: false,
        "invoices._renewalId": renewalId,
      },
      {
        $set: {
          "invoices.$.paidStatus": true,
          "invoices.$.paymentDate": new Date(),
          "invoices.$.amount": invoice.amount,
        },
      },
      { new: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return updatedClient.invoices[updatedClient.invoices.length - 1];
  }

  async getInvoiceByClientId(userPerformer, clientId) {
    const client_id = clientId || userPerformer.clientId;

    const client = await Client.findOne({
      _id: client_id,
      isDeleted: false,
      "invoices.isDeleted": false,
    })
      .select("invoices")
      .lean();

    if (client) {
      client.invoices.sort((a, b) => b.createdAt - a.createdAt);
      return client.invoices;
    }
    return [];
  }

  async deleteInvoice(userPerformer, id) {
    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: userPerformer.clientId,
        isDeleted: false,
        "invoices._id": id,
      },
      {
        $set: { "invoices.$.isDeleted": true },
      },
      { new: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Client Invoice not found");

    return updatedClient.invoices.find(
      (invoice) => invoice._id.toString() === id
    );
  }

  async allInvoices(userPerformer) {
    const clients = await Client.find({
      isDeleted: false,
      "invoices.isDeleted": false,
    })
      .select("invoices")
      .lean();
    if (clients) {
      clients.invoices.sort((a, b) => b.createdAt - a.createdAt);
      return clients.invoices;
    }
    return [];
  }


}

module.exports = new InvoiceService();
