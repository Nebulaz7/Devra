import React from 'react';
import Avvvatars from 'avvvatars-react';
import Link from 'next/link';
import { truncateAddress } from '@aptos-labs/wallet-adapter-react';

interface CampaignCardProps {
  campaign: {
    campaign_id: string;
    campaign_type: string;
    onchain_campaign_id: string;
    creator_wallet_address: string;
    current_contributions: number;
    description: string;
    expiration: number;
    is_active: boolean;
    max_data_count: string;
    score: string;
    title: string;
    total_budget: number;
    unit_price: number;
    data_format: string;
  };
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/detailed-campaign/${campaign.campaign_id}`}
      className="
        radial-gradient-border border border-pink-500/50 rounded-xl p-6 h-[260px] 
        cursor-pointer transition-all duration-300 ease-in-out 
        hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(236,72,153,0.1)] hover:border-pink-400
      "
    >
      <div className="inner-content">
        <div className="flex items-center gap-3">
          <Avvvatars
            value={campaign.creator_wallet_address}
            style="shape"
            size={50}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-sm truncate">{campaign.title}</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Creator: {truncateAddress(campaign.creator_wallet_address)}
            </p>
          </div>
        </div>

        <ul className="flex items-center justify-between gap-2 text-xs mt-3">
          <li className="bg-pink-600 backdrop-blur-sm p-1 px-3 rounded-md">FDC Verification</li>
          <li className="bg-pink-600 backdrop-blur-sm p-1 px-3 rounded-md">AI Verification</li>
        </ul>

        <div className="grid grid-cols-2 gap-4 mt-6 ml-2">
          <div className="border-r border-b border-gray-800">
            <p className="text-gray-400 text-xs">Score</p>
            <p className="text-white font-medium mt-1">{campaign.score}</p>
          </div>
          <div className="border-b pb-2 border-gray-800 pl-9">
            <p className="text-gray-400 text-xs">Price</p>
            <p className="text-white font-medium mt-1">
              {campaign.unit_price} PAS
            </p>
          </div>
          <div className="border-r border-gray-800">
            <p className="text-gray-400 text-xs">File Size</p>
            <p className="text-white font-medium mt-1">
              {campaign.max_data_count}
            </p>
          </div>
          <div className="pl-9">
            <p className="text-gray-400 text-xs">Data Format</p>
            <p className="text-white font-medium mt-1 uppercase">
              {campaign.data_format}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
