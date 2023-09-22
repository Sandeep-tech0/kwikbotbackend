const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");

class ContentService {
  async addContent(userPerformer, content) {
    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: userPerformer.clientId,
        isDeleted: false,
      },
      {
        $addToSet: { contents: content },
      },
      { new: true, upsert: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return content;
  }

  async getContentById(userPerformer, id) {
    const client = await Client.findOne({
      _id: userPerformer.clientId,
      isDeleted: false,
      "contents._id": id,
    }).select("contents");

    if (!client)
      throw ApiError.badRequest("Content with this client not found");

    const content = client.contents.find(
      (content) => content._id.toString() === id
    );
    if (!client.contents || client.contents.length == 0)
      throw ApiError.notFound("Content not found");
    return content;
  }

  async getContentByUserId(userPerformer, userId) {
    const user_id = userId || userPerformer._id;

    const client = await Client.findOne({
      users: user_id,
      isDeleted: false,
      "contents.isDeleted": false,
    })
      .select("contents")
      .lean();

    if (client) {
      client.contents = client.contents.filter((content) => !content.isDeleted);
      client.contents.sort((a, b) => b.createdAt - a.createdAt);
      return client.contents;
    }
    return [];
  }

  async updateContent(userPerformer, id, content) {
    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: userPerformer.clientId,
        isDeleted: false,
        "contents._id": id,
      },
      {
        $set: { "contents.$": content },
      },
      { new: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Content not found");

    return content;
  }

  async deleteContent(userPerformer, id) {
    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: userPerformer.clientId,
        isDeleted: false,
        "contents._id": id,
      },
      {
        $set: { "contents.$.isDeleted": true },
      },
      { new: true }
    ).select("contents");

    if (!updatedClient.contents || updatedClient.contents.length == 0)
      throw ApiError.badRequest("Content not found");

    return updatedClient.contents;
  }

  async AllContentByClientId(userPerformer, clientId) {
    if (!clientId) {
      throw ApiError.badRequest("Client Id is required");
    }

    const client = await Client.findOne({
      _id: clientId,
      isDeleted: false,
      "contents.isDeleted": false,
    })
      .select("contents.title contents.description contents.isDeleted")
      .lean();

    if (!client) {
      throw ApiError.badRequest("Client contents not found");
    }

    // Filter the contents to include only those with contents.isDeleted === false
    const activeContents = client.contents
      .filter((content) => !content.isDeleted)
      .map(({ isDeleted, ...rest }) => rest);

    return activeContents;
  }
}

module.exports = new ContentService();
