
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UtensilsCrossed, MapPin, Clock, Users, Plus } from "lucide-react";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FoodPoint {
  id: string;
  donorName: string;
  donorContact: string;
  foodType: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  availablePortions: number;
  timeAvailable: string;
  status: 'available' | 'limited' | 'finished';
  createdAt: any;
  userId: string;
}

const FreeFoodBoard = () => {
  const [foodPoints, setFoodPoints] = useState<FoodPoint[]>([]);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [foodForm, setFoodForm] = useState({
    foodType: '',
    description: '',
    location: '',
    availablePortions: '',
    timeAvailable: '',
    donorContact: ''
  });

  const { userProfile } = useAuth();
  const { toast } = useToast();

  const foodTypes = [
    'Meals', 'Snacks', 'Fruits', 'Sweets', 'Beverages', 
    'Breakfast', 'Lunch', 'Dinner', 'Water', 'Special Diet'
  ];

  useEffect(() => {
    const q = query(collection(db, 'food_points'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const points = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FoodPoint)).filter(point => point.status !== 'finished');
      setFoodPoints(points);
    });

    return () => unsubscribe();
  }, []);

  const addFoodPoint = async () => {
    try {
      await addDoc(collection(db, 'food_points'), {
        ...foodForm,
        donorName: userProfile?.displayName,
        userId: userProfile?.uid,
        availablePortions: parseInt(foodForm.availablePortions),
        status: 'available',
        createdAt: serverTimestamp()
      });

      toast({
        title: "Food Point Added",
        description: "Your food donation has been registered. Thank you!"
      });

      setIsAddingFood(false);
      setFoodForm({
        foodType: '', description: '', location: '', 
        availablePortions: '', timeAvailable: '', donorContact: ''
      });
    } catch (error) {
      console.error('Food point error:', error);
      toast({
        title: "Failed to Add",
        description: "Could not register food point. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string, portions: number) => {
    if (status === 'finished') return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    if (portions < 10) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getTimeRemaining = (timeAvailable: string) => {
    const now = new Date();
    const endTime = new Date(timeAvailable);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Add Food Point */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UtensilsCrossed className="h-5 w-5 mr-2" />
            Free Food & Water Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAddingFood ? (
            <Button onClick={() => setIsAddingFood(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Donate Food/Water
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={foodForm.foodType}
                  onChange={(e) => setFoodForm({...foodForm, foodType: e.target.value})}
                >
                  <option value="">Select Food Type</option>
                  {foodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <Input
                  placeholder="Available portions (number)"
                  type="number"
                  value={foodForm.availablePortions}
                  onChange={(e) => setFoodForm({...foodForm, availablePortions: e.target.value})}
                />
              </div>

              <Textarea
                placeholder="Description (e.g., Fresh hot meals, vegetarian, contains nuts...)"
                value={foodForm.description}
                onChange={(e) => setFoodForm({...foodForm, description: e.target.value})}
              />

              <Input
                placeholder="Location (exact spot where people can find it)"
                value={foodForm.location}
                onChange={(e) => setFoodForm({...foodForm, location: e.target.value})}
              />

              <Input
                placeholder="Available until (time)"
                value={foodForm.timeAvailable}
                onChange={(e) => setFoodForm({...foodForm, timeAvailable: e.target.value})}
              />

              <Input
                placeholder="Your contact number"
                value={foodForm.donorContact}
                onChange={(e) => setFoodForm({...foodForm, donorContact: e.target.value})}
              />

              <div className="flex space-x-2">
                <Button onClick={addFoodPoint} className="flex-1">
                  Add Food Point
                </Button>
                <Button onClick={() => setIsAddingFood(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Points List */}
      <div className="space-y-3">
        {foodPoints.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No food points available right now
            </CardContent>
          </Card>
        ) : (
          foodPoints.map((point) => (
            <Card key={point.id} className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{point.foodType}</h3>
                      <Badge className={getStatusColor(point.status, point.availablePortions)}>
                        {point.availablePortions} portions left
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{point.description}</p>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {point.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeRemaining(point.timeAvailable)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Donated by: {point.donorName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm"
                      onClick={() => window.open(`tel:${point.donorContact}`, '_self')}
                    >
                      Call Donor
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const message = `Found your food donation at ${point.location}. Thank you!`;
                        window.open(`https://wa.me/${point.donorContact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FreeFoodBoard;
