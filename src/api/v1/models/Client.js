const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema([
  {
    organizationName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    BotCode: {
      type: String,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    billingInfo: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      email: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      address: {
        type: String,
      },
      zipcode: {
        type: String,
      },
      isCompany: {
        type: Boolean,
      },
      companyName: {
        type: String,
      },
      GSTIN: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
    subscriptionPlans: [

      {
        planName: {
          type: String,
        default: "Basic Plan",
        },
        planId: {
          type: String
        },
        frequency: {
          type: String,
          enum: ["Monthly", "Yearly"],
          required: true,
        },
        currency: {
          type: String,
          default: "USD",
        },
        amount: {
          type: Number,
          required: true,
        },
        setUpAmount: {
          type: Number,
          required: true,
          default: 0,
        },
        isSetUpAmountApplicable: {
          type: Boolean,
          default: true,
        },
        applicableTaxPercentage: {
          type: Number,
          default: 0,
        },
        isTaxApplicable: {
          type: Boolean,
          default: false,
        },
        isCancelled: {
          type: Boolean,
          default: false,
        },
        cancellationReason: [String],
        fullReason: {
          type: String,
        },
        cancellationDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        isRenew: {
          type: Boolean,
          default: true
        },
        description: [
          {
            title: {
              type: String,
              required: true,
            },
            amount: {
              type: Number,
              required: true,
            },
            isPayable: {
              type: Boolean,
              default: true,
            },
          },
        ],
        renewals: [
          {
            renewalDate: {
              type: Date,
              required: true,
            },
            subscription_id: {
                type: String,
                required: true,
                },
            plan_id: {
              type: String,
              required: true,
            },
            planName: {
              type: String,
              required: true,
            },
            startDate: {
              type: Date,
              required: true,
            },
            endDate: {
              type: Date,
              required: true,
            },
            nextRenewalDate: {
              type: Date,
              required: true,
            },
            amount: {
              type: Number,
              required: true,
            },
            GST: {
              type: Number,
              default: 0,
            },
            payableAmount: {
              type: Number,
              required: true,
            },
            isPaid: {
              type: Boolean,
              default: false,
            },
            isCancelled: {
              type: Boolean,
              default: false,
            },
            cancellationDate: {
              type: Date,
            },
            isActive: {
              type: Boolean,
              default: true,
            },
            isDeleted: {
              type: Boolean,
              default: false,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            isSendMailWeekBefore: {
              type: Boolean,
              default: false,
            },
            isSendMailThreeDayBefore: {
              type: Boolean,
              default: false,
            },
            isSendMailDayBefore: {
              type: Boolean,
              default: false,
            },
            isSendMailOnRenewalDate: {
              type: Boolean,
              default: false,
            },
            updatedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    invoices: [
      {
        _renewalId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        invoiceNumber: {
          type: String,
          required: true,
        },
        invoiceDate: {
          type: Date,
          required: true,
        },
        paymentDate: {
          type: Date,
        },
        amount: {
          type: Number,
          required: true,
        },
        paidStatus: {
          type: Boolean,
          default: false,
        },
        invoicePdfPath: {
          type: String,
          required: true,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        GST: {
          type: Number,
          default: 0,
        },
        email: {
          type: String,
        },
      },
    ],
    contents: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    payments: [
      {
        _renewalId: {
          type: String,
        },
        paymentId: {
          type: String,
          required: true,
        },
        paymentStatus: {
          type: String,
          required: true,
        },
        paymentMethod: {
          type: String,
        },
        paymentDate: {
          type: Date,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        GST: {
          type: Number,
          required: true,
          default: 0,
        },
        currency: {
          type: String,
          required: true,
        },
        paymentMode: {
          type: String,
        },
        paymentGateway: {
          type: String,
        },
        feeType: {
          type: String,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    conversations: [
      {
        visitorId: {
          type: String,
        },
        conversation: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    leadCaptures: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        message: {
          type: String,
        },
        isDeleted: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
]);

module.exports = mongoose.model("Client", ClientSchema);
