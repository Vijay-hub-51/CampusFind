import express from 'express'; import cors from 'cors'; import dotenv from 'dotenv'; import mongoose from 'mongoose'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken';
import User from './models/User.js'; import Item from './models/Item.js'; import Claim from './models/Claim.js'; import {auth,admin} from './middleware/auth.js'; import {matchScore} from './utils/match.js';
dotenv.config(); const app=express();
const allowedOrigins=(process.env.CLIENT_URLS||process.env.CLIENT_URL||'http://localhost:5173')
  .split(',')
  .map(origin=>origin.trim().replace(/\/+$/,''))
  .filter(Boolean);
app.use(cors({origin:(origin,callback)=>{
  // Allow non-browser requests (for example health checks) without an Origin header.
  if(!origin||allowedOrigins.includes(origin.replace(/\/+$/,'')))return callback(null,true);
  return callback(new Error('Not allowed by CORS'));
}}));
app.use(express.json());
const tokenFor=u=>jwt.sign({id:u._id,role:u.role,name:u.name,email:u.email},process.env.JWT_SECRET,{expiresIn:'7d'});
app.get('/api/health',(_,res)=>res.json({ok:true,app:'CampusFind'}));
app.post('/api/auth/register',async(req,res)=>{try{const {name,email,password,studentId,department,year}=req.body;if(!name||!email||!password)return res.status(400).json({message:'Name, email and password are required'});if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});const u=await User.create({name,email,password:await bcrypt.hash(password,10),studentId,department,year});res.status(201).json({token:tokenFor(u),user:{id:u._id,name:u.name,email:u.email,role:u.role}})}catch(e){res.status(500).json({message:e.message})}});
app.post('/api/auth/login',async(req,res)=>{try{const u=await User.findOne({email:req.body.email});if(!u||!(await bcrypt.compare(req.body.password,u.password)))return res.status(401).json({message:'Invalid email or password'});res.json({token:tokenFor(u),user:{id:u._id,name:u.name,email:u.email,role:u.role}})}catch(e){res.status(500).json({message:e.message})}});
app.get('/api/items',async(req,res)=>{try{const q={status:'active'};if(req.query.type&&req.query.type!=='all')q.type=req.query.type;if(req.query.category&&req.query.category!=='all')q.category=req.query.category;if(req.query.search)q.$or=[{title:new RegExp(req.query.search,'i')},{description:new RegExp(req.query.search,'i')},{location:new RegExp(req.query.search,'i')}];const items=await Item.find(q).populate('reportedBy','name department').sort({createdAt:-1});res.json(items)}catch(e){res.status(500).json({message:e.message})}});app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate(
        'reportedBy',
        'name email department studentId'
      );

    if (!item) {
      return res.status(404).json({
        message: 'Item not found'
      });
    }

    res.json(item);

  } catch (e) {
    res.status(400).json({
      message: 'Invalid item ID'
    });
  }
});
app.post('/api/items',auth,async(req,res)=>{try{const item=await Item.create({...req.body,reportedBy:req.user.id,status:req.user.role==='admin'?'active':'pending'});res.status(201).json(item)}catch(e){res.status(400).json({message:e.message})}});
app.get('/api/items/matches/:id',auth,async(req,res)=>{const item=await Item.findById(req.params.id);if(!item)return res.status(404).json({message:'Item not found'});const opposite=await Item.find({type:item.type==='lost'?'found':'lost',status:'active'}).lean();const matches=opposite.map(x=>({...x,score:matchScore(item,x)})).filter(x=>x.score>=40).sort((a,b)=>b.score-a.score).slice(0,10);res.json(matches)});

