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

  // ✅ SINGLE FIXED FUNCTION (ONLY ONE)
  const calculateDifference = (input, output) => {
    return (parseFloat(input) || 0) - (parseFloat(output) || 0);
  };

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

  // ✅ TOTALS
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

    doc.addImage(logo, "PNG", 14, 10, 30, 30);

    doc.setFontSize(20);
    doc.text("Gold Karat Management Report", 50, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 30);

    // TABLE
    autoTable(doc, {
      startY: 50,

      head: [["Date", "Karat", "Input Weight", "Output Weight", "Less Weight"]],

      body: filteredRecords.map((record) => [
        record.date,
        record.karatType,
        record.inputWeight,
        record.outputWeight,
        calculateDifference(record.inputWeight, record.outputWeight).toFixed(3),
      ]),

      // ✅ TOTAL ROW INSIDE TABLE
      foot: [
        [
          "TOTAL",
          "",
          totalInput.toFixed(3),
          totalOutput.toFixed(3),
          totalLoss.toFixed(3),
        ],
      ],

      styles: {
        fontSize: 10,
      },

      footStyles: {
        fillColor: [20, 20, 20],
        textColor: 255,
        fontStyle: "bold",
      },
    });
    const finalY = doc.lastAutoTable.finalY + 12;

    // ===============================
    // 🔥 CLEAN ONE-LINE SUMMARY
    // ===============================

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL SUMMARY:", 14, finalY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const summaryLine =
      `Input: ${totalInput.toFixed(3)}   |   ` +
      `Output: ${totalOutput.toFixed(3)}   |   ` +
      `Loss: ${totalLoss.toFixed(3)}`;

    doc.text(summaryLine, 14, finalY + 8);

    doc.save("gold-records.pdf");
    toast.success("PDF Exported Successfully");
  };
  const bg = darkMode ? "bg-[#0b1220] text-white" : "bg-gray-100 text-black";

  const card = darkMode
    ? "bg-[#111c33] border-gray-800"
    : "bg-white border-gray-200";

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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaWeightHanging className="text-[#d4af37]" />
            <h1 className="font-bold text-lg">Gold Manager</h1>
          </div>
          <p className="text-xs opacity-60">Business Dashboard</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        <div className={`${card} border rounded-2xl p-6 flex justify-between`}>
          <h1 className="text-2xl font-bold text-[#d4af37]">
            Machinecut Hisab Management System
          </h1>

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

        {/* TABLE */}
        <div className={`${card} border rounded-2xl p-6`}>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#d4af37]">Records</h2>

            <button
              onClick={exportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Export PDF
            </button>
          </div>
             {loading ? (
            <div className="text-center py-10 text-lg">
              Loading records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-lg">
              No records found
            </div>
          ) : (
         
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[#d4af37]">
                  <th>Date</th>
                  <th>Karat</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Less</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td>{r.date}</td>
                    <td>{r.karatType}</td>
                    <td>{r.inputWeight}</td>
                    <td>{r.outputWeight}</td>
                    <td className="text-red-400 font-bold">
                      {calculateDifference(
                        r.inputWeight,
                        r.outputWeight,
                      ).toFixed(3)}
                    </td>
                    <td>
                      <button onClick={() => deleteRecord(r.id)}>
                        <FaTrash className="text-red-500" />
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
