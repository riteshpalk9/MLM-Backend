import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Copy, Check, Wallet } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Referrals = () => {
  const [referralData, setReferralData] = useState({
    direct: [],
    indirect: [],
    totalDirect: 0,
    totalIndirect: 0
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/referrals');
      setReferralData(response.data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-3xl font-bold text-gray-900">Referral Network</h1>
        <p className="text-gray-600 mt-1">Manage your referral network and track performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Direct Referrals</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {referralData.totalDirect}/8
              </p>
              <p className="text-sm text-blue-600 mt-1">Level 1 • 5% commission</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Indirect Referrals</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {referralData.totalIndirect}
              </p>
              <p className="text-sm text-purple-600 mt-1">Level 2 • 1% commission</p>
            </div>
            <div className="bg-purple-500 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Direct Referrals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Direct Referrals (Level 1)</h2>
          <p className="text-gray-600 mt-1">People you referred directly</p>
        </div>
        
        <div className="p-6">
          {referralData.direct.length > 0 ? (
            <div className="space-y-4">
              {referralData.direct.map((referral) => (
                <div
                  key={referral._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{referral.name}</h3>
                      <p className="text-sm text-gray-600">{referral.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Wallet className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            ₹{referral.wallet.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Code:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {referral.referralCode}
                          </code>
                          <button
                            onClick={() => copyReferralCode(referral.referralCode)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        Level 1
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No direct referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Share your referral code to start building your network
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Indirect Referrals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Indirect Referrals (Level 2)</h2>
          <p className="text-gray-600 mt-1">People referred by your direct referrals</p>
        </div>
        
        <div className="p-6">
          {referralData.indirect.length > 0 ? (
            <div className="space-y-4">
              {referralData.indirect.map((referral) => (
                <div
                  key={referral._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{referral.name}</h3>
                      <p className="text-sm text-gray-600">{referral.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Wallet className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            ₹{referral.wallet.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Referred by:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {referral.referredBy}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        Level 2
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No indirect referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Encourage your direct referrals to invite others
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;