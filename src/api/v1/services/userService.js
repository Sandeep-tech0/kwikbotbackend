const ApiError = require('../middlewares/apiError');
const User = require('../models/User');
const Client = require('../models/Client');
const UserValidation = require('../validations/user');
const JwtUtils = require('../helpers/jwtUtils');
const smtpEmailService = require('./smtpEmailService');

class UserService {
    async getUserByEmail(email) {
        return await User.findOne({
            email: email,
            isDeleted: false
        });
    }
    async getUserByPhone(phone) {
        return await User.findOne({
            phone: phone,
            isDeleted: false
        }).lean();
    }

    async findById(id) {
        return await User.findOne({
            _id: id,
            isDeleted: false
        });
    }

    async loginByEmailPassword(email, password) {
        const user = await User.findOne({
            email: email, isDeleted: false
        })
            .select('firstName LastName email phone userType password isActive');

        if (!user) {
            throw ApiError.badRequest('Invalid email');
        }
        if (user.password !== password) {
            throw ApiError.badRequest('Invalid password');
        }
        if (user.userType !== 'ClientUser') {
            throw ApiError.badRequest('Invalid user');
        }
        //to remove password from the response
        user.password = undefined;
        const token = JwtUtils.getToken(user._doc);
        //for client id and organization name
        const client = await Client.findOne({ users: user._id, isDeleted: false }).select('_id organizationName isActive');
        if (!client) {
            throw ApiError.badRequest('Invalid user');
        }
        if (!client.isActive) {
            throw ApiError.badRequest('Your account is not active. Please contact your Admin');
        }
        user._doc.organizationName = client.organizationName;
        user._doc.clientId = client._id;


        return {
            user,
            token
        };
    }

    async loginForSuperAdmin(email, password) {
        const user = await User.findOne({
            email: email, isDeleted: false
        })
            .select('firstName lastName phone email userType password isActive');

        if (!user) {
            throw ApiError.badRequest('Invalid email');
        }
        if (user.password !== password) {
            throw ApiError.badRequest('Invalid password');
        }
        if (user.userType !== 'SuperAdmin') {
            throw ApiError.badRequest('Invalid user');
        }
        //to remove password from the response
        user.password = undefined;
        const token = JwtUtils.getToken(user._doc);

        return {
            user,
            token
        };
    }

