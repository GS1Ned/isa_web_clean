/**
 * Authority Badge Component
 * 
 * Displays a visual indicator of source authority level in Ask ISA responses.
 * Helps users understand the reliability of cited information.
 */

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  Building2,
  Users,
} from 'lucide-react';

export type AuthorityLevel = 'official' | 'verified' | 'guidance' | 'industry' | 'community';

interface AuthorityBadgeProps {
  level: AuthorityLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AUTHORITY_CONFIG: Record<AuthorityLevel, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: {
    bg: string;
    text: string;
    border: string;
  };
}> = {
  official: {
    label: 'Official',
    description: 'Official EU legislation and regulatory texts',
    icon: ShieldCheck,
    colors: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
  },
  verified: {
    label: 'Verified',
    description: 'GS1 standards and EFRAG official guidance',
    icon: BadgeCheck,
    colors: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
  },
  guidance: {
    label: 'Guidance',
    description: 'Implementation guides and technical specifications',
    icon: BookOpen,
    colors: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
  },
  industry: {
    label: 'Industry',
    description: 'Industry reports, whitepapers, and best practices',
    icon: Building2,
    colors: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
    },
  },
  community: {
    label: 'Community',
    description: 'Community contributions and user-generated content',
    icon: Users,
    colors: {
      bg: 'bg-gray-50',
      text: 'text-gray-500',
      border: 'border-gray-200',
    },
  },
};

const SIZE_CONFIG = {
  sm: {
    badge: 'px-1.5 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-2 py-1 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base gap-2',
    icon: 'h-5 w-5',
  },
};

export function AuthorityBadge({
  level,
  showLabel = true,
  size = 'sm',
  className,
}: AuthorityBadgeProps) {
  const config = AUTHORITY_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center rounded-full border font-medium',
              config.colors.bg,
              config.colors.text,
              config.colors.border,
              sizeConfig.badge,
              className
            )}
          >
            <Icon className={sizeConfig.icon} />
            {showLabel && <span>{config.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Authority Score Indicator
 * Shows the overall authority score of an answer based on its sources
 */
interface AuthorityScoreProps {
  score: number;
  level: AuthorityLevel;
  breakdown?: Record<AuthorityLevel, number>;
  className?: string;
}

export function AuthorityScore({
  score,
  level,
  breakdown,
  className,
}: AuthorityScoreProps) {
  const config = AUTHORITY_CONFIG[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2',
              config.colors.bg,
              config.colors.border,
              className
            )}
          >
            <div className={cn('font-semibold', config.colors.text)}>
              {Math.round(score * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Authority Score
            </div>
            <AuthorityBadge level={level} size="sm" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <p className="font-medium mb-2">Source Authority Breakdown</p>
          {breakdown && (
            <div className="space-y-1 text-xs">
              {Object.entries(breakdown).map(([lvl, count]) => (
                count > 0 && (
                  <div key={lvl} className="flex justify-between">
                    <span className="capitalize">{lvl}</span>
                    <span className="font-medium">{count} source{count !== 1 ? 's' : ''}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Authority Legend
 * Explains the different authority levels to users
 */
export function AuthorityLegend({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-muted-foreground">Source Authority Levels</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(Object.keys(AUTHORITY_CONFIG) as AuthorityLevel[]).map((level) => {
          const config = AUTHORITY_CONFIG[level];
          const Icon = config.icon;
          return (
            <div
              key={level}
              className={cn(
                'flex items-start gap-2 rounded-md border p-2',
                config.colors.bg,
                config.colors.border
              )}
            >
              <Icon className={cn('h-4 w-4 mt-0.5', config.colors.text)} />
              <div>
                <p className={cn('text-sm font-medium', config.colors.text)}>
                  {config.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
