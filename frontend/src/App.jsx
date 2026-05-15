import { useEffect, useState } from "react";
import axios from "axios";

import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "./assets/logo.png";

function App() {
  const API = "https://weight-management-software.onrender.com/api/records";

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [date, setDate] = useState("");
  const [karatType, setKaratType] = useState("75");
  const [inputWeight, setInputWeight] = useState("");
  const [outputWeight, setOutputWeight] = useState("");

  const [selectedKarat, setSelectedKarat] = useState("ALL");

  const [loading, setLoading] = useState(false);

  // LIGHT MODE DEFAULT
  const [darkMode, setDarkMode] = useState(false);

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

    if (saved) {
      setDarkMode(saved === "dark");
    }
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
      setFilteredRecords(
        records.filter((r) => r.karatType === selectedKarat),
      );
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

    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(`© ${BRAND_NAME}`, 14, pageHeight - 10);

    doc.text(`Contact: ${EMAIL}`, 14, pageHeight - 5);

    doc.save("gold-records.pdf");

    toast.success("PDF Exported");
  };

  // THEMES

  const bg = darkMode
    ? "bg-slate-900 text-white"
    : "bg-[#f8fafc] text-slate-800";

  const card = darkMode
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200 shadow-sm";

  const inputStyle =
    "w-full p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 " +
    (darkMode
      ? "bg-slate-900 border-slate-700 text-white"
      : "bg-white border-slate-300 text-slate-800");

  return (
    <div className={`min-h-screen p-3 md:p-6 space-y-6 ${bg}`}>
      <ToastContainer />

      {/* HEADER */}

      <div
        className={`${card} border rounded-3xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-amber-500 text-center md:text-left">
          Machinecut Hisab System
        </h1>

        <button
          onClick={toggleTheme}
          className="bg-amber-400 hover:bg-amber-500 transition-all text-black px-5 py-2 rounded-xl font-semibold w-full md:w-auto"
        >
          {darkMode ? "Light ☀️" : "Dark 🌙"}
        </button>
      </div>

      {/* FORM */}

      <div className={`${card} border rounded-3xl p-4 md:p-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            className="bg-amber-400 hover:bg-amber-500 transition-all text-black px-6 py-3 rounded-xl font-semibold"
          >
            Save Record
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className={`${card} border rounded-3xl p-4 md:p-6`}>
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center mb-4">
          <h2 className="text-amber-500 text-xl font-bold">
            Records
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedKarat}
              onChange={(e) => setSelectedKarat(e.target.value)}
              className={inputStyle}
            >
              <option value="ALL">All</option>
              <option value="75">75</option>
              <option value="84">84</option>
              <option value="92">92</option>
            </select>

            <button
              onClick={exportPDF}
              className="bg-red-500 hover:bg-red-600 transition-all text-white px-4 py-2 rounded-xl"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-100 rounded-2xl p-4">
            <p className="text-sm text-slate-600">Total Input</p>
            <h3 className="text-2xl font-bold text-amber-700">
              {totalInput.toFixed(3)}
            </h3>
          </div>

          <div className="bg-green-100 rounded-2xl p-4">
            <p className="text-sm text-slate-600">Total Output</p>
            <h3 className="text-2xl font-bold text-green-700">
              {totalOutput.toFixed(3)}
            </h3>
          </div>

          <div className="bg-red-100 rounded-2xl p-4">
            <p className="text-sm text-slate-600">Total Loss</p>
            <h3 className="text-2xl font-bold text-red-700">
              {totalLoss.toFixed(3)}
            </h3>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[700px] text-sm">
              <thead
                className={
                  darkMode
                    ? "bg-slate-900 text-amber-400"
                    : "bg-slate-100 text-slate-800"
                }
              >
                <tr>
                  <th className="py-4 px-4 text-left">Date</th>

                  <th className="py-4 px-4 text-left">Karat</th>

                  <th className="py-4 px-4 text-left">Input</th>

                  <th className="py-4 px-4 text-left">Output</th>

                  <th className="py-4 px-4 text-left">Loss</th>

                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <td className="py-4 px-4">
                      {formatDate(r.date)}
                    </td>

                    <td className="py-4 px-4 font-semibold">
                      {r.karatType}
                    </td>

                    <td className="py-4 px-4">
                      {format3(r.inputWeight)}
                    </td>

                    <td className="py-4 px-4">
                      {format3(r.outputWeight)}
                    </td>

                    <td className="py-4 px-4 text-red-500 font-bold">
                      {calculateDifference(
                        r.inputWeight,
                        r.outputWeight,
                      ).toFixed(3)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => deleteRecord(r.id)}
                        className="hover:scale-110 transition-all"
                      >
                        <FaTrash className="text-red-500 text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}

        <div className="text-center text-xs opacity-60 mt-6">
          © {BRAND_NAME} | {EMAIL}
        </div>
      </div>
    </div>
  );
}

export default App;