    async getProfile(id) {

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        }).select('firstName lastName password email phone country userType profilePic isActive')
            .lean();

        if (!user) {
            throw ApiError.badRequest('Invalid user');
        }

        const client = await Client.findOne({
            users: user._id,
            isDeleted: false,
            isActive: true
        }).select('_id organizationName')
            .lean();

        if (client) {
            user.organizationName = client.organizationName;
            user.clientId = client._id;
        }

        return user;
    }


    async registerClientUser(user) {
        const foundUserByemail = await this.getUserByEmail(user.email);
        if (foundUserByemail && foundUserByemail.email == user.email) {
            throw ApiError.badRequest('Email already exists');
        }
        if(user.phone){
            const foundUserByPhone = await this.getUserByPhone(user.phone);
             if (foundUserByPhone && foundUserByPhone.phone == user.phone) {
                 throw ApiError.badRequest('Phone number already exists');
             }   
         }
        UserValidation.insert(user);
        const newUser = await User.create(user);
        return newUser;
    }

    async updateUser(id, user,userPerformer) {
        UserValidation.update(id, user);

        if(userPerformer.userType === 'SuperAdmin'){
            if(user.email){
                const foundUserByemail = await this.getUserByEmail(user.email);
                if (foundUserByemail && foundUserByemail.email == user.email && foundUserByemail._id != id) {
                    throw ApiError.badRequest('Email already exists');
                }
            var email1 = user.email;
            }
        }
       
        if(user.phone){
           const foundUserByPhone = await this.getUserByPhone(user.phone);
            if (foundUserByPhone && foundUserByPhone.phone == user.phone && foundUserByPhone._id != id) {
                throw ApiError.badRequest('Phone number already exists');
            }   
        }

        const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: { password: user.password,firstName:user.firstName,lastName:user.lastName,phone:user.phone,email:email1,country:user.country} }, { new: true });
        if (!updatedUser) {
            throw ApiError.badRequest('Invalid user');
        }
        // to update the Organisation name in the user profile
        const client =await Client.findOneAndUpdate({ users: updatedUser._id }, { organizationName: user.organizationName, industry: user.industry }, { new: true });
        if (!client) {
            throw ApiError.badRequest('Invalid Client');
        }

        updatedUser.organizationName = client.organizationName;
        updatedUser.industry = client.industry;
        updatedUser.clientId = client._id;

        return updatedUser;
    }

    async updatePassword(user) {
        if (!user.email) {
            throw ApiError.badRequest('Email is required');
        }
        if (!user.oldPassword) {
            throw ApiError.badRequest('Old password is required');
        }
        if (!user.newPassword) {
            throw ApiError.badRequest('New password is required');
        }
        if (user.oldPassword === user.newPassword) {
            throw ApiError.badRequest('Old password and new password should not be same');
        }
        const updatedPassword = await User.findOneAndUpdate({ email: user.email, password: user.oldPassword },
            { $set: { password: user.newPassword } },
            { new: true });

        if (!updatedPassword) {
            throw ApiError.badRequest('Old password is incorrect');
        }
        return updatedPassword;
    }

    async resetPassword(user) {
        if (!user.email) {
            throw ApiError.badRequest('Email is required');
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiresAt = new Date();
        otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);

        const otp1 = {
            otp: otp,
            otpExpiresAt: otpExpiresAt
        }

        // in the user collection not push
        const updatedUser = await User.findOneAndUpdate({ email: user.email }, { $set: { otp: otp1 } }, { new: true });

        if (!updatedUser) {
            throw ApiError.badRequest('Invalid user');
        }


        if (smtpEmailService.checkIfEmailInString(user.email)) {
            const msg = `Dear User,<br><br>We have received a request to verify your Kwikbot Account. 
              Please Verify your account by entering this code.<br><br>
              <b>${otp}</b><br><br>
              This code will expire in 5 minutes.<br><br>
              Thank you for using our services.<br><br>
              <b>Regards</b><br><br><b>Kwik Bot</b>
              `
            const subject = 'Reset Password OTP'
            smtpEmailService.sendMail(user.email, subject, msg);
        }
        return true;
    }

    async verifyOtp(user) {
        if (!user.email) {
            throw ApiError.badRequest('Email is required');
        }

        if (!user.otp) {
            throw ApiError.badRequest('OTP is required');
        }
        //check if the otp is valid and not otpExpiredAt is greater than current time
        const foundUser = await User.findOne({
            email: user.email,
            otp: { $elemMatch: { otp: user.otp, otpExpiresAt: { $gt: new Date() } } }
        });
        if (!foundUser) {
            throw ApiError.badRequest('Invalid OTP');
        }
        return true;

    }

    async changePassword(user) {
        if (!user.email) {
            throw ApiError.badRequest('Email is required');
        }
        if (!user.password) {
            throw ApiError.badRequest('Password is required');
        }
        if (!user.confirmPassword) {
            throw ApiError.badRequest('Confirm password is required');
        }
        if (user.password !== user.confirmPassword) {
            throw ApiError.badRequest('Password and confirm password should be same');
        }

        const foundUser = await this.getUserByEmail(user.email);
        if (!foundUser) {
            throw ApiError.badRequest('Invalid user');
        }
        //update the password in the user collection
        foundUser.password = user.password;
        await foundUser.save();

        return foundUser;

    }



    async deleteUser(id) {
        UserValidation.delete(id);
        const updatedUser = await User.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
        if (!updatedUser) {
            throw ApiError.badRequest('Invalid user');
        }
    }

    async getAllUsers(userPerformer,searchTerm, is_active) {
        if(userPerformer.userType !== 'SuperAdmin'){
            throw ApiError.badRequest('Invalid user');
        }
        const searchRegex = new RegExp(searchTerm, 'i');
        const clients = await Client.aggregate([
            {
                $lookup: {
                    from: 'users', // Replace with the actual name of your users collection
                    localField: 'users',
                    foreignField: '_id',
                    as: 'matchedUsers',
                }
            },
            {
                $match: {
                    $or: [
                        { 'matchedUsers.email': searchRegex },
                        { 'matchedUsers.phone': searchRegex },
                    ],
                    matchedUsers: { $elemMatch: { userType: 'ClientUser' } },
                    isDeleted: false,
                    organizationName: searchRegex
                }
            },
            {
                $project: {
                    _id: 1,
                    organizationName: 1,
                    subscriptionPlans: 1,
                    isActive: 1,
                    isDeleted: 1,
                    createdAt: 1,
                    'matchedUsers.firstName': 1,
                    'matchedUsers.lastName': 1,
                    'matchedUsers.email': 1,
                    'matchedUsers.phone': 1,
                    'matchedUsers.country': 1,
                    'matchedUsers.profilePic': 1,
                    'matchedUsers.isActive': 1,
                    'matchedUsers.userType': 1,
                    'matchedUsers._id': 1
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            }
        ]);
    
        return clients;
    }
    

    async blockUnblockClientUser(clientId, isActive) {
        if (!clientId || clientId === '') {
            throw ApiError.badRequest('Client Id is required');
        }
        if (isActive === undefined || isActive === '') {
            throw ApiError.badRequest('Status is required');
        }

        const updatedUser = await Client.findOneAndUpdate({ _id: clientId }, { isActive: isActive }, { new: true });
        await User.findOneAndUpdate({ _id: updatedUser.users[0] }, { isActive: isActive }, { new: true });
        if (!updatedUser) {
            throw ApiError.badRequest('Invalid user');
        }

        return updatedUser;
    }


}

module.exports = new UserService();