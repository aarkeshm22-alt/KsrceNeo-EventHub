import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaCloudUploadAlt, FaTimes } from "react-icons/fa";

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const editTargetData = location.state?.editTargetData || null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    registrationLink: "",
    registrationOpenDate: "",
    registrationCloseDate: "",
  });

  // ===== NEW: Levels state =====
  const [levels, setLevels] = useState([]);
  const [newLevel, setNewLevel] = useState("");

  const [imageFile, setImageFile] = useState(null);

  // ===== Pre‑populate on edit =====
  useEffect(() => {
    if (editTargetData) {
      setFormData({
        title: editTargetData.title || "",
        description: editTargetData.description || "",
        eventDate: editTargetData.eventDate ? editTargetData.eventDate.split("T")[0] : "",
        location: editTargetData.location || "",
        registrationLink: editTargetData.registrationLink || "",
        registrationOpenDate: editTargetData.registrationOpenDate
          ? editTargetData.registrationOpenDate.split("T")[0]
          : "",
        registrationCloseDate: editTargetData.registrationCloseDate
          ? editTargetData.registrationCloseDate.split("T")[0]
          : "",
      });
      if (editTargetData.image) {
        setImagePreview(editTargetData.image);
      }
      // ===== Populate levels =====
      setLevels(editTargetData.levels || []);
    }
  }, [editTargetData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ===== Levels handlers =====
  const addLevel = () => {
    if (newLevel.trim()) {
      setLevels([...levels, newLevel.trim()]);
      setNewLevel("");
    }
  };

  const removeLevel = (index) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  const updateLevel = (index, value) => {
    const updated = [...levels];
    updated[index] = value;
    setLevels(updated);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    // Optional date validation
    if (formData.registrationCloseDate && formData.registrationOpenDate) {
      const open = new Date(formData.registrationOpenDate);
      const close = new Date(formData.registrationCloseDate);
      if (close <= open) {
        setFormError("Registration close date must be after the open date.");
        setIsLoading(false);
        return;
      }
    }

    const multiPartPayload = new FormData();
    multiPartPayload.append("title", formData.title);
    multiPartPayload.append("description", formData.description);
    multiPartPayload.append("eventDate", formData.eventDate);
    multiPartPayload.append("location", formData.location);
    multiPartPayload.append("registrationLink", formData.registrationLink);
    multiPartPayload.append("registrationOpenDate", formData.registrationOpenDate);
    multiPartPayload.append("registrationCloseDate", formData.registrationCloseDate);

    // ===== Append levels as JSON string =====
    multiPartPayload.append("levels", JSON.stringify(levels));

    if (imageFile) {
      multiPartPayload.append("image", imageFile);
    }

    try {
      const endpoint = editTargetData
        ? `http://localhost:5000/api/events/update/${editTargetData._id}`
        : "http://localhost:5000/api/events/create";

      const method = editTargetData ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        body: multiPartPayload,
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/admin/events");
      } else {
        setFormError(data.message || "Failed saving tracking configuration pipeline.");
      }
    } catch (err) {
      console.error("Frontend Uplink Error Log Check:", err);
      setFormError("Uplink processing stream failed connecting to base microservices.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      {/* HEADER CONTROLS FRAME */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <button
          type="button"
          onClick={() => navigate("/admin/events")}
          className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all shadow-xs active:scale-95"
        >
          <FaArrowLeft size={14} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">
            {editTargetData ? "Modify Event Details" : "Create New Event"}
          </h1>
        </div>
      </div>

      {/* SUBMISSION FORM */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-6 flex items-center gap-3">
          <FaFileAlt className="text-amber-400" size={16} />
          <div>
            <h2 className="text-sm font-black tracking-tight uppercase">Enter the Event Details</h2>
            <p className="text-[11px] text-slate-300">Ensure all mandatory fields are filled in before submitting the form.</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Name *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Smart India Hackathon 2026"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Date *</label>
              <input
                type="date"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Place / Venue *</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Tech Campus Hub"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Registration Open & Close Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Open Date *</label>
              <input
                type="date"
                name="registrationOpenDate"
                required
                value={formData.registrationOpenDate}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Close Date *</label>
              <input
                type="date"
                name="registrationCloseDate"
                required
                value={formData.registrationCloseDate}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Link *</label>
            <input
              type="url"
              name="registrationLink"
              required
              value={formData.registrationLink}
              onChange={handleInputChange}
              placeholder="https://external-form-portal.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs"
            />
          </div>

          {/* ============================================================
              NEW: DYNAMIC EVENT LEVELS
              ============================================================ */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Event Levels
                <span className="text-[10px] font-normal text-slate-400 ml-2 normal-case">
                  (e.g., Registration, Team Formation, Final Pitch)
                </span>
              </label>
              <span className="text-xs font-bold text-slate-400">
                {levels.length} level{levels.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* List of existing levels */}
            <div className="space-y-2">
              {levels.map((level, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-bold text-slate-400">{index + 1}.</span>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => updateLevel(index, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-3 py-2 text-sm font-semibold outline-hidden transition-all shadow-xs"
                    placeholder={`Level ${index + 1} name`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLevel(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new level */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLevel();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-3 py-2 text-sm font-semibold outline-hidden transition-all shadow-xs"
                placeholder="Type a level name and press Enter"
              />
              <button
                type="button"
                onClick={addLevel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition"
              >
                Add
              </button>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Levels will be displayed on the event card in the order you add them.
            </p>
          </div>

          {/* FILE DROPZONE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pamphlet/Flyer *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 relative border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 text-center hover:bg-slate-100/50 transition-all group flex flex-col items-center justify-center min-h-[140px]">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <FaCloudUploadAlt className="text-slate-400 group-hover:text-blue-900 transition-colors mb-2" size={32} />
                <p className="text-xs font-bold text-blue-950">Click or Drag the image here</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Supports JPEG, PNG, or WebP formats</p>
              </div>

              <div className="w-full h-[140px] rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Live Asset Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4">No image found...!</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description About the Event *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a brief overview of the event to help participants understand its purpose and scope..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-900 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-hidden transition-all shadow-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="px-5 py-3 rounded-xl border border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-blue-950 disabled:opacity-50 shadow-xs active:scale-95"
            >
              {isLoading ? "Saving Event Information..." : editTargetData ? "Update Event" : "Post Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDetails;