import React, { useState, useEffect, useRef } from 'react';

const MoreOptionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10ZM19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="white"/>
  </svg>
);

const AddIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.667 11.666H5.66699M11.667 5.66602V17.666" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Documented by icon (pen nib)
const NoteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M19.0696 4.83911C19 4.76937 18.9173 4.71405 18.8262 4.67631C18.7352 4.63857 18.6376 4.61914 18.539 4.61914C18.4405 4.61914 18.3429 4.63857 18.2518 4.67631C18.1608 4.71405 18.078 4.76937 18.0084 4.83911L17.3544 5.49311C16.9344 5.29256 16.4625 5.22721 16.0038 5.30606C15.5451 5.38491 15.1221 5.60407 14.7931 5.93336L6.83789 13.8879L11.0806 18.1306L19.0366 10.1769C19.3658 9.84782 19.5848 9.42481 19.6635 8.9661C19.7423 8.50738 19.6768 8.03555 19.4761 7.61561L20.1309 6.96086C20.2715 6.82021 20.3505 6.62948 20.3505 6.43061C20.3505 6.23173 20.2715 6.041 20.1309 5.90036L19.0696 4.83911ZM15.8686 11.2216L11.0806 16.0096L8.95964 13.8879L13.7469 9.10061L15.8686 11.2216ZM17.2321 9.85811L17.9746 9.11561C18.0444 9.04595 18.0997 8.96323 18.1374 8.87219C18.1752 8.78114 18.1946 8.68354 18.1946 8.58498C18.1946 8.48642 18.1752 8.38882 18.1374 8.29778C18.0997 8.20673 18.0444 8.12401 17.9746 8.05436L16.9149 6.99386C16.8452 6.92412 16.7625 6.8688 16.6715 6.83106C16.5804 6.79332 16.4828 6.77389 16.3843 6.77389C16.2857 6.77389 16.1881 6.79332 16.0971 6.83106C16.006 6.8688 15.9233 6.92412 15.8536 6.99386L15.1111 7.73636L17.2321 9.85811Z" fill="white" fillOpacity="0.45"/>
    <path d="M4.62207 20.3315L6.21357 14.498L10.4556 18.7408L4.62207 20.3315Z" fill="white" fillOpacity="0.45"/>
  </svg>
);

// Administered by icon (heart/care)
const CareIcon = () => (
  <svg style={{ marginLeft: '40px' }} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white" fillOpacity="0.45"/>
  </svg>
);

const GradientBlur = () => (
  <div className="gradient-blur">
    {[...Array(8)].map((_, i) => <div key={i} />)}
  </div>
);

