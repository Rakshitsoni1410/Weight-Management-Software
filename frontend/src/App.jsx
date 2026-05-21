import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./assets/logo.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API = "https://weight-management-software.onrender.com/api/records";
const BRAND_NAME = "Gold Management System - Rakshit R Soni";
const EMAIL = "rakshitrsoni@gmail.com";

/* ── helpers ── */
const formatDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
};
const formatDateForAPI = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const calcDiff = (inp, out) => (parseFloat(inp)||0) - (parseFloat(out)||0);
const fmt3 = (v) => Number(parseFloat(v||0).toFixed(3));

/* ── wake-up ping ── */
const PING_URL = "https://weight-management-software.onrender.com/api/records";
async function pingServer() {
  try { await axios.get(PING_URL, { timeout: 90000 }); return true; }
  catch { return false; }
}

/* ── server status banner ── */
function ServerBanner({ status }) {
  if (status === "online") return null;
  if (status === "waking") return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-700 text-sm">
      <FaSpinner className="animate-spin flex-shrink-0" />
      <div>
        <strong>Server is waking up…</strong>
        <span className="ml-2 text-amber-600">Render free tier sleeps after inactivity. This takes 30–60 seconds. Please wait.</span>
      </div>
      <div className="ml-auto flex gap-1">
        {[0,1,2].map(i=>(
          <span key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
        ))}
      </div>
    </div>
  );
  if (status === "error") return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm">
      <FaExclamationTriangle className="flex-shrink-0" />
      <div><strong>Server unreachable.</strong> <span className="text-red-600">Check your internet or try refreshing the page.</span></div>
    </div>
  );
  return null;
}

