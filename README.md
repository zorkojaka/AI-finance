# Projektna struktura in inicializacija

## FAZA 1: Osnovna struktura

### 1️⃣ Inicializacija projektnih map
- Ustvarjene so bile osnovne mape projekta:
  - `/backend`
  - `/frontend`
  - `/docs`
  - `/data`

### 2️⃣ Inicializacija git repozitorija
- Git repozitorij je inicializiran v korenski mapi projekta.
- Prvi commit pokriva strukturo map in osnovno vsebino.

### 3️⃣ Inicializacija backend okolja
- V `/backend` izveden `npm init -y`.
- Nameščen Express: `npm install express`.
- Ustvarjen je `index.js` z Express strežnikom:
  - Endpoint `GET /api/health` vrača `{ "status": "OK" }`
- Testirano: dostopno na [http://localhost:3000/api/health](http://localhost:3000/api/health).

### 4️⃣ Inicializacija frontend okolja
- V `/frontend` zagnan `npm create vite@latest` (React + JavaScript).
- Izveden je bil `npm install`.
- Testirano: ob zagonu `npm run dev` je na [http://localhost:5173](http://localhost:5173) prikazana začetna "Vite + React" stran.

---

_Nadaljevanje: uvedba React Routerja in osnovnih strani z navigacijo._
