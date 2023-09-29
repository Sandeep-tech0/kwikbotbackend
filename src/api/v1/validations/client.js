const ApiError = require('../middlewares/apiError');

class ClientValidation {

    insert(client) {
        if (!client)
          throw ApiError.badRequest('Client Details are required');
        
        if (client.user.userType !== 'ClientUser')
          throw ApiError.badRequest('User type should be ClientUser');
      
        if (!client.user.firstName)
          throw ApiError.badRequest('Client first name is required');
      
        if (!client.user.lastName)
          throw ApiError.badRequest('Client last name is required');
      
        if (!client.user.email)
          throw ApiError.badRequest('Client email is required');
      
        if (!client.user.phone)
          throw ApiError.badRequest('Client phone is required');
      
        if (!client.user.country)
          throw ApiError.badRequest('Client Country name is required');
      
        if (!client.client.organizationName)
          throw ApiError.badRequest('Client organization name is required');
      
        if (client.client.subscriptionPlans.length < 1)
          throw ApiError.badRequest('Subscription Plan is required');
      
        if (!client.client.subscriptionPlans[0].frequency)
          return ApiError.badRequest('Subscription Plan frequency is required');
        if (!client.client.subscriptionPlans[0].amount)
          throw ApiError.badRequest('Subscription Plan amount is required');
      
        if (!client.client.subscriptionPlans[0].setUpAmount)
          throw ApiError.badRequest('Subscription Plan setUpAmount is required');
      }
      

    update(id, client) {
        if (!id)
            throw ApiError.badRequest('Client user id is required');
        if (!client)
            throw ApiError.badRequest('Client Details are required');
    }

    delete(id) {
        if (!id)
            throw ApiError.badRequest('Client id is required');
    }

}

module.exports = new ClientValidation();