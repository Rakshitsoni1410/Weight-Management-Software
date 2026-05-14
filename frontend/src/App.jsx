import { useEffect, useState } from "react";
import axios from "axios";

import { FaWeightHanging, FaTrash } from "react-icons/fa";

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

  // FETCH RECORDS
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API);
      setRecords(response.data);
    } catch (error) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  // FILTER RECORDS
  useEffect(() => {
    if (selectedKarat === "ALL") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) => record.karatType === selectedKarat,
      );
      setFilteredRecords(filtered);
    }
  }, [records, selectedKarat]);

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ 1. CALCULATION (ADDED)
  const calculateDifference = (input, output) => {
    return (parseFloat(input) || 0) - (parseFloat(output) || 0);
  };

  // ✅ 2. TOTALS (ADDED)
  const totalInput = filteredRecords.reduce(
    (sum, r) => sum + (parseFloat(r.inputWeight) || 0),
    0,
  );

  const totalOutput = filteredRecords.reduce(
    (sum, r) => sum + (parseFloat(r.outputWeight) || 0),
    0,
  );

  const totalDifference = totalInput - totalOutput;

  // ADD RECORD
  const addRecord = async () => {
    if (!date || !inputWeight || !outputWeight) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      const newRecord = {
        date,
        karatType,
        inputWeight,
        outputWeight,
      };

      await axios.post(API, newRecord);

      toast.success("Record added successfully");

      setDate("");
      setInputWeight("");
      setOutputWeight("");

      fetchRecords();
    } catch (error) {
      toast.error("Failed to add record");
    }
  };

  // DELETE RECORD
  const deleteRecord = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Record deleted successfully");
      fetchRecords();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // EXPORT PDF (UPDATED)
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.addImage(logo, "PNG", 14, 10, 30, 30);

    doc.setFontSize(20);
    doc.text("Gold Karat Management Report", 50, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 30);

    // ✅ UPDATED TABLE WITH LESS WEIGHT + TOTALS
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

      foot: [
        [
          "TOTAL",
          "",
          totalInput.toFixed(3),
          totalOutput.toFixed(3),
          totalDifference.toFixed(3),
        ],
      ],
    });

    doc.save("gold-records.pdf");
    toast.success("PDF Exported Successfully");
  };

  return (
    <div className="flex">
      <ToastContainer />

      {/* SIDEBAR */}
      <div className="w-64 bg-yellow-700 text-white min-h-screen p-5 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <FaWeightHanging size={28} />
          <h1 className="text-2xl font-bold">Gold Manager</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-800 p-3 rounded-lg">Dashboard</div>

          <div className="hover:bg-yellow-800 p-3 rounded-lg transition">
            Gold Records
          </div>

          <div className="hover:bg-yellow-800 p-3 rounded-lg transition">
            Reports
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        {/* HEADER */}
        <div className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-700">
              Gold Karat Management
            </h2>

            <p className="text-gray-500 mt-1">
              Manage 75 / 84 / 92 Karat Gold Records
            </p>
          </div>

          <div className="bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold">
            Offline Business Software
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h2 className="text-2xl font-bold mb-5">Add Gold Record</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <select
              value={karatType}
              onChange={(e) => setKaratType(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="75">75 Karat</option>
              <option value="84">84 Karat</option>
              <option value="92">92 Karat</option>
            </select>

            <input
              type="number"
              placeholder="Input Weight"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Output Weight"
              value={outputWeight}
              onChange={(e) => setOutputWeight(e.target.value)}
              className="border p-3 rounded-lg"
            />
          </div>

          <button
            onClick={addRecord}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg mt-5"
          >
            Save Record
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-xl shadow-md mt-6 flex flex-wrap gap-4 items-center">
          <h3 className="font-bold text-lg">Filter By Karat:</h3>

          <select
            value={selectedKarat}
            onChange={(e) => setSelectedKarat(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="ALL">All</option>
            <option value="75">75 Karat</option>
            <option value="84">84 Karat</option>
            <option value="92">92 Karat</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">Gold Records</h2>

            <button
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
            >
              Export PDF
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-lg">Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-lg">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-600 text-white">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Karat</th>
                    <th className="p-4 text-left">Input Weight</th>
                    <th className="p-4 text-left">Output Weight</th>

                    {/* ✅ ADDED */}
                    <th className="p-4 text-left">Less Weight</th>

                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-100">
                      <td className="p-4">{record.date}</td>
                      <td className="p-4 font-semibold">{record.karatType}</td>
                      <td className="p-4">{record.inputWeight}</td>
                      <td className="p-4">{record.outputWeight}</td>

                      {/* ✅ ADDED */}
                      <td className="p-4 font-bold text-red-600">
                        {calculateDifference(
                          record.inputWeight,
                          record.outputWeight,
                        ).toFixed(3)}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
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
