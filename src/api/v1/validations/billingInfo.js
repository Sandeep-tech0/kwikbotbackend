const { ApiError } = require('../middlewares/apiError');
class BillingInfoValidation {

    insert(billingInfo) {
        if (!billingInfo)
            throw ApiError.badRequest('Billing Info Details are required');
        if (!billingInfo.firstName)
            throw ApiError.badRequest('First Name is required');
        if (!billingInfo.lastName)
            throw ApiError.badRequest('Last Name is required');
        if (!billingInfo.email)
            throw ApiError.badRequest('Email is required');
        if (!billingInfo.city)
            throw ApiError.badRequest('City is required');
        if (!billingInfo.state)
            throw ApiError.badRequest('State is required');
        if (!billingInfo.zipcode)
            throw ApiError.badRequest('Zipcode is required');
        /* if (!billingInfo.companyName)
            throw ApiError.badRequest('Company Name is required'); */
        /* if (!billingInfo.GSTIN)
            throw ApiError.badRequest('GSTIN is required'); */

    }

}

module.exports = new BillingInfoValidation();