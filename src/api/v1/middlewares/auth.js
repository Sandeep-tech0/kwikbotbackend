const ApiError = require('../middlewares/apiError');
const Response = require('../middlewares/response');
const UserService = require('../services/userService');
const JwtUtils = require('../helpers/jwtUtils');
module.exports = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || token === '')
        return Response.error(res, ApiError.badRequest('Token is required'));

    try {
        const user = await JwtUtils.verifyToken(token);
        if (!user)
            return Response.error(res, ApiError.notAuthorized());

        const authorizedUser = await UserService.getProfile(user._id);
        if (!authorizedUser)
            return Response.error(res, ApiError.notAuthorized());
        if(!authorizedUser.isActive)
            return Response.error(res, ApiError.notActive());

        req.user = authorizedUser;
        return next();
    } catch (err) {
        if (err instanceof ApiError)
            return Response.error(res, ApiError.notAuthorized());

        return Response.error(res, ApiError.internal(err));
    }
}