function App() {
  const [records, setRecords]               = useState([]);
  const [filteredRecords, setFiltered]      = useState([]);
  const [date, setDate]                     = useState(null);
  const [karatType, setKaratType]           = useState("75");
  const [inputWeight, setInputWeight]       = useState("");
  const [outputWeight, setOutputWeight]     = useState("");
  const [selectedKarat, setSelectedKarat]   = useState("ALL");
  const [loading, setLoading]               = useState(false);
  const [darkMode, setDarkMode]             = useState(false);
  const [serverStatus, setServerStatus]     = useState("waking"); // waking | online | error
  const [wakeSeconds, setWakeSeconds]       = useState(0);

  /* theme */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);
  const toggleTheme = () => {
    const n = !darkMode;
    setDarkMode(n);
    localStorage.setItem("theme", n ? "dark" : "light");
  };

  /* wake-up on mount — ping server, show countdown */
  useEffect(() => {
    let interval;
    let cancelled = false;

    const wake = async () => {
      setServerStatus("waking");
      setWakeSeconds(0);
      interval = setInterval(() => setWakeSeconds(s => s+1), 1000);
      const ok = await pingServer();
      clearInterval(interval);
      if (cancelled) return;
      if (ok) { setServerStatus("online"); fetchRecords(); }
      else setServerStatus("error");
    };

    wake();
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  /* auto-ping every 10 min to keep server warm */
  useEffect(() => {
    const keepAlive = setInterval(async () => {
      try { await axios.get(API, { timeout: 5000 }); } catch {}
    }, 10 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { timeout: 15000 });
      setRecords(res.data || []);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const karat = selectedKarat;
    setFiltered(karat === "ALL" ? records : records.filter(r => r.karatType === karat));
  }, [records, selectedKarat]);

  const totalInput  = filteredRecords.reduce((s,r) => s + (parseFloat(r.inputWeight)||0), 0);
  const totalOutput = filteredRecords.reduce((s,r) => s + (parseFloat(r.outputWeight)||0), 0);
  const totalLoss   = totalInput - totalOutput;

  const addRecord = async () => {
    if (!date || !inputWeight || !outputWeight) { toast.warning("Fill all fields"); return; }
    if (serverStatus !== "online") { toast.warning("Server is still waking up, please wait…"); return; }
    try {
      await axios.post(API, {
        date: formatDateForAPI(date),
        karatType,
        inputWeight: fmt3(inputWeight),
        outputWeight: fmt3(outputWeight),
      }, { timeout: 15000 });
      toast.success("Record added");
      setDate(null); setInputWeight(""); setOutputWeight("");
      fetchRecords();
    } catch { toast.error("Error adding record. Try again."); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete record?")) return;
    try {
      await axios.delete(`${API}/${id}`, { timeout: 15000 });
      toast.success("Deleted");
      fetchRecords();
    } catch { toast.error("Delete failed"); }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 14, 10, 30, 30);
    doc.setFontSize(18);
    doc.text("Gold Carat Management Report", 50, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 30);
    autoTable(doc, {
      startY: 45,
      head: [["Date","Karat","Input","Output","Ghat"]],
      body: filteredRecords.map(r => [
        formatDate(r.date), r.karatType, r.inputWeight, r.outputWeight,
        calcDiff(r.inputWeight, r.outputWeight).toFixed(3),
      ]),
      foot: [["TOTAL","", totalInput.toFixed(3), totalOutput.toFixed(3), totalLoss.toFixed(3)]],
    });
    const ph = doc.internal.pageSize.height;
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`© ${BRAND_NAME}`, 14, ph-10);
    doc.text(`Contact: ${EMAIL}`, 14, ph-5);
    doc.save("gold-records.pdf");
    toast.success("PDF Exported");
  };

  /* styles */
  const bg    = darkMode ? "bg-slate-900 text-white"        : "bg-[#f8fafc] text-slate-800";
  const card  = darkMode ? "bg-slate-800 border-slate-700"  : "bg-white border-slate-200 shadow-sm";
  const inp   = "w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 " +
    (darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800");
  const isOffline = serverStatus !== "online";

  return (
    <div className={`min-h-screen p-3 md:p-6 space-y-4 ${bg}`}>
      <ToastContainer />

      {/* HEADER */}
      <div className={`${card} border rounded-3xl p-4 flex justify-between items-center`}>
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Machine cut Hisab System</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${serverStatus==="online"?"bg-green-500 animate-pulse":serverStatus==="waking"?"bg-amber-400 animate-pulse":"bg-red-500"}`} />
            <span className="text-xs text-slate-400">
              {serverStatus==="online" ? "Server online" : serverStatus==="waking" ? `Waking up server… ${wakeSeconds}s` : "Server offline"}
            </span>
          </div>
        </div>
        <button onClick={toggleTheme} className="bg-amber-400 px-4 py-2 rounded-xl font-semibold">
          {darkMode ? "Light ☀️" : "Dark 🌙"}
        </button>
      </div>

      {/* SERVER BANNER */}
      <ServerBanner status={serverStatus} />

      {/* FORM */}
      <div className={`${card} border rounded-3xl p-4 ${isOffline ? "opacity-60 pointer-events-none" : ""}`}>
        {isOffline && (
          <p className="text-xs text-amber-500 mb-3 flex items-center gap-1">
            <FaSpinner className="animate-spin" /> Form disabled while server wakes up…
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative h-[48px]">
            <DatePicker
              selected={date}
              onChange={d => setDate(d)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select Date"
              className={inp + " h-[48px]"}
              popperClassName="z-50"
              disabled={isOffline}
            />
          </div>
          <select value={karatType} onChange={e => setKaratType(e.target.value)} className={inp} disabled={isOffline}>
            <option value="75">75</option>
            <option value="84">84</option>
            <option value="92">92</option>
          </select>
          <input type="number" placeholder="Input Weight" value={inputWeight}
            onChange={e => setInputWeight(e.target.value)} className={inp} disabled={isOffline} />
          <input type="number" placeholder="Output Weight" value={outputWeight}
            onChange={e => setOutputWeight(e.target.value)} className={inp} disabled={isOffline} />
          <button onClick={addRecord} disabled={isOffline}
            className="bg-amber-400 px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isOffline ? <><FaSpinner className="animate-spin" /> Wait…</> : "Save Record"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {serverStatus === "online" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Input",  value: totalInput.toFixed(3),  color: "text-blue-500"  },
            { label: "Total Output", value: totalOutput.toFixed(3), color: "text-green-500" },
            { label: "Total Ghat",   value: totalLoss.toFixed(3),   color: "text-red-500"   },
          ].map(s => (
            <div key={s.label} className={`${card} border rounded-2xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className={`${card} border rounded-3xl p-4`}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <h2 className="text-amber-500 text-xl font-bold">Records</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select value={selectedKarat} onChange={e => setSelectedKarat(e.target.value)} className={inp}>
              <option value="ALL">All</option>
              <option value="75">75</option>
              <option value="84">84</option>
              <option value="92">92</option>
            </select>
            <button onClick={exportPDF} disabled={isOffline}
              className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50">
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <FaSpinner className="animate-spin text-3xl text-amber-400" />
            <p className="text-sm">Loading records…</p>
          </div>
        ) : serverStatus === "waking" ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <div className="flex gap-2">
              {[0,1,2,3,4].map(i=>(
                <span key={i} className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:`${i*0.1}s`}} />
              ))}
            </div>
            <p className="text-sm text-amber-500 font-medium">Waking up server… {wakeSeconds}s</p>
            <p className="text-xs text-slate-400">Render free tier needs 30–60 seconds to start</p>
          </div>
        ) : serverStatus === "error" ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-400">
            <FaExclamationTriangle className="text-3xl" />
            <p className="text-sm font-medium">Could not connect to server</p>
            <button onClick={() => window.location.reload()} className="text-xs bg-red-500 text-white px-4 py-2 rounded-xl">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[700px] text-sm">
              <thead className={darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}>
                <tr>
                  {["Date","Carat","Input","Output","Ghat","Action"].map(h=>(
                    <th key={h} className={`py-3 px-4 ${h==="Action"?"text-center":"text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">No records found</td></tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.id} className={`border-b transition ${darkMode?"border-slate-700 hover:bg-slate-700/40":"border-slate-200 hover:bg-slate-50"}`}>
                      <td className="py-3 px-4 whitespace-nowrap">{formatDate(r.date)}</td>
                      <td className="py-3 px-4 font-semibold">{r.karatType}</td>
                      <td className="py-3 px-4">{fmt3(r.inputWeight)}</td>
                      <td className="py-3 px-4">{fmt3(r.outputWeight)}</td>
                      <td className="py-3 px-4 text-red-500 font-bold">{calcDiff(r.inputWeight,r.outputWeight).toFixed(3)}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => deleteRecord(r.id)} className="text-red-500 hover:text-red-700 transition">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className={`font-bold text-sm ${darkMode?"bg-slate-700":"bg-slate-100"}`}>
                  <td className="py-3 px-4" colSpan="2">TOTAL</td>
                  <td className="py-3 px-4 text-blue-500">{totalInput.toFixed(3)}</td>
                  <td className="py-3 px-4 text-green-500">{totalOutput.toFixed(3)}</td>
                  <td className="py-3 px-4 text-red-500">{totalLoss.toFixed(3)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-slate-400 pb-4">
        © {BRAND_NAME} · {EMAIL}
      </div>
    </div>
  );
}

export default App;