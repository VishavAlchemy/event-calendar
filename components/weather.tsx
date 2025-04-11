import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud } from "lucide-react";

type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
  className?: string;
  color?: "sky" | "violet" | "emerald" | "rose" | "orange" | "amber";
};

// Color mapping function from sidebar
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-500/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
    },
  };
  
  return colorMap[color] || colorMap.sky; // Default to sky if color not found
};

export const Weather = ({ 
  temperature, 
  weather, 
  location, 
  className,
  color = "sky" 
}: WeatherProps) => {
  const colorClasses = getColorClasses(color);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
    <div 
            className={cn(
              "text-sm rounded-md py-1 px-2 border inline-block",
              colorClasses.bg,
              colorClasses.text,
              colorClasses.border
            )}
          >
            {location}
          </div>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold tracking-tight">{temperature}°C</p>
            <p className="text-sm text-muted-foreground">{weather}</p>
          </div>
      
        </div>
      </CardContent>
    </Card>
  );
};