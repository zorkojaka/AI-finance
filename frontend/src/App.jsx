import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Prosim, izberi PDF datoteko!");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Napaka pri nalaganju:", error);
      setResponse({ status: "ERROR", message: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>OCR Invoice App (MVP)</h1>

      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      <button onClick={handleUpload}>Naloži in OCR</button>

      {loading && <p>Nalaganje in obdelava ...</p>}

      {response && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Rezultat OCR:</h2>
          {response.status === "OK" ? (
            <>
              <p>Prebranih strani: {response.pages_read}</p>
              <pre>{JSON.stringify(response.ocr_text, null, 2)}</pre>
            </>
          ) : (
            <pre>{JSON.stringify(response, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
