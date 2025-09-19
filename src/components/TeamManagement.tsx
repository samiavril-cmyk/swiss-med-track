import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthResilient } from '@/hooks/useAuthResilient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plus,
  UserPlus,
  Trash2,
  AlertTriangle,
  Clock,
  UserCheck,
  Building,
  MapPin,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamManagementProps {
  onMembershipChange?: () => void;
}

interface Team {
  id: string;
  team_name: string;
  department: string;
  hospital: string;
  description: string;
  created_at: string;
  member_count: number;
}

interface TeamMember {
  id: string;
  resident_id: string;
  resident_name: string;
  resident_email: string;
  pgy_level: number;
  department: string;
  hospital: string;
  joined_at: string;
  status: string;
  notes: string;
  overall_progress: number;
  total_procedures: number;
  last_activity: string | null;
  modules: ModuleProgressSummary[];
}

interface AvailableResident {
  user_id: string;
  full_name: string;
  email: string;
  pgy_level: number;
  department: string;
  hospital: string;
}

interface ModuleProgressSummary {
  module_key: string;
  module_name: string;
  progress_percentage: number;
  total_weighted_score: number;
  total_minimum: number;
  responsible_count: number;
  instructing_count: number;
  assistant_count: number;
  last_procedure_date: string | null;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onMembershipChange }) => {
  const { user } = useAuthResilient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableResidents, setAvailableResidents] = useState<AvailableResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    department: '',
    hospital: '',
    description: ''
  });
  const [selectedResident, setSelectedResident] = useState<string>('');
  const [memberNotes, setMemberNotes] = useState('');

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load supervisor's teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('supervisor_teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('supervisor_id', user?.id)
        .order('created_at', { ascending: false });

      if (teamsError) {
        console.error('Error loading teams:', teamsError);
        setError('Fehler beim Laden der Teams');
        return;
      }

      const teamsWithCount = teamsData?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || [];

      setTeams(teamsWithCount);

    } catch (err) {
      console.error('Error in loadTeams:', err);
      setError('Fehler beim Laden der Team-Daten');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadTeams();
    }
  }, [user?.id, loadTeams]);

  const loadTeamMembers = async (teamId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles!team_members_resident_id_fkey (
            user_id,
            full_name,
            email,
            pgy_level,
            department,
            hospital
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error loading team members:', membersError);
        return;
      }

      const members = membersData?.map(member => ({
        id: member.id,
        resident_id: member.resident_id,
        resident_name: member.profiles?.full_name || 'Unbekannt',
        resident_email: member.profiles?.email || '',
        pgy_level: member.profiles?.pgy_level || 0,
        department: member.profiles?.department || '',
        hospital: member.profiles?.hospital || '',
        joined_at: member.joined_at,
        status: member.status,
        notes: member.notes || '',
        overall_progress: 0,
        total_procedures: 0,
        last_activity: null,
        modules: []
      })) || [];

      const membersWithProgress = await Promise.all(members.map(async (member) => {
        try {
          const { data: progressData, error: progressError } = await supabase
            .rpc('get_resident_progress_summary', { resident_user_id: member.resident_id });

          if (progressError) {
            console.error('Error loading member progress:', progressError);
            return member;
          }

          const modules = (progressData || []).map((module) => ({
            module_key: module.module_key,
            module_name: module.module_name,
            progress_percentage: Number(module.progress_percentage || 0),
            total_weighted_score: Number(module.total_weighted_score || 0),
            total_minimum: Number(module.total_minimum || 0),
            responsible_count: Number(module.responsible_count || 0),
            instructing_count: Number(module.instructing_count || 0),
            assistant_count: Number(module.assistant_count || 0),
            last_procedure_date: module.last_procedure_date || null
          })) as ModuleProgressSummary[];

          const totals = modules.reduce((acc, module) => {
            return {
              weighted: acc.weighted + module.total_weighted_score,
              minimum: acc.minimum + module.total_minimum,
              procedures: acc.procedures + module.responsible_count + module.instructing_count + module.assistant_count,
              lastActivity: module.last_procedure_date && (!acc.lastActivity || module.last_procedure_date > acc.lastActivity)
                ? module.last_procedure_date
                : acc.lastActivity
            };
          }, { weighted: 0, minimum: 0, procedures: 0, lastActivity: null as string | null });

          const overallProgress = totals.minimum > 0
            ? Math.min(100, Number(((totals.weighted / totals.minimum) * 100).toFixed(1)))
            : 0;

          return {
            ...member,
            overall_progress: overallProgress,
            total_procedures: totals.procedures,
            last_activity: totals.lastActivity,
            modules
          };
        } catch (progressErr) {
          console.error('Unexpected error while loading member progress:', progressErr);
          return member;
        }
      }));

      setTeamMembers(membersWithProgress);
    } catch (err) {
      console.error('Error in loadTeamMembers:', err);
    }
  };

  const loadAvailableResidents = async () => {
    try {
      // Load residents who are not already in any team
      const { data: residentsData, error: residentsError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, pgy_level, department, hospital')
        .eq('role', 'resident')
        .not('user_id', 'in', `(SELECT resident_id FROM team_members WHERE status = 'active')`)
        .order('full_name');

      if (residentsError) {
        console.error('Error loading available residents:', residentsError);
        return;
      }

      setAvailableResidents(residentsData || []);
    } catch (err) {
      console.error('Error in loadAvailableResidents:', err);
    }
  };

  const handleCreateTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisor_teams')
        .insert({
          supervisor_id: user?.id,
          team_name: newTeam.team_name,
          department: newTeam.department,
          hospital: newTeam.hospital,
          description: newTeam.description
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Team erstellt",
        description: `Das Team "${newTeam.team_name}" wurde erfolgreich erstellt.`
      });

      setNewTeam({ team_name: '', department: '', hospital: '', description: '' });
      setShowCreateTeam(false);
      loadTeams();
      onMembershipChange?.();
    } catch (err) {
      console.error('Error creating team:', err);
      toast({
        title: "Fehler",
        description: "Team konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedResident) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .upsert({
          team_id: selectedTeam.id,
          resident_id: selectedResident,
          notes: memberNotes,
          status: 'active',
          joined_at: new Date().toISOString()
        }, { onConflict: 'team_id,resident_id' });

      if (error) throw error;

      toast({
        title: "Resident hinzugefügt",
        description: "Der Resident wurde erfolgreich zum Team hinzugefügt."
      });

      setSelectedResident('');
      setMemberNotes('');
      setShowAddMember(false);
      loadTeamMembers(selectedTeam.id);
      loadTeams(); // Update team count
      loadAvailableResidents();
      onMembershipChange?.();
    } catch (err) {
      console.error('Error adding member:', err);
      toast({
        title: "Fehler",
        description: "Resident konnte nicht hinzugefügt werden.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Resident entfernt",
        description: "Der Resident wurde aus dem Team entfernt."
      });

      if (selectedTeam) {
        loadTeamMembers(selectedTeam.id);
        loadTeams(); // Update team count
        loadAvailableResidents();
      }
      onMembershipChange?.();
    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        title: "Fehler",
        description: "Resident konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    loadTeamMembers(team.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Teams und Residents</p>
        </div>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neues Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Team erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie ein neues Team für Ihre Residents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team_name">Team Name</Label>
                <Input
                  id="team_name"
                  value={newTeam.team_name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, team_name: e.target.value }))}
                  placeholder="z.B. Chirurgie Team A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Abteilung</Label>
                <Input
                  id="department"
                  value={newTeam.department}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="z.B. Allgemeinchirurgie"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Krankenhaus</Label>
                <Input
                  id="hospital"
                  value={newTeam.hospital}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, hospital: e.target.value }))}
                  placeholder="z.B. Universitätsspital Zürich"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung des Teams..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateTeam} disabled={!newTeam.team_name.trim()}>
                  Team erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ihre Teams
            </CardTitle>
            <CardDescription>
              Wählen Sie ein Team aus, um die Mitglieder zu verwalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.map((team) => (
                <Card 
                  key={team.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{team.team_name}</h3>
                      <Badge variant="outline">{team.member_count} Mitglieder</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {team.department}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {team.hospital}
                      </div>
                      {team.description && (
                        <p className="text-xs text-gray-500 mt-2">{team.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {teams.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Teams vorhanden</h3>
                  <p className="text-gray-600">
                    Erstellen Sie Ihr erstes Team, um Residents zu verwalten.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Team Mitglieder
                </CardTitle>
                <CardDescription>
                  {selectedTeam ? `Mitglieder von "${selectedTeam.team_name}"` : 'Wählen Sie ein Team aus'}
                </CardDescription>
              </div>
              {selectedTeam && (
                <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={loadAvailableResidents}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Resident zum Team hinzufügen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie einen Resident zu "{selectedTeam.team_name}" hinzu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resident">Resident auswählen</Label>
                        <Select value={selectedResident} onValueChange={setSelectedResident}>
                          <SelectTrigger>
                            <SelectValue placeholder="Resident auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableResidents.length === 0 ? (
                              <SelectItem value="__none" disabled>
                                Keine freien Residents verfügbar
                              </SelectItem>
                            ) : (
                              availableResidents.map((resident) => (
                                <SelectItem key={resident.user_id} value={resident.user_id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{resident.full_name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      PGY {resident.pgy_level} - {resident.department}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notizen (optional)</Label>
                        <Textarea
                          id="notes"
                          value={memberNotes}
                          onChange={(e) => setMemberNotes(e.target.value)}
                          placeholder="Notizen zum Resident..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddMember(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleAddMember} disabled={!selectedResident}>
                          Hinzufügen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTeam ? (
              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const focusModules = [...member.modules]
                    .sort((a, b) => a.progress_percentage - b.progress_percentage)
                    .slice(0, 2);

                  return (
                    <Card key={member.id}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{member.resident_name}</h4>
                            <p className="text-sm text-gray-600">{member.resident_email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">PGY {member.pgy_level}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Fortschritt gesamt</span>
                            <span className="font-semibold">{Math.round(member.overall_progress)}%</span>
                          </div>
                          <Progress value={member.overall_progress} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {member.department}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Seit: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {member.total_procedures} dokumentierte Einsätze
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            {member.last_activity
                              ? `Letzte Aktivität: ${new Date(member.last_activity).toLocaleDateString('de-DE')}`
                              : 'Keine Aktivitäten'}
                          </div>
                        </div>

                        {focusModules.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700">Fokus-Module</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {focusModules.map((module) => (
                                <div key={module.module_key} className="border rounded-lg p-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{module.module_name}</span>
                                    <Badge variant="outline">{Math.round(module.progress_percentage)}%</Badge>
                                  </div>
                                  <div className="mt-2">
                                    <Progress value={module.progress_percentage} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.notes && (
                          <p className="text-xs text-gray-500">{member.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {teamMembers.length === 0 && (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keine Mitglieder</h3>
                    <p className="text-gray-600">
                      Fügen Sie Residents zu diesem Team hinzu.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Team auswählen</h3>
                <p className="text-gray-600">
                  Wählen Sie ein Team aus, um die Mitglieder zu sehen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamManagement;

