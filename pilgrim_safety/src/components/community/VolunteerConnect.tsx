
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users, Search, Phone, MapPin } from "lucide-react";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: 'available' | 'busy' | 'offline';
  contact: string;
  bloodGroup?: string;
  languages: string[];
  rating: number;
  createdAt: any;
}

const VolunteerConnect = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchSkill, setSearchSkill] = useState('');
  const [volunteerForm, setVolunteerForm] = useState({
    skills: '',
    location: '',
    contact: '',
    bloodGroup: '',
    languages: '',
    availability: 'available'
  });

  const { userProfile } = useAuth();
  const { toast } = useToast();

  const skillCategories = [
    'Medical', 'Translation', 'Navigation', 'Food Distribution', 
    'Blood Donation', 'Emergency Response', 'Crowd Management',
    'Technical Support', 'Lost & Found', 'Accessibility Help'
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'volunteers'), (snapshot) => {
      const volunteerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Volunteer));
      setVolunteers(volunteerData);
    });

    return () => unsubscribe();
  }, []);

  const registerAsVolunteer = async () => {
    try {
      await addDoc(collection(db, 'volunteers'), {
        name: userProfile?.displayName,
        userId: userProfile?.uid,
        skills: volunteerForm.skills.split(',').map(s => s.trim()),
        location: volunteerForm.location,
        contact: volunteerForm.contact,
        bloodGroup: volunteerForm.bloodGroup,
        languages: volunteerForm.languages.split(',').map(l => l.trim()),
        availability: volunteerForm.availability,
        rating: 5.0,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Volunteer Registration Successful",
        description: "You're now part of the volunteer network!"
      });

      setIsRegistering(false);
      setVolunteerForm({
        skills: '', location: '', contact: '', bloodGroup: '', languages: '', availability: 'available'
      });
    } catch (error) {
      console.error('Volunteer registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Could not register as volunteer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredVolunteers = volunteers.filter(vol => 
    searchSkill === '' || vol.skills.some(skill => 
      skill.toLowerCase().includes(searchSkill.toLowerCase())
    )
  );

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Register as Volunteer */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Volunteer Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isRegistering ? (
            <Button onClick={() => setIsRegistering(true)} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Join as Volunteer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Skills (comma separated)"
                  value={volunteerForm.skills}
                  onChange={(e) => setVolunteerForm({...volunteerForm, skills: e.target.value})}
                />
                <Input
                  placeholder="Current Location"
                  value={volunteerForm.location}
                  onChange={(e) => setVolunteerForm({...volunteerForm, location: e.target.value})}
                />
                <Input
                  placeholder="Contact Number"
                  value={volunteerForm.contact}
                  onChange={(e) => setVolunteerForm({...volunteerForm, contact: e.target.value})}
                />
                <Input
                  placeholder="Blood Group (optional)"
                  value={volunteerForm.bloodGroup}
                  onChange={(e) => setVolunteerForm({...volunteerForm, bloodGroup: e.target.value})}
                />
              </div>
              <Input
                placeholder="Languages you speak (comma separated)"
                value={volunteerForm.languages}
                onChange={(e) => setVolunteerForm({...volunteerForm, languages: e.target.value})}
              />
              <div className="flex space-x-2">
                <Button onClick={registerAsVolunteer} className="flex-1">
                  Register
                </Button>
                <Button onClick={() => setIsRegistering(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Volunteers */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Find Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by skill..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillCategories.map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchSkill(skill)}
                  className="text-xs"
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteer List */}
      <div className="space-y-3">
        {filteredVolunteers.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No volunteers found for this skill
            </CardContent>
          </Card>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <Card key={volunteer.id} className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{volunteer.name}</h3>
                      <Badge className={getAvailabilityColor(volunteer.availability)}>
                        {volunteer.availability}
                      </Badge>
                      {volunteer.bloodGroup && (
                        <Badge variant="outline">🩸 {volunteer.bloodGroup}</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {volunteer.location}
                      </div>
                      <div>Skills: {volunteer.skills.join(', ')}</div>
                      <div>Languages: {volunteer.languages.join(', ')}</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`tel:${volunteer.contact}`, '_self')}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <div className="text-xs text-center">
                      ⭐ {volunteer.rating.toFixed(1)}
                    </div>
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

export default VolunteerConnect;
