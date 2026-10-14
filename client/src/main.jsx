import React,{useEffect,useState} from 'react'; import {createRoot} from 'react-dom/client'; import {BrowserRouter,useNavigate,useLocation,Routes,Route,Link} from 'react-router-dom'; import axios from 'axios'; import {Search,PlusCircle,PackageSearch,ShieldCheck,MapPin,CalendarDays,ArrowRight,LogIn,UserPlus,LayoutDashboard,CheckCircle2,Clock3,Menu,X} from 'lucide-react'; import './styles.css';
const API='http://localhost:5000/api'; const api=axios.create({baseURL:API});
function useAuth(){const [u,setU]=useState(()=>JSON.parse(localStorage.getItem('campusfind_user')||'null'));const login=(data)=>{localStorage.setItem('campusfind_token',data.token);localStorage.setItem('campusfind_user',JSON.stringify(data.user));setU(data.user)};const logout=()=>{localStorage.clear();setU(null)};return {u,login,logout}}
function Nav(){const {u,logout}=useAuth();const [open,setOpen]=useState(false);return <header><div className="nav wrap"><Link className="brand" to="/"><span className="brandmark">CF</span> CampusFind</Link><button className="mobile" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav className={open?'show':''}><Link to="/browse">Browse</Link>{u && (
  <>
    <Link to="/report">
      Report Item
    </Link>

    <Link to="/activity">
      My Activity
    </Link>
  </>
)}{u?.role==='admin'&&<Link to="/admin">Admin</Link>}{u?<><span className="hello">Hi, {u.name.split(' ')[0]}</span><button className="ghost" onClick={logout}>Logout</button></>:<><Link to="/login">Login</Link><Link className="navcta" to="/register">Get Started</Link></>}</nav></div></header>}
const demo=[{_id:'1',type:'lost',title:'Black HP Laptop',category:'Electronics',description:'HP laptop with a small blue sticker near the touchpad.',color:'Black',brand:'HP',location:'MCA Block',date:'2026-09-28',status:'active',reportedBy:{name:'Student'}},{_id:'2',type:'found',title:'Blue Water Bottle',category:'Accessories',description:'Steel bottle found near the library entrance.',color:'Blue',brand:'Milton',location:'Library',date:'2026-09-27',status:'active',reportedBy:{name:'Student'}},{_id:'3',type:'lost',title:'Black Wallet',category:'Accessories',description:'Leather wallet, personal cards inside.',color:'Black',brand:'',location:'Canteen',date:'2026-09-28',status:'active',reportedBy:{name:'Student'}}];
function Home(){return <><section className="hero"><div className="wrap heroGrid"><div><div className="pill">🎓 Built for campuses</div><h1>Lost something?<br/><em>Let's find it.</em></h1><p>CampusFind connects students and staff to report, discover and safely recover lost belongings across campus.</p><div className="actions"><Link className="btn primary" to="/report">Report an item <ArrowRight size={17}/></Link><Link className="btn secondary" to="/browse">Browse items</Link></div><div className="trust"><ShieldCheck size={18}/> Verified reports · Secure claims · Campus focused</div></div><div className="heroCard"><div className="cardTop"><span>Live campus activity</span><span className="live"><i/> Live</span></div><div className="activity"><div className="iconBox lost">!</div><div><b>Black Wallet</b><small>Reported lost · Canteen</small></div><span>2h</span></div><div className="activity"><div className="iconBox found">✓</div><div><b>Blue Water Bottle</b><small>Found · Library</small></div><span>5h</span></div><div className="match"><CheckCircle2/><div><b>Possible match found</b><small>Our matching engine compares location, date, category, color & brand.</small></div></div></div></div></section><section className="wrap section"><div className="sectionHead"><div><span className="eyebrow">HOW IT WORKS</span><h2>From lost to found in three steps.</h2></div></div><div className="steps"><Step n="01" icon={<PlusCircle/>} title="Report" text="Tell the campus what you lost or found with key details and a photo."/><Step n="02" icon={<PackageSearch/>} title="Match" text="CampusFind compares reports and surfaces likely matches automatically."/><Step n="03" icon={<ShieldCheck/>} title="Recover" text="Submit a claim, verify ownership and safely return the item."/></div></section><section className="darkSection"><div className="wrap"><div className="sectionHead light"><div><span className="eyebrow">RECENT REPORTS</span><h2>See what's happening on campus.</h2></div><Link to="/browse" className="textLink">View all <ArrowRight size={16}/></Link></div><div className="grid3">{demo.map(i=><ItemCard key={i._id} item={i}/>)}</div></div></section></>}
function Step({n,icon,title,text}){return <div className="step"><span>{n}</span><div className="stepIcon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      className="itemCard"
      onClick={() => navigate(`/items/${item._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          navigate(`/items/${item._id}`);
        }
      }}
    >
      <div className={'itemImage ' + item.type}>
        {item.type === 'lost' ? 'LOST' : 'FOUND'}
      </div>

      <div className="itemBody">

        <div className="meta">
          <span className={item.type}>
            {item.type}
          </span>

          <span>{item.category}</span>
        </div>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <div className="itemFoot">

          <span>
            <MapPin size={14} />
            {item.location}
          </span>

          <span>
            <CalendarDays size={14} />

            {new Date(
              item.date || item.createdAt
            ).toLocaleDateString()}
          </span>

        </div>

      </div>
    </div>
  );
}
function Browse(){const [items,setItems]=useState(demo),[q,setQ]=useState(''),[type,setType]=useState('all'),[loading,setLoading]=useState(true);useEffect(()=>{let c=false;api.get('/items',{params:{search:q,type}}).then(r=>{if(!c)setItems(r.data.length?r.data:[])}).catch(()=>{}).finally(()=>!c&&setLoading(false));return()=>c=true},[q,type]);return <main className="wrap page"><div className="pageHead"><div><span className="eyebrow">CAMPUS BOARD</span><h1>Browse reports</h1><p>Find a lost or found item reported by your campus community.</p></div><Link className="btn primary" to="/report"><PlusCircle size={17}/> Report item</Link></div><div className="filters"><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search item, location or description..."/></div><div className="tabs">{['all','lost','found'].map(x=><button className={type===x?'active':''} onClick={()=>setType(x)} key={x}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div></div>{loading?<div className="empty">Loading reports...</div>:items.length?<div className="grid3">{items.map(i=><ItemCard key={i._id} item={i}/>)}</div>:<div className="empty"><PackageSearch size={38}/><h3>No reports found</h3><p>Try another search or report the item yourself.</p></div>}</main>}
function ItemDetails() {
  const { u } = useAuth();
  const { pathname } = useLocation();

  const id = pathname.split('/').pop();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchSearched, setMatchSearched] = useState(false);
  const [error, setError] = useState('');

  // Claim states
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const response = await api.get(`/items/${id}`);
        setItem(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load item.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const findMatches = async () => {
    if (!u) {
      alert('Please login to find possible matches.');
      return;
    }

    try {
      setMatchLoading(true);
      setMatchSearched(false);
      setMatches([]);

      const token = localStorage.getItem(
        'campusfind_token'
      );

      const response = await api.get(
        `/items/matches/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMatches(response.data);
      setMatchSearched(true);

    } catch (err) {
      console.error('Match search failed:', err);

      setMatchSearched(true);

      alert(
        err.response?.data?.message ||
        'Unable to find matches.'
      );
    } finally {
      setMatchLoading(false);
    }
  };

  // Submit claim
  const submitClaim = async (e) => {
    e.preventDefault();

    if (!u) {
      alert('Please login to claim this item.');
      return;
    }

    if (!claimAnswer.trim()) {
      setClaimMessage(
        'Please provide verification details.'
      );
      return;
    }

    try {
      setClaimLoading(true);
      setClaimMessage('');

      const token = localStorage.getItem(
        'campusfind_token'
      );

      await api.post(
        '/claims',
        {
          item: id,
          answer: claimAnswer.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClaimSubmitted(true);
      setClaimMessage(
        'Your claim has been submitted successfully. An administrator will review it.'
      );
      setClaimAnswer('');

    } catch (err) {
      console.error('Claim submission failed:', err);

      setClaimMessage(
        err.response?.data?.message ||
        'Unable to submit your claim.'
      );
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="wrap page">
        <div className="empty">
          Loading item...
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="wrap page">
        <div className="empty">
          <PackageSearch size={40} />

          <h2>Item not found</h2>

          <p>{error}</p>

          <Link
            to="/browse"
            className="btn primary"
          >
            Back to Browse
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap page">

      <Link
        to="/browse"
        className="backLink"
      >
        ← Back to Browse
      </Link>

      <div className="detailsGrid">

        <div className="detailsImage">

          <div
            className={`largeItemImage ${item.type}`}
          >
            {item.type === 'lost'
              ? 'LOST ITEM'
              : 'FOUND ITEM'}
          </div>

        </div>

        <div className="detailsContent">

          <div className="meta">

            <span className={item.type}>
              {item.type}
            </span>

            <span>
              {item.category}
            </span>

          </div>

          <h1>{item.title}</h1>

          <p className="detailsDescription">
            {item.description ||
              'No description provided.'}
          </p>

          <div className="detailsInfo">

            <div>
              <MapPin size={18} />

              <div>
                <small>Location</small>
                <strong>{item.location}</strong>
              </div>
            </div>

            <div>
              <CalendarDays size={18} />

              <div>
                <small>Date</small>

                <strong>
                  {new Date(
                    item.date || item.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div>
              <PackageSearch size={18} />

              <div>
                <small>Category</small>
                <strong>{item.category}</strong>
              </div>
            </div>

            {item.brand && (
              <div>
                <ShieldCheck size={18} />

                <div>
                  <small>Brand</small>
                  <strong>{item.brand}</strong>
                </div>
              </div>
            )}

            {item.color && (
              <div>

                <span className="detailDot"></span>

                <div>
                  <small>Color</small>
                  <strong>{item.color}</strong>
                </div>

              </div>
            )}

          </div>

          <div className="reportedBy">

            <small>Reported by</small>

            <strong>
              {item.reportedBy?.name ||
                'Campus member'}
            </strong>

            {item.reportedBy?.department && (
              <span>
                {item.reportedBy.department}
              </span>
            )}

          </div>

          {/* Find Possible Matches */}
          {u && (
            <button
              className="btn primary"
              onClick={findMatches}
              disabled={matchLoading}
            >
              <Search size={17} />

              {matchLoading
                ? 'Finding matches...'
                : 'Find Possible Matches'}
            </button>
          )}

        </div>

      </div>

      {/* Claim This Item - FOUND ITEMS ONLY */}
      {item.type === 'found' && (
        <section className="matchSection">

          <div className="sectionHead">

            <div>
              <span className="eyebrow">
                ITEM RECOVERY
              </span>

              <h2>
                Is this your item?
              </h2>

              <p>
                Submit a claim with details that
                can help verify that the item belongs
                to you.
              </p>
            </div>

          </div>

          {!u ? (
            <div className="matchEmpty">

              <LogIn size={22} />

              <div>
                <strong>
                  Login to claim this item
                </strong>

                <p>
                  Please login to submit a claim
                  for this found item.
                </p>
              </div>

            </div>
          ) : claimSubmitted ? (

            <div className="matchEmpty">

              <CheckCircle2 size={22} />

              <div>
                <strong>
                  Claim submitted successfully
                </strong>

                <p>
                  Your claim has been submitted
                  for administrator review.
                </p>
              </div>

            </div>

          ) : (

            <form
              className="reportCard"
              onSubmit={submitClaim}
            >

              <label>
                Verification details

                <textarea
                  rows="5"
                  value={claimAnswer}
                  onChange={(e) =>
                    setClaimAnswer(e.target.value)
                  }
                  placeholder="Describe a unique detail that proves this item belongs to you. For example, a sticker, scratch, serial number, or something inside the item."
                  required
                />

              </label>

              {claimMessage && (
                <div
                  className={
                    claimSubmitted
                      ? 'success'
                      : 'error'
                  }
                >
                  {claimMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn primary"
                disabled={claimLoading}
              >
                <ShieldCheck size={17} />

                {claimLoading
                  ? 'Submitting claim...'
                  : 'Submit Claim'}
              </button>

            </form>

          )}

        </section>
      )}

      {/* Possible Matches */}
      {matches.length > 0 && (

        <section className="matchSection">

          <div className="sectionHead">

            <div>
              <span className="eyebrow">
                SMART MATCHING
              </span>

              <h2>
                Possible matches
              </h2>

              <p>
                These reports have similar
                characteristics.
              </p>
            </div>

          </div>

          <div className="grid3">

            {matches.map(match => (

              <div
                className="matchCard"
                key={match._id}
              >

                <div className="matchScore">
                  {match.score}% Match
                </div>

                <div className="meta">

                  <span className={match.type}>
                    {match.type}
                  </span>

                  <span>
                    {match.category}
                  </span>

                </div>

                <h3>{match.title}</h3>

                <p>
                  {match.description}
                </p>

                <div className="itemFoot">

                  <span>
                    <MapPin size={14} />
                    {match.location}
                  </span>

                  <span>
                    <CalendarDays size={14} />

                    {new Date(
                      match.date ||
                      match.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

                <Link
                  to={`/items/${match._id}`}
                  className="matchLink"
                >
                  View match →
                </Link>

              </div>

            ))}

          </div>

        </section>
      )}

      {/* Show this BEFORE the user searches */}
      {u && !matchSearched && (

        <div className="matchEmpty">

          <CheckCircle2 size={22} />

          <div>

            <strong>
              Looking for a possible match?
            </strong>

            <p>
              Click "Find Possible Matches" to
              compare this report with other
              active campus reports.
            </p>

          </div>

        </div>

      )}

      {/* Show this AFTER searching when no matches exist */}
      {u &&
        matchSearched &&
        !matchLoading &&
        matches.length === 0 && (

        <div className="matchEmpty">

          <PackageSearch size={22} />

          <div>

            <strong>
              No possible matches found
            </strong>

            <p>
              We couldn't find an active{' '}
              {item.type === 'lost'
                ? 'found'
                : 'lost'}{' '}
              report that matches this item's
              details.
            </p>

            <p>
              New matching reports may appear
              later.
            </p>

          </div>

        </div>

      )}

    </main>
  );
}
function Auth({mode}){const nav=useNavigate();const {login}=useAuth();const [form,setForm]=useState({name:'',email:'',password:'',studentId:'',department:'',year:''});const [err,setErr]=useState('');const submit=async e=>{e.preventDefault();try{const r=await api.post('/auth/'+(mode==='login'?'login':'register'),form);login(r.data);nav('/')}catch(e){setErr(e.response?.data?.message||'Something went wrong')}};return <main className="authPage"><div className="authCard"><Link className="brand center" to="/"><span className="brandmark">CF</span> CampusFind</Link><h1>{mode==='login'?'Welcome back':'Join your campus'}</h1><p>{mode==='login'?'Sign in to manage your reports and claims.':'Create an account to report and recover items.'}</p>{err&&<div className="error">{err}</div>}<form onSubmit={submit}>{mode==='register'&&<><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Student ID<input value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}/></label><div className="two"><label>Department<input value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></label><label>Year<input value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/></label></div></>}<label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="btn primary full">{mode==='login'?<><LogIn size={17}/> Sign in</>:<><UserPlus size={17}/> Create account</>}</button></form><p className="switch">{mode==='login'?<>New here? <Link to="/register">Create an account</Link></>:<>Already registered? <Link to="/login">Sign in</Link></>}</p></div></main>}
function Report(){const nav=useNavigate();const {u}=useAuth();const [form,setForm]=useState({type:'lost',title:'',category:'Electronics',description:'',color:'',brand:'',location:'',date:new Date().toISOString().slice(0,10)});const [msg,setMsg]=useState('');if(!u)return <Auth mode="login"/>;const submit=async e=>{e.preventDefault();try{const token=localStorage.getItem('campusfind_token');await api.post('/items',form,{headers:{Authorization:`Bearer ${token}`}});setMsg('Your report was submitted for review.');setTimeout(()=>nav('/browse'),1000)}catch(e){setMsg(e.response?.data?.message||'Could not submit report')}};return <main className="wrap page narrow"><div className="pageHead"><div><span className="eyebrow">NEW REPORT</span><h1>Report an item</h1><p>Provide enough detail for another student to recognize it.</p></div></div><form className="reportCard" onSubmit={submit}><div className="seg"><button type="button" className={form.type==='lost'?'active lost':''} onClick={()=>setForm({...form,type:'lost'})}>I lost something</button><button type="button" className={form.type==='found'?'active found':''} onClick={()=>setForm({...form,type:'found'})}>I found something</button></div><div className="two"><label>Item name<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Black HP Laptop"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Electronics','Documents','Accessories','Books','Clothing','Keys','Other'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Description<textarea rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Distinctive details, stickers, marks, contents..."/></label><div className="three"><label>Color<input value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></label><label>Brand<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label><label>Date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div><label>Campus location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Library, Canteen, MCA Block..."/></label>{msg&&<div className="success">{msg}</div>}<button className="btn primary">Submit report <ArrowRight size={17}/></button></form></main>}
function Admin() {
  const { u } = useAuth();

  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const token =
        localStorage.getItem(
          'campusfind_token'
        );

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        statsResponse,
        itemsResponse,
        claimsResponse
      ] = await Promise.all([
        api.get('/admin/stats', {
          headers,
        }),

        api.get('/admin/items', {
          headers,
        }),

        api.get('/admin/claims', {
          headers,
        }),
      ]);

      setStats(statsResponse.data);
      setItems(itemsResponse.data);
      setClaims(claimsResponse.data);

    } catch (error) {
      console.error(
        'Failed to load admin data:',
        error
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (u?.role === 'admin') {
      loadAdminData();
    }
  }, [u]);


  // ==================================================
  // UPDATE ITEM STATUS
  // ==================================================

  const updateItemStatus = async (
    id,
    status
  ) => {
    try {
      const token =
        localStorage.getItem(
          'campusfind_token'
        );

      await api.patch(
        `/admin/items/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadAdminData();

    } catch (error) {
      console.error(
        'Failed to update item:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Could not update the report.'
      );
    }
  };


  // ==================================================
  // UPDATE CLAIM STATUS
  // ==================================================

  const updateClaimStatus = async (
    id,
    status
  ) => {
    try {
      const token =
        localStorage.getItem(
          'campusfind_token'
        );

      await api.patch(
        `/admin/claims/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadAdminData();

    } catch (error) {
      console.error(
        'Failed to update claim:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Could not update the claim.'
      );
    }
  };


  // ==================================================
  // ACCESS CONTROL
  // ==================================================

  if (u?.role !== 'admin') {
    return (
      <main className="wrap page">

        <div className="empty">

          <LayoutDashboard />

          <h2>
            Admin access required
          </h2>

        </div>

      </main>
    );
  }


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="wrap page">

        <div className="empty">
          Loading admin dashboard...
        </div>

      </main>
    );
  }


  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  return (
    <main className="wrap page">

      {/* PAGE HEADER */}

      <div className="pageHead">

        <div>

          <span className="eyebrow">
            ADMIN CONSOLE
          </span>

          <h1>
            Campus overview
          </h1>

          <p>
            Moderate reports and monitor
            recovery activity.
          </p>

        </div>

      </div>


      {/* ==================================================
          STATISTICS
          ================================================== */}

      {stats && (
        <div className="stats">

          {[
            [
              'Lost reports',
              stats.lost
            ],

            [
              'Found reports',
              stats.found
            ],

            [
              'Returned',
              stats.returned
            ],

            [
              'Users',
              stats.users
            ],

            [
              'Pending review',
              stats.pending
            ],

          ].map(
            ([label, value]) => (
              <div
                className="stat"
                key={label}
              >

                <small>
                  {label}
                </small>

                <strong>
                  {value}
                </strong>

              </div>
            )
          )}

        </div>
      )}


      {/* ==================================================
          REPORTS
          ================================================== */}

      <div className="adminTable">

        <div className="tableHead">

          <b>
            Recent reports
          </b>

          <span>
            {items.length} total
          </span>

        </div>


        {items.length === 0 ? (

          <div className="empty">

            <PackageSearch size={38} />

            <h3>
              No reports
            </h3>

            <p>
              There are no reports to review.
            </p>

          </div>

        ) : (

          items
            .slice(0, 12)
            .map((item) => (

              <div
                className="row"
                key={item._id}
              >

                <div className="reportInfo">

                  <b>
                    {item.title}
                  </b>

                  <small>
                    {item.type} ·{' '}
                    {item.location} · by{' '}
                    {item.reportedBy?.name ||
                      'Unknown'}
                  </small>

                </div>


                <div className="adminActions">

                  <span
                    className={`status ${item.status}`}
                  >
                    {item.status}
                  </span>


                  {item.status ===
                    'pending' && (

                    <button
                      className="approveBtn"
                      onClick={() =>
                        updateItemStatus(
                          item._id,
                          'active'
                        )
                      }
                    >

                      <CheckCircle2
                        size={15}
                      />

                      Approve

                    </button>

                  )}


                  {item.status ===
                    'active' && (

                    <span className="approvedLabel">
                      ✓ Published
                    </span>

                  )}

                </div>

              </div>

            ))

        )}

      </div>


      {/* ==================================================
          CLAIM REVIEW
          ================================================== */}

      <div
        className="adminTable"
        style={{
          marginTop: '24px',
        }}
      >

        <div className="tableHead">

          <b>
            Claim Review
          </b>

          <span>
            {claims.length} total
          </span>

        </div>


        {claims.length === 0 ? (

          <div className="empty">

            <ShieldCheck size={38} />

            <h3>
              No claims
            </h3>

            <p>
              There are no item claims to review.
            </p>

          </div>

        ) : (

          claims.map((claim) => (

            <div
              className="row"
              key={claim._id}
            >

              {/* CLAIM INFORMATION */}

              <div className="reportInfo">

                <b>
                  {claim.item?.title ||
                    'Unknown item'}
                </b>

                <small>
                  Claimed by{' '}
                  {claim.claimant?.name ||
                    'Unknown user'}
                </small>

                {claim.claimant?.email && (
                  <small>
                    {claim.claimant.email}
                  </small>
                )}

                {claim.claimant?.studentId && (
                  <small>
                    Student ID:{' '}
                    {claim.claimant.studentId}
                  </small>
                )}

              </div>


              {/* VERIFICATION ANSWER */}

              <div
                style={{
                  flex: 1,
                  marginLeft: '20px',
                  marginRight: '20px',
                }}
              >

                <small>
                  Verification details
                </small>

                <p
                  style={{
                    margin:
                      '5px 0 0',
                    lineHeight: 1.5,
                  }}
                >
                  {claim.answer ||
                    'No verification details provided.'}
                </p>

              </div>


              {/* CLAIM STATUS + ACTIONS */}

              <div className="adminActions">

                <span
                  className={`status ${claim.status}`}
                >
                  {claim.status}
                </span>


                {claim.status ===
                  'pending' && (

                  <>

                    <button
                      className="approveBtn"
                      onClick={() =>
                        updateClaimStatus(
                          claim._id,
                          'approved'
                        )
                      }
                    >

                      <CheckCircle2
                        size={15}
                      />

                      Approve

                    </button>


                    <button
                      className="rejectBtn"
                      onClick={() =>
                        updateClaimStatus(
                          claim._id,
                          'rejected'
                        )
                      }
                    >

                      Reject

                    </button>

                  </>

                )}


                {claim.status ===
                  'approved' && (

                  <span className="approvedLabel">
                    ✓ Approved
                  </span>

                )}


                {claim.status ===
                  'rejected' && (

                  <span className="approvedLabel">
                    ✕ Rejected
                  </span>

                )}

              </div>

            </div>

          ))

        )}

      </div>

    </main>
  );
}
function MyActivity() {
  const { u } = useAuth();

  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const token =
          localStorage.getItem(
            'campusfind_token'
          );

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          itemsResponse,
          claimsResponse
        ] = await Promise.all([
          api.get('/my-items', {
            headers,
          }),

          api.get('/my-claims', {
            headers,
          }),
        ]);

        setItems(itemsResponse.data);
        setClaims(claimsResponse.data);

      } catch (error) {
        console.error(
          'Failed to load activity:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (u) {
      loadActivity();
    }
  }, [u]);


  if (!u) {
    return (
      <main className="wrap page">

        <div className="empty">

          <LogIn size={38} />

          <h2>
            Login required
          </h2>

          <p>
            Please login to view your activity.
          </p>

          <Link
            to="/login"
            className="btn primary"
          >
            Login
          </Link>

        </div>

      </main>
    );
  }


  if (loading) {
    return (
      <main className="wrap page">

        <div className="empty">
          Loading your activity...
        </div>

      </main>
    );
  }


  return (
    <main className="wrap page">

      {/* PAGE HEADER */}

      <div className="pageHead">

        <div>

          <span className="eyebrow">
            MY ACTIVITY
          </span>

          <h1>
            Your campus activity
          </h1>

          <p>
            Track the items you reported and
            the claims you submitted.
          </p>

        </div>

      </div>


      {/* ==================================================
          MY REPORTS
          ================================================== */}

      <section className="adminTable">

        <div className="tableHead">

          <b>
            My Reports
          </b>

          <span>
            {items.length} total
          </span>

        </div>


        {items.length === 0 ? (

          <div className="empty">

            <PackageSearch size={38} />

            <h3>
              No reports yet
            </h3>

            <p>
              You haven't reported any items yet.
            </p>

            <Link
              to="/report"
              className="btn primary"
            >
              Report an item
            </Link>

          </div>

        ) : (

          items.map((item) => (

            <div
              className="row"
              key={item._id}
            >

              <div className="reportInfo">

                <b>
                  {item.title}
                </b>

                <small>
                  {item.type} ·{' '}
                  {item.category} ·{' '}
                  {item.location}
                </small>

              </div>


              <div className="adminActions">

                <span
                  className={`status ${item.status}`}
                >
                  {item.status}
                </span>

                <Link
                  to={`/items/${item._id}`}
                  className="matchLink"
                >
                  View →
                </Link>

              </div>

            </div>

          ))

        )}

      </section>


      {/* ==================================================
          MY CLAIMS
          ================================================== */}

      <section
        className="adminTable"
        style={{
          marginTop: '24px',
        }}
      >

        <div className="tableHead">

          <b>
            My Claims
          </b>

          <span>
            {claims.length} total
          </span>

        </div>


        {claims.length === 0 ? (

          <div className="empty">

            <ShieldCheck size={38} />

            <h3>
              No claims yet
            </h3>

            <p>
              You haven't submitted any item claims.
            </p>

          </div>

        ) : (

          claims.map((claim) => (

            <div
              className="row"
              key={claim._id}
            >

              <div className="reportInfo">

                <b>
                  {claim.item?.title ||
                    'Unknown item'}
                </b>

                <small>
                  {claim.item?.type} ·{' '}
                  {claim.item?.category} ·{' '}
                  {claim.item?.location}
                </small>

              </div>


              <div className="adminActions">

                <span
                  className={`status ${claim.status}`}
                >
                  {claim.status}
                </span>

                {claim.item?._id && (
                  <Link
                    to={`/items/${claim.item._id}`}
                    className="matchLink"
                  >
                    View →
                  </Link>
                )}

              </div>

            </div>

          ))

        )}

      </section>

    </main>
  );
}
function App(){return <><Nav/><Routes><Route path="/" element={<Home/>}/><Route path="/browse" element={<Browse/>}/><Route
  path="/items/:id"
  element={<ItemDetails/>}
/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/report" element={<Report/>}/><Route path="/admin" element={<Admin/>}/><Route
  path="/activity"
  element={<MyActivity />}
/></Routes><footer><div className="wrap"><b>CampusFind</b><span>Smart campus lost & found · MCA Mini Project</span></div></footer></>};createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
