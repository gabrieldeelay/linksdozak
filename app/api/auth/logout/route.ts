import { NextResponse } from 'next/server';
import { cookieName,sameOrigin,sessionOptions } from '@/lib/auth';
export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:'Origem inválida.'},{status:403});const res=NextResponse.json({ok:true});res.cookies.set(cookieName,'',{...sessionOptions,maxAge:0});return res;}
