import jwt from 'jsonwebtoken';
export function auth(req,res,next){ try { const token=req.headers.authorization?.split(' ')[1]; if(!token) return res.status(401).json({message:'Authentication required'}); req.user=jwt.verify(token,process.env.JWT_SECRET); next(); } catch { res.status(401).json({message:'Invalid or expired token'}); } }
export function admin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({message:'Admin access required'}); next(); }
