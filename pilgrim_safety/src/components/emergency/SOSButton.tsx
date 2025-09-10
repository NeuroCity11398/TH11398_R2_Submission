
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MapPin, Clock } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SOSButton = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const sendSOSAlert = async () => {
    try {
      setIsActivated(true);
      
      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Send SOS to Firebase
      await addDoc(collection(db, 'sos_alerts'), {
        userId: userProfile?.uid,
        userName: userProfile?.displayName,
        userPhone: userProfile?.phoneNumber || 'Not provided',
        location: currentLocation,
        locationString: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
        timestamp: serverTimestamp(),
        status: 'active',
        type: 'emergency',
        priority: 'critical'
      });

      // Auto-call emergency services (simulated)
      setTimeout(() => {
        window.open('tel:+911234567890', '_self');
      }, 2000);

      toast({
        title: "SOS Alert Sent",
        description: "Emergency services have been notified of your location. Stay calm.",
        variant: "destructive"
      });

    } catch (error) {
      console.error('SOS Error:', error);
      toast({
        title: "SOS Failed",
        description: "Could not send alert. Try calling emergency services directly.",
        variant: "destructive"
      });
    }
  };

  const cancelSOS = async () => {
    setIsActivated(false);
    setLocation(null);
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  if (isActivated) {
    return (
      <div className="space-y-4">
        <Alert className="border-destructive bg-destructive/10">
          <Phone className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            <div className="font-semibold">SOS ACTIVATED</div>
            <div className="text-sm mt-2">
              Emergency services notified. Help is on the way.
            </div>
            {location && (
              <div className="flex items-center mt-2 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button 
            onClick={cancelSOS}
            variant="outline" 
            className="flex-1"
          >
            Cancel SOS
          </Button>
          <Button 
            onClick={() => window.open('tel:+911234567890', '_self')}
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={sendSOSAlert}
      className="w-full h-20 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg font-bold"
    >
      <div className="text-center">
        <Phone className="h-8 w-8 mx-auto mb-2" />
        <div>SOS EMERGENCY</div>
        <div className="text-sm font-normal">Tap to send alert + location</div>
      </div>
    </Button>
  );
};

export default SOSButton;
