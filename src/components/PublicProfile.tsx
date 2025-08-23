import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityRing } from './ActivityRing';
import { 
  Award, 
  BookOpen, 
  FileText, 
  Stethoscope, 
  ExternalLink,
  MapPin,
  Building,
  Calendar,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  full_name: string;
  institution?: string;
  specialty?: string;
  pgy_level?: number;
  linkedin_url?: string;
  avatar_url?: string;
  public_fields: {
    courses: boolean;
    awards: boolean;
    publications: boolean;
    procedures: boolean;
  };
}

interface ActivityData {
  courses: {
    completed: number;
    total: number;
    mandatory_completed: number;
    mandatory_total: number;
  };
  procedures: {
    completed: number;
    required: number;
  };
  publications: {
    count: number;
    recent: Array<{
      title: string;
      journal?: string;
      publication_date?: string;
      doi?: string;
      link?: string;
    }>;
  };
  awards: Array<{
    title: string;
    organization?: string;
    awarded_date?: string;
  }>;
}

interface PublicProfileProps {
  profile: ProfileData;
  activityData: ActivityData;
  className?: string;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  profile,
  activityData,
  className
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const getActivityRings = () => {
    const rings = [];
    
    if (profile.public_fields.courses) {
      rings.push({
        id: 'courses',
        label: 'Kurse',
        progress: activityData.courses.total > 0 ? (activityData.courses.completed / activityData.courses.total) * 100 : 0,
        variant: 'coral' as const,
        icon: BookOpen
      });
      
      rings.push({
        id: 'mandatory',
        label: 'Pflicht',
        progress: activityData.courses.mandatory_total > 0 ? (activityData.courses.mandatory_completed / activityData.courses.mandatory_total) * 100 : 0,
        variant: 'lavender' as const,
        icon: BookOpen
      });
    }
    
    if (profile.public_fields.procedures) {
      rings.push({
        id: 'procedures',
        label: 'OPs',
        progress: activityData.procedures.required > 0 ? (activityData.procedures.completed / activityData.procedures.required) * 100 : 0,
        variant: 'mint' as const,
        icon: Stethoscope
      });
    }
    
    if (profile.public_fields.publications) {
      rings.push({
        id: 'publications',
        label: 'Papers',
        progress: Math.min(activityData.publications.count * 20, 100), // 5 publications = 100%
        variant: 'amber' as const,
        icon: FileText
      });
    }
    
    return rings;
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.full_name} - Medizinisches Profil`,
        text: `Schauen Sie sich das medizinische Profil von ${profile.full_name} an`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const activityRings = getActivityRings();

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-medical p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {profile.avatar_url && (
              <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden">
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-2 text-sm opacity-90">
                {profile.pgy_level && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                    PGY-{profile.pgy_level}
                  </Badge>
                )}
                {profile.specialty && (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />
                    {profile.specialty}
                  </span>
                )}
                {profile.institution && (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {profile.institution}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {profile.linkedin_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Rings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-medical-primary" />
            Fortschritt {new Date().getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            {activityRings.map((ring) => (
              <ActivityRing
                key={ring.id}
                progress={ring.progress}
                variant={ring.variant}
                label={ring.label}
                showPercentage
                onClick={() => setSelectedActivity(selectedActivity === ring.id ? null : ring.id)}
                className={selectedActivity === ring.id ? 'ring-2 ring-medical-primary rounded-lg p-2' : ''}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      {selectedActivity && (
        <Card>
          <CardContent className="pt-6">
            {selectedActivity === 'courses' && profile.public_fields.courses && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Absolvierte Kurse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-activity-coral/10 border border-activity-coral/20">
                    <div className="text-2xl font-bold text-activity-coral">
                      {activityData.courses.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">von {activityData.courses.total} Kursen</div>
                  </div>
                  <div className="p-4 rounded-lg bg-activity-lavender/10 border border-activity-lavender/20">
                    <div className="text-2xl font-bold text-activity-lavender">
                      {activityData.courses.mandatory_completed}
                    </div>
                    <div className="text-sm text-muted-foreground">von {activityData.courses.mandatory_total} Pflichtkursen</div>
                  </div>
                </div>
              </div>
            )}

            {selectedActivity === 'procedures' && profile.public_fields.procedures && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Chirurgische Eingriffe</h3>
                <div className="p-4 rounded-lg bg-activity-mint/10 border border-activity-mint/20">
                  <div className="text-2xl font-bold text-activity-mint">
                    {activityData.procedures.completed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    von {activityData.procedures.required} erforderlichen Eingriffen
                  </div>
                </div>
              </div>
            )}

            {selectedActivity === 'publications' && profile.public_fields.publications && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Publikationen</h3>
                <div className="space-y-3">
                  {activityData.publications.recent.map((pub, index) => (
                    <div key={index} className="p-4 rounded-lg bg-activity-amber/10 border border-activity-amber/20">
                      <h4 className="font-medium text-activity-amber">{pub.title}</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pub.journal && <span>{pub.journal}</span>}
                        {pub.publication_date && (
                          <span className="ml-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(pub.publication_date).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                      {(pub.doi || pub.link) && (
                        <div className="mt-2">
                          {pub.link && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={pub.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Ansehen
                              </a>
                            </Button>
                          )}
                          {pub.doi && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                                DOI: {pub.doi}
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Awards Section */}
      {profile.public_fields.awards && activityData.awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-progress-complete" />
              Auszeichnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activityData.awards.map((award, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-activity-amber/20 to-activity-coral/10 border border-activity-amber/30">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-activity-amber mt-0.5" />
                    <div>
                      <h4 className="font-medium">{award.title}</h4>
                      {award.organization && (
                        <p className="text-sm text-muted-foreground">{award.organization}</p>
                      )}
                      {award.awarded_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(award.awarded_date).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};