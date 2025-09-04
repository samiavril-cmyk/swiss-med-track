# 🏥 Sample Users für Supervisor System

## 👨‍⚕️ **Supervisors (Vorgesetzte)**

### Dr. Jose Martinez
- **Email:** `jose.martinez@hospital.ch`
- **Password:** `password123`
- **Rolle:** Supervisor
- **Abteilung:** Allgemeinchirurgie
- **Krankenhaus:** Universitätsspital Zürich
- **Team:** Allgemeinchirurgie Team A (5 Residents)

### Prof. Dr. Matthias Weber
- **Email:** `matthias.weber@hospital.ch`
- **Password:** `password123`
- **Rolle:** Supervisor
- **Abteilung:** Traumatologie
- **Krankenhaus:** Universitätsspital Basel
- **Team:** Traumatologie Team B (5 Residents)

---

## 👩‍⚕️ **Residents (Jose's Team - Allgemeinchirurgie)**

### Dr. Anna Schmidt
- **Email:** `anna.schmidt@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 3
- **Supervisor:** Dr. Jose Martinez
- **Notizen:** Sehr motiviert, gute technische Fähigkeiten

### Dr. Michael Müller
- **Email:** `michael.mueller@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 4
- **Supervisor:** Dr. Jose Martinez
- **Notizen:** Erfahren in laparoskopischen Eingriffen

### Dr. Sarah Johnson
- **Email:** `sarah.johnson@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 2
- **Supervisor:** Dr. Jose Martinez
- **Notizen:** Starke Kommunikationsfähigkeiten

### Dr. Thomas Brown
- **Email:** `thomas.brown@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 5
- **Supervisor:** Dr. Jose Martinez
- **Notizen:** Senior Resident, bereit für komplexe Fälle

### Dr. Lisa Garcia
- **Email:** `lisa.garcia@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 3
- **Supervisor:** Dr. Jose Martinez
- **Notizen:** Gute Teamplayerin, zuverlässig

---

## 👨‍⚕️ **Residents (Matthias's Team - Traumatologie)**

### Dr. David Wilson
- **Email:** `david.wilson@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 4
- **Supervisor:** Prof. Dr. Matthias Weber
- **Notizen:** Spezialist für Beckenfrakturen

### Dr. Emma Davis
- **Email:** `emma.davis@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 2
- **Supervisor:** Prof. Dr. Matthias Weber
- **Notizen:** Begabt in der Arthroskopie

### Dr. James Miller
- **Email:** `james.miller@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 3
- **Supervisor:** Prof. Dr. Matthias Weber
- **Notizen:** Starke anatomische Kenntnisse

### Dr. Maria Rodriguez
- **Email:** `maria.rodriguez@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 5
- **Supervisor:** Prof. Dr. Matthias Weber
- **Notizen:** Erfahren in der Notfallchirurgie

### Dr. Robert Taylor
- **Email:** `robert.taylor@hospital.ch`
- **Password:** `password123`
- **PGY Level:** 1
- **Supervisor:** Prof. Dr. Matthias Weber
- **Notizen:** Neuer Resident, vielversprechend

---

## 📊 **Sample Data Features**

### ✅ **Prozeduren (2023-2025)**
- **20-50 Prozeduren pro Resident** über 3 Jahre
- **Verschiedene Rollen:** Primary, Responsible, Instructing, Assistant
- **FMH Module:** Basis Allgemeinchirurgie, Traumatologie, Viszeralchirurgie
- **Realistische Datenverteilung** basierend auf PGY Level

### ✅ **Teams & Management**
- **2 Teams** mit je 5 Residents
- **Team-Notizen** für jeden Resident
- **Supervisor-Berichte** mit Fortschrittsbewertungen
- **Abteilungs- und Krankenhaus-Zuordnung**

### ✅ **Fortschrittsverfolgung**
- **Echtzeit-Statistiken** pro FMH-Modul
- **Gewichtete Bewertungen** basierend auf Rollen
- **Fortschritts-Prozente** und Mindestanforderungen
- **Letzte Aktivitäten** und Trends

---

## 🚀 **Testing Instructions**

### 1. **Supervisor Login**
```
Email: jose.martinez@hospital.ch
Password: password123
→ Navigate to /supervisor
```

### 2. **Resident Login**
```
Email: anna.schmidt@hospital.ch
Password: password123
→ Navigate to /dashboard (Profile Settings)
```

### 3. **Features to Test**
- ✅ Supervisor Dashboard mit Team-Übersicht
- ✅ Team Management (Teams erstellen, Residents hinzufügen)
- ✅ Fortschrittsverfolgung pro FMH-Modul
- ✅ Resident-Profile mit Supervisor-Auswahl
- ✅ Echtzeit-Statistiken und Analytics

---

## 📈 **Expected Results**

### **Jose's Team (Allgemeinchirurgie)**
- **5 Residents** mit verschiedenen PGY Levels
- **~150-250 Prozeduren** insgesamt
- **Fokus auf:** Appendektomie, Cholezystektomie, Hernienoperationen

### **Matthias's Team (Traumatologie)**
- **5 Residents** mit verschiedenen PGY Levels
- **~150-250 Prozeduren** insgesamt
- **Fokus auf:** Frakturen, Arthroskopie, Osteosynthese

### **Supervisor Analytics**
- **Team-Statistiken** mit Fortschritts-Prozente
- **Individual Reports** pro Resident
- **Gap Analysis** für fehlende Prozeduren
- **Trends** über 2023-2025

---

## 🔧 **Database Migrations**

Führe diese Migrations in Supabase aus:
1. `20250125000003_supervisor_system.sql` - Supervisor System
2. `20250125000004_sample_data.sql` - Sample Data
3. `20250125000005_sample_auth_users.sql` - Auth Users

**Alle User haben das gleiche Passwort:** `password123`
