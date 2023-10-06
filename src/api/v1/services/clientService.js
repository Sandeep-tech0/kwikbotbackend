const ApiError = require("../middlewares/apiError");
const Client = require("../models/Client");
const UserService = require("./userService");
const ClientValidation = require("../validations/client");
const SubcriptionPlanService = require("../services/subscriptionPlanService");
const smtpEmailService = require("./smtpEmailService");

class ClientService {
  async getClientById(id) {
    const client = await Client.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!client) throw ApiError.badRequest("Client not found");
    return client;
  }

  async getClientByUserId(userId) {
    const client = await Client.findOne({
      users: userId,
      isDeleted: false,
    });
    if (!client) throw ApiError.badRequest("Client not found");
    return client;
  }

  async addClient(userPerformer, clientDetail) {
    if (userPerformer.userType !== "SuperAdmin")
      throw ApiError.badRequest("Only SuperAdmin can add client");
    await ClientValidation.insert(clientDetail);

    const user = await UserService.registerClientUser(clientDetail.user);
    clientDetail.client.users = [user._id];
    const newClient = await Client.create(clientDetail.client);
    if (!newClient) throw ApiError.badRequest("Client not created");
    newClient.users = [user];
    //========== the user detail i want to save in the billingInformation in client model ==================/

    const billingInformation = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyName: user.organizationName
    };

    //========== the user detail i want to save in the billingInformation in client model ==================/
  await Client.findOneAndUpdate(
      { _id: newClient._id },
      {
        billingInfo: billingInformation,
      },
      { new: true }
    );

    const msg = `
    <html>
    <body>
    <head>
  <title>Welcome to Kwikbot</title>
</head>
    <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f0f0f0">
      <tr>
        <td style="padding: 20px;">
          <table align="center" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border: 1px solid #e6e6e6;">
            <tr>
              <td style="padding: 40px;">
                <h1>Welcome to Kwikbot</h1>
                <p>Hi ${user.firstName},</p>
                <p>We are thrilled to welcome you to Kwikbot.</p>
                <p>Your account has been successfully created, and we're excited to have you on board.</p>
                <p>Your registered email is: ${user.email}</p>
                <p>For security purposes, we recommend that you set a strong password for your account.</p>
                <p>Click on the link below to reset your password:</p>
                <p><a href="https://beta.kwikbot.ai/admin/set-password">Set Password</a></p>
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                <p>Thank you for choosing Kwikbot. We look forward to serving you!</p>
                <p>Best regards,</p>
                <p>The Kwikbot Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
    const subject = "Welcome to Kwikbot";

    smtpEmailService.sendMail(user.email, subject, msg);

    return newClient;
  }

  async getAllClients(userPerformer) {
    const client = await Client.find({
      isDeleted: false,
    }).lean();
    if (!client) throw ApiError.badRequest("Client not found");
    return client;
  }

  async updateClient(userPerformer, id, clientDetail) {
    if (userPerformer.userType !== "SuperAdmin")
      throw ApiError.badRequest("Only SuperAdmin can update client");

    ClientValidation.update(id, clientDetail);
    clientDetail.user.organizationName = clientDetail.client.organizationName;
    clientDetail.user.industry = clientDetail.client.industry;

    const updatedUser = await UserService.updateUser(
      id,
      clientDetail.user,
      userPerformer
    );

    if (!updatedUser) throw ApiError.badRequest("Client not found");
    const updatedClient = await SubcriptionPlanService.updateClientSubscription(
      userPerformer,
      clientDetail.client.subscriptionPlans[0],
      updatedUser.clientId
    );
    if (!updatedClient) throw ApiError.badRequest("Client not found");

    return {
      user: updatedUser,
      client: {
        subscriptionPlans: updatedClient,
      },
    };
  }

  async getAllTransactionsOfClient(userPerformer, clientId) {
    const finalClientId = clientId || userPerformer.clientId;

    const client = await Client.findOne({
      _id: finalClientId,
      isDeleted: false,
      "payments.isDeleted": false,
    })
      .populate("users", "email firstName lastName")
      .select("payments")
      .lean();

    return client;
  }

  async getClientDetail(id) {
    if (!id) throw ApiError.badRequest("Client Id is required");
    const clientDetail = await Client.findOne({
      _id: id,
      isDeleted: false,
      //  'subcriptionPlans.isActive': true
    })
      .select("organizationName industry subscriptionPlans isDeleted isActive")
      .populate(
        "users",
        "firstName lastName email phone country userType profilePic isActive password"
      )
      .lean();

    //only active subscription plan left all other subscription plan will be removed
    if (
      clientDetail.subscriptionPlans &&
      clientDetail.subscriptionPlans.length > 0
    ) {
      clientDetail.subscriptionPlans = clientDetail.subscriptionPlans.filter(
        (plan) => plan.isActive === true
      );
    }

    return clientDetail;
  }
}

module.exports = new ClientService();
