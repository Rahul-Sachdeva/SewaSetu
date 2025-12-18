import { Fund } from "../Models/fund.model.js";
import { NGO } from "../Models/ngo.model.js";
import { Campaign } from "../Models/campaign.model.js";
import { AssistanceRequest } from "../Models/assistance.model.js";
import { Donation } from "../Models/donation.model.js";
import { DonationHandling } from "../Models/user_donation_handling.model.js";
import { User } from "../Models/user.model.js";

/* ===========================================================
   ADMIN / GLOBAL ANALYTICS CONTROLLER
   =========================================================== */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalFundsRaised,
      totalNGOs,
      activeCampaigns,
      totalDonors,
      completedRequests,
      citiesImpacted,
      totalDonations
    ] = await Promise.all([
      Fund.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      NGO.countDocuments({ verification_status: "verified" }),
      Campaign.countDocuments({ status: { $in: ["ongoing", "upcoming"] } }),
      Fund.distinct("donor"),
      AssistanceRequest.countDocuments({ status: "completed" }),
      AssistanceRequest.distinct("address"),
      Donation.countDocuments(),
    ]);

    // 🔹 Average donation size (monetary)
    const avgDonation = await Fund.aggregate([
      { $group: { _id: null, avg: { $avg: "$amount" } } },
    ]);

    // 🔹 Top donors globally
    const topDonors = await Fund.aggregate([
      { $group: { _id: "$donor", totalDonated: { $sum: "$amount" } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          donorName: { $arrayElemAt: ["$user.name", 0] },
          totalDonated: 1,
        },
      },
    ]);

    // 🔹 Top performing campaigns
    const topCampaigns = await Fund.aggregate([
      { $group: { _id: "$campaign", totalAmount: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "_id",
          as: "campaign",
        },
      },
      { $unwind: "$campaign" },
      {
        $project: {
          campaignName: "$campaign.title",
          ngo: "$campaign.ngo",
          amount: "$totalAmount",
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 5 },
    ]);

    // 🔹 NGO leaderboard by funds
    const ngoLeaderboard = await Fund.aggregate([
      {
        $lookup: {
          from: "campaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      { $unwind: "$campaign" },
      {
        $group: {
          _id: "$campaign.ngo",
          totalFunds: { $sum: "$amount" },
          campaignsCount: { $addToSet: "$campaign._id" },
        },
      },
      {
        $lookup: {
          from: "ngos",
          localField: "_id",
          foreignField: "_id",
          as: "ngo",
        },
      },
      {
        $project: {
          ngoName: { $arrayElemAt: ["$ngo.name", 0] },
          totalFunds: 1,
          campaignsCount: { $size: "$campaignsCount" },
        },
      },
      { $sort: { totalFunds: -1 } },
      { $limit: 5 },
    ]);

    // 🔹 Monthly donation trend
    const donationsOverTime = await Fund.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
      { $project: { label: "$_id", value: "$total", _id: 0 } },
    ]);

    // 🔹 Requests breakdown
    const requestStatusDist = await AssistanceRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    // 🔹 Donation type breakdown (non-fund donations)
    const donationTypeBreakdown = await Donation.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    // 🔹 Donation handling distribution
    const donationHandlingDist = await DonationHandling.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    res.json({
      summary: {
        totalFunds: totalFundsRaised[0]?.total || 0,
        totalNGOs,
        activeCampaigns,
        totalDonors: totalDonors.length,
        avgDonation: avgDonation[0]?.avg?.toFixed(2) || 0,
        completedRequests,
        totalDonations,
        citiesImpacted: citiesImpacted.length,
      },
      topDonors,
      topCampaigns,
      ngoLeaderboard,
      requestStatusDist,
      donationsOverTime,
      donationTypeBreakdown,
      donationHandlingDist,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Error fetching analytics", error });
  }
};

/* ===========================================================
   NGO-SPECIFIC ANALYTICS CONTROLLER
   =========================================================== */
export const getNgoAnalytics = async (req, res) => {
  try {
    const ngoId = req.user?.ngo || req.query.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID required" });
    }

    // fetch all campaigns for this NGO
    const ngoCampaigns = await Campaign.find({ ngo: ngoId }, "_id title");

    const campaignIds = ngoCampaigns.map((c) => c._id);

    // 🔹 Total & average fund amount
    const fundsAgg = await Fund.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      {
        $group: {
          _id: null,
          totalFunds: { $sum: "$amount" },
          avgDonation: { $avg: "$amount" },
          donors: { $addToSet: "$donor" },
        },
      },
    ]);

    const totalFunds = fundsAgg[0]?.totalFunds || 0;
    const avgDonation = fundsAgg[0]?.avgDonation?.toFixed(2) || 0;
    const totalDonors = fundsAgg[0]?.donors?.length || 0;

    const activeCampaigns = await Campaign.countDocuments({
      ngo: ngoId,
      status: { $in: ["ongoing", "upcoming"] },
    });

    const completedRequests = await AssistanceRequest.countDocuments({
      selectedNGOs: ngoId,
      status: "completed",
    });

    const handledDonations = await DonationHandling.aggregate([
      { $match: { handledBy: ngoId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 🔹 Top donors for this NGO
    const topDonors = await Fund.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      { $group: { _id: "$donor", totalDonated: { $sum: "$amount" } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          donorName: { $arrayElemAt: ["$user.name", 0] },
          totalDonated: 1,
        },
      },
    ]);

    // 🔹 Campaign-wise funds
    const donationsByCampaign = await Fund.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      {
        $group: {
          _id: "$campaign",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "_id",
          as: "campaign",
        },
      },
      {
        $project: {
          campaignName: { $arrayElemAt: ["$campaign.title", 0] },
          amount: "$totalAmount",
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // 🔹 Monthly inflow
    const donationsOverTime = await Fund.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: { label: "$_id", value: "$total", _id: 0 },
      },
    ]);

    // Add new donor distribution (optional)
const donorContributionDist = await Fund.aggregate([
  { $match: { campaign: { $in: campaignIds } } },
  {
    $group: {
      _id: "$donor",
      totalDonated: { $sum: "$amount" },
    },
  },
  {
    $bucket: {
      groupBy: "$totalDonated",
      boundaries: [0, 500, 1000, 5000, 10000, 50000, Infinity],
      default: "Unknown",
      output: { count: { $sum: 1 } },
    },
  },
]);

res.json({
  summary: {
    totalFunds,
    avgDonation,
    totalDonors,
    activeCampaigns,
    completedRequests,
    totalCampaigns: ngoCampaigns.length,
  },
  topDonors,
  donationsByCampaign,
  donationsOverTime,
  handledDonations,
  donorContributionDist, // NEW
});


  } catch (err) {
    console.error("NGO analytics error:", err);
    res.status(500).json({ message: "Failed to fetch NGO analytics", err });
  }
};