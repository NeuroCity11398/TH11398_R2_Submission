
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, AlertTriangle, Heart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HelpRequestForm = () => {
  const { userProfile } = useAuth();
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const helpTypes = [
    { id: 'medical', label: 'Medical Emergency', icon: Heart, color: 'destructive' },
    { id: 'security', label: 'Security Issue', icon: AlertTriangle, color: 'destructive' },
    { id: 'crowd', label: 'Crowd Control', icon: Users, color: 'secondary' },
    { id: 'general', label: 'General Help', icon: Phone, color: 'default' }
  ];

  const submitHelpRequest = async () => {
    if (!requestType || !description || !location) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'help_requests'), {
        userId: userProfile?.uid,
        userEmail: userProfile?.email,
        userName: userProfile?.displayName,
        type: requestType,
        description,
        location,
        status: 'pending',
        priority: requestType === 'medical' || requestType === 'security' ? 'high' : 'normal',
        createdAt: serverTimestamp()
      });

      toast({ 
        title: "Help Request Sent", 
        description: "Emergency services have been notified. Help is on the way!",
        variant: "default"
      });

      // Reset form
      setRequestType('');
      setDescription('');
      setLocation('');
    } catch (error) {
      toast({ title: "Error", description: "Failed to send help request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Phone className="h-5 w-5 mr-2" />
          Request Help
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Help Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-foreground">Type of Help Needed</label>
          <div className="grid grid-cols-2 gap-3">
            {helpTypes.map((type) => (
              <Button
                key={type.id}
                variant={requestType === type.id ? "default" : "outline"}
                className={`h-16 flex-col space-y-2 ${
                  requestType === type.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
                onClick={() => setRequestType(type.id)}
              >
                <type.icon className="h-5 w-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Your Current Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Describe your location (e.g., Near Main Gate, Temple Complex)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
          <textarea
            placeholder="Please describe the situation and what kind of help you need..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitHelpRequest}
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold"
        >
          {isSubmitting ? (
            "Sending Request..."
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 mr-2" />
              Send Help Request
            </>
          )}
        </Button>

        {/* Emergency Contact Reminder */}
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            For immediate life-threatening emergencies, call emergency services directly
          </p>
          <Badge className="mt-2 bg-destructive text-destructive-foreground">
            Emergency: 1-800-PILGRIM
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpRequestForm;
