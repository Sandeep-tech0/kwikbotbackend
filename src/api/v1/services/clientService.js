const ApiError = require('../middlewares/apiError');
const Client = require('../models/Client');
const UserService = require('./userService');
const ClientValidation = require('../validations/client');
const SubcriptionPlanService = require('../services/subscriptionPlanService');

class ClientService {

    async getClientById(id) {
        const client = await Client.findOne({
            _id: id,
            isDeleted: false
        });
        if (!client)
            throw ApiError.badRequest('Client not found');
        return client;
    }

    async getClientByUserId(userId) {
        const client = await Client.findOne({
            users: userId,
            isDeleted: false
        });
        if (!client)
            throw ApiError.badRequest('Client not found');
        return client;
    }

    async addClient(userPerformer, clientDetail) {
        if (userPerformer.userType !== 'SuperAdmin')
            throw ApiError.badRequest('Only SuperAdmin can add client');
      await   ClientValidation.insert(clientDetail);

        const user = await UserService.registerClientUser(clientDetail.user);
        clientDetail.client.users = [user._id];
        const newClient = await Client.create(clientDetail.client);
        if (!newClient)
            throw ApiError.badRequest('Client not created');
        newClient.users = [user];
        return newClient;
    }

    async getAllClients(userPerformer) {
        const client = await Client.find({
            isDeleted: false
        }).lean();
        if (!client)
            throw ApiError.badRequest('Client not found');
        return client;
    }


    async updateClient(userPerformer, id, clientDetail) {
        if (userPerformer.userType !== 'SuperAdmin')
            throw ApiError.badRequest('Only SuperAdmin can update client');

        ClientValidation.update(id, clientDetail);
        clientDetail.user.organizationName = clientDetail.client.organizationName;
        clientDetail.user.industry = clientDetail.client.industry;
        
        const updatedUser = await UserService.updateUser(id, clientDetail.user,userPerformer);

        if (!updatedUser)
            throw ApiError.badRequest('Client not found');
        const updatedClient = await SubcriptionPlanService.updateClientSubscription(userPerformer, clientDetail.client.subscriptionPlans[0], updatedUser.clientId);
        if (!updatedClient)
            throw ApiError.badRequest('Client not found');
        
        return {
            user: updatedUser,
            client: {
                subscriptionPlans: updatedClient
            }
        };
    }

    async getAllTransactionsOfClient(userPerformer, clientId) {
        const finalClientId = clientId || userPerformer.clientId;
        
        const client = await Client.findOne({
            _id: finalClientId,
            isDeleted: false,
            'payments.isDeleted': false
        })
            .populate('users', 'email firstName lastName')
            .select('payments')
            .lean();

        return client;
    }

    async getClientDetail(id) {
        if(!id)
            throw ApiError.badRequest('Client Id is required');
        const clientDetail = await Client.findOne({
            _id: id,
            isDeleted: false,
          //  'subcriptionPlans.isActive': true
        }).select('organizationName industry subscriptionPlans isDeleted isActive')
        .populate('users', 'firstName lastName email phone country userType profilePic isActive password')
        .lean();

        //only active subscription plan left all other subscription plan will be removed
        if(clientDetail.subscriptionPlans && clientDetail.subscriptionPlans.length > 0){
            clientDetail.subscriptionPlans = clientDetail.subscriptionPlans.filter(plan => plan.isActive === true);
        }

        
        return clientDetail;
    }


}

module.exports = new ClientService();