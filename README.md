# AI Medical Imaging Assistant

## Overview
AI system to detect brain tumors from MRI images.

## Features
- Upload MRI image
- CNN-based prediction
- Confidence score
- Real-time API

## Tech Stack
- FastAPI
- TensorFlow (CNN)
- Next.js

## Run

### Backend
cd backend
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## Disclaimer
Educational project only.