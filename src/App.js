import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

const App = () => {
  const webcamRef = useRef(null);
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  // አዲስ state ለኦፕሬተር ምርጫ (Default: Ethio Telecom)
  const [operator, setOperator] = useState("ethio"); 

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" 
  };

  // የኦፕሬተር ኮዱን መለየጫ
  const getPrefix = () => (operator === "ethio" ? "*805*" : "*705*");

  const captureAndScan = useCallback(async () => {
    setLoading(true);
    setCopySuccess("");
    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      try {
        const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
        const cleanedText = text.replace(/\s/g, ''); 
        const regex = /\d{12,16}/;
        const found = cleanedText.match(regex);

        if (found) {
          const detectedNumber = found[0];
          setCardNumber(detectedNumber);
          
          if (window.confirm(`ያነበብኩት ቁጥር: ${detectedNumber} ነው። ወደ መደወያ ልውሰድህ?`)) {
            window.location.href = `tel:${getPrefix()}${detectedNumber}%23`;
          }
        } else {
          alert("ቁጥሩ አልተገኘም! እባክህ ካርዱን በደንብ አቅርበህ ሞክር።");
        }
      } catch (error) {
        alert("የሆነ ስህተት ተፈጥሯል፤ እባክህ ደግመህ ሞክር።");
      }
    }
    setLoading(false);
  }, [webcamRef, operator]);

  const rechargeNow = () => {
    if (cardNumber) {
      window.location.href = `tel:${getPrefix()}${cardNumber}%23`;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Ethio & Safari Card Loader</h1>
        <p style={styles.subtitle}>ኦፕሬተር መርጠህ ካርዱን ስካን አድርግ</p>
      </header>

      {/* የኦፕሬተር መምረጫ (Selector) */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setOperator("ethio")}
          style={{...styles.tab, backgroundColor: operator === "ethio" ? "#007bff" : "#ddd", color: operator === "ethio" ? "#fff" : "#333"}}
        >
          Ethio Telecom (*805*)
        </button>
        <button 
          onClick={() => setOperator("safari")}
          style={{...styles.tab, backgroundColor: operator === "safari" ? "#E02227" : "#ddd", color: operator === "safari" ? "#fff" : "#333"}}
        >
          Safaricom (*705*)
        </button>
      </div>

      <div style={styles.cameraWrapper}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={styles.webcam}
        />
        <div style={styles.overlay}></div>
      </div>

      <div style={styles.actionArea}>
        <button 
          onClick={captureAndScan} 
          disabled={loading} 
          style={{...styles.button, backgroundColor: loading ? '#ccc' : (operator === "ethio" ? '#007bff' : '#E02227')}}
        >
          {loading ? "በማንበብ ላይ..." : "ካርዱን አንብብ"}
        </button>

        {cardNumber && (
          <div style={styles.resultCard}>
            <p style={styles.label}>የተገኘው የ {operator === "ethio" ? "ኢትዮ" : "ሳፋሪኮም"} ካርድ ቁጥር</p>
            <h2 style={styles.cardNumberText}>{cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</h2>
            
            <button onClick={rechargeNow} style={{...styles.rechargeBtn, backgroundColor: operator === "ethio" ? "#28a745" : "#E02227"}}>
              አሁን ሙላ ({getPrefix()})
            </button>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(cardNumber);
                setCopySuccess("ኮፒ ተደርጓል!");
              }} 
              style={styles.copyBtn}
            >
              {copySuccess || "ቁጥሩን ኮፒ አድርግ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Segoe UI, Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '15px' },
  title: { color: '#333', margin: '0', fontSize: '24px' },
  subtitle: { color: '#666', fontSize: '14px' },
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '20px', width: '100%', maxWidth: '400px' },
  tab: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.3s' },
  cameraWrapper: { position: 'relative', width: '100%', maxWidth: '400px', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '4px solid #fff' },
  webcam: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', height: '45px', border: '2px solid #28a745', borderRadius: '5px', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)' },
  actionArea: { width: '100%', maxWidth: '400px', marginTop: '20px' },
  button: { width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' },
  resultCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', marginTop: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  label: { color: '#888', fontSize: '12px' },
  cardNumberText: { color: '#333', fontSize: '22px', letterSpacing: '2px' },
  rechargeBtn: { color: '#fff', width: '100%', padding: '14px', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' },
  copyBtn: { backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', width: '100%', padding: '10px', borderRadius: '10px' }
};
export default App;