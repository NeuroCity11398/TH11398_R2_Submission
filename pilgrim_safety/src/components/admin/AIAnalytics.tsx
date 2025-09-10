
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Users, Activity } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AnalyticsData {
  crowdPrediction: {
    currentDensity: number;
    predictedPeak: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  patternAnalysis: {
    movementTrends: Array<{
      zone: string;
      inflow: number;
      outflow: number;
      netChange: number;
    }>;
    bottlenecks: string[];
    safeRoutes: string[];
  };
  realTimeInsights: {
    totalPeople: number;
    averageStayTime: string;
    emergencyReadiness: number;
    systemHealth: number;
  };
}

const AIAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    crowdPrediction: {
      currentDensity: 67,
      predictedPeak: "2:30 PM - 4:00 PM",
      riskLevel: 'medium',
      recommendations: [
        "Deploy additional volunteers at Main Gate",
        "Open alternate route via East Entrance",
        "Increase health unit staffing by 20%",
        "Activate crowd dispersal protocol in Temple area"
      ]
    },
    patternAnalysis: {
      movementTrends: [
        { zone: "Main Entrance", inflow: 234, outflow: 189, netChange: 45 },
        { zone: "Temple Complex", inflow: 189, outflow: 167, netChange: 22 },
        { zone: "Dining Hall", inflow: 145, outflow: 178, netChange: -33 },
        { zone: "Exit Gates", inflow: 98, outflow: 234, netChange: -136 }
      ],
      bottlenecks: ["Temple Complex Entry", "Main Dining Hall", "Parking Gate B"],
      safeRoutes: ["Route A (via East)", "Route C (via Service Road)", "Route D (Emergency)"]
    },
    realTimeInsights: {
      totalPeople: 12847,
      averageStayTime: "3h 24m",
      emergencyReadiness: 94,
      systemHealth: 98
    }
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Crowd Prediction */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Crowd Prediction & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Current Density</div>
              <div className="text-2xl font-bold text-primary">{analytics.crowdPrediction.currentDensity}%</div>
              <Progress value={analytics.crowdPrediction.currentDensity} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Predicted Peak</div>
              <div className="text-lg font-semibold">{analytics.crowdPrediction.predictedPeak}</div>
              <Badge className={getRiskColor(analytics.crowdPrediction.riskLevel)}>
                {analytics.crowdPrediction.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Total Present</div>
              <div className="text-2xl font-bold text-primary">
                {analytics.realTimeInsights.totalPeople.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg stay: {analytics.realTimeInsights.averageStayTime}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {analytics.crowdPrediction.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    index < 2 ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement Pattern Analysis */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-Time Movement Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.patternAnalysis.movementTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">{trend.zone}</div>
                  <div className="text-sm text-muted-foreground">
                    In: {trend.inflow} • Out: {trend.outflow}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {trend.netChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-400" />
                  )}
                  <span className={`font-medium ${trend.netChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {trend.netChange > 0 ? '+' : ''}{trend.netChange}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium mb-3 text-orange-400 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Current Bottlenecks
              </h4>
              <div className="space-y-2">
                {analytics.patternAnalysis.bottlenecks.map((bottleneck, index) => (
                  <Badge key={index} variant="outline" className="border-orange-500/50 text-orange-400">
                    {bottleneck}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-green-400 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Recommended Safe Routes
              </h4>
              <div className="space-y-2">
                {analytics.patternAnalysis.safeRoutes.map((route, index) => (
                  <Badge key={index} variant="outline" className="border-green-500/50 text-green-400">
                    {route}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Dashboard */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>System Health & Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Emergency Readiness</div>
              <div className="text-2xl font-bold text-green-400">
                {analytics.realTimeInsights.emergencyReadiness}%
              </div>
              <Progress value={analytics.realTimeInsights.emergencyReadiness} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">System Health</div>
              <div className="text-2xl font-bold text-green-400">
                {analytics.realTimeInsights.systemHealth}%
              </div>
              <Progress value={analytics.realTimeInsights.systemHealth} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalytics;
