"use client";

import { CampModal } from "@campnetwork/origin/react";

interface AuthModalProps {
  wcProjectId?: string;
  injectButton?: boolean;
  onlyWagmi?: boolean;
  className?: string;
}

/**
 * Authentication modal component using Origin SDK's CampModal
 * Provides wallet connection and authentication functionality
 */
export function AuthModal({
  wcProjectId,
  injectButton = true,
  onlyWagmi = false,
  className = "",
}: AuthModalProps) {
  return (
    <div className={className}>
      <CampModal
        wcProjectId={wcProjectId}
        injectButton={injectButton}
        onlyWagmi={onlyWagmi}
      />
    </div>
  );
}
