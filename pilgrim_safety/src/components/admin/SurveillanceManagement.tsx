
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SurveillanceCamera {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'offline' | 'maintenance';
  zone: string;
  createdAt: any;
}

const SurveillanceManagement = () => {
  const [cameras, setCameras] = useState<SurveillanceCamera[]>([]);
  const [newCamera, setNewCamera] = useState({ name: '', location: '', zone: '' });
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'surveillance_cameras'), (snapshot) => {
      const cameraData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SurveillanceCamera[];
      setCameras(cameraData);
    });

    return unsubscribe;
  }, []);

  const addCamera = async () => {
    if (!newCamera.name || !newCamera.location || !newCamera.zone) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, 'surveillance_cameras'), {
        ...newCamera,
        status: 'active',
        createdAt: serverTimestamp()
      });
      setNewCamera({ name: '', location: '', zone: '' });
      toast({ title: "Success", description: "Camera added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add camera", variant: "destructive" });
    }
  };

  const updateCameraStatus = async (id: string, status: 'active' | 'offline' | 'maintenance') => {
    try {
      await updateDoc(doc(db, 'surveillance_cameras', id), { status });
      toast({ title: "Success", description: "Camera status updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const deleteCamera = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'surveillance_cameras', id));
      toast({ title: "Success", description: "Camera deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete camera", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Surveillance Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add New Camera Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg">
          <input
            placeholder="Camera Name"
            value={newCamera.name}
            onChange={(e) => setNewCamera({...newCamera, name: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <input
            placeholder="Location"
            value={newCamera.location}
            onChange={(e) => setNewCamera({...newCamera, location: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <input
            placeholder="Zone"
            value={newCamera.zone}
            onChange={(e) => setNewCamera({...newCamera, zone: e.target.value})}
            className="px-3 py-2 border rounded bg-background text-foreground"
          />
          <Button onClick={addCamera} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Camera
          </Button>
        </div>

        {/* Cameras Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cameras.map((camera) => (
              <TableRow key={camera.id}>
                <TableCell className="font-medium">{camera.name}</TableCell>
                <TableCell>{camera.location}</TableCell>
                <TableCell>{camera.zone}</TableCell>
                <TableCell>
                  <Badge variant={camera.status === 'active' ? 'default' : camera.status === 'offline' ? 'destructive' : 'secondary'}>
                    {camera.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCameraStatus(camera.id, camera.status === 'active' ? 'maintenance' : 'active')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCamera(camera.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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

export default SurveillanceManagement;
