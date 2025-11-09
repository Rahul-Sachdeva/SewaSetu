import Razorpay from "razorpay";
import crypto from "crypto";
import { Campaign } from "../Models/campaign.model.js"; // import campaign schema
import { Fund } from "../Models/fund.model.js";
import { updateUserPoints } from "../Controllers/user.controller.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order + fund record
export const createOrder = async (req, res) => {
  try {
    const { campaignId, amount } = req.body;
    const userId = req.user._id; // assuming auth middleware

    const options = {
      amount: parseFloat(amount), // paise
      currency: "INR",
      receipt: `fund_${campaignId}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("Razorpay order created:", order);
    } catch (err) {
      console.error("Razorpay order creation error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("order: ", order)

    const fund = await Fund.create({
      campaign: campaignId,
      donor: userId,
      amount: amount / 100,
      orderId: order.id,
      status: "created",
    });
    console.log("here");

    res.json({ orderId: order.id, amount, currency: "INR", fundId: fund._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ Update Fund entry
      const fund = await Fund.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id, status: "paid" },
        { new: true }
      );

      if (!fund) {
        return res.status(404).json({ success: false, message: "Fund record not found" });
      }

      // After updating fund
      if (fund && fund.status === "paid" && !fund.campaignUpdated) {
        await Campaign.findByIdAndUpdate(fund.campaign, {
          $inc: { collectedFunds: fund.amount }
        });

        // Mark fund as already counted
        fund.campaignUpdated = true;
        await fund.save();
      }

      // Calculate points: 1 point per 10 rupees
      const points = Math.floor(fund.amount / 10);

      // Award points to the donor
      await updateUserPoints(fund.donor, "donation_amount", points);

      return res.json({ success: true, fund });
    } else {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFundsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const funds = await Fund.find({ campaign: campaignId })
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFundsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const funds = await Fund.find({ donor: userId })
      .populate("campaign", "title targetFunds collectedFunds")
      .sort({ createdAt: -1 });

    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body; // raw JSON

    // Step 1: Validate signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Step 2: Handle events
    const event = body.event;

    if (event === "payment.captured") {
      const { order_id, id: paymentId } = body.payload.payment.entity;
      const fund = await Fund.findOneAndUpdate(
        { orderId: order_id },
        { paymentId, status: "paid" },
        { new: true }
      );
      // After updating fund
      if (fund && fund.status === "paid" && !fund.campaignUpdated) {
        await Campaign.findByIdAndUpdate(fund.campaign, {
          $inc: { totalFundsRaised: fund.amount }
        });

        // Mark fund as already counted
        fund.campaignUpdated = true;
        await fund.save();
      }
    }

    if (event === "payment.failed") {
      const { order_id } = body.payload.payment.entity;
      await Fund.findOneAndUpdate(
        { orderId: order_id },
        { status: "failed" },
        { new: true }
      );
    }

    // Step 3: Respond success to Razorpay
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
