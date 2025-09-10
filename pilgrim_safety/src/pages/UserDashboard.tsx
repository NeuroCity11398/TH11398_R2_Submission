import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MapPin, Phone, Heart, Shield, Navigation,
  Clock, AlertTriangle, ChevronLeft, Bell, Info,
  Camera, Wifi, Battery, Signal, LogOut, UtensilsCrossed,
  Search, Route, User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import HelpRequestForm from "@/components/user/HelpRequestForm";
import SOSButton from "@/components/emergency/SOSButton";
import SafeRouteMap from "@/components/navigation/SafeRouteMap";
import VolunteerConnect from "@/components/community/VolunteerConnect";
import LostAndFound from "@/components/community/LostAndFound";
import FreeFoodBoard from "@/components/community/FreeFoodBoard";

interface EmergencyAlert {
  id: string;
  type: string;
  location: string;
  severity: string;
  description: string;
  resolved: boolean;
  createdAt: any;
}

interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  type: string;
  location: string;
  description: string;
  status: string;
  priority: string;
  createdAt: any;
}

interface HealthUnit {
  id: string;
  name: string;
  location: string;
  staff: number;
  status: string;
  equipment: string;
  createdAt: any;
}

const UserDashboard = () => {
  const { userProfile, logout } = useAuth();
  const [safetyAlerts, setSafetyAlerts] = useState<EmergencyAlert[]>([]);
  const [myHelpRequests, setMyHelpRequests] = useState<HelpRequest[]>([]);
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);

  const [emergencyContacts] = useState([
    { name: "Emergency Hotline", number: "1-800-PILGRIM", type: "Emergency" },
    { name: "Medical Assistance", number: "1-800-MEDICAL", type: "Health" },
    { name: "Lost & Found", number: "1-800-LOST", type: "Support" },
    { name: "Travel Assistance", number: "1-800-TRAVEL", type: "Travel" }
  ]);

  const [userLocation] = useState({
    current: "Main Entrance Plaza",
    zone: "Zone A",
    coordinates: "25.3176° N, 82.9739° E"
  });

  useEffect(() => {
    // Listen to emergency alerts
    const unsubscribeAlerts = onSnapshot(collection(db, 'emergency_alerts'), (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmergencyAlert)).filter(alert => !alert.resolved);
      setSafetyAlerts(alerts);
    });

    // Listen to user's help requests
    if (userProfile?.uid) {
      const unsubscribeHelp = onSnapshot(
        query(collection(db, 'help_requests'), where('userId', '==', userProfile.uid)),
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as HelpRequest));
          setMyHelpRequests(requests);
        }
      );

      return () => {
        unsubscribeAlerts();
        unsubscribeHelp();
      };
    }

    // Listen to health units
    const unsubscribeHealth = onSnapshot(collection(db, 'health_units'), (snapshot) => {
      const units = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HealthUnit)).filter(unit => unit.status === 'active');
      setHealthUnits(units.slice(0, 4)); // Show nearest 4 units
    });

    return () => {
      unsubscribeAlerts();
      unsubscribeHealth();
    };
  }, [userProfile?.uid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-lg shadow-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <Button variant="ghost" size="sm" className="mr-4 hover:bg-primary/10">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Pilgrim Safety Portal
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {userProfile?.displayName}
              </span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* SOS Emergency Button */}
        <SOSButton />

        {/* Safety Alerts */}
        {safetyAlerts.length > 0 && (
          <div className="space-y-3">
            {safetyAlerts.slice(0, 2).map((alert) => (
              <Alert key={alert.id} className={`${
                alert.severity === 'Critical' ? 'border-destructive/50 bg-destructive/10' :
                alert.severity === 'High' ? 'border-orange-500/50 bg-orange-500/10' :
                'border-yellow-500/50 bg-yellow-500/10'
              } backdrop-blur-sm`}>
                <Bell className="h-4 w-4" />
                <AlertTitle>{alert.type}</AlertTitle>
                <AlertDescription>{alert.description} at {alert.location}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Features Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card/60 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="lost-found">Lost & Found</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* My Help Requests Status */}
            {myHelpRequests.length > 0 && (
              <Card className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-400">
                    <Phone className="h-5 w-5 mr-2" />
                    Your Help Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {myHelpRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/30">
                        <div>
                          <div className="font-medium">{request.type.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">{request.location}</div>
                        </div>
                        <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Request Form */}
            <HelpRequestForm />

            {/* Current Location & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Your Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-lg font-semibold text-primary">{userLocation.current}</div>
                  <div className="text-sm text-muted-foreground">
                    <div>Zone: {userLocation.zone}</div>
                    <div>Coordinates: {userLocation.coordinates}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Area Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crowd Density</span>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                  <Progress value={65} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    Current: 342 people • Capacity: 500
                  </div>
                  <div className="text-xs text-green-400">
                    ✓ Safe to proceed • Alternative routes available
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nearby Health Units */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Nearby Health Units
                </CardTitle>
                <CardDescription>Medical assistance within walking distance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthUnits.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No health units data available</p>
                  ) : (
                    healthUnits.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <div>
                            <div className="font-medium">{unit.name}</div>
                            <div className="text-sm text-muted-foreground">{unit.location} • Staff: {unit.staff}</div>
                          </div>
                        </div>
                        <Badge variant="default">
                          {unit.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {emergencyContacts.map((contact, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-16 justify-start hover:bg-accent"
                      onClick={() => window.open(`tel:${contact.number}`, '_self')}
                    >
                      <div className="text-left">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.number}</div>
                        <div className="text-xs text-primary">{contact.type}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <SafeRouteMap />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <VolunteerConnect />
          </TabsContent>

          <TabsContent value="lost-found" className="space-y-6">
            <LostAndFound />
          </TabsContent>

          <TabsContent value="food" className="space-y-6">
            <FreeFoodBoard />
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-6">
            <VolunteerConnect />
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Safety System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border border-border/50 rounded-lg bg-green-500/10">
                <Camera className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm font-medium">Surveillance</div>
                <div className="text-xs text-green-400">Active</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded-lg bg-green-500/10">
                <Heart className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm font-medium">Medical</div>
                <div className="text-xs text-green-400">Ready</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded-lg bg-green-500/10">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm font-medium">Emergency</div>
                <div className="text-xs text-green-400">Standby</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded-lg bg-green-500/10">
                <Wifi className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm font-medium">Network</div>
                <div className="text-xs text-green-400">Strong</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
