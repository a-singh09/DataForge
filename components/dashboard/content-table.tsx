"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Eye,
  Edit,
  Trash2,
  Download,
  Star,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Archive,
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useCreatorAnalytics from "@/hooks/useCreatorAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { formatEther, parseEther } from "viem";

const typeColors = {
  image: "bg-blue-500/20 text-blue-400",
  text: "bg-green-500/20 text-green-400",
  audio: "bg-purple-500/20 text-purple-400",
  video: "bg-red-500/20 text-red-400",
  code: "bg-yellow-500/20 text-yellow-400",
  social: "bg-pink-500/20 text-pink-400",
};

const typeIcons = {
  image: "🖼️",
  text: "📝",
  audio: "🎵",
  video: "🎥",
  code: "💻",
  social: "📱",
};

interface EditPricingDialogProps {
  content: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    tokenId: string,
    newPrice: string,
    newDuration: number,
    newRoyalty: number,
  ) => void;
}

function EditPricingDialog({
  content,
  isOpen,
  onClose,
  onSave,
}: EditPricingDialogProps) {
  const [price, setPrice] = useState(
    content ? formatEther(content.license.price) : "0",
  );
  const [duration, setDuration] = useState(
    content ? Math.floor(content.license.duration / (24 * 60 * 60)) : 30,
  );
  const [royalty, setRoyalty] = useState(
    content ? content.license.royaltyBps / 100 : 5,
  );

  const handleSave = () => {
    if (content) {
      onSave(content.tokenId, price, duration * 24 * 60 * 60, royalty * 100);
      onClose();
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle>Edit Pricing - {content.title}</DialogTitle>
          <DialogDescription>
            Update the license terms for your content using Origin SDK's
            updateTerms method.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (ETH)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration (days)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="royalty" className="text-right">
              Royalty (%)
            </Label>
            <Input
              id="royalty"
              type="number"
              min="0"
              max="100"
              value={royalty}
              onChange={(e) => setRoyalty(parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Update Terms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ContentTable() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { uploads, isLoading, error, refetchUploads } = useCreatorAnalytics();
  const { auth } = useAuth();

  // Filter content based on search and filters
  const filteredContent =
    uploads?.filter((content) => {
      const matchesSearch = content.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || content.contentType === filterType;
      // For now, we'll assume all content is active since we don't have status in the data
      const matchesStatus = filterStatus === "all" || filterStatus === "active";

      return matchesSearch && matchesType && matchesStatus;
    }) || [];

  const handleEditPricing = (content: any) => {
    setEditingContent(content);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTerms = async (
    tokenId: string,
    newPrice: string,
    newDuration: number,
    newRoyalty: number,
  ) => {
    try {
      if (!auth?.origin) {
        throw new Error("Origin SDK not available");
      }

      const newTerms = {
        price: parseEther(newPrice),
        duration: newDuration,
        royaltyBps: newRoyalty,
        paymentToken:
          "0x0000000000000000000000000000000000000000" as `0x${string}`, // Native token
      };

      // Get the current user's address - this might be needed for updateTerms
      // For now, we'll use a placeholder or try to get it from the auth context
      const userAddress =
        "0x0000000000000000000000000000000000000000" as `0x${string}`;
      await auth.origin.updateTerms(BigInt(tokenId), userAddress, newTerms);

      // Refresh the data
      refetchUploads();

      // Show success message (you might want to add a toast notification here)
      console.log("Terms updated successfully");
    } catch (error) {
      console.error("Failed to update terms:", error);
      // Show error message (you might want to add a toast notification here)
    }
  };

  const handleDeleteContent = async (tokenId: string) => {
    try {
      if (!auth?.origin) {
        throw new Error("Origin SDK not available");
      }

      await auth.origin.requestDelete(BigInt(tokenId));

      // Refresh the data
      refetchUploads();

      console.log("Delete request submitted successfully");
    } catch (error) {
      console.error("Failed to request delete:", error);
    }
  };

  const getContentMetrics = (content: any) => {
    // Mock metrics - in a real implementation, these would come from blockchain events
    const mockLicenses = Math.floor(Math.random() * 100) + 1;
    const mockRevenue =
      Number(formatEther(content.license.price)) * mockLicenses;
    const mockRating = (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0

    return {
      licenses: mockLicenses,
      revenue: mockRevenue,
      rating: parseFloat(mockRating),
    };
  };

  if (isLoading) {
    return (
      <Card className="glass border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-800">
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load content</p>
            <Button
              onClick={() => refetchUploads()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass border-gray-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-400" />
                Content Management System
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Manage your content library with Origin SDK integration
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                onClick={() => refetchUploads()}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No content found</p>
              <p className="text-sm text-gray-500">
                {uploads?.length === 0
                  ? "Upload your first content to get started"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Licenses</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((content) => {
                  const metrics = getContentMetrics(content);
                  return (
                    <TableRow key={content.tokenId}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              {typeIcons[
                                content.contentType as keyof typeof typeIcons
                              ] || "📄"}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {content.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              Token #{content.tokenId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            typeColors[
                              content.contentType as keyof typeof typeColors
                            ]
                          }
                        >
                          {content.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {Number(formatEther(content.license.price)).toFixed(
                            4,
                          )}{" "}
                          ETH
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4 text-gray-400" />
                          <span>{metrics.licenses}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-400">
                          {metrics.revenue.toFixed(4)} ETH
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{metrics.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditPricing(content)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Pricing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() =>
                                handleDeleteContent(content.tokenId)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((content) => {
                const metrics = getContentMetrics(content);
                return (
                  <div
                    key={content.tokenId}
                    className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={
                          typeColors[
                            content.contentType as keyof typeof typeColors
                          ]
                        }
                      >
                        {
                          typeIcons[
                            content.contentType as keyof typeof typeIcons
                          ]
                        }{" "}
                        {content.contentType}
                      </Badge>
                      <Badge variant="default">Active</Badge>
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {content.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="text-orange-400 font-medium">
                          {Number(formatEther(content.license.price)).toFixed(
                            4,
                          )}{" "}
                          ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Licenses:</span>
                        <span>{metrics.licenses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="text-green-400 font-medium">
                          {metrics.revenue.toFixed(4)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{metrics.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditPricing(content)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EditPricingDialog
        content={editingContent}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleUpdateTerms}
      />
    </>
  );
}
