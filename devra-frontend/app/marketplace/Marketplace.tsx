import React, { useState } from 'react';
import { HiOutlineCollection, HiOutlineRefresh } from 'react-icons/hi';
import CampaignCard from '../components/DatasetCard';



const mockCampaigns = [
  {
    campaign_id: '1',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-1',
    creator_wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    current_contributions: 100,
    description: 'High-quality medical imaging data for AI training',
    expiration: Date.now() + 1000000,
    is_active: true,
    title: 'Medical Image Dataset Collection',
    dataset_price: 5,
    chunk_count: '4 GB',
    data_format: 'json',
    score: '96%',
    file_size: '2.5 GB',
    ai_verified_status: true,
    fdc_verified_status: true,
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    max_data_count: '5 GB',
    total_budget: 5000,
    unit_price: 5,
  },
  {
    campaign_id: '2',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-2',
    creator_wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    current_contributions: 200,
    description: 'Multilingual text dataset with annotations',
    expiration: Date.now() + 2000000,
    is_active: true,
    title: 'Natural Language Processing Corpus',
    dataset_price: 8,
    chunk_count: '6 GB',
    data_format: 'csv',
    score: '90%',
    file_size: '1.2 GB',
    ai_verified_status: true,
    fdc_verified_status: true,
    wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    max_data_count: '7 GB',
    total_budget: 40000,
    unit_price: 8,
  },
  {
    campaign_id: '3',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-3',
    creator_wallet_address: '0x7890abcdef1234567890abcdef1234567890abcd',
    current_contributions: 150,
    description: 'Labeled images for object detection models',
    expiration: Date.now() + 3000000,
    is_active: true,
    title: 'Computer Vision Training Set',
    dataset_price: 12,
    chunk_count: 2500,
    data_format: 'json',
    score: '80%',
    file_size: '5.8 GB',
    ai_verified_status: true,
    fdc_verified_status: false,
    wallet_address: '0x7890abcdef1234567890abcdef1234567890abcd',
    max_data_count: '7 GB',
    total_budget: 30000,
    unit_price: 12,
  },
  {
    campaign_id: '4',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-4',
    creator_wallet_address: '0x4567890abcdef1234567890abcdef1234567890',
    current_contributions: 300,
    description: 'Historical stock market data with indicators',
    expiration: Date.now() + 4000000,
    is_active: true,
    title: 'Financial Time Series Data',
    dataset_price: 15,
    chunk_count: '9 GB',
    data_format: 'csv',
    score: '60%',
    file_size: '3.4 GB',
    ai_verified_status: true,
    fdc_verified_status: true,
    wallet_address: '0x4567890abcdef1234567890abcdef1234567890',
    max_data_count: '10 GB',
    total_budget: 150000,
    unit_price: 15,
  },
  {
    campaign_id: '5',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-5',
    creator_wallet_address: '0xdef1234567890abcdef1234567890abcdef12345',
    current_contributions: 50,
    description: 'Audio samples with transcriptions',
    expiration: Date.now() + 5000000,
    is_active: true,
    title: 'Speech Recognition Dataset',
    dataset_price: 20,
    chunk_count: 3000,
    data_format: 'json',
    score: '85%',
    file_size: '8.2 GB',
    ai_verified_status: false,
    fdc_verified_status: true,
    wallet_address: '0xdef1234567890abcdef1234567890abcdef12345',
    max_data_count: '8.2 GB',
    total_budget: 60000,
    unit_price: 20,
  },
  {
    campaign_id: '6',
    campaign_type: 'dataset',
    onchain_campaign_id: 'onchain-6',
    creator_wallet_address: '0x234567890abcdef1234567890abcdef123456789',
    current_contributions: 80,
    description: 'Customer reviews with sentiment labels',
    expiration: Date.now() + 6000000,
    is_active: true,
    title: 'Sentiment Analysis Collection',
    dataset_price: 7,
    chunk_count: 7500,
    data_format: 'csv',
    score: '92%',
    file_size: '900 MB',
    ai_verified_status: true,
    fdc_verified_status: true,
    wallet_address: '0x234567890abcdef1234567890abcdef123456789',
    max_data_count: '16 GB',
    total_budget: 52500,
    unit_price: 7,
  },
];

const CampaignCardSkeleton = () => {
  return (
    <div className="border-2 border-pink-200 rounded-xl p-6 h-[260px] animate-pulse bg-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-[50px] h-[50px] rounded-lg bg-pink-100"></div>
        <div className="flex-1">
          <div className="h-4 bg-pink-100 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-pink-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex gap-2">
          <div className="h-6 bg-pink-100 rounded w-24"></div>
          <div className="h-6 bg-pink-100 rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 ml-2">
        <div className="border-r border-b border-pink-200">
          <div className="h-3 bg-pink-100 rounded w-16 mb-2"></div>
          <div className="h-4 bg-pink-100 rounded w-12"></div>
        </div>
        <div className="border-b pb-2 border-pink-200 pl-9">
          <div className="h-3 bg-pink-100 rounded w-16 mb-2"></div>
          <div className="h-4 bg-pink-100 rounded w-20"></div>
        </div>
        <div className="border-r border-pink-200">
          <div className="h-3 bg-pink-100 rounded w-24 mb-2"></div>
          <div className="h-4 bg-pink-100 rounded w-12"></div>
        </div>
        <div className="pl-9">
          <div className="h-3 bg-pink-100 rounded w-20 mb-2"></div>
          <div className="h-4 bg-pink-100 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

const ActiveCampaigns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [campaigns] = useState(mockCampaigns);
  const [activeTab, setActiveTab] = useState<'Recent' | 'Popular' | 'Trending'>('Recent');

  const handleRefresh = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setIsRefetching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full relative">
        {/* Banner Section */}
       <div className="flex items-center justify-center mx-auto px-4 mt-24 font-bold text-3xl">
        Explore All Datasets
       </div>

        {/* Content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs and Refresh button */}
       <div className="flex justify-between items-center border-b border-gray-800 mb-8 mt-8">
            <div className="flex items-center gap-8">
              <button
                className={`flex items-center gap-2 px-4 py-3 text-white font-medium ${
                  activeTab === 'Recent' ? 'border-b-2 border-pink-500' : ''
                }`}
                onClick={() => setActiveTab('Recent')}
              >
                Recent
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-3 text-white font-medium ${
                  activeTab === 'Popular' ? 'border-b-2 border-pink-500' : ''
                }`}
                onClick={() => setActiveTab('Popular')}
              >
                Popular
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-3 text-white font-medium ${
                  activeTab === 'Trending' ? 'border-b-2 border-pink-500' : ''
                }`}
                onClick={() => setActiveTab('Trending')}
              >
                Trending
              </button>
            </div>
            </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <CampaignCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!campaigns || campaigns.length === 0) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <HiOutlineCollection className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">
                No Datasets Available
              </h3>
              <p className="text-gray-600 mt-2 max-w-md">
                There are currently no datasets available. Check back later or
                contact us to list your dataset.
              </p>
            </div>
          )}

          {/* Campaign Grid */}
          {!isLoading && campaigns && campaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.campaign_id} campaign={campaign} />
              ))}
            </div>
          )}

          {/* Refreshing notification */}
          {isRefetching && campaigns && campaigns.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
              <HiOutlineRefresh className="h-5 w-5 animate-spin" />
              <span>Refreshing listings...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCampaigns;