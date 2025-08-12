"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle, Calendar, Download } from "lucide-react";
import { IpNFTMetadata, MarketplaceQueryParams } from "@/types/marketplace";
import { useAuth } from "@/hooks/useAuth";
import { useLicensing } from "@/hooks/useLicensing";
import { MarketplaceService } from "@/lib/marketplace-service";
import LicenseRenewalModal from "@/components/marketplace/license-renewal-modal";
import { toast } from "@/hooks/use-toast";

type SubscriptionItem = {
  dataset: IpNFTMetadata;
  hasAccess: boolean;
  isExpired: boolean;
  expiryDate?: Date;
};

export default function Subscriptions() {
  const { auth } = useAuth();
  const { checkAccess, clearAccessCache } = useLicensing();
  const [wallet, setWallet] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [showRenewalModal, setShowRenewalModal] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<IpNFTMetadata | null>(
    null,
  );

  const service = useMemo(() => {
    if (auth) {
      return new MarketplaceService(auth);
    }
    return null;
  }, [auth]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) setWallet(accounts[0] as string);
        }
      } catch (_) {
        // ignore
      }
    };
    fetchWallet();
  }, []);

  const refresh = async () => {
    if (!service) return;
    setIsLoading(true);
    try {
      const params: MarketplaceQueryParams = {
        page: 1,
        limit: 20,
        filters: { sortBy: "popular", contentTypes: [] },
      } as any;

      const data = await service.getMarketplaceData(params);
      if (!data.items?.length || !wallet) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      // Process datasets in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      const results: (SubscriptionItem | null)[] = [];

      for (let i = 0; i < data.items.length; i += batchSize) {
        const batch = data.items.slice(i, i + batchSize);

        // Add delay between batches to prevent rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const batchResults = await Promise.allSettled(
          batch.map(async (dataset) => {
            try {
              const status = await checkAccess(dataset.tokenId, wallet);
              // Only consider datasets where an expiry exists (active or expired subscription)
              if (status.expiryDate) {
                return {
                  dataset,
                  hasAccess: status.hasAccess,
                  isExpired: status.isExpired,
                  expiryDate: status.expiryDate,
                } as SubscriptionItem;
              }
            } catch (error) {
              console.warn(
                `Failed to check access for token ${dataset.tokenId}:`,
                error,
              );
            }
            return null;
          }),
        );

        // Extract successful results
        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          }
        });
      }

      const filtered = results.filter(Boolean) as SubscriptionItem[];
      // Sort by expiry ascending (soonest first)
      filtered.sort((a, b) => {
        const aTime = a.expiryDate ? a.expiryDate.getTime() : 0;
        const bTime = b.expiryDate ? b.expiryDate.getTime() : 0;
        return aTime - bTime;
      });

      setItems(filtered);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
      toast({
        title: "Failed to load subscriptions",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet || !service) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, service]);

  const onOpenRenew = (dataset: IpNFTMetadata) => {
    setSelectedDataset(dataset);
    setShowRenewalModal(true);
  };

  const onRenewSuccess = (
    tokenId: bigint,
    transactionHash: string,
    periods: number,
  ) => {
    toast({
      title: "Renewed",
      description: `Extended ${periods} period(s). Tx ${transactionHash.slice(
        0,
        10,
      )}...`,
    });
    setShowRenewalModal(false);
    setSelectedDataset(null);
    // Clear cache to ensure fresh data after renewal
    clearAccessCache();
    refresh();
  };

  const onRenewError = (error: Error) => {
    toast({
      title: "Renewal failed",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <Card className="glass border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Subscriptions</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!wallet && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to view subscriptions.
            </AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <div className="text-sm text-gray-400">
            {isLoading ? "Loading subscriptions..." : "No subscriptions found."}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ dataset, hasAccess, isExpired, expiryDate }) => (
              <div
                key={dataset.tokenId.toString()}
                className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {dataset.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      Token #{dataset.tokenId.toString()}
                    </div>
                    {expiryDate && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {expiryDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasAccess && !isExpired ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Expired
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => onOpenRenew(dataset)}
                  >
                    Renew
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator className="mt-4" />

        {showRenewalModal && selectedDataset && (
          <LicenseRenewalModal
            isOpen={showRenewalModal}
            onClose={() => {
              setShowRenewalModal(false);
              setSelectedDataset(null);
            }}
            dataset={selectedDataset}
            onSuccess={onRenewSuccess}
            onError={onRenewError}
          />
        )}
      </CardContent>
    </Card>
  );
}
