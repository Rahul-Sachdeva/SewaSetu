import { Donation } from "../Models/donation.model.js";
import { NGO } from "../Models/ngo.model.js";
import { Campaign } from "../Models/campaign.model.js";
import { AssistanceRequest } from "../Models/assistance.model.js";

export const getPublicDashboardStats = async (req, res) => {
  try {
    // --- Main KPIs ---
    const totalMealsAgg = await Donation.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalMeals = totalMealsAgg[0]?.totalQuantity || 0;

    const totalNGOs = await NGO.countDocuments({ verification_status: "approved" });
    const citiesArr = await NGO.distinct("city");
    const citiesImpacted = citiesArr.length;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const activeCampaigns = await Campaign.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: startOfMonth },
      status: "active"
    });

    // --- Additional Data for Charts ---
    // Donations over time (12 months)
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const donationsOverTimeAgg = await Donation.aggregate([
      { $match: { status: "paid", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalDonation: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const donationsOverTime = donationsOverTimeAgg.map(item => ({
      label: `${item._id.year}-${item._id.month}`,
      value: item.totalDonation
    }));

    // Top 10 cities by requests count
    const topCities = await AssistanceRequest.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { city: "$_id", count: 1, _id: 0 } }
    ]);

    // Requests by status (pie chart)
    const requestStatusDistAgg = await AssistanceRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const requestStatusDist = requestStatusDistAgg.map(item => ({
      label: item._id,
      value: item.count
    }));

    // Top NGOs for donations (bar chart)
    const topNGOsAgg = await Donation.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$ngo", totalDonation: { $sum: "$amount" } } },
      { $sort: { totalDonation: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "ngos", localField: "_id", foreignField: "_id", as: "ngo" }
      },
      { $unwind: "$ngo" },
      { $project: { ngoName: "$ngo.name", totalDonation: 1, _id: 0 } }
    ]);

    // Total donors (unique donors)
    const totalDonors = await Donation.distinct("donor", { status: "paid" }).then(d => d.length);

    // Requests completed
    const requestsCompleted = await AssistanceRequest.countDocuments({ status: "completed" });

    // Donations by campaign
    const donationsByCampaign = await Donation.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$campaign",
          amount: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "_id",
          as: "campaign"
        }
      },
      { $unwind: "$campaign" },
      {
        $project: {
          campaignName: "$campaign.title",
          amount: 1
        }
      },
      { $sort: { amount: -1 } }
    ]);

    return res.json({
      totalMeals,
      totalNGOs,
      citiesImpacted,
      activeCampaigns,
      totalDonors,
      requestsCompleted,
      donationsOverTime,
      citiesData: topCities,
      requestStatusDist,
      topNGOs: topNGOsAgg,
      donationsByCampaign
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};
