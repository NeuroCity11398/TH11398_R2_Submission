
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyAlert {
  id: string;
  type: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  resolved: boolean;
  createdAt: any;
}

const EmergencyAlertsManagement = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [newAlert, setNewAlert] = useState({ type: '', location: '', severity: 'Medium' as const, description: '' });
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'emergency_alerts'), (snapshot) => {
      const alertData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyAlert[];
      setAlerts(alertData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return unsubscribe;
  }, []);

  const addAlert = async () => {
    if (!newAlert.type || !newAlert.location || !newAlert.description) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, 'emergency_alerts'), {
        ...newAlert,
        resolved: false,
        createdAt: serverTimestamp()
      });
      setNewAlert({ type: '', location: '', severity: 'Medium', description: '' });
      toast({ title: "Success", description: "Emergency alert created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create alert", variant: "destructive" });
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await updateDoc(doc(db, 'emergency_alerts', id), { resolved: true });
      toast({ title: "Success", description: "Alert resolved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to resolve alert", variant: "destructive" });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'emergency_alerts', id));
      toast({ title: "Success", description: "Alert deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete alert", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Emergency Alerts Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add New Alert Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg">
          <input
            placeholder="Alert Type"
            value={newAlert.type}
            onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <input
            placeholder="Location"
            value={newAlert.location}
            onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <select
            value={newAlert.severity}
            onChange={(e) => setNewAlert({...newAlert, severity: e.target.value as any})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <input
            placeholder="Description"
            value={newAlert.description}
            onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <Button onClick={addAlert} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>

        {/* Alerts Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.type}</TableCell>
                <TableCell>{alert.location}</TableCell>
                <TableCell>
                  <Badge variant={
                    alert.severity === 'Critical' ? 'destructive' :
                    alert.severity === 'High' ? 'destructive' :
                    alert.severity === 'Medium' ? 'secondary' : 'default'
                  }>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>{alert.description}</TableCell>
                <TableCell>
                  <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlertsManagement;
