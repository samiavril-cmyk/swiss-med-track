import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Star, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  type: 'required' | 'optional';
  status: 'completed' | 'upcoming' | 'in-progress';
  points: number;
  category: string;
}

interface CourseTimelineProps {
  courses: Course[];
  year: number;
}

export const CourseTimeline: React.FC<CourseTimelineProps> = ({ courses, year }) => {
  // Sort courses by date
  const sortedCourses = [...courses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'upcoming': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'required': return 'bg-red-500';
      case 'optional': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
      case 'in-progress': return <Badge variant="default" className="bg-blue-100 text-blue-800">Läuft</Badge>;
      case 'upcoming': return <Badge variant="outline">Geplant</Badge>;
      default: return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <Card className="medical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Kurse {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
          
          <div className="space-y-6">
            {sortedCourses.map((course, index) => (
              <div key={course.id} className="relative flex items-start gap-4">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${getStatusColor(course.status)}`}>
                    {/* Type indicator */}
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getTypeColor(course.type)}`}></div>
                  </div>
                </div>

                {/* Course content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg border border-card-border p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {course.type === 'required' && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <h3 className={`font-semibold text-card-foreground ${
                            course.type === 'required' ? 'font-bold' : 'font-medium'
                          }`}>
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{course.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(course.status)}
                        <Badge variant="secondary" className="text-xs">
                          {course.points} CME
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(course.date).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{course.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Required course highlight */}
                    {course.type === 'required' && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-700 font-medium">
                          ⭐ Pflichtkurs - Erforderlich für FMH-Zertifizierung
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {courses.filter(c => c.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {courses.filter(c => c.type === 'required').length}
                </p>
                <p className="text-sm text-muted-foreground">Pflichtkurse</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {courses.reduce((sum, c) => sum + c.points, 0)}
                </p>
                <p className="text-sm text-muted-foreground">CME Punkte</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {courses.filter(c => c.status === 'upcoming').length}
                </p>
                <p className="text-sm text-muted-foreground">Geplant</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data for demonstration
export const mockCourses2024: Course[] = [
  {
    id: '1',
    title: 'Advanced Laparoscopy Workshop',
    date: '2024-03-15',
    location: 'Zürich',
    duration: '2 Tage',
    type: 'required',
    status: 'completed',
    points: 8,
    category: 'Chirurgie'
  },
  {
    id: '2',
    title: 'Emergency Medicine Simulation',
    date: '2024-05-20',
    location: 'Basel',
    duration: '1 Tag',
    type: 'required',
    status: 'completed',
    points: 6,
    category: 'Notfallmedizin'
  },
  {
    id: '3',
    title: 'Digital Health Innovation',
    date: '2024-07-10',
    location: 'Bern',
    duration: '1 Tag',
    type: 'optional',
    status: 'completed',
    points: 4,
    category: 'Digital Health'
  },
  {
    id: '4',
    title: 'Trauma Surgery Masterclass',
    date: '2024-09-15',
    location: 'Lausanne',
    duration: '3 Tage',
    type: 'required',
    status: 'upcoming',
    points: 12,
    category: 'Traumatologie'
  },
  {
    id: '5',
    title: 'Medical Ethics Workshop',
    date: '2024-11-08',
    location: 'Genf',
    duration: '1 Tag',
    type: 'optional',
    status: 'upcoming',
    points: 3,
    category: 'Ethik'
  },
  {
    id: '6',
    title: 'Research Methodology',
    date: '2024-12-12',
    location: 'Zürich',
    duration: '2 Tage',
    type: 'optional',
    status: 'upcoming',
    points: 6,
    category: 'Forschung'
  }
];

export const mockCourses2023: Course[] = [
  {
    id: '7',
    title: 'Basic Surgical Skills',
    date: '2023-02-20',
    location: 'Zürich',
    duration: '2 Tage',
    type: 'required',
    status: 'completed',
    points: 8,
    category: 'Chirurgie'
  },
  {
    id: '8',
    title: 'Patient Communication',
    date: '2023-04-15',
    location: 'Basel',
    duration: '1 Tag',
    type: 'required',
    status: 'completed',
    points: 4,
    category: 'Kommunikation'
  },
  {
    id: '9',
    title: 'Medical Imaging Interpretation',
    date: '2023-06-10',
    location: 'Bern',
    duration: '1 Tag',
    type: 'optional',
    status: 'completed',
    points: 5,
    category: 'Radiologie'
  },
  {
    id: '10',
    title: 'Quality Management in Healthcare',
    date: '2023-08-25',
    location: 'Lausanne',
    duration: '1 Tag',
    type: 'optional',
    status: 'completed',
    points: 3,
    category: 'Qualitätsmanagement'
  }
];
