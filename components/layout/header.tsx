"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Wallet,
  User,
  BarChart3,
  Upload,
  Search,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState, useAuth, CampModal } from "@campnetwork/origin/react";

const navigation = [
  { name: "Marketplace", href: "/marketplace", icon: Search },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { authenticated, loading } = useAuthState();
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="font-space text-xl font-bold gradient-text">
              CreatorVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-orange-400 ${
                    pathname === item.href ? "text-orange-400" : "text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-10 w-32 rounded-md"></div>
            ) : (
              <>
                <CampModal />
                {authenticated && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-gray-900 border-gray-800"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem asChild>
                        <Link href="/ai-dashboard" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          AI Dashboard
                        </Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={auth.disconnect}
                        className="cursor-pointer text-red-400"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-orange-400 ${
                      pathname === item.href
                        ? "text-orange-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-800">
                {loading ? (
                  <div className="animate-pulse bg-gray-700 h-10 w-full rounded-md"></div>
                ) : (
                  <div className="space-y-4">
                    <CampModal />
                    {authenticated && (
                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-orange-400"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/ai-dashboard"
                          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-orange-400"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>AI Dashboard</span>
                        </Link>
                        <button
                          onClick={() => {
                            auth.disconnect();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 text-sm font-medium text-red-400 hover:text-red-300"
                        >
                          <Wallet className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
