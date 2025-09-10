
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Package, Phone, MapPin, Clock } from "lucide-react";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LostItem {
  id: string;
  type: 'person' | 'item';
  reporterName: string;
  reporterContact: string;
  title: string;
  description: string;
  lastSeenLocation: string;
  category?: string;
  photo?: string;
  status: 'lost' | 'found' | 'resolved';
  createdAt: any;
  userId: string;
}

const LostAndFound = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportForm, setReportForm] = useState({
    type: 'item' as 'person' | 'item',
    title: '',
    description: '',
    lastSeenLocation: '',
    category: '',
    reporterContact: ''
  });

  const { userProfile } = useAuth();
  const { toast } = useToast();

  const itemCategories = [
    'Electronics', 'Bags', 'Jewelry', 'Clothing', 'Documents', 
    'Religious Items', 'Keys', 'Money/Wallet', 'Mobile Phone', 'Other'
  ];

  useEffect(() => {
    const q = query(collection(db, 'lost_found'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LostItem));
      setLostItems(items);
    });

    return () => unsubscribe();
  }, []);

  const submitReport = async () => {
    try {
      await addDoc(collection(db, 'lost_found'), {
        ...reportForm,
        reporterName: userProfile?.displayName,
        userId: userProfile?.uid,
        status: 'lost',
        createdAt: serverTimestamp()
      });

      toast({
        title: "Report Submitted",
        description: `${reportForm.type === 'person' ? 'Missing person' : 'Lost item'} report has been filed.`
      });

      setIsReporting(false);
      setReportForm({
        type: 'item',
        title: '',
        description: '',
        lastSeenLocation: '',
        category: '',
        reporterContact: ''
      });
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredItems = lostItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lostPeople = filteredItems.filter(item => item.type === 'person');
  const lostObjects = filteredItems.filter(item => item.type === 'item');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'found': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'resolved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report New Loss */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Lost & Found Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isReporting ? (
            <Button onClick={() => setIsReporting(true)} className="w-full">
              Report Missing Person/Item
            </Button>
          ) : (
            <div className="space-y-4">
              <Tabs value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value as 'person' | 'item'})}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="person">Missing Person</TabsTrigger>
                  <TabsTrigger value="item">Lost Item</TabsTrigger>
                </TabsList>
              </Tabs>

              <Input
                placeholder={reportForm.type === 'person' ? "Person's Name" : "Item Name"}
                value={reportForm.title}
                onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
              />

              <Textarea
                placeholder={reportForm.type === 'person' ? "Physical description, age, clothing..." : "Detailed description of the item..."}
                value={reportForm.description}
                onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
              />

              <Input
                placeholder="Last seen location"
                value={reportForm.lastSeenLocation}
                onChange={(e) => setReportForm({...reportForm, lastSeenLocation: e.target.value})}
              />

              {reportForm.type === 'item' && (
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={reportForm.category}
                  onChange={(e) => setReportForm({...reportForm, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {itemCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}

              <Input
                placeholder="Your contact number"
                value={reportForm.reporterContact}
                onChange={(e) => setReportForm({...reportForm, reporterContact: e.target.value})}
              />

              <div className="flex space-x-2">
                <Button onClick={submitReport} className="flex-1">
                  Submit Report
                </Button>
                <Button onClick={() => setIsReporting(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <Input
            placeholder="Search lost items or people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Lost Items/People */}
      <Tabs defaultValue="people" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="people">Missing People ({lostPeople.length})</TabsTrigger>
          <TabsTrigger value="items">Lost Items ({lostObjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-3">
          {lostPeople.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                No missing person reports
              </CardContent>
            </Card>
          ) : (
            lostPeople.map((person) => (
              <Card key={person.id} className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{person.title}</h3>
                        <Badge className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{person.description}</p>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Last seen: {person.lastSeenLocation}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Reported by: {person.reporterName}
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => window.open(`tel:${person.reporterContact}`, '_self')}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-3">
          {lostObjects.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                No lost item reports
              </CardContent>
            </Card>
          ) : (
            lostObjects.map((item) => (
              <Card key={item.id} className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{item.description}</p>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Last seen: {item.lastSeenLocation}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Reported by: {item.reporterName}
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => window.open(`tel:${item.reporterContact}`, '_self')}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LostAndFound;
