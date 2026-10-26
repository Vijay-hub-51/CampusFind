import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function auth(req,res,next){ try { const token=req.headers.authorization?.split(' ')[1]; if(!token) return res.status(401).json({message:'Authentication required'}); const payload=jwt.verify(token,process.env.JWT_SECRET); const user=await User.findById(payload.id).select('name email role'); if(!user)return res.status(401).json({message:'User no longer exists'}); req.user={...payload,name:user.name,email:user.email,role:user.role}; next(); } catch { res.status(401).json({message:'Invalid or expired token'}); } }
export function admin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({message:'Admin access required'}); next(); }
