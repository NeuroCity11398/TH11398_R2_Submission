
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MapPin, Plus, Edit, Trash2, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LocationData {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  status: 'safe' | 'crowded' | 'critical';
  lastUpdated: any;
  adminId: string;
  adminName: string;
  aiAnalysis?: {
    riskLevel: string;
    prediction: string;
    recommendation: string;
  };
}

const LocationManagement = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [newLocation, setNewLocation] = useState({
    name: '',
    capacity: '',
    currentCount: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'location_status'), (snapshot) => {
      const locationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LocationData[];
      setLocations(locationData);
    }, (error) => {
      console.error("Error fetching locations:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load location data", 
        variant: "destructive" 
      });
    });

    return unsubscribe;
  }, [toast]);

  const generateAIAnalysis = (currentCount: number, capacity: number) => {
    const densityPercentage = (currentCount / capacity) * 100;
    
    let riskLevel = 'Low';
    let prediction = 'Stable crowd levels expected';
    let recommendation = 'Continue normal operations';

    if (densityPercentage > 80) {
      riskLevel = 'Critical';
      prediction = 'High risk of overcrowding';
      recommendation = 'Implement crowd control measures immediately';
    } else if (densityPercentage > 60) {
      riskLevel = 'High';
      prediction = 'Increasing crowd density detected';
      recommendation = 'Deploy additional staff and monitor closely';
    } else if (densityPercentage > 40) {
      riskLevel = 'Medium';
      prediction = 'Moderate crowd levels';
      recommendation = 'Monitor for potential increases';
    }

    return { riskLevel, prediction, recommendation };
  };

  const getLocationStatus = (currentCount: number, capacity: number): 'safe' | 'crowded' | 'critical' => {
    const percentage = (currentCount / capacity) * 100;
    if (percentage > 80) return 'critical';
    if (percentage > 60) return 'crowded';
    return 'safe';
  };

  const addLocation = async () => {
    if (!newLocation.name.trim() || !newLocation.capacity || !newLocation.currentCount) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill all fields with valid data", 
        variant: "destructive" 
      });
      return;
    }

    const capacity = parseInt(newLocation.capacity);
    const currentCount = parseInt(newLocation.currentCount);

    if (capacity <= 0 || currentCount < 0 || currentCount > capacity) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter valid capacity and current count", 
        variant: "destructive" 
      });
      return;
    }

    if (!userProfile) {
      toast({ 
        title: "Authentication Error", 
        description: "You must be logged in", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const status = getLocationStatus(currentCount, capacity);
      const aiAnalysis = generateAIAnalysis(currentCount, capacity);

      await addDoc(collection(db, 'location_status'), {
        name: newLocation.name.trim(),
        capacity,
        currentCount,
        status,
        adminId: userProfile.uid,
        adminName: userProfile.displayName || userProfile.email,
        lastUpdated: serverTimestamp(),
        aiAnalysis
      });
      
      setNewLocation({ name: '', capacity: '', currentCount: '' });
      toast({ 
        title: "Success", 
        description: "Location added successfully with AI analysis" 
      });
    } catch (error: any) {
      console.error("Error adding location:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add location", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocationCount = async (id: string, newCount: number, capacity: number) => {
    if (newCount < 0 || newCount > capacity) {
      toast({ 
        title: "Invalid Count", 
        description: "Count must be between 0 and capacity", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const status = getLocationStatus(newCount, capacity);
      const aiAnalysis = generateAIAnalysis(newCount, capacity);

      await updateDoc(doc(db, 'location_status', id), { 
        currentCount: newCount,
        status,
        aiAnalysis,
        lastUpdated: serverTimestamp(),
        updatedBy: userProfile?.displayName || userProfile?.email
      });
      
      toast({ 
        title: "Success", 
        description: "Location updated with new AI analysis" 
      });
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update location", 
        variant: "destructive" 
      });
    }
  };

  const deleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    
    try {
      await deleteDoc(doc(db, 'location_status', id));
      toast({ 
        title: "Success", 
        description: "Location deleted successfully" 
      });
    } catch (error: any) {
      console.error("Error deleting location:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete location", 
        variant: "destructive" 
      });
    }
  };

  const getDensityPercentage = (current: number, capacity: number) => {
    return Math.min((current / capacity) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Status & Crowd Density ({locations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add New Location Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-border/50 rounded-lg bg-card/30">
            <Input
              placeholder="Location Name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            />
            <Input
              placeholder="Max Capacity"
              type="number"
              min="1"
              value={newLocation.capacity}
              onChange={(e) => setNewLocation({...newLocation, capacity: e.target.value})}
            />
            <Input
              placeholder="Current Count"
              type="number"
              min="0"
              value={newLocation.currentCount}
              onChange={(e) => setNewLocation({...newLocation, currentCount: e.target.value})}
            />
            <Button 
              onClick={addLocation} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Adding..." : "Add Location"}
            </Button>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {locations.map((location) => (
              <Card key={location.id} className="bg-card/30 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{location.name}</h3>
                    <Badge variant={
                      location.status === 'safe' ? 'default' : 
                      location.status === 'crowded' ? 'secondary' : 
                      'destructive'
                    }>
                      {location.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="font-medium">{location.currentCount}/{location.capacity}</span>
                  </div>
                  
                  <Progress 
                    value={getDensityPercentage(location.currentCount, location.capacity)} 
                    className="w-full"
                  />
                  
                  {location.aiAnalysis && (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span className="font-medium text-sm">AI Analysis</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><strong>Risk:</strong> {location.aiAnalysis.riskLevel}</div>
                        <div><strong>Prediction:</strong> {location.aiAnalysis.prediction}</div>
                        <div><strong>Recommendation:</strong> {location.aiAnalysis.recommendation}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Input
                      type="number"
                      min="0"
                      max={location.capacity}
                      defaultValue={location.currentCount}
                      onBlur={(e) => {
                        const newCount = parseInt(e.target.value);
                        if (newCount !== location.currentCount) {
                          updateLocationCount(location.id, newCount, location.capacity);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    By: {location.adminName}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManagement;
