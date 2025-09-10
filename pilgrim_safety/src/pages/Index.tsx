
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, Camera, MapPin, Phone, Activity, Clock, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { userProfile, logout } = useAuth();

  const features = [
    {
      icon: AlertTriangle,
      title: "Disaster & Emergency Preparedness",
      description: "Real-time disaster simulation, fire escape routes, and emergency response systems",
      badge: "Critical"
    },
    {
      icon: Camera,
      title: "AI-Based Surveillance & Crowd Control",
      description: "Intelligent traffic monitoring, facial recognition, and predictive crowd flow algorithms",
      badge: "AI Powered"
    },
    {
      icon: Users,
      title: "Crowd & Barricade Management",
      description: "Dynamic crowd control protocols and real-time barricading systems",
      badge: "Live"
    },
    {
      icon: Phone,
      title: "Mobile Medical Units",
      description: "Primary health centres linked to emergency health response systems",
      badge: "24/7"
    }
  ];

  const stats = [
    { label: "Active Pilgrims", value: "1,245", icon: Users },
    { label: "Emergency Alerts", value: "3", icon: AlertTriangle },
    { label: "Surveillance Cameras", value: "156", icon: Camera },
    { label: "Response Time", value: "2.3 min", icon: Clock }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-lg shadow-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Pilgrim Safety & Surveillance System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {userProfile.displayName}
                  </span>
                  <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>
                    {userProfile.role}
                  </Badge>
                </div>
              )}
              <div className="flex space-x-2">
                {userProfile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" className="border-primary/20 hover:border-primary/40">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {userProfile?.role === 'user' && (
                  <Link to="/user">
                    <Button className="bg-primary hover:bg-primary/90">
                      User Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ensuring Pilgrim Safety Through Advanced Surveillance
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Real-time monitoring, emergency preparedness, and AI-powered crowd control systems 
            designed to protect pilgrims during their sacred journey.
          </p>
          
          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            {userProfile?.role === 'admin' && (
              <Link to="/admin">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Control Center
                </Button>
              </Link>
            )}
            {userProfile?.role === 'user' && (
              <Link to="/user">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Pilgrim Portal
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Comprehensive Safety Solutions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <feature.icon className="h-10 w-10 text-primary" />
                    <Badge variant={feature.badge === "Critical" ? "destructive" : "default"} className="shadow-sm">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 bg-destructive/10 border-t-4 border-destructive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-destructive mr-3" />
            <h3 className="text-2xl font-bold text-destructive">Emergency Hotline</h3>
          </div>
          <p className="text-xl font-bold text-destructive/90 mb-2">24/7 Emergency Response: 1-800-PILGRIM</p>
          <p className="text-muted-foreground">Available in multiple languages for immediate assistance</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/60 backdrop-blur-sm text-foreground py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <span className="font-semibold">Pilgrim Safety & Surveillance System</span>
          </div>
          <p className="text-muted-foreground">Protecting pilgrims through technology and vigilance</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
