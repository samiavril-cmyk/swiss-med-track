import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MapPin, Calendar, Star, Clock, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { CourseInputModal } from "@/components/CourseInputModal";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  modality: string;
  city: string;
  country: string;
  specialty: string;
  language: string;
  difficulty_level: string;
  tags: string[];
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  cover_image_url: string;
  cme_points: number;
  points: number;
  capacity: number;
  has_certificate: boolean;
  provider_id: string;
}

export default function Courses() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [selectedModality, setSelectedModality] = useState(searchParams.get("modality") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"available" | "my-courses">("available");

  const countries = ["Switzerland", "Germany", "Austria", "France", "Italy"];
  const specialties = ["Cardiology", "Surgery", "Neurology", "Radiology", "Emergency Medicine", "Internal Medicine"];
  const modalities = ["Online", "In-Person", "Hybrid"];
  const priceRanges = [
    { label: "Free", value: "0" },
    { label: "Under 100 CHF", value: "0-100" },
    { label: "100-500 CHF", value: "100-500" },
    { label: "500-1000 CHF", value: "500-1000" },
    { label: "Over 1000 CHF", value: "1000+" }
  ];

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      await fetchCourses();
      if (user && isMounted) {
        await fetchUserCourses();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user]); // Remove fetchCourses from dependencies to prevent loops

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCountry) {
        query = query.eq("country", selectedCountry);
      }

      if (selectedSpecialty) {
        query = query.eq("specialty", selectedSpecialty);
      }

      if (selectedModality) {
        query = query.eq("modality", selectedModality);
      }

      if (priceRange) {
        if (priceRange === "0") {
          query = query.eq("price", 0);
        } else if (priceRange.includes("-")) {
          const [min, max] = priceRange.split("-").map(Number);
          query = query.gte("price", min).lte("price", max);
        } else if (priceRange === "1000+") {
          query = query.gte("price", 1000);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Fallback mit Beispiel-Daten anzeigen
      setCourses([
        {
          id: 'demo-1',
          title: 'Suturing Basics',
          description: 'Grundlagen der Nahttechniken',
          price: 0,
          currency: 'CHF',
          modality: 'In-Person',
          city: 'Zürich',
          country: 'Switzerland',
          specialty: 'Surgery',
          language: 'DE',
          difficulty_level: 'Beginner',
          tags: ['Hands-on', 'Workshop'],
          average_rating: 4.5,
          total_reviews: 12,
          is_featured: true,
          cover_image_url: '',
          cme_points: 4,
          points: 0,
          capacity: 20,
          has_certificate: true,
          provider_id: 'demo'
        }
      ] as any);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCountry, selectedSpecialty, selectedModality, priceRange]);

  const fetchUserCourses = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_courses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setUserCourses(data || []);
    } catch (error) {
      console.error("Error fetching user courses:", error);
    }
  }, [user]);

  const handleCourseAdded = (newCourse: Course) => {
    setUserCourses(prev => [newCourse, ...prev]);
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedSpecialty("");
    setSelectedModality("");
    setPriceRange("");
    setSearchParams({});
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return `${price} ${currency}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "fill-amber text-amber" 
            : "fill-muted stroke-muted-foreground"
        }`}
      />
    ));
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-accent/20">
      {course.is_featured && (
        <div className="bg-gradient-to-r from-medical-primary to-swiss-blue text-white text-xs px-2 py-1 rounded-t-md font-medium">
          Featured Course
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-t-md">
        {course.cover_image_url ? (
          <img 
            src={course.cover_image_url} 
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-medical-primary/20 to-swiss-blue/20 flex items-center justify-center">
            <div className="text-6xl text-medical-primary opacity-30">📚</div>
          </div>
        )}
        
        {course.modality && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm"
          >
            {course.modality}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold group-hover:text-medical-primary transition-colors line-clamp-2">
            {course.title}
          </CardTitle>
          {course.has_certificate && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Certificate
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          {renderStars(course.average_rating)}
          <span className="text-sm text-muted-foreground ml-1">
            ({course.total_reviews} reviews)
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <CardDescription className="line-clamp-2 mb-3">
          {course.description}
        </CardDescription>

        <div className="space-y-2 text-sm text-muted-foreground">
          {course.city && course.country && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{course.city}, {course.country}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {course.cme_points > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.cme_points} CME</span>
              </div>
            )}
            
            {course.capacity && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Max {course.capacity}</span>
              </div>
            )}
          </div>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-2xl font-bold text-medical-primary">
            {formatPrice(course.price, course.currency)}
          </div>
          
          <Link to={`/courses/${course.id}`}>
            <Button variant="medical" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Medizinische Kurse
            </h1>
            <p className="text-muted-foreground">
              Entdecken Sie FMH-konforme Fortbildungsmöglichkeiten
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            {user && (
              <CourseInputModal onCourseAdded={handleCourseAdded} />
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Kalender
            </Button>
          </div>
        </div>

        {/* Tabs for Available vs My Courses */}
        <Tabs value={activeTab} onValueChange={(value: "available" | "my-courses") => setActiveTab(value)} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Verfügbare Kurse</TabsTrigger>
            <TabsTrigger value="my-courses">Meine Kurse ({userCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {/* Search and Filters */}
            <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateSearchParams("search", e.target.value);
                }}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value);
                updateSearchParams("country", value);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpecialty} onValueChange={(value) => {
                setSelectedSpecialty(value);
                updateSearchParams("specialty", value);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedModality} onValueChange={(value) => {
                setSelectedModality(value);
                updateSearchParams("modality", value);
              }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem key={modality} value={modality}>{modality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={(value) => {
                setPriceRange(value);
                updateSearchParams("price", value);
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || selectedCountry || selectedSpecialty || selectedModality || priceRange) && (
                <Button variant="outline" onClick={clearAllFilters} size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Course Marketplace
            {!loading && <span className="text-muted-foreground ml-2">({courses.length} courses)</span>}
          </h1>

          <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-md"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clear filters to see more results.
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={view === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="my-courses" className="mt-6">
            {user ? (
              <div>
                {userCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">Noch keine Kurse hinzugefügt</h3>
                    <p className="text-muted-foreground mb-4">
                      Fügen Sie Ihren ersten Kurs hinzu, um Ihre Fortbildung zu verfolgen.
                    </p>
                    <CourseInputModal onCourseAdded={handleCourseAdded} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Anmeldung erforderlich</h3>
                <p className="text-muted-foreground mb-4">
                  Melden Sie sich an, um Ihre Kurse zu verwalten.
                </p>
                <Button asChild>
                  <a href="/auth">Anmelden</a>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}