const ApiError = require('../middlewares/apiError');
const Client = require('../models/Client');
const BillingInfoValidation = require('../validations/billingInfo');


class BillingInfo {
    async getBillingInfoByClientId(userPerformer,clientId) {
        const client_id = clientId || userPerformer.clientId;
        const client = await Client.findOne({
            _id: client_id,
            isDeleted: false,
        }).select('billingInfo').lean();
        if (!client)
            throw ApiError.badRequest('Client not found');

        return client.billingInfo;
    }
  

    async updateBillingInfo(userPerformer, billingInfo,clientId) {
        BillingInfoValidation.insert(billingInfo);
        const client_id = clientId || userPerformer.clientId;
        const updatedClient = await Client.findOneAndUpdate({
            _id: client_id,
            isDeleted: false
        },
        {
            $set: { billingInfo: billingInfo }
        },
        { new: true });

        if (!updatedClient)
            throw ApiError.badRequest('Client not found');

        return updatedClient.billingInfo;
    }
}

module.exports = new BillingInfo();