app.post(
  '/api/claims',
  auth,
  async (req, res) => {
    try {
      const { item, answer } = req.body;

      // 1. Validate required fields
      if (
        !item ||
        typeof answer !== 'string' ||
        !answer.trim()
      ) {
        return res.status(400).json({
          message:
            'Item and verification answer are required',
        });
      }

      // 2. Check whether the item exists
      const foundItem = await Item.findById(item);

      if (!foundItem) {
        return res.status(404).json({
          message: 'Item not found',
        });
      }

      // 3. Only found items can be claimed
      if (foundItem.type !== 'found') {
        return res.status(400).json({
          message: 'Only found items can be claimed',
        });
      }

      // 4. Only active items can be claimed
      if (foundItem.status !== 'active') {
        return res.status(400).json({
          message:
            'This item is not available for claiming',
        });
      }

      // 5. Prevent duplicate claims by the same user
      const existingClaim = await Claim.findOne({
        item: foundItem._id,
        claimant: req.user.id,
      });

      if (existingClaim) {
        return res.status(409).json({
          message:
            'You have already submitted a claim for this item',
        });
      }

      // 6. Create the claim
      const claim = await Claim.create({
        item: foundItem._id,
        claimant: req.user.id,
        answer: answer.trim(),
      });

      return res.status(201).json(claim);
    } catch (e) {
      console.error('Failed to create claim:', e.message);

      return res.status(400).json({
        message: e.message,
      });
    }
  }
);
// Admin - Get all claims
app.get('/api/admin/claims',auth,admin,async(_,res)=>{
  try{
    const claims=await Claim.find()
      .populate(
        'item',
        'title type category location status'
      )
      .populate(
        'claimant',
        'name email studentId department'
      )
      .sort({createdAt:-1});

    console.log(
      'ADMIN CLAIMS FOUND:',
      claims.length
    );

    res.json(claims);

  }catch(e){
    console.error(
      'Failed to load claims:',
      e.message
    );

    res.status(500).json({
      message:e.message
    });
  }
});


// Admin - Approve or reject claim
app.patch('/api/admin/claims/:id',auth,admin,async(req,res)=>{
  try{
    const {status}=req.body;

    if(!['approved','rejected'].includes(status)){
      return res.status(400).json({
        message:'Status must be approved or rejected'
      });
    }

    const claim=await Claim.findById(
      req.params.id
    );

    if(!claim){
      return res.status(404).json({
        message:'Claim not found'
      });
    }

    claim.status=status;

    await claim.save();

    // When approved, mark the item as returned
    
if (status === 'approved') {
  // Mark the item as returned
  await Item.findByIdAndUpdate(
    claim.item,
    {
      status: 'returned',
    }
  );

  // Reject all other pending claims for this item
  await Claim.updateMany(
    {
      item: claim.item,
      _id: { $ne: claim._id },
      status: 'pending',
    },
    {
      $set: {
        status: 'rejected',
      },
    }
  );
}

    const updatedClaim=
      await Claim.findById(claim._id)
        .populate(
          'item',
          'title type category location status'
        )
        .populate(
          'claimant',
          'name email studentId department'
        );

    res.json(updatedClaim);

  }catch(e){
    console.error(
      'Failed to update claim:',
      e.message
    );

    res.status(400).json({
      message:e.message
    });
  }
});
app.get('/api/my-items',auth,async(req,res)=>res.json(await Item.find({reportedBy:req.user.id}).sort({createdAt:-1})));
// ======================================================
// MY CLAIMS
// ======================================================

app.get(
  '/api/my-claims',
  auth,
  async (req, res) => {
    try {
      const claims =
        await Claim.find({
          claimant: req.user.id
        })
          .populate(
            'item',
            'title type category location status'
          )
          .sort({
            createdAt: -1
          });

      res.json(claims);

    } catch (e) {
      res.status(500).json({
        message: e.message
      });
    }
  }
);
app.get('/api/admin/stats',auth,admin,async(_,res)=>{const [lost,found,returned,users,pending]=await Promise.all([Item.countDocuments({type:'lost'}),Item.countDocuments({type:'found'}),Item.countDocuments({status:'returned'}),User.countDocuments(),Item.countDocuments({status:'pending'})]);res.json({lost,found,returned,users,pending})});
app.get('/api/admin/items',auth,admin,async(_,res)=>res.json(await Item.find().populate('reportedBy','name email').sort({createdAt:-1})));
app.patch('/api/admin/items/:id',auth,admin,async(req,res)=>{const item=await Item.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});res.json(item)});
const port=process.env.PORT||5000;mongoose.connect(process.env.MONGO_URI).then(()=>app.listen(port,()=>console.log(`CampusFind API running on ${port}`))).catch(e=>{console.error('MongoDB connection failed:',e.message);process.exit(1)});
