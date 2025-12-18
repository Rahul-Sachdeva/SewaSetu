import { Fund } from "../Models/fund.model.js";
import { NGO } from "../Models/ngo.model.js";
import { Campaign } from "../Models/campaign.model.js";
import { AssistanceRequest } from "../Models/assistance.model.js";
import { Donation } from "../Models/donation.model.js";
import { DonationHandling } from "../Models/user_donation_handling.model.js";
import { User } from "../Models/user.model.js";

/* ===========================================================
   HELPER: BUILD DATE RANGE FROM YYYY-MM
   =========================================================== */
const buildDateRange = (fromMonth, toMonth) => {
  if (!fromMonth && !toMonth) return null;

  const range = {};

  if (fromMonth) {
    range.$gte = new Date(`${fromMonth}-01`);
  }

  if (toMonth) {
    const end = new Date(`${toMonth}-01`);
    end.setMonth(end.getMonth() + 1); // move to next month
    range.$lt = end;
  }

  return range;
};

/* ===========================================================
   ADMIN / GLOBAL ANALYTICS
   =========================================================== */
export const getAnalytics = async (req, res) => {
  try {
    const { fromMonth, toMonth, ngoId, city } = req.query;

    const dateRange = buildDateRange(fromMonth, toMonth);

    /* =============================
       CAMPAIGN FILTER
    ============================== */
    const campaignMatch = {
      ...(ngoId && { ngo: ngoId }),
    };

    const campaigns = await Campaign.find(campaignMatch, "_id");
    const campaignIds = campaigns.map(c => c._id);

    /* =============================
       BASE MATCH OBJECTS
    ============================== */
    const fundMatch = {
      ...(campaignIds.length && { campaign: { $in: campaignIds } }),
      ...(dateRange && { createdAt: dateRange }),
    };

    const donationMatch = {
      ...(dateRange && { createdAt: dateRange }),
    };

    const requestMatch = {
      ...(city && { address: { $regex: city, $options: "i" } }),
      ...(dateRange && { createdAt: dateRange }),
    };

    /* =============================
       CORE METRICS
    ============================== */
    const [
      totalFundsRaised,
      totalNGOs,
      activeCampaigns,
      completedRequests,
      totalDonations,
      citiesImpacted,
    ] = await Promise.all([
      Fund.aggregate([
        { $match: fundMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      NGO.countDocuments({ verification_status: "verified" }),
      Campaign.countDocuments({ status: { $in: ["ongoing", "upcoming"] } }),
      AssistanceRequest.countDocuments({ ...requestMatch, status: "completed" }),
      Donation.countDocuments(donationMatch),
      AssistanceRequest.distinct("address", requestMatch),
    ]);

    /* =============================
       AVERAGE DONATION
    ============================== */
    const avgDonation = await Fund.aggregate([
      { $match: fundMatch },
      { $group: { _id: null, avg: { $avg: "$amount" } } },
    ]);

    /* =============================
       TOP DONORS
    ============================== */
    const topDonors = await Fund.aggregate([
      { $match: fundMatch },
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

    /* =============================
       TOP CAMPAIGNS
    ============================== */
    const topCampaigns = await Fund.aggregate([
      { $match: fundMatch },
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

    /* =============================
       NGO LEADERBOARD
    ============================== */
    const ngoLeaderboard = await Fund.aggregate([
      { $match: fundMatch },
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

    /* =============================
       DONATIONS OVER TIME
    ============================== */
    const donationsOverTime = await Fund.aggregate([
      { $match: fundMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
      { $project: { label: "$_id", value: "$total", _id: 0 } },
    ]);

    /* =============================
       REQUEST STATUS
    ============================== */
    const requestStatusDist = await AssistanceRequest.aggregate([
      { $match: requestMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    /* =============================
       DONATION TYPES
    ============================== */
    const donationTypeBreakdown = await Donation.aggregate([
      { $match: donationMatch },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    /* =============================
       DONATION HANDLING
    ============================== */
    const donationHandlingDist = await DonationHandling.aggregate([
      { $match: donationMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { label: "$_id", value: "$count", _id: 0 } },
    ]);

    res.json({
      summary: {
        totalFunds: totalFundsRaised[0]?.total || 0,
        totalNGOs,
        activeCampaigns,
        totalDonors: topDonors.length,
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
   NGO-SPECIFIC ANALYTICS
   =========================================================== */
export const getNgoAnalytics = async (req, res) => {
  try {
    const ngoId = req.user?.ngo || req.query.ngoId;
    if (!ngoId) return res.status(400).json({ message: "NGO ID required" });

    const { fromMonth, toMonth, campaignId } = req.query;
    const dateRange = buildDateRange(fromMonth, toMonth);

    const campaignMatch = {
      ngo: ngoId,
      ...(campaignId && { _id: campaignId }),
    };

    const campaigns = await Campaign.find(campaignMatch, "_id title");
    const campaignIds = campaigns.map(c => c._id);

    const fundMatch = {
      campaign: { $in: campaignIds },
      ...(dateRange && { createdAt: dateRange }),
    };

    /* =============================
       CORE METRICS
    ============================== */
    const fundsAgg = await Fund.aggregate([
      { $match: fundMatch },
      {
        $group: {
          _id: null,
          totalFunds: { $sum: "$amount" },
          avgDonation: { $avg: "$amount" },
          donors: { $addToSet: "$donor" },
        },
      },
    ]);

    const activeCampaigns = await Campaign.countDocuments({
      ngo: ngoId,
      status: { $in: ["ongoing", "upcoming"] },
    });

    const completedRequests = await AssistanceRequest.countDocuments({
      selectedNGOs: ngoId,
      ...(dateRange && { createdAt: dateRange }),
      status: "completed",
    });

    const handledDonations = await DonationHandling.aggregate([
      {
        $match: {
          handledBy: ngoId,
          ...(dateRange && { createdAt: dateRange }),
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const topDonors = await Fund.aggregate([
      { $match: fundMatch },
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

    const donationsByCampaign = await Fund.aggregate([
      { $match: fundMatch },
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

    const donationsOverTime = await Fund.aggregate([
      { $match: fundMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
      { $project: { label: "$_id", value: "$total", _id: 0 } },
    ]);

    const donorContributionDist = await Fund.aggregate([
      { $match: fundMatch },
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
        totalFunds: fundsAgg[0]?.totalFunds || 0,
        avgDonation: fundsAgg[0]?.avgDonation?.toFixed(2) || 0,
        totalDonors: fundsAgg[0]?.donors?.length || 0,
        activeCampaigns,
        completedRequests,
        totalCampaigns: campaigns.length,
      },
      topDonors,
      donationsByCampaign,
      donationsOverTime,
      handledDonations,
      donorContributionDist,
    });
  } catch (err) {
    console.error("NGO analytics error:", err);
    res.status(500).json({ message: "Failed to fetch NGO analytics", err });
  }
};
