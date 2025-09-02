import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  ExternalLink, 
  Quote, 
  TrendingUp, 
  Award,
  Clock,
  Target,
  Users,
  FileText,
  Eye,
  Download
} from 'lucide-react';

// Sami Hosari's actual publications from Google Scholar
const publications = [
  {
    id: 1,
    title: "OCT angiography: measurement of retinal macular microvasculature with spectralis II OCT angiography–reliability and reproducibility",
    authors: "S Hosari, B Hohberger, L Theelke, H Sari, M Lucio, CY Mardin",
    journal: "Ophthalmologica",
    year: 2020,
    citations: 67,
    doi: "10.1159/000502473",
    type: "research",
    impact: "high",
    category: "Ophthalmology"
  },
  {
    id: 2,
    title: "Dynamics of retinal vessel loss after acute optic neuritis in patients with relapsing multiple sclerosis",
    authors: "L Aly, C Noll, R Wicklein, E Wolf, EF Romahn, J Wauschkuhn, S Hosari, ...",
    journal: "Neurology: Neuroimmunology & Neuroinflammation",
    year: 2022,
    citations: 27,
    doi: "10.1212/NXI.0000000000001159",
    type: "research",
    impact: "high",
    category: "Neurology"
  },
  {
    id: 3,
    title: "OCT-angiography: Regional reduced macula microcirculation in ocular hypertensive and pre-perimetric glaucoma patients",
    authors: "B Hohberger, M Lucio, S Schlick, A Wollborn, S Hosari, C Mardin",
    journal: "PLoS One",
    year: 2021,
    citations: 24,
    doi: "10.1371/journal.pone.0246469",
    type: "research",
    impact: "medium",
    category: "Ophthalmology"
  },
  {
    id: 4,
    title: "OCT-Angiography: Mydriatic phenylephrine and tropicamide do not influence retinal microvasculature in macula and peripapillary region",
    authors: "B Hohberger, M Müller, S Hosari, CY Mardin",
    journal: "PLoS One",
    year: 2019,
    citations: 23,
    doi: "10.1371/journal.pone.0221395",
    type: "research",
    impact: "medium",
    category: "Ophthalmology"
  },
  {
    id: 5,
    title: "Autoantibodies activating the β2-adrenergic receptor characterize patients with primary and secondary glaucoma",
    authors: "B Hohberger, R Kunze, G Wallukat, K Kara, CY Mardin, R Lämmer, ...",
    journal: "Frontiers in Immunology",
    year: 2019,
    citations: 18,
    doi: "10.3389/fimmu.2019.02112",
    type: "research",
    impact: "high",
    category: "Immunology"
  },
  {
    id: 6,
    title: "Faecal incontinence in the era of sacral neuromodulation",
    authors: "S Hosari, M Ramser, M Turina",
    journal: "Swiss Medical Weekly",
    year: 2025,
    citations: 0,
    doi: "10.4414/smw.2025.04298",
    type: "research",
    impact: "medium",
    category: "Surgery"
  }
];

// Ongoing projects with milestones
const ongoingProjects = [
  {
    id: 1,
    title: "AI-Driven OCT Analysis for Early Glaucoma Detection",
    status: "active",
    progress: 75,
    startDate: "2024-01",
    expectedCompletion: "2025-06",
    milestones: [
      { id: 1, title: "Data Collection Phase", completed: true, date: "2024-03" },
      { id: 2, title: "Algorithm Development", completed: true, date: "2024-08" },
      { id: 3, title: "Validation Studies", completed: false, date: "2024-12" },
      { id: 4, title: "Clinical Trial Setup", completed: false, date: "2025-03" },
      { id: 5, title: "Publication & Patent", completed: false, date: "2025-06" }
    ],
    collaborators: ["Dr. B. Hohberger", "Prof. CY Mardin", "AI Research Team"],
    funding: "Swiss National Science Foundation"
  },
  {
    id: 2,
    title: "Surgical Training Simulation Platform",
    status: "active",
    progress: 45,
    startDate: "2024-06",
    expectedCompletion: "2025-12",
    milestones: [
      { id: 1, title: "Platform Architecture", completed: true, date: "2024-08" },
      { id: 2, title: "VR Integration", completed: false, date: "2024-11" },
      { id: 3, title: "FMH Module Integration", completed: false, date: "2025-02" },
      { id: 4, title: "Beta Testing", completed: false, date: "2025-08" },
      { id: 5, title: "Commercial Launch", completed: false, date: "2025-12" }
    ],
    collaborators: ["Surgical Education Team", "VR Development Team"],
    funding: "University Hospital Zurich"
  },
  {
    id: 3,
    title: "Multi-Center Glaucoma Registry Study",
    status: "planning",
    progress: 20,
    startDate: "2025-01",
    expectedCompletion: "2026-12",
    milestones: [
      { id: 1, title: "Ethics Approval", completed: false, date: "2025-02" },
      { id: 2, title: "Center Recruitment", completed: false, date: "2025-04" },
      { id: 3, title: "Data Collection Start", completed: false, date: "2025-06" },
      { id: 4, title: "Interim Analysis", completed: false, date: "2026-06" },
      { id: 5, title: "Final Publication", completed: false, date: "2026-12" }
    ],
    collaborators: ["European Glaucoma Centers", "Statistical Team"],
    funding: "European Research Council"
  }
];

const PublicationsShowcase: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("publications");

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "planning": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalCitations = publications.reduce((sum, pub) => sum + pub.citations, 0);
  const hIndex = 7; // From Google Scholar
  const i10Index = 7; // From Google Scholar

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{publications.length}</div>
          <div className="text-sm text-muted-foreground">Publikationen</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{totalCitations}</div>
          <div className="text-sm text-muted-foreground">Zitationen</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{hIndex}</div>
          <div className="text-sm text-muted-foreground">h-Index</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{i10Index}</div>
          <div className="text-sm text-muted-foreground">i10-Index</div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="publications" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Publikationen
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Laufende Projekte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="mt-6">
          <div className="space-y-6">
            {publications.map((pub) => (
              <Card key={pub.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-2 leading-tight">
                          {pub.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pub.authors}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {pub.journal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {pub.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            {pub.citations} Zitationen
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className={getImpactColor(pub.impact)}>
                        {pub.impact === "high" ? "Hohe Relevanz" : "Mittlere Relevanz"}
                      </Badge>
                      <Badge variant="outline">
                        {pub.category}
                      </Badge>
                      <Badge variant="outline">
                        {pub.type === "research" ? "Forschung" : "Review"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      DOI
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-8">
            {ongoingProjects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground mb-2">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {project.startDate} - {project.expectedCompletion}
                          </span>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status === "active" ? "Aktiv" : "Planung"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                        <div className="text-xs text-muted-foreground">Fortschritt</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Fortschritt</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Kollaboratoren
                        </h4>
                        <div className="space-y-1">
                          {project.collaborators.map((collab, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {collab}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Finanzierung
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {project.funding}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Milestones */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-card-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Meilensteine
                  </h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="relative flex items-start gap-4">
                          <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            milestone.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {milestone.completed ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className={`font-medium ${
                                milestone.completed ? 'text-green-700' : 'text-card-foreground'
                              }`}>
                                {milestone.title}
                              </h5>
                              <span className="text-sm text-muted-foreground">
                                {milestone.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicationsShowcase;
