import { useEffect, useState } from "react";
import axios from "axios";

import { FaWeightHanging, FaTrash, FaMoon, FaSun } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "./assets/logo.png";

function App() {
  const API = "http://localhost:8080/api/records";

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [date, setDate] = useState("");
  const [karatType, setKaratType] = useState("75");
  const [inputWeight, setInputWeight] = useState("");
  const [outputWeight, setOutputWeight] = useState("");

  const [selectedKarat, setSelectedKarat] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const calculateDifference = (a, b) =>
    parseFloat(a || 0) - parseFloat(b || 0) || 0;

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setRecords(res.data || []);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (selectedKarat === "ALL") {
      setFilteredRecords(records || []);
    } else {
      setFilteredRecords(
        (records || []).filter((r) => r.karatType === selectedKarat),
      );
    }
  }, [records, selectedKarat]);

  const totalInput = (filteredRecords || []).reduce(
    (s, r) => s + parseFloat(r.inputWeight || 0),
    0,
  );

  const totalOutput = (filteredRecords || []).reduce(
    (s, r) => s + parseFloat(r.outputWeight || 0),
    0,
  );

  const totalLoss = totalInput - totalOutput;

  const addRecord = async () => {
    if (!date || !inputWeight || !outputWeight) {
      toast.warning("Fill all fields");
      return;
    }

    try {
      await axios.post(API, {
        date,
        karatType,
        inputWeight,
        outputWeight,
      });

      toast.success("Record added");

      setDate("");
      setInputWeight("");
      setOutputWeight("");

      fetchRecords();
    } catch {
      toast.error("Error adding record");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete record?")) return;

    await axios.delete(`${API}/${id}`);
    toast.success("Deleted");
    fetchRecords();
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.addImage(logo, "PNG", 12, 10, 22, 22);
    doc.text("Gold Report", 45, 20);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Karat", "Input", "Output", "Loss"]],
      body: (filteredRecords || []).map((r) => [
        r.date,
        r.karatType,
        r.inputWeight,
        r.outputWeight,
        calculateDifference(r.inputWeight, r.outputWeight).toFixed(3),
      ]),
    });

    doc.save("report.pdf");
  };

  // 🎨 FIXED THEME SYSTEM
  const bg = darkMode ? "bg-[#0b1220] text-white" : "bg-gray-100 text-black";

  const card = darkMode
    ? "bg-[#111c33] border-gray-800"
    : "bg-white border-gray-200";

  // ⭐ FIXED INPUT (IMPORTANT CHANGE HERE)
  const inputStyle =
    "w-full p-3 rounded-lg border focus:outline-none " +
    (darkMode
      ? "bg-[#0b1220] border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-black placeholder-gray-500");

  return (
    <div className={`flex min-h-screen transition-all ${bg}`}>
      <ToastContainer />

      {/* SIDEBAR */}
      <div
        className={`w-64 hidden md:block p-6 border-r ${
          darkMode ? "bg-[#0f172a] border-gray-800" : "bg-white"
        }`}
      >
        {/* BRAND SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaWeightHanging className="text-[#d4af37]" />
            <h1 className="font-bold text-lg">Gold Manager</h1>
          </div>

          <p className="text-xs opacity-60"> Business Dashboard</p>
        </div>
        {/* MENU */}
        <div className="space-y-2 text-sm">
          <div className="bg-[#111c33] text-[#d4af37] p-3 rounded-lg border border-gray-800">
            Dashboard
          </div>

          <div className="p-3 hover:bg-[#111c33] rounded-lg cursor-pointer transition">
            Records
          </div>

          <div className="p-3 hover:bg-[#111c33] rounded-lg cursor-pointer transition">
            Reports
          </div>
        </div>
      </div>
      {/* MAIN */}
      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        <div className={`${card} border rounded-2xl p-6 flex justify-between`}>
          <div>
            <h1 className="text-2xl font-bold text-[#d4af37]">
              Machinecut Hisab Management System 
            </h1>
            <p className="opacity-70"> Dashboard</p>
          </div>

          <button
            onClick={toggleTheme}
            className="bg-[#d4af37] text-black px-4 py-2 rounded-xl font-semibold"
          >
            {darkMode ? "Light ☀️" : "Dark 🌙"}
          </button>
        </div>

        {/* FORM */}
        <div className={`${card} border rounded-2xl p-6`}>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputStyle}
            />

            <select
              value={karatType}
              onChange={(e) => setKaratType(e.target.value)}
              className={inputStyle}
            >
              <option value="75">75</option>
              <option value="84">84</option>
              <option value="92">92</option>
            </select>

            <input
              type="number"
              placeholder="Input Weight"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className={inputStyle}
            />

            <input
              type="number"
              placeholder="Output Weight"
              value={outputWeight}
              onChange={(e) => setOutputWeight(e.target.value)}
              className={inputStyle}
            />
          </div>

          <button
            onClick={addRecord}
            className="mt-5 bg-[#d4af37] text-black px-6 py-3 rounded-xl font-semibold"
          >
            Save Record
          </button>
        </div>

        {/* FILTER */}
        <div className={`${card} border rounded-2xl p-4 flex gap-4`}>
          <span>Filter:</span>

          <select
            value={selectedKarat}
            onChange={(e) => setSelectedKarat(e.target.value)}
            className={inputStyle}
          >
            <option value="ALL">ALL</option>
            <option value="75">75</option>
            <option value="84">84</option>
            <option value="92">92</option>
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className={`${card} border rounded-2xl p-6`}>
          {/* HEADER (FIXED ALIGNMENT) */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#d4af37]">Records</h2>
              <p className="text-xs opacity-60 mt-1">
                All gold transactions history
              </p>
            </div>

            <button
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Export PDF
            </button>
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="py-8 text-center opacity-70">Loading...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="py-8 text-center opacity-60">No records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-[#d4af37]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Karat</th>
                    <th className="p-3">Input</th>
                    <th className="p-3">Output</th>
                    <th className="p-3">Loss</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-800 hover:bg-[#0b1220] transition"
                    >
                      <td className="p-3">{r.date}</td>
                      <td className="p-3 text-[#d4af37] font-medium">
                        {r.karatType}
                      </td>
                      <td className="p-3">{r.inputWeight}</td>
                      <td className="p-3">{r.outputWeight}</td>

                      <td className="p-3 text-red-400 font-bold">
                        {calculateDifference(
                          r.inputWeight,
                          r.outputWeight,
                        ).toFixed(3)}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => deleteRecord(r.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
