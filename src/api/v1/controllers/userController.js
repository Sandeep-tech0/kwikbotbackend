const Response = require('../middlewares/response');
const UserService = require('../services/userService');

async function getProfile(req, res) {
    try {
        const userPerformer = req.user;
        const id = req.params.id || userPerformer._id;
        const user = await UserService.getProfile(id);
        return Response.success(res, "User profile fetched successfully", user);
    } catch (error) {
        return Response.error(res, error);
    }
}

async function getAllUsers(req, res) {
    try {
        const userPerformer = req.user;
        const search_by = req.query.search_by;
        const is_active = req.query.is_active;
        const users = await UserService.getAllUsers(userPerformer,search_by, is_active);
        return Response.success(res, `${users.length} Users fetched successfully`, users);
    } catch (error) {
        return Response.error(res, error);
    }
}

async function updateUser(req, res) {
    try {
        const id = req.params.id; 
        const userPerformer = req.user;
        const user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            country: req.body.country,
            profilePic: req.body.profilePic,
            organizationName: req.body.organizationName,
            email: req.body.email,
            userType: req.body.userType
        }
        const updatedUser = await UserService.updateUser(id, user, userPerformer);
        return Response.success(res, "User updated successfully", updatedUser);
    } catch (error) {
        return Response.error(res, error);
    }
}

async function blockUnblockClientUser(req, res) {
    try {
        const clientId = req.params.client_id;
        const is_active = req.body.is_active;
        const user = await UserService.blockUnblockClientUser(clientId, is_active);
        return Response.success(res, "User updated successfully", user);
    } catch (error) {
        return Response.error(res, error);
    }
}

module.exports = {
    getProfile,
    updateUser,
    getAllUsers,
    blockUnblockClientUser
}
