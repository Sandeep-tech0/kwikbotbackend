const Response = require("../middlewares/response");
const ClientService = require("../services/clientService");
const ConversationService = require("../services/conversationService");

async function addClient(req, res) {
  try {
    const userPerformer = req.user;
    const clientDetail = req.body;
    const newClient = await ClientService.addClient(
      userPerformer,
      clientDetail
    );
    return Response.success(res, "Client created successfully", newClient);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getAllClients(req, res) {
  try {
    const userPerformer = req.user;
    const newClient = await ClientService.getAllClients(userPerformer);
    return Response.success(res, "Client created successfully", newClient);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updateClient(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const clientDetail = req.body;
    const updatedClient = await ClientService.updateClient(
      userPerformer,
      id,
      clientDetail
    );
    return Response.success(res, "Client updated successfully", updatedClient);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getAllTransactionsOfClient(req, res) {
  try {
    const clientId = req.query.clientId;
    const userPerformer = req.user;
    const transactions = await ClientService.getAllTransactionsOfClient(
      userPerformer,
      clientId
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

async function getClientDetail(req, res) {
  try {
    const id = req.params.id;
    const user = await ClientService.getClientDetail(id);
    return Response.success(res, "User profile fetched successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}
async function getConversationOfClient(req, res) {
  try {
    const id = req.params.id;
    const user = await ConversationService.getConversationOfClient(id);
    return Response.success(res, "Conversations found successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function addConversationOfClient(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const conversation = req.body;
    const user = await ConversationService.addConversationOfClient(
      userPerformer,
      id,
      conversation
    );
    return Response.success(res, "Conversation added successfully", user);
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  addClient,
  updateClient,
  getAllTransactionsOfClient,
  getClientDetail,
  getConversationOfClient,
  addConversationOfClient,
  getAllClients,
};