export const CarePlayerUI = () => {
  const [isCaregiversModalActive, setIsCaregiversModalActive] = useState(false);
  const [isTaskModalActive, setIsTaskModalActive] = useState(false);
  const [taskModalTop, setTaskModalTop] = useState(0);
  const [taskModalTransform, setTaskModalTransform] = useState('translateY(0px)');

  const contentRef = useRef(null);
  const taskOpenRef = useRef(null);

  const anyModalActive = isCaregiversModalActive || isTaskModalActive;

  useEffect(() => {
    const updateTaskModalPosition = () => {
      if (taskOpenRef.current && contentRef.current) {
        const top = taskOpenRef.current.getBoundingClientRect().top - contentRef.current.offsetTop - 2;
        setTaskModalTop(top);
      }
    };
    updateTaskModalPosition();
    window.addEventListener('resize', updateTaskModalPosition);
    return () => window.removeEventListener('resize', updateTaskModalPosition);
  }, []);

  const handleCaregiverToggle = () => {
    setIsCaregiversModalActive(!isCaregiversModalActive);
  };

  const handleTaskOpen = () => {
    if (taskOpenRef.current && contentRef.current) {
      const distanceY = window.innerHeight - taskOpenRef.current.getBoundingClientRect().bottom + contentRef.current.offsetTop - 390;
      setTaskModalTransform(`translateY(${distanceY}px)`);
    }
    setIsTaskModalActive(true);
  };

  const handleTaskClose = () => {
    setTaskModalTransform('translateY(0px)');
    setIsTaskModalActive(false);
  };

  return (
    <main className="care-player">
      <div className="content-wrapper">
        <div ref={contentRef} className={`content ${anyModalActive ? 'active' : ''}`}>
          <div className="main-content">
            {/* LEFT: Patient photo */}
            <div className="photo-wrapper">
              <img
                className="photo"
                src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500&q=80"
                alt="Margaret Johnson"
              />
              <img
                className="photo"
                style={{ filter: 'brightness(1.4) saturate(0.8) blur(48px)', zIndex: 'auto' }}
                src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500&q=80"
                alt=""
              />
            </div>

            {/* RIGHT: Info & task list */}
            <div className="main-info">
              <div className="title-container">
                <h1>Margaret Johnson</h1>
                <div className="title-info">
                  <p className="light">Patient, 78</p>
                  <div className="divider" />
                  <p className="light">7 activities</p>
                  <div className="divider" />
                  <p className="light">Today</p>
                  <div className="divider" />
                  <button
                    className="caregiver-link"
                    onClick={handleCaregiverToggle}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <p className="light" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Sarah J., CNA</p>
                  </button>
                </div>
              </div>

              <div className="songs">
                {/* First task is clickable — opens detail modal */}
                <div ref={taskOpenRef} className="song" onClick={handleTaskOpen}>
                  <p className="bold">Morning Medication</p>
                  <div className="end">
                    <MoreOptionsIcon />
                    <p className="light">8:02 AM</p>
                  </div>
                </div>
                <div className="song"><p className="bold">Vital Signs Check</p><p className="light">9:30 AM</p></div>
                <div className="song"><p className="bold">Morning Walk, 30 min</p><p className="light">11:00 AM</p></div>
                <div className="song"><p className="bold">Lunch & Nutrition Log</p><p className="light">12:15 PM</p></div>
                <div className="song"><p className="bold">Blood Pressure Reading</p><p className="light">2:00 PM</p></div>
                <div className="song"><p className="bold">Evening Medication</p><p className="light">6:00 PM</p></div>
                <div className="song"><p className="bold">Family Update Published</p><p className="light">7:45 PM</p></div>
              </div>
            </div>
          </div>

          {/* TASK DETAIL MODAL — slides up from clicked task row */}
          <div
            className={`song-modal ${isTaskModalActive ? 'active' : ''}`}
            style={{ top: `${taskModalTop}px`, transform: taskModalTransform }}
          >
            <div className="song">
              <p className="bold">Morning Medication</p>
              <div className="end">
                <div onClick={handleTaskClose} style={{ cursor: 'pointer' }}><AddIcon /></div>
                <p className="light">8:02 AM</p>
              </div>
            </div>
            <div className="song-modal-info">
              <div className="song-credits">
                <NoteIcon />
                <p className="light">Sarah J., CNA <u>& ADLTrack AI</u></p>
                <CareIcon />
                <p className="light">Metoprolol 25mg, Lisinopril 10mg <u>& 1 more</u></p>
              </div>
              <br />
              <p className="bold">
                All three morning medications administered on schedule. Margaret was in good spirits and asked about her granddaughter's recital. Mild lower-back discomfort noted (2/10 pain scale) — not a change from baseline. No adverse reactions observed. Photo evidence attached.
              </p>
              <br />
              <p className="bold">
                Medication compliance this week: 100%. ADLTrack AI flagged that Margaret's blood pressure readings have trended slightly low over the past 3 days (avg 108/72 vs 118/78 baseline). Flagged for family review. Caregiver note: "She mentioned sleeping better this week — seems more rested than usual."
              </p>
              <br />
              <p className="bold">
                Next scheduled: Evening Medication at 6:00 PM (Metoprolol 25mg + Aspirin 81mg). Reminder sent to Sarah's app 45 minutes in advance. Family notified of morning completion at 8:04 AM via push notification.
              </p>
            </div>
            <GradientBlur />
          </div>

          {/* CAREGIVER PROFILE MODAL */}
          <div
            className={`modal ${isCaregiversModalActive ? 'active' : ''}`}
            style={{ display: isTaskModalActive ? 'none' : 'flex' }}
          >
            <div className="toggle" onClick={handleCaregiverToggle}>
              <AddIcon />
            </div>
            <div className="modal-content">
              <div className="photo-wrapper">
                <h1>Sarah Johnson</h1>
                <img
                  className="photo"
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80"
                  alt="Sarah Johnson, CNA"
                />
                <img
                  className="photo"
                  style={{ filter: 'brightness(1.5) saturate(0.9) blur(48px)', zIndex: 'auto' }}
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80"
                  alt=""
                />
              </div>
              <div className="info">
                <div className="info-top">
                  <div className="info-top-left">
                    <p className="genre light">CNA · Licensed</p>
                    <div className="divider" />
                    <p className="light">3 years exp.</p>
                  </div>
                  <p className="light">4.97 ★ rating</p>
                </div>
                <p className="bold">
                  Sarah Johnson is a Certified Nursing Assistant based in Austin, TX with over three years of specialized experience in elder care and Activities of Daily Living (ADL) support. She holds active certifications in CPR, First Aid, and Dementia Care.
                </p>
                <br />
                <p className="bold">
                  Sarah has been Margaret's primary caregiver for 14 months. Family members consistently cite her warm communication style and attention to routine as key to Margaret's improved daily wellbeing scores. She uses ADLTrack for every shift — logging vitals, attaching photo evidence, and sending family updates in real time.
                </p>
                <br />
                <p className="bold">
                  "I treat every patient like family. ADLTrack helps me show families exactly what I do — that transparency builds real trust." — Sarah J.
                </p>
              </div>
            </div>
            <GradientBlur />
            <div className="shade" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarePlayerUI;
