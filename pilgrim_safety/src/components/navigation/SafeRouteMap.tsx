
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Users, AlertTriangle, Route } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CrowdZone {
  id: string;
  location: string;
  density: number;
  status: 'safe' | 'moderate' | 'high' | 'critical';
  coordinates: { lat: number; lng: number };
  capacity: number;
  currentCount: number;
}

interface SafeRoute {
  id: string;
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  crowdLevel: 'low' | 'medium' | 'high';
  accessibility: boolean;
  waypoints: string[];
}

const SafeRouteMap = () => {
  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>([]);
  const [safeRoutes, setSafeRoutes] = useState<SafeRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SafeRoute | null>(null);

  useEffect(() => {
    // Listen to real-time crowd data
    const unsubscribeCrowd = onSnapshot(collection(db, 'crowd_zones'), (snapshot) => {
      const zones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CrowdZone));
      setCrowdZones(zones);
    });

    // Mock safe routes data (in real app, this would be from AI prediction service)
    const mockRoutes: SafeRoute[] = [
      {
        id: '1',
        from: 'Main Entrance',
        to: 'Temple Complex',
        distance: '1.2 km',
        estimatedTime: '15 min',
        crowdLevel: 'low',
        accessibility: true,
        waypoints: ['Security Check', 'Information Center', 'Medical Post']
      },
      {
        id: '2',
        from: 'Parking Area',
        to: 'Dining Hall',
        distance: '0.8 km',
        estimatedTime: '10 min',
        crowdLevel: 'medium',
        accessibility: true,
        waypoints: ['Rest Area', 'Water Station']
      },
      {
        id: '3',
        from: 'Temple Complex',
        to: 'Exit Gates',
        distance: '1.5 km',
        estimatedTime: '20 min',
        crowdLevel: 'low',
        accessibility: false,
        waypoints: ['Souvenir Shop', 'Final Security']
      }
    ];
    setSafeRoutes(mockRoutes);

    return () => {
      unsubscribeCrowd();
    };
  }, []);

  const getCrowdStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Crowd Heat Map */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Live Crowd Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crowdZones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">{zone.location}</div>
                    <div className="text-sm text-muted-foreground">
                      {zone.currentCount}/{zone.capacity} people
                    </div>
                  </div>
                </div>
                <Badge className={getCrowdStatusColor(zone.status)}>
                  {zone.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safe Routes */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2" />
            AI-Recommended Safe Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safeRoutes.map((route) => (
              <div key={route.id} className="border border-border/50 rounded-lg p-4 bg-card/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">
                    {route.from} → {route.to}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCrowdLevelColor(route.crowdLevel)}>
                      {route.crowdLevel} crowd
                    </Badge>
                    {route.accessibility && (
                      <Badge variant="outline">Accessible</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{route.distance}</span>
                  <span>{route.estimatedTime}</span>
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  Waypoints: {route.waypoints.join(' • ')}
                </div>

                <Button 
                  onClick={() => setSelectedRoute(route)}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <Navigation className="h-3 w-3 mr-2" />
                  Use This Route
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Route Details */}
      {selectedRoute && (
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Navigation className="h-5 w-5 mr-2" />
              Active Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{selectedRoute.from} → {selectedRoute.to}</div>
              <div className="text-sm text-muted-foreground">
                {selectedRoute.distance} • {selectedRoute.estimatedTime}
              </div>
              <div className="text-xs">
                Follow: {selectedRoute.waypoints.join(' → ')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SafeRouteMap;
