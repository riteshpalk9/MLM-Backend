import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import axios from "axios";

const Reports = () => {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    earningsByLevel: {},
    recentEarnings: [],
  });
  const [referralEarnings, setReferralEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [earningsRes, referralRes] = await Promise.all([
        axios.get("http://localhost:4862/api/report/earnings"),
        axios.get("http://localhost:4862/api/report/referral-earnings"),
      ]);

      setEarningsData(earningsRes.data);
      setReferralEarnings(referralRes.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          Detailed insights into your earnings and network performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                ₹{earningsData.totalEarnings.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Level 1 Earnings
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                ₹{(earningsData.earningsByLevel.level1?.total || 0).toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {earningsData.earningsByLevel.level1?.count || 0} transactions
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Level 2 Earnings
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                ₹{(earningsData.earningsByLevel.level2?.total || 0).toFixed(2)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {earningsData.earningsByLevel.level2?.count || 0} transactions
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Active Referrals
              </p>
              <p className="text-2xl font-bold text-orange-700 mt-1">
                {referralEarnings.filter((r) => r.totalEarned > 0).length}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Earnings
          </h2>
          <p className="text-gray-600 mt-1">
            Latest commission earnings from your network
          </p>
        </div>

        <div className="p-6">
          {earningsData.recentEarnings.length > 0 ? (
            <div className="space-y-4">
              {earningsData.recentEarnings.map((earning) => (
                <div
                  key={earning._id}
                  className={`border rounded-lg p-4 transition-colors ${
                    earning.level === 1
                      ? "border-blue-200 bg-blue-50 hover:border-blue-300"
                      : "border-purple-200 bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          From: {earning.fromUserId.name}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            earning.level === 1
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          Level {earning.level}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(earning.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-green-600">
                            +₹{earning.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No earnings yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Earnings will appear here when your referrals make purchases
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Referral Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Referral Performance
          </h2>
          <p className="text-gray-600 mt-1">
            Earnings breakdown by each referral
          </p>
        </div>

        <div className="p-6">
          {referralEarnings.length > 0 ? (
            <div className="space-y-4">
              {referralEarnings.map((ref) => (
                <div
                  key={ref.referral.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          {ref.referral.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {ref.referral.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">
                            Earned from this referral:
                          </span>
                          <span className="font-medium text-green-600">
                            ₹{ref.totalEarned.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">
                            Transactions:
                          </span>
                          <span className="font-medium text-blue-600">
                            {ref.earningsCount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">
                            Their wallet:
                          </span>
                          <span className="font-medium text-purple-600">
                            ₹{ref.referral.wallet.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No referral data available</p>
              <p className="text-sm text-gray-400 mt-1">
                Referral performance will show here once you have active
                referrals
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
