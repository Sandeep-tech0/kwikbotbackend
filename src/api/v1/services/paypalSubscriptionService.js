const ApiError = require("../middlewares/apiError");
const paypalTokenController = require("../middlewares/paypalToken");
const axios = require("axios");
const clientModel = require("../models/Client");
const invoiceService = require("../services/invoiceService");


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

      const planCount = clientData.subscriptionPlans.length - 1;
  
      const updatedFrequency =
        clientData.subscriptionPlans[planCount].frequency === "Monthly" ? "MONTH" : "YEAR";
  
      const setupfeeValue =
        clientData.subscriptionPlans[planCount].isSetUpAmountApplicable === true
          ? clientData.subscriptionPlans[planCount].setUpAmount
          : 0;
  
      // Define the request data in the correct structure
      const requestData = {
        product_id: "1695106714",
        name: clientData.subscriptionPlans[planCount].planName,
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
                value: clientData.subscriptionPlans[planCount].amount,
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
      };
  
    
  
      const apiresponse = await axios.post(
        `https://api-m.sandbox.paypal.com/v1/billing/plans`,
        requestData,
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
  

  async completeSubscription({
    subscriptionID,
    orderID,
    clientId,
    userPerformer,
  }) {
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
      const frequency =
        subscriptionPlanDetail?.data?.billing_cycles[0]?.frequency
          ?.interval_unit;
      const nextBillingTime = new Date(
        subscriptionApiResponse?.data?.billing_info?.next_billing_time
      );
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds

      let endDate;

      if (frequency === "MONTH") {
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      } else if (frequency === "YEAR") {
        nextBillingTime.setFullYear(nextBillingTime.getFullYear() + 1);
        endDate = new Date(nextBillingTime.getTime() - oneDayInMilliseconds);
      }


const intialAmount =
subscriptionApiResponse?.data?.billing_info?.last_payment?.amount?.value;
const setupfeeValue =
subscriptionPlanDetail?.data?.payment_preferences?.setup_fee?.value;
const totalAmount =  parseInt(intialAmount) + parseInt(setupfeeValue);
const totalAmountIncludeGST = parseInt(totalAmount) + (parseInt(totalAmount) * parseInt(subscriptionPlanDetail?.data?.taxes?.percentage)) / 100;
const GSTamount = (parseInt(totalAmount) * parseInt(subscriptionPlanDetail?.data?.taxes?.percentage)) / 100;

    
      const renewalData = {
        amount:
        totalAmountIncludeGST,
        payableAmount:
          subscriptionPlanDetail?.data?.billing_cycles[0]?.pricing_scheme
            ?.fixed_price?.value,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        plan_id: subscriptionPlanDetail?.data?.id,
        planName: subscriptionPlanDetail?.data?.name,
        renewalDate:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        startDate:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.time,
        endDate: endDate,
        nextRenewalDate:
          subscriptionApiResponse?.data?.billing_info?.next_billing_time,
        subscription_id: subscriptionApiResponse?.data?.id,
        isPaid: true,
        isCancelled: false,
      };

const updatedClient = await clientModel
  .findOneAndUpdate(
    {
      _id: clientId,
      isDeleted: false,
    },
    {
      $push: { "subscriptionPlans.$[elem].renewals": renewalData }, // Update the last element
      $set: { "subscriptionPlans.$[elem].isRenew": true }, // Update the last element
    },
    {
      new: true,
      arrayFilters: [{ "elem": { $exists: true } }],
    }
  )
  .select("subscriptionPlans")
  .lean();

      ///////////////=============adding payment data ==========================////////////////////
      const payment = {
        _renewalId:
          updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
        paymentId: orderApiResponse?.data?.id,
        paymentStatus: orderApiResponse?.data?.status,
        paymentMethod: "PayPal",
        paymentDate: orderApiResponse?.data?.create_time,
        amount:
        totalAmountIncludeGST,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        currency:
          subscriptionApiResponse?.data?.billing_info?.last_payment?.amount
            ?.currency_code,
        paymentMode: "Online",
        paymentGateway: "PayPal",
        feeType: "Subscription",
      };

      
 await clientModel
        .findOneAndUpdate(
          { _id: clientId, isDeleted: false },
          {
            $push: { payments: payment },
          },
          { new: true }
        )
        .lean();

      //////////////////////////////////=================invoice===================///////////////////////////

    
      function generateUniqueInvoiceNumber() {
        // Generate a unique invoice number with a combination of current year, timestamp, and a random number
        const currentYear = new Date().getFullYear();
        const timestamp = new Date().getTime();
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
        return `INV-${currentYear}-${timestamp}-${randomPart}`;
      }

      const invoiceData = {
        client_id: clientId,
        renewal_id:
          updatedClient.subscriptionPlans[0].renewals[0]._id.toString(),
        title: "Subscription Plan",
        ///=== create uniqe invoice number for every invoice  ===///
   invoiceNumber:
   generateUniqueInvoiceNumber(),

        invoiceDate: new Date(),
        paymentDate: new Date(),
        amount:
        totalAmountIncludeGST,
        paidStatus: true,
        GST: subscriptionPlanDetail?.data?.taxes?.percentage,
        email: subscriptionApiResponse?.data?.subscriber?.email_address,
      };

      await invoiceService.addInvoice(userPerformer, invoiceData);

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

  

  async webhook(data) {
    try {
    } catch (error) {
      return ApiError.badRequest(error.message);
    }
  }
}

module.exports = new paypalSubscriptionService();
