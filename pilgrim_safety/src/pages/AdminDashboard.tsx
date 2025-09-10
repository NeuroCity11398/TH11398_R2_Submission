import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, Users, Camera, AlertTriangle, MapPin, Activity, 
  Phone, Clock, ChevronLeft, Settings, Bell, Eye,
  TrendingUp, TrendingDown, Zap, Heart, LogOut, Database,
  Brain, Search, UtensilsCrossed
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SurveillanceManagement from "@/components/admin/SurveillanceManagement";
import HealthUnitsManagement from "@/components/admin/HealthUnitsManagement";
import EmergencyAlertsManagement from "@/components/admin/EmergencyAlertsManagement";
import AIAnalytics from "@/components/admin/AIAnalytics";
import LocationManagement from "@/components/admin/LocationManagement";

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

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  location: { lat: number; lng: number };
  locationString: string;
  timestamp: any;
  status: string;
  type: string;
  priority: string;
}

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: string;
  location: string;
  contactInfo: string;
}

interface LostItem {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  reportedBy: string;
  timestamp: any;
}

interface FoodPoint {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  contactInfo: string;
  timestamp: any;
}

const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foodPoints, setFoodPoints] = useState<FoodPoint[]>([]);
  const [realTimeData, setRealTimeData] = useState({
    totalUsers: 0,
    activeCameras: 152,
    totalCameras: 156,
    emergencyUnits: 12,
    responseTime: 2.3,
    helpRequestsCount: 0,
    sosAlertsCount: 0,
    activeVolunteers: 0,
    lostItemsCount: 0,
    activeFoodPoints: 0
  });

  const [pilgrimStats] = useState([
    { location: "Main Entrance", count: 342, capacity: 500, status: "Normal" },
    { location: "Temple Complex", count: 456, capacity: 400, status: "High" },
    { location: "Dining Hall", count: 234, capacity: 600, status: "Low" },
    { location: "Rest Areas", count: 123, capacity: 300, status: "Normal" }
  ]);

  useEffect(() => {
    // Real-time emergency alerts listener
    const unsubscribeAlerts = onSnapshot(collection(db, 'emergency_alerts'), (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmergencyAlert)).filter(alert => !alert.resolved);
      setActiveAlerts(alerts);
    });

    // Real-time help requests listener
    const unsubscribeHelp = onSnapshot(collection(db, 'help_requests'), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HelpRequest));
      setHelpRequests(requests);
      setRealTimeData(prev => ({
        ...prev,
        helpRequestsCount: requests.filter(req => req.status === 'pending').length
      }));
    });

    // Real-time users count
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setRealTimeData(prev => ({
        ...prev,
        totalUsers: snapshot.size
      }));
    });

    // New real-time listeners for additional features
    const unsubscribeSOS = onSnapshot(collection(db, 'sos_alerts'), (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as SOSAlert));
      setSosAlerts(alerts.filter(alert => alert.status === 'active'));
      setRealTimeData(prev => ({ ...prev, sosAlertsCount: alerts.filter(alert => alert.status === 'active').length }));
    });

    const unsubscribeVolunteers = onSnapshot(collection(db, 'volunteers'), (snapshot) => {
      const vols = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Volunteer));
      setVolunteers(vols);
      setRealTimeData(prev => ({ ...prev, activeVolunteers: vols.filter(v => v.availability === 'available').length }));
    });

    const unsubscribeLostFound = onSnapshot(collection(db, 'lost_found'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as LostItem));
      setLostItems(items);
      setRealTimeData(prev => ({ ...prev, lostItemsCount: items.filter(item => item.status === 'lost').length }));
    });

    const unsubscribeFood = onSnapshot(collection(db, 'food_points'), (snapshot) => {
      const points = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as FoodPoint));
      setFoodPoints(points);
      setRealTimeData(prev => ({ ...prev, activeFoodPoints: points.filter(p => p.status === 'available').length }));
    });

    return () => {
      unsubscribeAlerts();
      unsubscribeHelp();
      unsubscribeUsers();
      unsubscribeSOS();
      unsubscribeVolunteers();
      unsubscribeLostFound();
      unsubscribeFood();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-lg shadow-xl border-b border-border/50">
        <div className="px-6 py-4">
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
                AI-Powered Control Center
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {userProfile?.displayName}
              </span>
              <Button variant="outline" size="sm" className="border-primary/20">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({activeAlerts.length + realTimeData.sosAlertsCount})
              </Button>
              <Button variant="outline" size="sm" className="border-primary/20">
                <Phone className="h-4 w-4 mr-2" />
                Help ({realTimeData.helpRequestsCount})
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Emergency Alerts */}
        {(activeAlerts.length > 0 || sosAlerts.length > 0) && (
          <div className="mb-6 space-y-3">
            {sosAlerts.slice(0, 2).map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-destructive bg-destructive/10 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>🆘 SOS ALERT - {alert.userName}</span>
                  <Badge variant="destructive">CRITICAL</Badge>
                </AlertTitle>
                <AlertDescription>
                  Location: {alert.locationString} • Contact: {alert.userPhone} • Time: {new Date(alert.timestamp?.toDate()).toLocaleTimeString()}
                </AlertDescription>
              </Alert>
            ))}
            
            {activeAlerts.slice(0, 2).map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.severity === 'Critical' ? 'border-destructive bg-destructive/10' :
                alert.severity === 'High' ? 'border-orange-500 bg-orange-500/10' :
                'border-yellow-500 bg-yellow-500/10'
              } backdrop-blur-sm`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.type} at {alert.location}</span>
                  <Badge variant={alert.severity === 'Critical' ? 'destructive' : 'default'}>
                    {alert.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {alert.description} • Response team dispatched
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-card/60 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="ai-analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
            <TabsTrigger value="health">Health Units</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="help-requests">Help</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="crowd">Crowd Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">🆘 SOS Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{realTimeData.sosAlertsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Critical emergencies
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{realTimeData.helpRequestsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending assistance
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{realTimeData.activeVolunteers}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
                    Available to help
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lost & Found</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">{realTimeData.lostItemsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Active cases
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Food Points</CardTitle>
                  <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{realTimeData.activeFoodPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    Active donations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{realTimeData.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-400" />
                    Registered pilgrims
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{activeAlerts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Emergency situations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{realTimeData.responseTime} min</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingDown className="inline h-3 w-3 mr-1 text-green-400" />
                    Improved by 15%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Location Status */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Location Status & Crowd Density</CardTitle>
                <CardDescription>Real-time monitoring of pilgrim distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pilgrimStats.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-foreground">{location.location}</div>
                          <div className="text-sm text-muted-foreground">{location.count}/{location.capacity} capacity</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <Progress value={(location.count / location.capacity) * 100} className="bg-muted/30" />
                        </div>
                        <Badge variant={
                          location.status === 'High' ? 'destructive' :
                          location.status === 'Normal' ? 'default' : 'secondary'
                        }>
                          {location.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <LocationManagement />
          </TabsContent>

          <TabsContent value="ai-analytics" className="space-y-6">
            <AIAnalytics />
          </TabsContent>

          <TabsContent value="surveillance" className="space-y-6">
            <SurveillanceManagement />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <HealthUnitsManagement />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <EmergencyAlertsManagement />
          </TabsContent>

          <TabsContent value="help-requests" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Help Requests ({helpRequests.length})
                </CardTitle>
                <CardDescription>Real-time user assistance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {helpRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No help requests at this time</p>
                  ) : (
                    helpRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            request.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                          }`} />
                          <div>
                            <div className="font-medium text-foreground">{request.type.toUpperCase()} - {request.userName}</div>
                            <div className="text-sm text-muted-foreground">{request.location}</div>
                            <div className="text-sm text-muted-foreground">{request.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={request.status === 'pending' ? 'destructive' : 'default'}>
                            {request.status}
                          </Badge>
                          <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                            {request.priority} priority
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* Community Management Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Volunteer Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Volunteers</span>
                      <span className="font-semibold">{volunteers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Now</span>
                      <span className="font-semibold text-green-400">{realTimeData.activeVolunteers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Rate</span>
                      <span className="font-semibold">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Lost & Found Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Active Cases</span>
                      <span className="font-semibold">{realTimeData.lostItemsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolved Today</span>
                      <span className="font-semibold text-green-400">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution Rate</span>
                      <span className="font-semibold">87%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crowd" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Crowd Control</CardTitle>
                <CardDescription>Real-time barricade management and flow optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">78%</div>
                    <div className="text-sm text-gray-600">Overall Crowd Density</div>
                    <Progress value={78} className="mt-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">24</div>
                    <div className="text-sm text-gray-600">Active Barricades</div>
                    <Badge className="mt-2 bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">3.2 km/h</div>
                    <div className="text-sm text-gray-600">Avg Flow Speed</div>
                    <Badge className="mt-2 bg-orange-100 text-orange-800">Monitored</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
