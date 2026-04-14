import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

const App = () => {
  const webcamRef = useRef(null);
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // ካሜራው በስልክ ሲከፈት የጀርባውን ካሜራ እንዲጠቀም እና ጥራቱ እንዲጨምር
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // የጀርባ ካሜራ
  };

  const captureAndScan = useCallback(async () => {
    setLoading(true);
    setCopySuccess("");
    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      try {
        // AIው ምስሉን አንብቦ ጽሁፍ እንዲያወጣ ማዘዝ
        const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng', {
          logger: m => console.log(m) 
        });

        // ቁጥሮችን ብቻ ለይቶ ማውጣት (ከ12-16 ያሉ ተከታታይ ቁጥሮች)
        const cleanedText = text.replace(/\s/g, ''); // ክፍተቶችን ማጥፋት
        const regex = /\d{12,16}/;
        const found = cleanedText.match(regex);

        if (found) {
          setCardNumber(found[0]);
        } else {
          alert("ቁጥሩ አልተገኘም! እባክህ ካርዱን በደንብ አቅርበህ በቂ ብርሃን ባለበት ቦታ ሞክር።");
        }
      } catch (error) {
        console.error("Error scanning:", error);
        alert("የሆነ ስህተት ተፈጥሯል፣ እባክህ ደግመህ ሞክር።");
      }
    }
    setLoading(false);
  }, [webcamRef]);

  // ካርዱን በቀጥታ ለመሙላት (*805*)
  const rechargeNow = () => {
    if (cardNumber) {
      window.location.href = `tel:*805*${cardNumber}#`;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Ethio Card Loader</h1>
        <p style={styles.subtitle}>ካርዱን በካሜራ ስካን አድርገህ ሙላ</p>
      </header>

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
          style={{...styles.button, backgroundColor: loading ? '#ccc' : '#007bff'}}
        >
          {loading ? "በማንበብ ላይ..." : "ካርዱን አንብብ"}
        </button>

        {cardNumber && (
          <div style={styles.resultCard}>
            <p style={styles.label}>የተገኘው የካርድ ቁጥር</p>
            <h2 style={styles.cardNumberText}>{cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</h2>
            
            <button onClick={rechargeNow} style={styles.rechargeBtn}>
              አሁን ሙላ (*805*)
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

      <footer style={styles.footer}>
        <p>Built for Ethio Telecom users</p>
      </footer>
    </div>
  );
};

// ለአፑ ውበት የሚሰጡ ስታይሎች (CSS)
const styles = {
  container: {
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { color: '#007bff', margin: '0', fontSize: '28px' },
  subtitle: { color: '#666', fontSize: '14px' },
  cameraWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    height: '300px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    border: '4px solid #fff'
  },
  webcam: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '40px',
    border: '2px solid #28a745',
    borderRadius: '5px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
  },
  actionArea: { width: '100%', maxWidth: '400px', marginTop: '25px' },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: '0.3s'
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    marginTop: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  label: { color: '#888', fontSize: '12px', margin: '0' },
  cardNumberText: { color: '#333', margin: '10px 0', fontSize: '24px', letterSpacing: '2px' },
  rechargeBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    cursor: 'pointer'
  },
  copyBtn: {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer'
  },
  footer: { marginTop: 'auto', padding: '20px', color: '#aaa', fontSize: '12px' }
};

export default App;