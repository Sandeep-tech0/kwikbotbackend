const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");

class ConversationService {
  async getConversationOfClient(id) {
    const client = await Client.findOne({
      _id: id,
      isDeleted: false,
    })
      .select("conversations")
      .lean();

    if (client) {
      // Now, sort the conversations array by createdAt in descending order
      client.conversations.sort((a, b) => b.createdAt - a.createdAt);
      return client.conversations;
    }

    return [];
  }

  async addConversationOfClient(userPerformer, clientId, conversation) {
    //create unique id for conversation using random string of 8 digits
    const randomNumber = Math.floor(Math.random() * 100000000);
    // Convert the random number to a string and pad it with leading zeros to ensure it has 8 digits
    const uniqueId = randomNumber.toString().padStart(8, "0");
    const newConversation = {
      visitorId: uniqueId,
      conversation: JSON.stringify(conversation),
    };

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: clientId,
        isDeleted: false,
      },
      {
        $addToSet: { conversations: newConversation },
      },
      { new: true, upsert: true }
    ).select("conversations");

    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return updatedClient.conversations[updatedClient.conversations.length - 1];
  }
}

module.exports = new ConversationService();
