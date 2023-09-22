const ApiError = require("../middlewares/apiError");
const paypalTokenController = require("../middlewares/paypalToken");
const axios = require("axios");
const clientModel = require("../models/Client");
const invoiceService = require('../services/invoiceService');

class paypalSubscriptionService {
  async createPlan(clientId) {
    const clientData = await clientModel
      .findById(clientId)
      .select("subscriptionPlans")
      .lean();
    if (!clientData) {
      throw new Error("Client not found");
    }

    try {
      const token = await paypalTokenController.createToken();

 const updatedFrequency = clientData.subscriptionPlans[0].frequency === "Monthly" ? "MONTH" : "YEAR";

//////========== if setupamountis = aplicable ho to setupfee pass ho warna nahi pass ho 0 =========//////

const setupfeeValue = clientData.subscriptionPlans[0].isSetUpAmountApplicable === true ?  
clientData.subscriptionPlans[0].setUpAmount : 0;

      let data = JSON.stringify({
        product_id: "1695106714",
        name: clientData.subscriptionPlans[0].planName,
        description: "-",
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: {
              interval_unit: updatedFrequency,
              interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: clientData.subscriptionPlans[0].amount,
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: setupfeeValue,
            currency_code: "USD",
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
        taxes: {
          percentage: "10",
          inclusive: false,
        },
      });

      const apiresponse = await axios.post(
        `https://api-m.sandbox.paypal.com/v1/billing/plans`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "PayPal-Request-Id": "5329613a-2575-441b-bf68-ba8d4e287180",
            Prefer: "return=representation",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return apiresponse.data;
    } catch (error) {
      console.error("Error creating plan:", error);
      return ApiError.badRequest(error.message);
    }
  }

  async completeSubscription({ subscriptionID, orderID, clientId, userPerformer }) {
    try {
      const token = await paypalTokenController.createToken();
      const orderApiResponse = await axios.get(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const subscriptionApiResponse = await axios.get(
        `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const subscriptionPlanDetail = await axios.get(
        `https://api-m.sandbox.paypal.com/v1/billing/plans/${subscriptionApiResponse.data.plan_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const frequency = subscriptionPlanDetail?.data?.billing_cycles[0]?.frequency?.interval_unit;
      const nextBillingTime = new Date(subscriptionApiResponse?.data?.billing_info?.next_billing_time);
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      
      let endDate;
      
      if (frequency === "MONTH") {
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      } else if (frequency === "YEAR") {
        nextBillingTime.setFullYear(nextBillingTime.getFullYear() + 1);
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      }
      
     const renewalData = {
        amount: subscriptionPlanDetail?.data?.billing_cycles[0]?.pricing_scheme?.fixed_price?.value,
        payableAmount: subscriptionPlanDetail?.data?.billing_cycles[0]?.pricing_scheme?.fixed_price?.value,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        plan_id: subscriptionPlanDetail?.data?.id,
        planName: subscriptionPlanDetail?.data?.name,
        renewalDate: subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        startDate: subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        endDate: endDate,
        nextRenewalDate: subscriptionApiResponse?.data?.billing_info?.next_billing_time,
        subscription_id: subscriptionApiResponse?.data?.id,
        isPaid: true,
        isCancelled: false
      };
      const updatedClient = await clientModel.findOneAndUpdate(
        {
          _id: clientId,
          isDeleted: false,
        },
        {
          $push: { 'subscriptionPlans.0.renewals': renewalData },
        },
        { new: true }
      )
      .select("subscriptionPlans")
      .lean();

  
      if (!updatedClient) {
        throw new Error("Client not found");
      }
      updatedClient.subscriptionPlans[0].renewals.push(renewalData);

///////////////=============adding payment data ==========================////////////////////
      const payment = {
        _renewalId: updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
        paymentId: orderApiResponse?.data?.id,
        paymentStatus: orderApiResponse?.data?.status,
        paymentMethod:  'PayPal',
        paymentDate:orderApiResponse?.data?.create_time,
        amount: subscriptionApiResponse?.data?.billing_info?.last_payment?.amount?.value ,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        currency: subscriptionApiResponse?.data?.billing_info?.last_payment?.amount?.currency_code ,
        paymentMode: 'Online',
        paymentGateway: 'PayPal',
        feeType: 'Subscription',
   }
   const clientPayment = await clientModel.findOneAndUpdate({ _id: clientId, isDeleted: false },
    {
      $push: { 'payments': payment },
    },
    { new: true }
  )
  .lean();

  clientPayment.payments.push(payment);

  //////////////////////////////////=================invoice===================///////////////////////////
 

  const invoiceData = {
    client_id: clientId,
    renewal_id: updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
    title: 'Subscription Plan',

    ///////////////================ invoice ki length kam karni hai ====================/////////////////////
    invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + '00' + payment._renewalId.slice(0, 4),
    invoiceDate: new Date(),
    paymentDate: new Date(),
    amount: payment.amount,
    paidStatus: true,
    GST: subscriptionPlanDetail?.data?.taxes?.percentage,
    email: subscriptionApiResponse?.data?.subscriber?.email_address,
}

console.log('invoiceData',invoiceData);
await invoiceService.addInvoice(userPerformer,invoiceData);

      return {
        order: orderApiResponse?.data,
        subscription: subscriptionApiResponse?.data,
        PlanDetails: subscriptionPlanDetail?.data,
      };
    } catch (error) {
      console.error("Error creating plan:", error);
      return ApiError.badRequest(error.message);
    }
  }


  async cancelRenewal(data) {
    try {
      const { subscriptionID, clientId, renewalId } = data;
      const token = await paypalTokenController.createToken();
      const subscriptionApiResponse = await axios.get(
        `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
   
      const updatedClient = await clientModel.findOneAndUpdate(
        {
          _id: clientId,
          isDeleted: false,
          "subscriptionPlans.renewals._id": renewalId,
        },
        {
          $set: {
            "subscriptionPlans.$.renewals.$[innerRenewal].isCancelled": true,
            "subscriptionPlans.$.renewals.$[innerRenewal].cancellationDate":
              new Date(),
          },
        },
        {
          new: true,
          arrayFilters: [{ "innerRenewal._id": renewalId }],
        }
      )
        .select("subscriptionPlans")
        .lean();
      if (!updatedClient) {
        throw new Error("Client not found");
      }

      return subscriptionApiResponse.data;
    } catch (error) {
      console.error("Error creating plan:", error);
      ApiError.badRequest(error.message);
    }
  }
}

module.exports = new paypalSubscriptionService();
