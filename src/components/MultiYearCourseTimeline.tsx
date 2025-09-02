import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Star, TrendingUp } from 'lucide-react';
import { CourseTimeline, mockCourses2024, mockCourses2023, Course } from './CourseTimeline';

interface MultiYearCourseTimelineProps {
  coursesByYear: Record<number, Course[]>;
}

export const MultiYearCourseTimeline: React.FC<MultiYearCourseTimelineProps> = ({ coursesByYear }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const years = Object.keys(coursesByYear).map(Number).sort((a, b) => b - a);

  const getYearStats = (year: number) => {
    const courses = coursesByYear[year] || [];
    const completed = courses.filter(c => c.status === 'completed').length;
    const required = courses.filter(c => c.type === 'required').length;
    const totalPoints = courses.reduce((sum, c) => sum + c.points, 0);
    const requiredCompleted = courses.filter(c => c.type === 'required' && c.status === 'completed').length;

    return {
      total: courses.length,
      completed,
      required,
      totalPoints,
      requiredCompleted,
      completionRate: required > 0 ? (requiredCompleted / required) * 100 : 0
    };
  };

  const currentYearStats = getYearStats(selectedYear);

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Kurs-Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = years.indexOf(selectedYear);
                if (currentIndex < years.length - 1) {
                  setSelectedYear(years[currentIndex + 1]);
                }
              }}
              disabled={years.indexOf(selectedYear) >= years.length - 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">{selectedYear}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = years.indexOf(selectedYear);
                if (currentIndex > 0) {
                  setSelectedYear(years[currentIndex - 1]);
                }
              }}
              disabled={years.indexOf(selectedYear) <= 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Year Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-700">{currentYearStats.total}</p>
            <p className="text-sm text-blue-600">Kurse gesamt</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-700">{currentYearStats.completed}</p>
            <p className="text-sm text-green-600">Abgeschlossen</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-2xl font-bold text-red-700">{currentYearStats.requiredCompleted}/{currentYearStats.required}</p>
            <p className="text-sm text-red-600">Pflichtkurse</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-700">{currentYearStats.totalPoints}</p>
            <p className="text-sm text-purple-600">CME Punkte</p>
          </div>
        </div>

        {/* Progress Bar for Required Courses */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-card-foreground">Pflichtkurse Fortschritt</span>
            <span className="text-sm text-muted-foreground">
              {currentYearStats.requiredCompleted}/{currentYearStats.required} ({Math.round(currentYearStats.completionRate)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentYearStats.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Year Tabs */}
        <Tabs value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {years.map(year => (
              <TabsTrigger key={year} value={year.toString()} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {year}
                {getYearStats(year).required > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getYearStats(year).requiredCompleted}/{getYearStats(year).required}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {years.map(year => (
            <TabsContent key={year} value={year.toString()} className="mt-6">
              <CourseTimeline courses={coursesByYear[year] || []} year={year} />
            </TabsContent>
          ))}
        </Tabs>

        {/* Multi-Year Summary */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Mehrjahres-Übersicht
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-card-foreground">
                {Object.values(coursesByYear).flat().length}
              </p>
              <p className="text-sm text-muted-foreground">Kurse gesamt</p>
            </div>
            <div>
              <p className="text-xl font-bold text-card-foreground">
                {Object.values(coursesByYear).flat().filter(c => c.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </div>
            <div>
              <p className="text-xl font-bold text-card-foreground">
                {Object.values(coursesByYear).flat().filter(c => c.type === 'required').length}
              </p>
              <p className="text-sm text-muted-foreground">Pflichtkurse</p>
            </div>
            <div>
              <p className="text-xl font-bold text-card-foreground">
                {Object.values(coursesByYear).flat().reduce((sum, c) => sum + c.points, 0)}
              </p>
              <p className="text-sm text-muted-foreground">CME Punkte</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data for multiple years
export const mockCoursesByYear: Record<number, Course[]> = {
  2024: mockCourses2024,
  2023: mockCourses2023,
  2022: [
    {
      id: '11',
      title: 'Introduction to Surgery',
      date: '2022-03-10',
      location: 'Zürich',
      duration: '2 Tage',
      type: 'required',
      status: 'completed',
      points: 8,
      category: 'Chirurgie'
    },
    {
      id: '12',
      title: 'Medical Ethics Basics',
      date: '2022-06-15',
      location: 'Basel',
      duration: '1 Tag',
      type: 'required',
      status: 'completed',
      points: 4,
      category: 'Ethik'
    }
  ],
  2021: [
    {
      id: '13',
      title: 'Foundation Course',
      date: '2021-09-20',
      location: 'Bern',
      duration: '1 Tag',
      type: 'required',
      status: 'completed',
      points: 6,
      category: 'Grundlagen'
    }
  ]
};
