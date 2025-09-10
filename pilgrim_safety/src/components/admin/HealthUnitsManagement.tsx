
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Heart, Plus, Edit, Trash2, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface HealthUnit {
  id: string;
  name: string;
  location: string;
  staff: number;
  status: 'active' | 'busy' | 'offline';
  equipment: string;
  createdAt: any;
  adminId?: string;
  adminName?: string;
}

const HealthUnitsManagement = () => {
  const [units, setUnits] = useState<HealthUnit[]>([]);
  const [newUnit, setNewUnit] = useState({ 
    name: '', 
    location: '', 
    staff: '', 
    equipment: '' 
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'health_units'), (snapshot) => {
      const unitData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthUnit[];
      setUnits(unitData);
    }, (error) => {
      console.error("Error fetching health units:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load health units", 
        variant: "destructive" 
      });
    });

    return unsubscribe;
  }, [toast]);

  const addUnit = async () => {
    if (!newUnit.name.trim() || !newUnit.location.trim() || !newUnit.equipment.trim() || !newUnit.staff || parseInt(newUnit.staff) <= 0) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill all fields with valid data", 
        variant: "destructive" 
      });
      return;
    }

    if (!userProfile) {
      toast({ 
        title: "Authentication Error", 
        description: "You must be logged in to add health units", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'health_units'), {
        name: newUnit.name.trim(),
        location: newUnit.location.trim(),
        staff: parseInt(newUnit.staff),
        equipment: newUnit.equipment.trim(),
        status: 'active',
        adminId: userProfile.uid,
        adminName: userProfile.displayName || userProfile.email,
        createdAt: serverTimestamp()
      });
      
      setNewUnit({ name: '', location: '', staff: '', equipment: '' });
      toast({ 
        title: "Success", 
        description: "Health unit added successfully" 
      });
    } catch (error: any) {
      console.error("Error adding health unit:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add health unit", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUnitStatus = async (id: string, status: 'active' | 'busy' | 'offline') => {
    try {
      await updateDoc(doc(db, 'health_units', id), { 
        status,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile?.displayName || userProfile?.email
      });
      toast({ 
        title: "Success", 
        description: "Unit status updated successfully" 
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update status", 
        variant: "destructive" 
      });
    }
  };

  const deleteUnit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this health unit?")) return;
    
    try {
      await deleteDoc(doc(db, 'health_units', id));
      toast({ 
        title: "Success", 
        description: "Health unit deleted successfully" 
      });
    } catch (error: any) {
      console.error("Error deleting health unit:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete unit", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Health Units Management ({units.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add New Unit Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border border-border/50 rounded-lg bg-card/30">
          <Input
            placeholder="Unit Name (e.g., Emergency Ward)"
            value={newUnit.name}
            onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
          />
          <Input
            placeholder="Location (e.g., Main Building)"
            value={newUnit.location}
            onChange={(e) => setNewUnit({...newUnit, location: e.target.value})}
          />
          <Input
            placeholder="Staff Count"
            type="number"
            min="1"
            value={newUnit.staff}
            onChange={(e) => setNewUnit({...newUnit, staff: e.target.value})}
          />
          <Input
            placeholder="Equipment (e.g., X-Ray, ECG)"
            value={newUnit.equipment}
            onChange={(e) => setNewUnit({...newUnit, equipment: e.target.value})}
          />
          <Button 
            onClick={addUnit} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Unit"}
          </Button>
        </div>

        {/* Units Table */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No health units found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {unit.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        {unit.staff}
                      </div>
                    </TableCell>
                    <TableCell>{unit.equipment}</TableCell>
                    <TableCell>
                      <Badge variant={
                        unit.status === 'active' ? 'default' : 
                        unit.status === 'busy' ? 'secondary' : 
                        'destructive'
                      }>
                        {unit.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {unit.adminName || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUnitStatus(
                            unit.id, 
                            unit.status === 'active' ? 'busy' : 
                            unit.status === 'busy' ? 'offline' : 'active'
                          )}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUnit(unit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthUnitsManagement;
