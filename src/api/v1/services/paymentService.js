const paypal = require('paypal-rest-sdk');
const ApiError = require('../middlewares/apiError');
const Client = require('../models/Client');
const SubscriptionPlanService = require('../services/subscriptionPlanService');
const invoiceService = require('../services/invoiceService');

class PaymentService {
    constructor() {
        paypal.configure({
            mode: 'sandbox', // Use 'sandbox' for testing, 'live' for production
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_CLIENT_SECRET,
        });
    }


    async createPayPalPayment(userPerformer, subscriptionId) {
        const client = await Client.findOne({
            _id: userPerformer.clientId,
            isDeleted: false,
            'subscriptionPlans._id': subscriptionId,
            'subscriptionPlans.isActive': true,
            'subscriptionPlans.isDeleted': false,
            'subscriptionPlans.isCancelled': false,
        }).select('subscriptionPlans')
            .lean();

        const activeSubscriptions = client.subscriptionPlans[client.subscriptionPlans.length - 1]
        const paymentData = {};
        paymentData.amount = activeSubscriptions.amount;
        if (activeSubscriptions.isTaxApplicable) {
            paymentData.amount = (activeSubscriptions.amount + (activeSubscriptions.amount * activeSubscriptions.applicableTaxPercentage) / 100).tofixed(2);
        }
        if (activeSubscriptions.isSetUpFeeApplicable && activeSubscriptions.renewals.length < 1) {
            paymentData.amount = paymentData.amount + activeSubscriptions.setUpAmount;
        }
        paymentData.currency_code = activeSubscriptions.currency;

        return paymentData;

    }

    async completeOrder(userPerformer, subcriptionId, order) {
        if (!order) {
            throw ApiError.badRequest('Order not found');
        }
        if (!order.purchase_units[0].amount.value) {
            throw ApiError.badRequest('Amount not found');
        }
        if (!order.purchase_units[0].amount.currency_code) {
            throw ApiError.badRequest('Currency not found');
        }
        if (!subcriptionId) {
            throw ApiError.badRequest('Subscription Id is required');
        }
        const payment = {
            _renewalId: null,
            paymentId: order.id,
            paymentStatus: order.status,
            paymentMethod: 'PayPal',
            paymentDate: new Date(),
            amount: order.purchase_units[0].amount.value,
            GST: 0,
            currency: order.purchase_units[0].amount.currency_code,
            paymentMode: 'Online',
            paymentGateway: 'PayPal',
            feeType: 'Subscription',

        }

        //add renewal after payment in subcription plan
        if (order.status == 'COMPLETED') {
            var updatedSubscriptionPlan = await SubscriptionPlanService.addRenewalafterPayment(userPerformer, subcriptionId, order.purchase_units[0].amount.value);
            var renewalId = updatedSubscriptionPlan.renewals[updatedSubscriptionPlan.renewals.length - 1]._id;


            payment._renewalId = renewalId;
            payment.GST = updatedSubscriptionPlan.renewals[updatedSubscriptionPlan.renewals.length - 1].GST;

            if (updatedSubscriptionPlan.renewals.length > 1) {
                payment.feeType = 'Renewal';
            }
            //adding payment in client
            const client = await Client.findOneAndUpdate({ _id: userPerformer.clientId, isDeleted: false },
                {
                    $addToSet: { payments: payment }
                },
                { new: true, upsert: true }).lean();


            const invoiceData = {
                client_id: client._id,
                renewal_id: renewalId,
                title: 'Subscription Plan',
                invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + '00' + updatedSubscriptionPlan.renewals.length,//'INV-2023-001'
                invoiceDate: new Date(),
                paymentDate: new Date(),
                amount: payment.amount,
                paidStatus: true,
            }
            //update invoice in client by renewal_id
            /* if(payment.feeType !== 'Subscription'){
            await invoiceService.updateInvoiceByRenewalId(userPerformer, renewalId, invoiceData);
            } */
            await invoiceService.addInvoice(userPerformer, invoiceData);

            return payment;
        }
        else {
            //adding payment in client
            await Client.findOneAndUpdate({ _id: userPerformer.clientId, isDeleted: false },
                {
                    $addToSet: { payments: payment }
                },
                { new: true, upsert: true }).lean();
            return payment;
        }
    }

    async cancelOrder(userPerformer, renewal_id, order) {
        const payment = {
            _renewalId: renewal_id,
            paymentId: order.id,
            paymentStatus: order.status,
            paymentMethod: 'PayPal',
            paymentDate: new Date(),
            amount: order.purchase_units[0].amount.value,
            GST: 0,
            currency: order.purchase_units[0].amount.currency_code,
            paymentMode: 'Online',
            paymentGateway: 'PayPal',
            feeType: 'Subscription',

        }

        const client = await Client.findOneAndUpdate({ _id: userPerformer.clientId, isDeleted: false },
            {
                $addToSet: { payments: payment }
            },
            { new: true, upsert: true }).lean();

        return payment;
    }

    async getAllTransactions(userPerformer, search_by, period, from_date, to_date) {
        if (userPerformer.userType !== 'SuperAdmin') {
            throw ApiError.badRequest('Invalid user');
        }
        const searchRegex = new RegExp(search_by, 'i');

        const clients = await Client.aggregate([
            {
                $lookup: {
                    from: 'users', // Replace with the actual name of your users collection
                    localField: 'users',
                    foreignField: '_id',
                    as: 'matchedUsers'
                }
            },
            {
                $match: {
                    $or: [
                        { 'matchedUsers.email': searchRegex },
                    ],
                    isDeleted: false,
                    'payments.isDeleted': false
                }
            },
            {
                $project: {
                    _id: 1,
                    organizationName: 1,
                    payments: 1,
                    'matchedUsers.email': 1,
                    'matchedUsers._id': 1,
                    'matchedUsers.firstName': 1,
                    'matchedUsers.lastName': 1
                }
            }
        ]);

        //filter and make payments array such a way that contain like above data object list
        const payments = [];
        if (clients.length > 0) {     
            for (const client of clients) {
                for (const payment of client.payments) {
                    const paymentData = {
                        _renewalId: payment._renewalId,
                        paymentId: payment.paymentId,
                        paymentStatus: payment.paymentStatus,
                        paymentMethod: payment.paymentMethod,
                        paymentDate: payment.paymentDate,
                        amount: payment.amount,
                        GST: payment.GST,
                        currency: payment.currency,
                        paymentMode: payment.paymentMode,
                        paymentGateway: payment.paymentGateway,
                        isDeleted: payment.isDeleted,
                        createdAt: payment.createdAt,
                        updatedAt: payment.updatedAt,
                        _id: payment._id,
                        user_id: client.matchedUsers[0]._id,
                        firstName: client.matchedUsers[0].firstName,
                        lastName: client.matchedUsers[0].lastName,
                        email: client.matchedUsers[0].email,
                        client_id: client._id,
                        organizationName: client.organizationName,
                    }
                    payments.push(paymentData);
                }
            }
        }

            return payments;
        }


    async getAllTransactionsByClientId(userPerformer, clientId) {

            const client = await Client.findOne({
                _id: clientId,
                'payments.isDeleted': false
            })
                .populate('users', 'email firstName lastName')
                .select('payments')
                .lean();

            return client;
        }

    }

module.exports = new PaymentService();
