import { useEffect, useState } from "react";
import axios from "axios";

import { FaTrash } from "react-icons/fa";
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

  const BRAND_NAME = "Gold Management System - Rakshit R Soni";
  const EMAIL = "rakshitrsoni@gmail.com";

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}-${m}-${y}`;
  };

  const calculateDifference = (input, output) =>
    (parseFloat(input) || 0) - (parseFloat(output) || 0);

  const format3 = (val) => Number(parseFloat(val || 0).toFixed(3));

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
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
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter((r) => r.karatType === selectedKarat));
    }
  }, [records, selectedKarat]);

  const totalInput = filteredRecords.reduce(
    (s, r) => s + (parseFloat(r.inputWeight) || 0),
    0,
  );

  const totalOutput = filteredRecords.reduce(
    (s, r) => s + (parseFloat(r.outputWeight) || 0),
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
        inputWeight: format3(inputWeight),
        outputWeight: format3(outputWeight),
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

    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Deleted");
      fetchRecords();
    } catch {
      toast.error("Delete failed");
    }
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
      head: [["Date", "Karat", "Input", "Output", "Loss"]],
      body: filteredRecords.map((r) => [
        formatDate(r.date),
        r.karatType,
        r.inputWeight,
        r.outputWeight,
        calculateDifference(r.inputWeight, r.outputWeight).toFixed(3),
      ]),
      foot: [
        [
          "TOTAL",
          "",
          totalInput.toFixed(3),
          totalOutput.toFixed(3),
          totalLoss.toFixed(3),
        ],
      ],
    });

    // ✅ CLEAN BRAND FOOTER (NO WATERMARK)
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(`© ${BRAND_NAME}`, 14, pageHeight - 10);

    doc.text(`Contact: ${EMAIL}`, 14, pageHeight - 5);

    doc.save("gold-records.pdf");
    toast.success("PDF Exported");
  };

  const bg = darkMode ? "bg-[#0b1220] text-white" : "bg-gray-100 text-black";

  const card = darkMode
    ? "bg-[#111c33] border-gray-800"
    : "bg-white border-gray-200";

  const inputStyle =
    "w-full p-3 rounded-lg border focus:outline-none " +
    (darkMode
      ? "bg-[#0b1220] border-gray-700 text-white"
      : "bg-white border-gray-300 text-black");

  return (
    <div className={`min-h-screen p-6 space-y-6 ${bg}`}>
      <ToastContainer />

      {/* HEADER */}
      <div className={`${card} border rounded-2xl p-6 flex justify-between`}>
        <h1 className="text-xl font-bold text-[#d4af37]">
          Machinecut Hisab System
        </h1>

        <button
          onClick={toggleTheme}
          className="bg-[#d4af37] text-black px-4 py-2 rounded-xl"
        >
          {darkMode ? "Light ☀️" : "Dark 🌙"}
        </button>
      </div>

      {/* FORM */}
      <div className={`${card} border rounded-2xl p-6`}>
        <div className="grid md:grid-cols-5 gap-4 items-end">
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

          <button
            onClick={addRecord}
            className="bg-[#d4af37] text-black px-6 py-3 rounded-xl font-semibold h-[48px]"
          >
            Save
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className={`${card} border rounded-2xl p-6`}>
        <div className="flex justify-between mb-4">
          <h2 className="text-[#d4af37] font-semibold">Records</h2>

          <button
            onClick={exportPDF}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Export PDF
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead
                className={
                  darkMode
                    ? "bg-[#0f172a] text-[#d4af37]"
                    : "bg-gray-200 text-gray-800"
                }
              >
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Karat</th>
                  <th className="py-3 px-4 text-left">Input</th>
                  <th className="py-3 px-4 text-left">Output</th>
                  <th className="py-3 px-4 text-left">Loss</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-3 px-4">{formatDate(r.date)}</td>
                    <td className="py-3 px-4">{r.karatType}</td>
                    <td className="py-3 px-4">{r.inputWeight}</td>
                    <td className="py-3 px-4">{r.outputWeight}</td>
                    <td className="py-3 px-4 text-red-500 font-bold">
                      {calculateDifference(
                        r.inputWeight,
                        r.outputWeight,
                      ).toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-center">
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

        {/* FOOTER BRAND */}
        <div className="text-center text-xs opacity-60 mt-4">
          © {BRAND_NAME} | {EMAIL}
        </div>
      </div>
    </div>
  );
}

export default App;
