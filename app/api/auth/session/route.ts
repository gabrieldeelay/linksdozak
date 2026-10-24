import { NextResponse } from 'next/server';
import { authenticated } from '@/lib/auth';
import { storageMode } from '@/lib/store';
export async function GET(){return NextResponse.json({authenticated:await authenticated(),storage:storageMode()},{headers:{'Cache-Control':'no-store'}});}
