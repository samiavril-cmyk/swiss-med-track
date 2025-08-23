import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Clock, Users, Award } from "lucide-react";

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
  capacity: number;
  has_certificate: boolean;
}

interface CourseCardProps {
  course: Course;
  showFullDescription?: boolean;
}

export function CourseCard({ course, showFullDescription = false }: CourseCardProps) {
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

  return (
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
              <Award className="h-3 w-3 mr-1" />
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
        <CardDescription className={showFullDescription ? "mb-3" : "line-clamp-2 mb-3"}>
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
            
            {course.difficulty_level && (
              <Badge variant="outline" className="text-xs capitalize">
                {course.difficulty_level}
              </Badge>
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
}