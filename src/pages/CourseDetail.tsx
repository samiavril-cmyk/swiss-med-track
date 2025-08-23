import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Download,
  Play,
  Heart,
  Share2
} from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";

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
  cover_image_url: string;
  cme_points: number;
  points: number;
  capacity: number;
  has_certificate: boolean;
  provider_id: string;
  requirements: string;
}

interface CourseSession {
  id: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  status: string;
  location: string;
}

interface CourseVideo {
  id: string;
  video_id: string;
  video_type: string;
  is_preview: boolean;
  order_index: number;
  videos: {
    title: string;
    description: string;
    duration: number;
    thumbnail_url: string;
  };
}

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  file_type: string;
  file_size: number;
  is_preview: boolean;
}

interface CourseReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch course sessions
      const { data: sessionsData } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", id)
        .order("start_date", { ascending: true });

      setSessions(sessionsData || []);

      // Fetch course videos
      const { data: videosData } = await supabase
        .from("course_videos")
        .select(`
          *,
          videos (
            title,
            description,
            duration,
            thumbnail_url
          )
        `)
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      setVideos(videosData || []);

      // Fetch course materials
      const { data: materialsData } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", id);

      setMaterials(materialsData || []);

      // Fetch course reviews - simplified for now since we don't have profile joins working
      const { data: reviewsData } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", id)
        .order("created_at", { ascending: false });

      // Map reviews to include mock profile data for demo
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        profiles: {
          full_name: "Course Participant",
          avatar_url: ""
        }
      }));

      setReviews(reviewsWithProfiles);

      // Check if user is enrolled (requires auth)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from("course_enrollments")
          .select("status")
          .eq("course_id", id)
          .eq("user_id", user.id)
          .single();

        setIsEnrolled(!!enrollment);
      }

    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!course || !selectedSession) {
      toast.error("Please select a session");
      return;
    }

    setEnrolling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to enroll");
        return;
      }

      // Create enrollment
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: course.id,
          user_id: user.id,
          status: "enrolled"
        });

      if (error) throw error;

      // Create payment record (simplified for demo)
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          course_id: course.id,
          session_id: selectedSession,
          amount: course.price,
          currency: course.currency,
          status: "pending"
        });

      if (paymentError) throw paymentError;

      toast.success("Successfully enrolled! Payment processing...");
      setIsEnrolled(true);

    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return `${price} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 cursor-pointer ${
          i < rating 
            ? "fill-amber text-amber" 
            : "fill-muted stroke-muted-foreground"
        }`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/courses">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="relative">
              {course.cover_image_url ? (
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-medical-primary/20 to-swiss-blue/20 rounded-lg flex items-center justify-center">
                  <div className="text-8xl text-medical-primary opacity-30">📚</div>
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Course Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {renderStars(course.average_rating)}
                      <span className="ml-1">({course.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{course.city}, {course.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {course.modality && (
                    <Badge variant="secondary">{course.modality}</Badge>
                  )}
                  {course.difficulty_level && (
                    <Badge variant="outline">{course.difficulty_level}</Badge>
                  )}
                  {course.has_certificate && (
                    <Badge variant="outline">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{course.description}</p>

              {/* Course Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-medical-primary" />
                  <div className="font-semibold">{course.cme_points} CME</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-medical-primary" />
                  <div className="font-semibold">{course.capacity || "Unlimited"}</div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-medical-primary" />
                  <div className="font-semibold">{sessions.length}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <Star className="h-6 w-6 mx-auto mb-2 text-medical-primary" />
                  <div className="font-semibold">{course.average_rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{course.requirements || "No specific requirements"}</p>
                  </CardContent>
                </Card>

                {course.tags && course.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Topics Covered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                {videos.length > 0 ? (
                  videos.map((video, index) => (
                    <Card key={video.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img 
                              src={video.videos.thumbnail_url || "/placeholder.svg"} 
                              alt={video.videos.title}
                              className="w-24 h-16 object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{video.videos.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {video.videos.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{Math.floor(video.videos.duration / 60)} min</span>
                              <Badge variant={video.is_preview ? "secondary" : "outline"} className="text-xs">
                                {video.is_preview ? "Free Preview" : "Premium"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">🎥</div>
                      <h3 className="text-lg font-semibold mb-2">No video content available</h3>
                      <p className="text-muted-foreground">This course doesn't include video lessons.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-medical-primary" />
                            <div>
                              <h4 className="font-semibold">{material.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {material.description} • {formatFileSize(material.file_size)} • {material.file_type.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={material.is_preview ? "secondary" : "outline"}>
                            {material.is_preview ? "Free" : "Premium"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <h3 className="text-lg font-semibold mb-2">No materials available</h3>
                      <p className="text-muted-foreground">This course doesn't include downloadable materials.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={review.profiles.avatar_url} />
                            <AvatarFallback>
                              {review.profiles.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{review.profiles.full_name}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-4">⭐</div>
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground">Be the first to review this course!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Enroll Now</span>
                  <span className="text-2xl font-bold text-medical-primary">
                    {formatPrice(course.price, course.currency)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <div className="text-center py-4">
                    <div className="text-green-600 font-semibold mb-2">✓ Already Enrolled</div>
                    <Button variant="outline" className="w-full">
                      Go to Course
                    </Button>
                  </div>
                ) : (
                  <>
                    {sessions.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Session:</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={selectedSession}
                          onChange={(e) => setSelectedSession(e.target.value)}
                        >
                          <option value="">Choose a session</option>
                          {sessions.map((session) => (
                            <option key={session.id} value={session.id}>
                              {formatDate(session.start_date)}
                              {session.location && ` - ${session.location}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      variant="medical" 
                      onClick={handleEnrollment}
                      disabled={enrolling || (sessions.length > 0 && !selectedSession)}
                    >
                      {enrolling ? "Processing..." : "Enroll Now"}
                    </Button>
                  </>
                )}

                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specialty:</span>
                    <span className="font-medium">{course.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="font-medium capitalize">{course.difficulty_level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Schedule */}
            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-medical-primary" />
                        <span className="font-medium text-sm">
                          {formatDate(session.start_date)}
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <Progress 
                          value={(session.current_participants / session.max_participants) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {session.current_participants}/{session.max_participants} enrolled
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}