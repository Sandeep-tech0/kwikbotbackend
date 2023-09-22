const { ApiError } = require('../middlewares/apiError');
class UserValidation {

    insert(user) {
        if (!user)
            return ApiError.badRequest('User Details are required');
        if (!user.email)
            return ApiError.badRequest('Email is required');
        if (!user.password)
            return ApiError.badRequest('Password is required');
        if (!user.userType)
            return ApiError.badRequest('Invalid user type');
    }

    update(id, user) {
        if (!id)
            return ApiError.badRequest('User id is required');
        if (!user)
            return ApiError.badRequest('User Details are required');
    }

    delete(id) {
        if (!id)
            throw ApiError.badRequest('User id is required');
    }
}

module.exports = new UserValidation();