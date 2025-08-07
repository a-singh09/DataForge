"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  DollarSign, 
  Upload, 
  Star, 
  Eye,
  Clock
} from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'license_purchase',
    title: 'License purchased',
    description: 'Premium Photography Collection',
    amount: 0.5,
    currency: 'ETH',
    timestamp: '2 hours ago',
    icon: Download,
    color: 'text-green-400'
  },
  {
    id: '2',
    type: 'content_upload',
    title: 'Content uploaded',
    description: 'New audio dataset minted',
    timestamp: '5 hours ago',
    icon: Upload,
    color: 'text-blue-400'
  },
  {
    id: '3',
    type: 'payment_received',
    title: 'Payment received',
    description: 'Royalty distribution',
    amount: 1.2,
    currency: 'ETH',
    timestamp: '1 day ago',
    icon: DollarSign,
    color: 'text-green-400'
  },
  {
    id: '4',
    type: 'rating_received',
    title: 'New rating',
    description: 'Social Media Text Dataset rated 5 stars',
    timestamp: '2 days ago',
    icon: Star,
    color: 'text-yellow-400'
  },
  {
    id: '5',
    type: 'content_viewed',
    title: 'Content previewed',
    description: 'Code Repository Dataset viewed 15 times',
    timestamp: '3 days ago',
    icon: Eye,
    color: 'text-purple-400'
  }
];

interface ActivityFeedProps {
  detailed?: boolean;
}

export default function ActivityFeed({ detailed = false }: ActivityFeedProps) {
  const displayActivities = detailed ? activities : activities.slice(0, 5);

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className={`h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{activity.title}</p>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                  {activity.amount && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        +{activity.amount} {activity.currency}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {!detailed && (
          <div className="text-center mt-6">
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}