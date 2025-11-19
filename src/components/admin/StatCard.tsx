import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  description?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, change, icon: Icon, description, onClick }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <Card 
      className={cn(onClick && "cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg")}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
        <CardTitle className="text-[11px] md:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
        <div className="text-lg md:text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-[10px] md:text-xs text-muted-foreground flex items-center mt-0.5 md:mt-1">
            {isPositive ? (
              <ArrowUp className="mr-0.5 md:mr-1 h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
            ) : (
              <ArrowDown className="mr-0.5 md:mr-1 h-2.5 w-2.5 md:h-3 md:w-3 text-red-500" />
            )}
            <span className={cn(isPositive ? "text-green-500" : "text-red-500")}>
              {Math.abs(change)}%
            </span>
            <span className="ml-0.5 md:ml-1">from last month</span>
          </p>
        )}
        {description && (
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
