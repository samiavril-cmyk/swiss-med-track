import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Kontakt aufnehmen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Vorname" />
                <Input placeholder="Nachname" />
              </div>
              <Input type="email" placeholder="E-Mail" />
              <Input placeholder="Betreff" />
              <Textarea placeholder="Ihre Nachricht" className="min-h-[140px]" />
              <Button className="w-full">Nachricht senden</Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="medical-card overflow-hidden">
              <img 
                src="https://samiavril-cmyk.github.io/swiss-med-track/residents-image-2.png"
                alt="Kontakt - ResidentTrack"
                className="w-full h-56 object-cover"
              />
              <CardContent className="pt-4">
                <p className="text-muted-foreground">
                  Wir freuen uns auf Ihre Nachricht. Unser Team meldet sich in der Regel innerhalb von 24 Stunden.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card overflow-hidden">
              <img 
                src="https://samiavril-cmyk.github.io/swiss-med-track/awardsresidents2-image.png"
                alt="Unser Team"
                className="w-full h-56 object-cover"
              />
              <CardContent className="pt-4">
                <p className="text-muted-foreground">
                  ResidentTrack – entwickelt von Chirurg:innen für Chirurg:innen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;


