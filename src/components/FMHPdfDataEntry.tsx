import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCopy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { fmhPdfModules, FMHPdfModule, FMHPdfProcedure } from '@/data/fmhPdfData';

type ProcedureInputKeys = 'responsible' | 'instructing' | 'assistant' | 'total';

type ProcedureState = FMHPdfProcedure & {
  values: Record<ProcedureInputKeys, string>;
};

type ModuleState = Omit<FMHPdfModule, 'procedures'> & {
  procedures: ProcedureState[];
};

interface FMHPdfDataEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sanitizeNumericInput = (value: string) => value.replace(/[^0-9]/g, '');

const toNumber = (value: string): number => {
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toNumberOrNull = (value: string): number | null => {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const buildInitialState = (): ModuleState[] =>
  fmhPdfModules.map((module) => ({
    ...module,
    procedures: module.procedures.map((procedure) => ({
      ...procedure,
      values: {
        responsible: procedure.responsible != null ? String(procedure.responsible) : '',
        instructing: procedure.instructing != null ? String(procedure.instructing) : '',
        assistant: procedure.assistant != null ? String(procedure.assistant) : '',
        total: procedure.total != null ? String(procedure.total) : '',
      },
    })),
  }));

const computeModuleSummary = (module: ModuleState) =>
  module.procedures.reduce(
    (acc, procedure) => {
      const responsible = toNumber(procedure.values.responsible);
      const instructing = toNumber(procedure.values.instructing);
      const assistant = toNumber(procedure.values.assistant);
      const reported = procedure.values.total ? toNumber(procedure.values.total) : 0;

      return {
        responsible: acc.responsible + responsible,
        instructing: acc.instructing + instructing,
        assistant: acc.assistant + assistant,
        reportedTotal: acc.reportedTotal + reported,
        computedTotal: acc.computedTotal + responsible + instructing + assistant,
      };
    },
    { responsible: 0, instructing: 0, assistant: 0, reportedTotal: 0, computedTotal: 0 }
  );

export const FMHPdfDataEntry: React.FC<FMHPdfDataEntryProps> = ({ open, onOpenChange }) => {
  const [moduleState, setModuleState] = useState<ModuleState[]>(() => buildInitialState());

  const handleInputChange = (
    moduleKey: string,
    procedureIndex: number,
    field: ProcedureInputKeys,
    value: string,
  ) => {
    const cleaned = sanitizeNumericInput(value);
    setModuleState((prev) =>
      prev.map((module) => {
        if (module.key !== moduleKey) return module;
        return {
          ...module,
          procedures: module.procedures.map((procedure, index) =>
            index === procedureIndex
              ? {
                  ...procedure,
                  values: {
                    ...procedure.values,
                    [field]: cleaned,
                  },
                }
              : procedure
          ),
        };
      })
    );
  };

  const handleReset = () => setModuleState(buildInitialState());

  const handleExport = async () => {
    const payload = moduleState.map((module) => ({
      key: module.key,
      name: module.name,
      minimumRequired: module.minimumRequired,
      entries: module.procedures.map((procedure) => ({
        code: procedure.code,
        name: procedure.name,
        minimum: procedure.minimum,
        responsible: toNumberOrNull(procedure.values.responsible),
        instructing: toNumberOrNull(procedure.values.instructing),
        assistant: toNumberOrNull(procedure.values.assistant),
        total: toNumberOrNull(procedure.values.total),
        computedTotal:
          toNumber(procedure.values.responsible) +
          toNumber(procedure.values.instructing) +
          toNumber(procedure.values.assistant),
      })),
    }));

    const json = JSON.stringify(payload, null, 2);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(json);
        toast.success('FMH PDF Daten wurden in die Zwischenablage kopiert.');
      } else {
        console.info('FMH PDF Daten', payload);
        toast.success('FMH PDF Daten wurden in der Konsole ausgegeben.');
      }
    } catch (error) {
      console.error('Clipboard error', error);
      toast.error('Die Daten konnten nicht kopiert werden.');
    }
  };

  const summaries = useMemo(
    () => moduleState.map((module) => computeModuleSummary(module)),
    [moduleState]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">FMH PDF Daten erfassen</DialogTitle>
          <DialogDescription>
            Erfassen und überprüfen Sie die Fallzahlen aus dem FMH eLogbuch-PDF direkt in der App.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-muted/40">
            <AlertTitle>Hinweis</AlertTitle>
            <AlertDescription>
              Die initialen Werte stammen aus dem bereitgestellten FMH PDF-Datensatz. Sie können Zahlen
              je Prozedur anpassen, die Summe kontrollieren und anschliessend als JSON exportieren.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Auf PDF-Werte zurücksetzen
            </Button>
            <Button size="sm" onClick={handleExport} className="gap-2">
              <ClipboardCopy className="w-4 h-4" />
              JSON exportieren
            </Button>
          </div>

          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-4">
              {moduleState.map((module, moduleIndex) => {
                const summary = summaries[moduleIndex];
                const effectiveTotal = summary.reportedTotal || summary.computedTotal;
                const progress =
                  module.minimumRequired && module.minimumRequired > 0
                    ? Math.round((effectiveTotal / module.minimumRequired) * 100)
                    : null;

                return (
                  <Card key={module.key} className="shadow-sm">
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{module.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          FMH Mindestanforderung: {module.minimumRequired ?? '—'} Eingriffe
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        <Badge variant="outline">Rollen-Summe {summary.computedTotal}</Badge>
                        <Badge variant="outline">Total-Spalte {summary.reportedTotal}</Badge>
                        <Badge variant={progress !== null && progress >= 100 ? 'default' : 'secondary'}>
                          {progress !== null ? `${progress}% des Minimums` : 'Kein Minimum definiert'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[720px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[320px]">Prozedur</TableHead>
                              <TableHead className="w-28">Minimum</TableHead>
                              <TableHead className="w-28">Verantwortlich</TableHead>
                              <TableHead className="w-28">Instruierend</TableHead>
                              <TableHead className="w-28">Assistent</TableHead>
                              <TableHead className="w-32">Total (optional)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {module.procedures.map((procedure, procedureIndex) => {
                              const responsible = toNumber(procedure.values.responsible);
                              const instructing = toNumber(procedure.values.instructing);
                              const assistant = toNumber(procedure.values.assistant);
                              const computedSum = responsible + instructing + assistant;
                              const totalValue = toNumberOrNull(procedure.values.total);
                              const totalDifference =
                                totalValue !== null ? totalValue - computedSum : null;

                              return (
                                <TableRow key={procedure.code || `${module.key}-${procedureIndex}`}>
                                  <TableCell className="align-top">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="whitespace-nowrap">
                                          {procedure.code}
                                        </Badge>
                                        <span className="font-medium leading-tight">{procedure.name}</span>
                                      </div>
                                      {procedure.minimum != null && (
                                        <p className="text-[11px] text-muted-foreground">
                                          PDF-Minimum: {procedure.minimum}
                                        </p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    {procedure.minimum != null ? procedure.minimum : '—'}
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <Input
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={procedure.values.responsible}
                                      onChange={(event) =>
                                        handleInputChange(
                                          module.key,
                                          procedureIndex,
                                          'responsible',
                                          event.target.value,
                                        )
                                      }
                                      className="max-w-[100px]"
                                    />
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <Input
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={procedure.values.instructing}
                                      onChange={(event) =>
                                        handleInputChange(
                                          module.key,
                                          procedureIndex,
                                          'instructing',
                                          event.target.value,
                                        )
                                      }
                                      className="max-w-[100px]"
                                    />
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <Input
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={procedure.values.assistant}
                                      onChange={(event) =>
                                        handleInputChange(
                                          module.key,
                                          procedureIndex,
                                          'assistant',
                                          event.target.value,
                                        )
                                      }
                                      className="max-w-[100px]"
                                    />
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <Input
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={procedure.values.total}
                                      onChange={(event) =>
                                        handleInputChange(
                                          module.key,
                                          procedureIndex,
                                          'total',
                                          event.target.value,
                                        )
                                      }
                                      placeholder={`${computedSum}`}
                                      className="max-w-[110px]"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                      Summe Rollen: {computedSum}
                                      {totalDifference !== null && totalDifference !== 0 && (
                                        <span className="ml-1 text-destructive">
                                          (Abweichung {totalDifference > 0 ? '+' : ''}
                                          {totalDifference})
                                        </span>
                                      )}
                                    </p>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
