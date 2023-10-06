const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");
const SMTPMailService = require("./smtpEmailService");
const leadModel = require("../models/Lead")

class LeadsCaptureService {
  async addLeadCapture(userPerformer, leadCapture) {
    const client_id = leadCapture.client_id || userPerformer.clientId;

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
      },
      {
        $addToSet: { leadCaptures: leadCapture },
      },
      { new: true, upsert: true }
    ).select("leadCaptures");

    return updatedClient.leadCaptures[updatedClient.leadCaptures.length - 1];
  }

  async getLeadCaptures(userPerformer, clientId) {
    const client_id = clientId || userPerformer.clientId;

    const client = await Client.findOne({
      _id: client_id,
      isDeleted: false,
      "leadCaptures.isDeleted": false,
    })
      .select("leadCaptures")
      .lean();

    if (client && client.leadCaptures) return client.leadCaptures;

    return [];
  }

  async getLeadCaptureById(userPerformer, leadCaptureId) {
    const client_id = userPerformer.clientId;

    const client = await Client.findOne({
      _id: client_id,
      isDeleted: false,
      "leadCaptures._id": leadCaptureId,
      "leadCaptures.isDeleted": false,
    })
      .select("leadCaptures")
      .lean();

    if (!client || !client.leadCaptures)
      throw ApiError.badRequest("Lead Capture not found");

    return client.leadCaptures[0];
  }

  async updateLeadCaptureById(userPerformer, leadCaptureId, leadCapture) {
    const client_id = userPerformer.clientId;
    if (!leadCapture.name) {
      throw ApiError.badRequest("Name is required");
    }
    if (!leadCapture.email) {
      throw ApiError.badRequest("Email is required");
    }

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "leadCaptures._id": leadCaptureId,
      },
      {
        $set: {
          "leadCaptures.$.name": leadCapture.name,
          "leadCaptures.$.email": leadCapture.email,
          "leadCaptures.$.phone": leadCapture.phone,
          "leadCaptures.$.message": leadCapture.message,
        },
      },
      { new: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return updatedClient.leadCaptures[0];
  }

  async deleteLeadCaptureById(userPerformer, leadCaptureId) {
    const client_id = userPerformer.clientId;

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: client_id,
        isDeleted: false,
        "leadCaptures._id": leadCaptureId,
      },
      {
        $set: {
          "leadCaptures.$.isDeleted": true,
        },
      },
      { new: true }
    );

    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return updatedClient.leadCaptures[0];
  }

  async sendLeadMail(email, name, phone) {
    if (!email) throw ApiError.badRequest("Email is required");

    if (!name) throw ApiError.badRequest("Name is required");

    const mailHTMLBody = `
        <div>
            <h3>New Lead</h3>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone || ""}</p>
            </div>`;

    //const mailResult = await SMTPMailService.sendMail(email, 'New Lead', `Name: ${name} \n Email: ${email} \n Phone: ${phone}`);
    //SMTPMailService.sendMail('info@acompworld.com', 'New Lead', `Name: ${name} \n Email: ${email} \n Phone: ${phone}`);
    SMTPMailService.sendMail("info@acompworld.com", "New Lead - (kwikbot)", mailHTMLBody);

    const leadData = {
      name,
      email,
      phone,
    };

    const newLead = await leadModel.create(leadData);
    return newLead;
  }

  /////////=============== lead data ==========================///////////

  async getLeadData() {
    try {


   const leadData = await leadModel.find({}).sort({createdAt: -1});

   return leadData;

    } catch (error) {
      console.log(error);
      return ApiError.badRequest(error.message);
    }
  }
}

module.exports = new LeadsCaptureService();
