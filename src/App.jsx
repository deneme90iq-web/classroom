import React, { useState, useEffect } from 'react';
import { Trophy, FileText, PenTool, CheckCircle, Star, Zap, Target, Clock, Settings, BookOpen, Plus, MessageSquare, Mic, MonitorPlay, BarChart, Shield, Check, X, Bell, LogOut, Copy, Users } from 'lucide-react';

const App = () => {
  // Auth
  const [screen, setScreen] = useState('login'); // login | dashboard
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('student');
  const [testMode, setTestMode] = useState(false);

  // Classroom
  const [classrooms, setClassrooms] = useState(() => {
    const saved = localStorage.getItem('classrooms');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentClass, setCurrentClass] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  // Student
  const [totalXp, setTotalXp] = useState(0);
  const [spendableXp, setSpendableXp] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('Ödevler');

  // Teacher
  const [newClassName, setNewClassName] = useState('');
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignReward, setNewAssignReward] = useState(100);
  const [newAssignType, setNewAssignType] = useState('Ödev');
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : [];
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [pendingStudents, setPendingStudents] = useState(() => {
    const saved = localStorage.getItem('pendingStudents');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist data to localStorage
  useEffect(() => { localStorage.setItem('classrooms', JSON.stringify(classrooms)); }, [classrooms]);
  useEffect(() => { localStorage.setItem('announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('pendingStudents', JSON.stringify(pendingStudents)); }, [pendingStudents]);

  // Ranks
  const getRank = (xp) => {
    if (xp < 500) return { name: "Acemi", level: 1, next: 500 };
    if (xp < 1500) return { name: "Geliştirici", level: 2, next: 1500 };
    if (xp < 3000) return { name: "Tasarımcı", level: 3, next: 3000 };
    if (xp < 5000) return { name: "Mühendis", level: 4, next: 5000 };
    if (xp < 8000) return { name: "Mimar", level: 5, next: 8000 };
    return { name: "Efsane", level: 6, next: 99999 };
  };
  const rank = getRank(totalXp);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  // Login
  const handleLogin = () => {
    if (!userName.trim()) return alert('Lütfen adınızı girin.');
    // Her girişte localStorage'dan güncel sınıf verilerini yükle
    const savedClassrooms = localStorage.getItem('classrooms');
    if (savedClassrooms) setClassrooms(JSON.parse(savedClassrooms));
    const savedAnn = localStorage.getItem('announcements');
    if (savedAnn) setAnnouncements(JSON.parse(savedAnn));
    const savedPending = localStorage.getItem('pendingStudents');
    if (savedPending) setPendingStudents(JSON.parse(savedPending));
    setScreen('dashboard');
    if (role === 'teacher') setActiveTab('Analitik');
    else setActiveTab('Ödevler');
  };

  // Teacher: Create Class
  const handleCreateClass = () => {
    if (!newClassName.trim()) return alert('Sınıf adı girin.');
    const code = generateCode();
    const newClass = { id: Date.now(), name: newClassName, code, assignments: [], students: [{ name: userName, xp: 0 }] };
    setClassrooms([...classrooms, newClass]);
    setCurrentClass(newClass);
    setNewClassName('');
    alert(`"${newClass.name}" sınıfı oluşturuldu!\nSınıf Kodu: ${code}`);
  };

  // Student: Join Class
  const handleJoinClass = () => {
    const cleanInput = joinCode.trim().toUpperCase().replace('#', '');
    if (!cleanInput) return alert('Lütfen bir sınıf kodu girin.');
    
    // Hem state hem localStorage'dan ara
    let allClassrooms = [...classrooms];
    const saved = localStorage.getItem('classrooms');
    if (saved) {
      const fromStorage = JSON.parse(saved);
      fromStorage.forEach(sc => {
        if (!allClassrooms.find(c => c.id === sc.id)) {
          allClassrooms.push(sc);
        }
      });
      setClassrooms(allClassrooms);
    }
    
    const found = allClassrooms.find(c => c.code.toUpperCase().replace('#', '') === cleanInput);
    if (!found) return alert('Geçersiz sınıf kodu! Kodun doğru olduğundan emin olun.');
    setPendingStudents(prev => [...prev, { id: Date.now(), name: userName, classId: found.id }]);
    setCurrentClass(found);
    setJoinCode('');
    alert(`"${found.name}" sınıfına başarıyla katıldın!`);
  };

  // Teacher: Create Assignment (goes to current class)
  const handleCreateAssignment = () => {
    if (!newAssignTitle.trim()) return alert('Başlık girin.');
    if (!currentClass) return alert('Önce bir sınıf seçin.');
    const newA = { id: Date.now(), title: newAssignTitle, type: newAssignType, rewardXp: Number(newAssignReward), completed: false };
    const updated = classrooms.map(c => c.id === currentClass.id ? { ...c, assignments: [newA, ...c.assignments] } : c);
    setClassrooms(updated);
    setCurrentClass(updated.find(c => c.id === currentClass.id));
    setNewAssignTitle('');
    alert(`${newAssignType} "${newA.title}" sınıfa gönderildi!`);
  };

  // Student: Submit Assignment
  const submitAssignment = (assignId, reward) => {
    const mult = inventory.includes(4) ? 2 : 1;
    const final_r = reward * mult;
    setTotalXp(p => p + final_r);
    setSpendableXp(p => p + final_r);
    if (currentClass) {
      const updated = classrooms.map(c => c.id === currentClass.id ? { ...c, assignments: c.assignments.map(a => a.id === assignId ? { ...a, completed: true } : a) } : c);
      setClassrooms(updated);
      setCurrentClass(updated.find(c => c.id === currentClass.id));
    }
    alert(`Teslim edildi! +${final_r} XP kazandın!`);
  };

  // Teacher: Post Announcement
  const handlePostAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewAnnouncement('');
  };

  // Teacher: Approve/Reject
  const approveStudent = (id) => { setPendingStudents(p => p.filter(s => s.id !== id)); alert('Öğrenci onaylandı!'); };
  const rejectStudent = (id) => { setPendingStudents(p => p.filter(s => s.id !== id)); alert('Başvuru reddedildi.'); };

  // Shop
  const shopItems = [
    { id: 1, name: 'Mor Tema', price: 200, icon: <Settings className="text-purple-400" size={32}/> },
    { id: 2, name: 'Altın Çerçeve', price: 300, icon: <Target className="text-yellow-400" size={32}/> },
    { id: 3, name: 'Geç Teslim Affı', price: 350, icon: <Clock className="text-blue-400" size={32}/> },
    { id: 4, name: '2x XP Boost', price: 400, icon: <Zap className="text-orange-400" size={32}/> },
    { id: 5, name: 'Taç Rozeti', price: 500, icon: <Trophy className="text-yellow-500" size={32}/> },
  ];
  const buyItem = (item) => {
    if (spendableXp >= item.price && !inventory.includes(item.id)) {
      setSpendableXp(p => p - item.price);
      setInventory([...inventory, item.id]);
    }
  };

  const leaderboard = [
    { name: 'Zeynep Y.', xp: 4500, r: 'Mühendis' },
    { name: 'Ahmet K.', xp: 3200, r: 'Tasarımcı' },
    { name: userName || 'Sen', xp: totalXp, r: rank.name, isMe: true },
    { name: 'Elif S.', xp: 1200, r: 'Geliştirici' },
  ].sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));

  const logout = () => {
    if (testMode) {
      localStorage.removeItem('classrooms');
      localStorage.removeItem('announcements');
      localStorage.removeItem('pendingStudents');
      setClassrooms([]);
      setAnnouncements([]);
      setPendingStudents([]);
      setTotalXp(0);
      setSpendableXp(0);
      setInventory([]);
      setTestMode(false);
    }
    setScreen('login');
    setCurrentClass(null);
    setUserName('');
  };

  const startTestMode = () => {
    localStorage.removeItem('classrooms');
    localStorage.removeItem('announcements');
    localStorage.removeItem('pendingStudents');
    setClassrooms([]);
    setAnnouncements([]);
    setPendingStudents([]);
    setTotalXp(350);
    setSpendableXp(350);
    setInventory([]);
    setTestMode(true);
    setUserName('Test Kullanıcı');
    setRole('teacher');
    setActiveTab('Analitik');
    setScreen('dashboard');
  };
  const isPurple = inventory.includes(1);

  // ======================== LOGIN SCREEN ========================
  if (screen === 'login') {
    return (
      <div className="login-screen">
        <div className="login-card glass-panel">
          <MonitorPlay size={48} className="text-yellow-400" />
          <h1 className="logo-text" style={{fontSize:'36px', marginBottom:'10px'}}>classroom.</h1>
          <p style={{color:'#adb5bd', marginBottom:'30px'}}>Sınıfı dijitale taşıyan akıllı platform</p>

          <div className="form-group">
            <label>Adınız</label>
            <input className="input-area" placeholder="İsminizi girin..." value={userName} onChange={e => setUserName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Rolünüz</label>
            <div className="role-picker">
              <button className={`role-btn ${role === 'student' ? 'sel-student' : ''}`} onClick={() => setRole('student')}>🎓 Öğrenci</button>
              <button className={`role-btn ${role === 'teacher' ? 'sel-teacher' : ''}`} onClick={() => setRole('teacher')}>👨‍🏫 Öğretmen</button>
            </div>
          </div>

          <button className="login-btn" onClick={handleLogin}>Giriş Yap</button>
          <button className="test-btn" onClick={startTestMode}>🧪 Test Modunda Dene</button>
          <p style={{color:'#6c757d', fontSize:'12px', marginTop:'20px'}}>%100 Ücretsiz • Açık Kaynak • PWA Desteği</p>
        </div>
      </div>
    );
  }

  // ======================== DASHBOARD ========================
  const studentTabs = ['Ödevler', 'Ders Notları', 'İletişim', 'Liderlik', 'Mağaza'];
  const teacherTabs = ['Analitik', 'Sınıf Yönetimi', 'Ödev/Quiz Ver', 'Canlı Ders'];

  return (
    <div className={`app-container ${isPurple ? 'theme-purple' : ''}`}>
      {testMode && (
        <div className="test-banner">
          🧪 TEST MODU — Çıkış yapınca tüm veriler silinecek.
          <button onClick={() => { setRole(role === 'teacher' ? 'student' : 'teacher'); setActiveTab(role === 'teacher' ? 'Ödevler' : 'Analitik'); setCurrentClass(currentClass); }} className="switch-role-btn">
            Rol Değiştir ({role === 'teacher' ? '→ Öğrenci' : '→ Öğretmen'})
          </button>
        </div>
      )}
      <nav className="glass-panel sidebar">
        <div className="logo-area">
          <MonitorPlay className="logo-icon" size={28} />
          <h1 className="logo-text">classroom.</h1>
        </div>

        <div className={`user-profile ${inventory.includes(2) ? 'has-gold-border' : ''}`}>
          {inventory.includes(5) && <Trophy className="crown-icon" size={24}/>}
          <div className="avatar"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="U" /></div>
          <div className="user-info">
            <h3>{userName}</h3>
            <span className="rank-badge">{role === 'teacher' ? 'Öğretmen' : `Sev.${rank.level}: ${rank.name}`}</span>
          </div>
        </div>

        {currentClass && (
          <div className="class-info-box">
            <p style={{fontSize:'12px', color:'#adb5bd'}}>Aktif Sınıf</p>
            <h4>{currentClass.name}</h4>
            <span className="code-badge" onClick={() => {navigator.clipboard.writeText(currentClass.code); alert('Kod kopyalandı!');}}>
              {currentClass.code} <Copy size={14}/>
            </span>
          </div>
        )}

        <ul className="nav-menu">
          {(role === 'teacher' ? teacherTabs : studentTabs).map(tab => (
            <li key={tab} className={activeTab === tab ? (role === 'teacher' ? 'active-teacher' : 'active') : ''} onClick={() => setActiveTab(tab)}>{tab}</li>
          ))}
        </ul>

        <button className="logout-btn" onClick={logout}><LogOut size={18}/> Çıkış Yap</button>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <div>
            <h2>{activeTab}</h2>
            {role === 'student' && (
              <div className="header-stats">
                <div className="stat-badge glass-panel"><Star className="text-yellow-400" size={16}/><span>{spendableXp} XP</span></div>
                {inventory.includes(4) && <div className="stat-badge glass-panel boost"><Zap size={16}/><span>2x Aktif</span></div>}
              </div>
            )}
          </div>
          {role === 'student' && (
            <div className="xp-container glass-panel">
              <div className="xp-info"><span className="level-text">Sev. {rank.level}</span><span className="xp-text">{totalXp}/{rank.next} XP</span></div>
              <div className="progress-bar-bg"><div className="progress-bar-fill glow" style={{width:`${(totalXp/rank.next)*100}%`}}></div></div>
            </div>
          )}
        </header>

        <div className="content-area">

          {/* NO CLASS YET */}
          {!currentClass && role === 'teacher' && (
            <div className="center-card glass-panel">
              <Users size={64} className="text-purple-400" style={{marginBottom:'20px'}}/>
              <h3>Henüz bir sınıfınız yok</h3>
              <p>Bir sınıf oluşturarak başlayın. Sınıf kodu otomatik üretilecek.</p>
              <div style={{display:'flex', gap:'15px', marginTop:'30px', width:'100%', maxWidth:'400px'}}>
                <input className="input-area" placeholder="Sınıf adı..." value={newClassName} onChange={e => setNewClassName(e.target.value)} style={{marginBottom:0}}/>
                <button className="primary-btn" onClick={handleCreateClass}>Oluştur</button>
              </div>
            </div>
          )}

          {!currentClass && role === 'student' && (
            <div className="center-card glass-panel">
              <BookOpen size={64} className="text-blue-400" style={{marginBottom:'20px'}}/>
              <h3>Bir sınıfa katıl</h3>
              <p>Öğretmeninden aldığın sınıf kodunu girerek başla.</p>
              <div style={{display:'flex', gap:'15px', marginTop:'30px', width:'100%', maxWidth:'400px'}}>
                <input className="input-area" placeholder="#ABCDE" value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{marginBottom:0}}/>
                <button className="primary-btn" onClick={handleJoinClass}>Katıl</button>
              </div>
            </div>
          )}

          {/* ===== STUDENT VIEWS ===== */}
          {currentClass && role === 'student' && activeTab === 'Ödevler' && (
            <>
              {announcements.length > 0 && (
                <section style={{marginBottom:'25px'}}>
                  <h3 className="section-title" style={{color:'#c77dff'}}><Bell size={20}/> Duyurular</h3>
                  {announcements.map((a,i) => <div key={i} className="glass-panel" style={{padding:'15px 20px', marginBottom:'10px', borderLeft:'4px solid #c77dff', background:'rgba(157,78,221,0.08)'}}><p>{a}</p></div>)}
                </section>
              )}
              <h3 className="section-title">Görevler ({currentClass.assignments.filter(a=>!a.completed).length})</h3>
              <div className="quest-list">
                {currentClass.assignments.length === 0 && <p style={{color:'#adb5bd'}}>Henüz ödev verilmedi.</p>}
                {currentClass.assignments.map(a => (
                  <div key={a.id} className={`quest-item glass-panel ${a.completed ? 'completed' : ''}`}>
                    <div className="quest-info">
                      <div className="icon-wrapper">{a.type==='Ödev' ? <FileText className="text-blue-400" size={22}/> : <PenTool className="text-orange-400" size={22}/>}</div>
                      <div><h4 style={{textDecoration:a.completed?'line-through':'none', color:a.completed?'#6c757d':'#fff'}}>{a.title}</h4><p>+{a.rewardXp} XP • {a.type}</p></div>
                    </div>
                    {a.completed ? <span style={{color:'#70e000',fontWeight:'bold',display:'flex',alignItems:'center',gap:'6px'}}><CheckCircle size={18}/>Teslim</span> : <button className="claim-btn" onClick={()=>submitAssignment(a.id,a.rewardXp)}>Teslim Et</button>}
                  </div>
                ))}
              </div>
            </>
          )}

          {currentClass && role === 'student' && activeTab === 'Ders Notları' && (
            <div className="center-card glass-panel">
              <BookOpen size={64} className="text-blue-400" style={{marginBottom:'20px'}}/>
              <h3>Ders Notu Havuzu</h3>
              <p>Not paylaşarak sınıfa katkı sağla ve XP kazan!</p>
              <button className="primary-btn" onClick={() => { const m = inventory.includes(4)?2:1; const r=20*m; setTotalXp(p=>p+r); setSpendableXp(p=>p+r); alert(`Not paylaşıldı! +${r} XP`); }}><Plus size={18}/> Not Yükle (+20 XP)</button>
            </div>
          )}

          {currentClass && role === 'student' && activeTab === 'Mağaza' && (
            <div className="shop-grid">
              {shopItems.map(item => {
                const owned = inventory.includes(item.id);
                return (
                  <div key={item.id} className="shop-item glass-panel interactive">
                    {item.icon}<h4>{item.name}</h4>
                    <div className="price"><Star size={16} className="text-yellow-400"/>{item.price} XP</div>
                    <button className={`buy-btn ${owned?'owned':''}`} onClick={()=>buyItem(item)} disabled={owned||spendableXp<item.price}>{owned?'Sahipsin':'Satın Al'}</button>
                  </div>
                );
              })}
            </div>
          )}

          {currentClass && role === 'student' && activeTab === 'Liderlik' && (
            <div className="leaderboard-list">
              {leaderboard.map(u => (
                <div key={u.rank} className={`leaderboard-item glass-panel ${u.isMe?'current-user':''}`}>
                  <div className="rank-circle" style={{color:u.rank===1?'#fca311':u.rank===2?'#e0e1dd':'#fff'}}>#{u.rank}</div>
                  <div className="leader-info"><h4>{u.name}</h4><p>{u.r}</p></div>
                  <div className="leader-score">{u.xp} XP</div>
                </div>
              ))}
            </div>
          )}

          {currentClass && role === 'student' && activeTab === 'İletişim' && (
            <div className="comm-grid">
              <div className="comm-card glass-panel interactive" onClick={()=>alert('Sohbet modülü başlatılıyor...')}><MessageSquare size={40} className="text-blue-400"/><h3>Sınıf Sohbeti</h3><button className="comm-btn" style={{background:'rgba(58,134,255,0.2)',color:'#4cc9f0'}}>Katıl</button></div>
              <div className="comm-card glass-panel interactive" onClick={()=>alert('Sesli oda başlatılıyor...')}><Mic size={40} className="text-green-400"/><h3>Sesli Oda</h3><button className="comm-btn" style={{background:'#38b000'}}>Katıl</button></div>
            </div>
          )}

          {/* ===== TEACHER VIEWS ===== */}
          {currentClass && role === 'teacher' && activeTab === 'Analitik' && (
            <div className="center-card glass-panel">
              <BarChart size={64} className="text-purple-400" style={{marginBottom:'20px'}}/>
              <h3>Sınıf Analitiği: {currentClass.name}</h3>
              <div className="teacher-grid">
                <div className="stat-box"><h4>Toplam Ödev</h4><p className="text-blue-400">{currentClass.assignments.length}</p></div>
                <div className="stat-box"><h4>Teslim Oranı</h4><p className="text-green-400">{currentClass.assignments.length>0 ? Math.round(currentClass.assignments.filter(a=>a.completed).length/currentClass.assignments.length*100) : 0}%</p></div>
                <div className="stat-box"><h4>Sınıf Kodu</h4><p className="text-yellow-400">{currentClass.code}</p></div>
              </div>
            </div>
          )}

          {currentClass && role === 'teacher' && activeTab === 'Sınıf Yönetimi' && (
            <div className="glass-panel" style={{padding:'30px'}}>
              <h3 className="section-title">Bekleyen Başvurular ({pendingStudents.filter(s=>s.classId===currentClass.id).length})</h3>
              {pendingStudents.filter(s=>s.classId===currentClass.id).length === 0 ? <p style={{color:'#adb5bd',marginBottom:'30px'}}>Bekleyen başvuru yok.</p> : pendingStudents.filter(s=>s.classId===currentClass.id).map(s => (
                <div key={s.id} className="action-row">
                  <div style={{display:'flex',alignItems:'center',gap:'15px'}}><Shield className="text-blue-400"/><span>{s.name}</span></div>
                  <div className="action-buttons"><button className="btn-approve" onClick={()=>approveStudent(s.id)}><Check size={18}/></button><button className="btn-reject" onClick={()=>rejectStudent(s.id)}><X size={18}/></button></div>
                </div>
              ))}
              <h3 className="section-title" style={{marginTop:'40px'}}>Duyuru Yayınla</h3>
              <textarea className="input-area" rows="3" placeholder="Mesajınızı yazın..." value={newAnnouncement} onChange={e=>setNewAnnouncement(e.target.value)}/>
              <div style={{display:'flex',justifyContent:'flex-end'}}><button className="primary-btn" style={{background:'#9d4edd'}} onClick={handlePostAnnouncement}>Gönder</button></div>
            </div>
          )}

          {currentClass && role === 'teacher' && activeTab === 'Ödev/Quiz Ver' && (
            <div className="glass-panel" style={{padding:'30px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginBottom:'25px'}}>
                <button className="teacher-module-btn" style={{borderColor:newAssignType==='Ödev'?'#3a86ff':'rgba(255,255,255,0.1)',color:'#4cc9f0'}} onClick={()=>setNewAssignType('Ödev')}>+ Ödev</button>
                <button className="teacher-module-btn" style={{borderColor:newAssignType==='Quiz'?'#fb5607':'rgba(255,255,255,0.1)',color:'#fb5607'}} onClick={()=>setNewAssignType('Quiz')}>+ Quiz</button>
              </div>
              <div style={{background:'rgba(0,0,0,0.2)',padding:'25px',borderRadius:'15px'}}>
                <div className="form-group"><label>Başlık</label><input className="input-area" placeholder="Örn: Hafta 2 Ödevi" value={newAssignTitle} onChange={e=>setNewAssignTitle(e.target.value)}/></div>
                <div className="form-group"><label>Ödül (+XP)</label><input type="number" className="input-area" value={newAssignReward} onChange={e=>setNewAssignReward(e.target.value)}/></div>
                <button className="submit-btn" onClick={handleCreateAssignment}>Sınıfa Gönder</button>
              </div>
            </div>
          )}

          {currentClass && role === 'teacher' && activeTab === 'Canlı Ders' && (
            <div className="comm-grid">
              <div className="comm-card glass-panel interactive" onClick={()=>alert('Sesli oda oluşturuluyor...')}><Mic size={48} className="text-green-400"/><h3>Sesli Oda Aç</h3><button className="comm-btn" style={{background:'#38b000'}}>Başlat</button></div>
              <div className="comm-card glass-panel interactive" onClick={()=>alert('Ekran paylaşımı başlatılıyor...')}><MonitorPlay size={48} className="text-blue-400"/><h3>Ekran Paylaş</h3><button className="comm-btn" style={{background:'#3a86ff'}}>Başlat</button></div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
